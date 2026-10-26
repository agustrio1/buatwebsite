import { describe, it, expect } from "vitest";
import { postSchema, flattenZodErrors } from "~/lib/validation/post";

describe("postSchema", () => {
  it("menerima data valid dengan slug format benar", () => {
    const result = postSchema.safeParse({
      title: "Cara Membuat Website",
      slug: "cara-membuat-website",
      status: "published",
    });
    expect(result.success).toBe(true);
  });

  it("menolak slug berhuruf kapital / spasi / underscore", () => {
    for (const slug of ["Cara-Website", "cara website", "cara_website", "-awal", "akhir-"]) {
      const result = postSchema.safeParse({ title: "Judul", slug, status: "draft" });
      expect(result.success, `slug '${slug}' harus ditolak`).toBe(false);
    }
  });

  it("menolak judul terlalu pendek dan mewajibkan status enum", () => {
    expect(postSchema.safeParse({ title: "ab", slug: "abc", status: "draft" }).success).toBe(false);
    expect(
      postSchema.safeParse({ title: "Judul", slug: "judul", status: "arsip" }).success
    ).toBe(false);
  });

  it("flattenZodErrors memetakan pesan pertama ke field terkait", () => {
    const parsed = postSchema.safeParse({ title: "ab", slug: "Slug Salah", status: "draft" });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const errors = flattenZodErrors(parsed.error);
      expect(errors.title).toBe("Judul minimal 3 karakter");
      expect(errors.slug).toContain("huruf kecil");
    }
  });
});
