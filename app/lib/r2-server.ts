import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomBytes } from "crypto";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!; // https://image-cdn.pribadiagus321.workers.dev

function buildSafeFileName(originalName: string) {
  const dotIndex = originalName.lastIndexOf(".");
  const ext = dotIndex !== -1 ? originalName.slice(dotIndex + 1).toLowerCase() : "bin";
  const base = originalName
    .slice(0, dotIndex !== -1 ? dotIndex : undefined)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");

  const suffix = randomBytes(4).toString("hex");
  return `${base || "file"}-${suffix}.${ext}`;
}

export async function uploadToR2(
  buffer: Buffer,
  fileName: string,
  folder: string,
  contentType: string
) {
  const safeName = buildSafeFileName(fileName);
  const cleanFolder = folder.replace(/^\/+|\/+$/g, "");
  const key = `${cleanFolder}/${safeName}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
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
    // biarkan gagal senyap, sama seperti perilaku imagekit.deleteFile sebelumnya
  }
}