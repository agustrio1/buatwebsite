import { describe, it, expect } from "vitest";
import type { JSONContent } from "@tiptap/react";
import { analyzeSeo, type Check } from "~/lib/seo-analysis";

function doc(...nodes: JSONContent[]): JSONContent {
  return { type: "doc", content: nodes };
}
function heading(level: number, text: string): JSONContent {
  return { type: "heading", attrs: { level }, content: [{ type: "text", text }] };
}
function para(text: string): JSONContent {
  return { type: "paragraph", content: [{ type: "text", text }] };
}
function byId(checks: Check[], id: string) {
  return checks.find((c) => c.id === id);
}

const baseInput = {
  focusKeyword: "",
  title: "",
  metaTitle: "",
  metaDescription: "",
  slug: "",
  summary: "",
  contentRich: null as JSONContent | null,
  siteName: "jadikanweb.id",
};

describe("analyzeSeo", () => {
  it("memberi skor 0-100 dan menandai fokus keyword kosong sebagai fail", () => {
    const res = analyzeSeo(baseInput);
    expect(res.score).toBeGreaterThanOrEqual(0);
    expect(res.score).toBeLessThanOrEqual(100);
    expect(byId(res.seoChecks, "focus-keyword")?.status).toBe("fail");
    // Tidak ada teks -> readability menghasilkan satu check kosong.
    expect(byId(res.readabilityChecks, "readable-empty")?.status).toBe("fail");
  });

  it("mendeteksi keyword di judul, slug, dan konten saat fokus keyword diisi", () => {
    const res = analyzeSeo({
      ...baseInput,
      focusKeyword: "website",
      title: "Panduan Membuat Website",
      slug: "cara-membuat-website",
      metaDescription: "Belajar membuat website dari nol untuk pemula bisnis.",
      contentRich: doc(
        heading(1, "Mengapa Website Penting"),
        para("Membuat website membantu bisnis tumbuh. Website juga menaikkan kredibilitas."),
        heading(2, "Langkah Membuat Website")
      ),
    });
    expect(byId(res.seoChecks, "kw-title")?.status).toBe("pass");
    expect(byId(res.seoChecks, "kw-slug")?.status).toBe("pass");
    expect(byId(res.seoChecks, "kw-content")?.status).toBe("pass");
    expect(byId(res.seoChecks, "h1")?.status).toBe("pass");
  });

  it("menandai keyword di judul sebagai fail bila judul tidak memuat keyword", () => {
    const res = analyzeSeo({
      ...baseInput,
      focusKeyword: "website",
      title: "Panduan Pemasaran Digital",
      contentRich: doc(para("Konten tentang iklan dan media sosial.")),
    });
    expect(byId(res.seoChecks, "kw-title")?.status).toBe("fail");
  });

  it("skor artikel lengkap lebih tinggi daripada artikel kosong", () => {
    const empty = analyzeSeo(baseInput).score;
    const full = analyzeSeo({
      ...baseInput,
      focusKeyword: "website",
      title: "Cara Membuat Website untuk UMKM",
      slug: "cara-membuat-website-umkm",
      metaDescription:
        "Panduan lengkap membuat website untuk UMKM: langkah, biaya, dan tips agar cepat online dan ditemukan pelanggan.".repeat(2),
      contentRich: doc(
        heading(1, "Cara Membuat Website"),
        para("Website adalah aset digital penting. Karena itu, UMKM perlu hadir online agar mudah ditemukan."),
        heading(2, "Persiapan"),
        para("Siapkan domain, hosting, dan konten. Selain itu, tentukan tujuan website agar tepat sasaran."),
        heading(2, "Eksekusi"),
        para("Bangun, uji, lalu publikasikan. Setelah itu, rawat dengan konten segar secara rutin.")
      ),
    }).score;
    expect(full).toBeGreaterThan(empty);
  });
});
