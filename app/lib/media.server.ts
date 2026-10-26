import { db } from "~/db";
import { posts, projects, projectImages } from "~/db/schema";

export type MediaItem = {
  url: string;
  key: string;
  source: string;
  label: string;
};

const PUBLIC_URL = process.env.R2_PUBLIC_URL ?? "";

// Ubah URL publik jadi key R2 (untuk info sumber/penamaan rapi).
function toKey(url: string): string {
  if (PUBLIC_URL && url.startsWith(PUBLIC_URL)) {
    return url.slice(PUBLIC_URL.length).replace(/^\/+/, "");
  }
  try {
    return new URL(url).pathname.replace(/^\/+/, "");
  } catch {
    return url;
  }
}

function fileName(key: string): string {
  return key.split("/").pop() ?? key;
}

// Kumpulkan src gambar dari dokumen TipTap (node type "image").
function collectInlineImages(node: unknown, out: string[]) {
  if (!node || typeof node !== "object") return;
  const n = node as { type?: string; attrs?: { src?: unknown }; content?: unknown };
  if (n.type === "image" && typeof n.attrs?.src === "string") out.push(n.attrs.src);
  if (Array.isArray(n.content)) for (const child of n.content) collectInlineImages(child, out);
}

/**
 * Daftar gambar yang SEDANG dipakai konten (tanpa tabel media baru):
 * cover/OG artikel, gambar inline di konten artikel, cover proyek,
 * gambar inline di deskripsi proyek, dan galeri proyek. Di-dedup by URL.
 */
export async function listUsedMedia(): Promise<MediaItem[]> {
  const [postRows, projectRows, galleryRows] = await Promise.all([
    db.query.posts.findMany({
      columns: { id: true, title: true, coverImageUrl: true, ogImageUrl: true, contentRich: true },
    }),
    db.query.projects.findMany({
      columns: { id: true, title: true, coverImageUrl: true, descriptionRich: true },
    }),
    db.query.projectImages.findMany({ columns: { imageUrl: true, altText: true } }),
  ]);

  const map = new Map<string, MediaItem>();
  function add(url: string | null | undefined, source: string, label: string) {
    if (!url || map.has(url)) return;
    const key = toKey(url);
    map.set(url, { url, key, source, label: label || fileName(key) });
  }

  for (const p of postRows) {
    add(p.coverImageUrl, "Artikel · Cover", p.title);
    add(p.ogImageUrl, "Artikel · OG", p.title);
    const inline: string[] = [];
    collectInlineImages(p.contentRich, inline);
    for (const u of inline) add(u, "Artikel · Konten", p.title);
  }

  for (const pr of projectRows) {
    add(pr.coverImageUrl, "Proyek · Cover", pr.title);
    const inline: string[] = [];
    collectInlineImages(pr.descriptionRich, inline);
    for (const u of inline) add(u, "Proyek · Konten", pr.title);
  }

  for (const g of galleryRows) add(g.imageUrl, "Proyek · Galeri", g.altText ?? "");

  return Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key));
}
