import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomBytes } from "crypto";
import sharp from "sharp";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

function buildSafeFileName(originalName: string, forcedExt?: string) {
  const dotIndex = originalName.lastIndexOf(".");
  const originalExt = dotIndex !== -1 ? originalName.slice(dotIndex + 1).toLowerCase() : "bin";
  const ext = forcedExt ?? originalExt;

  const base = originalName
    .slice(0, dotIndex !== -1 ? dotIndex : undefined)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");

  const suffix = randomBytes(4).toString("hex");
  return `${base || "file"}-${suffix}.${ext}`;
}

// Tipe yang TIDAK dikonversi ke WebP (SVG nggak perlu, GIF animasi bisa rusak)
const SKIP_CONVERSION_TYPES = ["image/svg+xml", "image/gif"];

export async function uploadToR2(
  buffer: Buffer,
  fileName: string,
  folder: string,
  contentType: string
) {
  const cleanFolder = folder.replace(/^\/+|\/+$/g, "");

  let finalBuffer = buffer;
  let finalContentType = contentType;
  let forcedExt: string | undefined;

  const shouldConvert = !SKIP_CONVERSION_TYPES.includes(contentType);

  if (shouldConvert) {
    try {
      finalBuffer = await sharp(buffer)
        .webp({ quality: 82 })
        .toBuffer();
      finalContentType = "image/webp";
      forcedExt = "webp";
    } catch (err) {
      // Kalau sharp gagal proses (misal file bukan gambar valid), fallback ke file asli
      console.error("Sharp conversion failed, using original file:", err);
    }
  }

  const safeName = buildSafeFileName(fileName, forcedExt);
  const key = `${cleanFolder}/${safeName}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: finalBuffer,
      ContentType: finalContentType,
    })
  );

  return {
    url: `${PUBLIC_URL}/${key}`,
    key,
  };
}

export async function deleteFromR2(key: string | null | undefined) {
  if (!key) return;
  try {
    await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch {
    // biarkan gagal senyap
  }
}