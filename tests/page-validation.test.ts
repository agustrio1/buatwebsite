import { describe, expect, it } from "vitest";
import {
  pageSchema,
  pageDocumentSchema,
  isReservedPageSlug,
  parsePageContent,
} from "../app/lib/validation/page";
import { BLOCK_DEFS, parseBlockProps } from "../app/lib/page-builder/blocks";
import { BLOCK_TYPES } from "../app/lib/page-builder/types";

describe("pageSchema", () => {
  it("menerima slug biasa", () => {
    const ok = pageSchema.safeParse({
      title: "Halaman Promo",
      slug: "promo-leads",
      status: "draft",
    });
    expect(ok.success).toBe(true);
  });

  it("menolak slug sistem (reserved)", () => {
    const bad = pageSchema.safeParse({
      title: "Halaman Palsu",
      slug: "blog",
      status: "published",
    });
    expect(bad.success).toBe(false);
  });

  it("menolak slug berhuruf besar / spasi", () => {
    const bad = pageSchema.safeParse({
      title: "Contoh",
      slug: "Halaman Baru",
      status: "draft",
    });
    expect(bad.success).toBe(false);
  });

  it("isReservedPageSlug mengabaikan slash tepi", () => {
    expect(isReservedPageSlug("/kontak/")).toBe(true);
    expect(isReservedPageSlug("promo")).toBe(false);
  });
});

describe("pageDocumentSchema", () => {
  it("menerima dokumen kosong", () => {
    const ok = pageDocumentSchema.safeParse({ version: 1, sections: [] });
    expect(ok.success).toBe(true);
  });

  it("menerima section valid dengan blok hero", () => {
    const doc = {
      version: 1,
      sections: [
        {
          id: "s1",
          background: { color: "#fff" },
          padding: "md",
          columns: [
            {
              id: "c1",
              ratio: "full",
              blocks: [{ id: "b1", type: "hero", props: { title: "Halo" } }],
            },
          ],
        },
      ],
    };
    const ok = pageDocumentSchema.safeParse(doc);
    expect(ok.success).toBe(true);
  });

  it("menolak tipe blok tidak dikenal", () => {
    const doc = {
      version: 1,
      sections: [
        {
          id: "s1",
          background: {},
          padding: "md",
          columns: [
            {
              id: "c1",
              ratio: "full",
              blocks: [{ id: "b1", type: "hack", props: {} }],
            },
          ],
        },
      ],
    };
    expect(pageDocumentSchema.safeParse(doc).success).toBe(false);
  });

  it("menolak section tanpa kolom", () => {
    const doc = {
      version: 1,
      sections: [{ id: "s1", background: {}, padding: "md", columns: [] }],
    };
    expect(pageDocumentSchema.safeParse(doc).success).toBe(false);
  });
});

describe("registry blok", () => {
  it("13 blok terdaftar lengkap", () => {
    expect(BLOCK_TYPES.length).toBe(13);
    for (const t of BLOCK_TYPES) {
      expect(BLOCK_DEFS[t].type).toBe(t);
    }
  });

  it("default props tiap blok lolos skemanya sendiri", () => {
    for (const t of BLOCK_TYPES) {
      const def = BLOCK_DEFS[t];
      const parsed = def.schema.safeParse(def.defaults());
      expect(parsed.success, `blok ${t} defaults tidak valid`).toBe(true);
    }
  });

  it("parseBlockProps mengembalikan default saat props rusak", () => {
    const props = parseBlockProps("hero", { title: 123, buttons: "bukan array" });
    expect(props.title).toBe(BLOCK_DEFS.hero.defaults().title);
  });
});

describe("parsePageContent", () => {
  it("null untuk JSON rusak / kosong", () => {
    expect(parsePageContent("{rusak")).toBeNull();
    expect(parsePageContent(null)).toBeNull();
  });
  it("objek untuk JSON valid", () => {
    expect(parsePageContent('{"a":1}')).toEqual({ a: 1 });
  });
});
