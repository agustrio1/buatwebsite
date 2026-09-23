import "dotenv/config";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "../app/db";
import { posts, projects, projectImages } from "../app/db/schema";
import { eq } from "drizzle-orm";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;

// Ambil path bersih dari URL ImageKit (buang domain & query string)
function extractKeyFromImageKitUrl(url: string): string {
  const clean = url.split("?")[0];
  const withoutDomain = clean.replace(/^https?:\/\/ik\.imagekit\.io\/[^/]+\//, "");
  return withoutDomain;
}

async function uploadToR2(key: string, buffer: Buffer, contentType: string) {
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return `${R2_PUBLIC_URL}/${key}`;
}

async function migrateOneUrl(oldUrl: string | null): Promise<string | null> {
  if (!oldUrl || !oldUrl.includes("ik.imagekit.io")) return oldUrl;

  const key = extractKeyFromImageKitUrl(oldUrl);
  const rawUrl = oldUrl.split("?")[0]; // fetch versi asli, tanpa transformasi

  console.log(`Downloading: ${rawUrl}`);
  const res = await fetch(rawUrl);
  if (!res.ok) {
    console.error(`  GAGAL fetch (${res.status}): ${rawUrl}`);
    return oldUrl; // biarin URL lama kalau gagal, biar ketauan mana yang belum sukses
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") ?? "image/webp";

  const newUrl = await uploadToR2(key, buffer, contentType);
  console.log(`  -> ${newUrl}`);
  return newUrl;
}

async function migratePosts() {
  const rows = await db.query.posts.findMany();
  for (const row of rows) {
    if (!row.coverImageUrl?.includes("ik.imagekit.io")) continue;
    const newUrl = await migrateOneUrl(row.coverImageUrl);
    if (newUrl !== row.coverImageUrl) {
      await db.update(posts).set({ coverImageUrl: newUrl }).where(eq(posts.id, row.id));
    }
  }
}

async function migrateProjects() {
  const rows = await db.query.projects.findMany();
  for (const row of rows) {
    if (!row.coverImageUrl?.includes("ik.imagekit.io")) continue;
    const newUrl = await migrateOneUrl(row.coverImageUrl);
    if (newUrl !== row.coverImageUrl) {
      await db.update(projects).set({ coverImageUrl: newUrl }).where(eq(projects.id, row.id));
    }
  }
}

async function migrateProjectImages() {
  const rows = await db.query.projectImages.findMany();
  for (const row of rows) {
    if (!row.imageUrl?.includes("ik.imagekit.io")) continue;
    const newUrl = await migrateOneUrl(row.imageUrl);
    if (newUrl !== row.imageUrl) {
      await db.update(projectImages).set({ imageUrl: newUrl! }).where(eq(projectImages.id, row.id));
    }
  }
}

async function main() {
  console.log("=== Migrasi posts ===");
  await migratePosts();

  console.log("=== Migrasi projects ===");
  await migrateProjects();

  console.log("=== Migrasi projectImages ===");
  await migrateProjectImages();

  console.log("Selesai!");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});