/**
 * Registry blok Page Builder.
 *
 * Satu sumber kebenaran untuk: props default, validasi zod, dan metadata
 * kontrol inspector. Renderer publik (app/components/site/page-blocks.tsx)
 * dan kanvas builder sama-sama memakai registry ini.
 */

import { z } from "zod";
import { BLOCK_TYPES, nodeId, type BlockType } from "./types";

// ---------- Kontrol inspector ----------

export type ControlKind =
  | "text"
  | "textarea"
  | "editor"
  | "image"
  | "url"
  | "color"
  | "number"
  | "select"
  | "checkbox"
  | "repeater";

export type ControlDef = {
  key: string;
  kind: ControlKind;
  label: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** repeater: kunci item yang dipakai sebagai judul baris ringkas */
  itemTitleKey?: string;
  itemControls?: ControlDef[];
};

const str = (def = "") => z.string().max(5000).default(def);
const longText = (def = "") => z.string().max(20000).default(def);
const bool = (def = false) => z.boolean().default(def);

const linkItem = {
  label: str("Tombol"),
  url: str("/kontak"),
};

const iconOptions = [
  "Zap",
  "Rocket",
  "ShieldCheck",
  "Gauge",
  "Palette",
  "Code2",
  "Globe",
  "Smartphone",
  "Search",
  "Headset",
  "TrendingUp",
  "Users",
  "Star",
  "CheckCircle2",
  "Wrench",
  "HeartHandshake",
].map((v) => ({ value: v, label: v }));

const textControl = (key: string, label: string, placeholder?: string): ControlDef => ({
  key,
  kind: "text",
  label,
  placeholder,
});
const textareaControl = (key: string, label: string): ControlDef => ({
  key,
  kind: "textarea",
  label,
});
const imageControl = (key: string, label: string): ControlDef => ({
  key,
  kind: "image",
  label,
});
const repeater = (
  key: string,
  label: string,
  itemTitleKey: string,
  itemControls: ControlDef[]
): ControlDef => ({ key, kind: "repeater", label, itemTitleKey, itemControls });

// ---------- Definisi blok ----------

export type BlockDef = {
  type: BlockType;
  label: string;
  description: string;
  /** nama ikon lucide untuk palette */
  icon: string;
  schema: z.ZodType<Record<string, unknown>>;
  defaults: () => Record<string, unknown>;
  controls: ControlDef[];
};

function item(withId: Record<string, unknown>): Record<string, unknown> {
  return { id: nodeId(), ...withId };
}

export const BLOCK_DEFS: Record<BlockType, BlockDef> = {
  hero: {
    type: "hero",
    label: "Hero",
    description: "Judul besar, subteks, gambar, tombol",
    icon: "Sparkles",
    schema: z
      .object({
        eyebrow: str(),
        title: str("Judul besar yang menarik"),
        subtitle: longText(),
        imageUrl: str(),
        imageAlt: str(),
        align: z.enum(["left", "center"]).default("left"),
        buttons: z
          .array(z.object({ id: str(), ...linkItem }))
          .default([]),
      })
      .passthrough(),
    defaults: () => ({
      eyebrow: "",
      title: "Judul besar yang menarik",
      subtitle: "Tulis satu-dua kalimat yang menjelaskan penawaran ini.",
      imageUrl: "",
      imageAlt: "",
      align: "left",
      buttons: [item({ label: "Hubungi Kami", url: "/kontak" })],
    }),
    controls: [
      textControl("eyebrow", "Label kecil (di atas judul)"),
      textControl("title", "Judul"),
      textareaControl("subtitle", "Subteks"),
      imageControl("imageUrl", "Gambar"),
      textControl("imageAlt", "Alt gambar"),
      {
        key: "align",
        kind: "select",
        label: "Posisi teks",
        options: [
          { value: "left", label: "Kiri" },
          { value: "center", label: "Tengah" },
        ],
      },
      repeater("buttons", "Tombol", "label", [
        textControl("label", "Teks"),
        textControl("url", "Link"),
      ]),
    ],
  },

  rich_text: {
    type: "rich_text",
    label: "Teks Kaya",
    description: "Konten TipTap (heading, list, gambar, dll)",
    icon: "Type",
    schema: z.object({ content: z.unknown() }).passthrough(),
    defaults: () => ({
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Tulis konten di sini." }],
          },
        ],
      },
    }),
    controls: [{ key: "content", kind: "editor", label: "Konten" }],
  },

  features: {
    type: "features",
    label: "Grid Fitur",
    description: "Kartu ikon + judul + deskripsi",
    icon: "LayoutGrid",
    schema: z
      .object({
        title: str(),
        columns: z.enum(["2", "3", "4"]).default("3"),
        items: z
          .array(
            z.object({
              id: str(),
              icon: str("Zap"),
              title: str("Fitur"),
              description: str(),
            })
          )
          .default([]),
      })
      .passthrough(),
    defaults: () => ({
      title: "",
      columns: "3",
      items: [
        item({ icon: "Zap", title: "Cepat", description: "Penjelasan singkat." }),
        item({ icon: "ShieldCheck", title: "Aman", description: "Penjelasan singkat." }),
        item({ icon: "Gauge", title: "Optimal", description: "Penjelasan singkat." }),
      ],
    }),
    controls: [
      textControl("title", "Judul section (opsional)"),
      {
        key: "columns",
        kind: "select",
        label: "Jumlah kolom",
        options: [
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
        ],
      },
      repeater("items", "Fitur", "title", [
        { key: "icon", kind: "select", label: "Ikon", options: iconOptions },
        textControl("title", "Judul"),
        textareaControl("description", "Deskripsi"),
      ]),
    ],
  },

  image: {
    type: "image",
    label: "Gambar",
    description: "Gambar tunggal / banner",
    icon: "Image",
    schema: z
      .object({
        url: str(),
        alt: str(),
        caption: str(),
        rounded: bool(true),
        lightbox: bool(false),
      })
      .passthrough(),
    defaults: () => ({ url: "", alt: "", caption: "", rounded: true, lightbox: false }),
    controls: [
      imageControl("url", "Gambar"),
      textControl("alt", "Alt gambar"),
      textControl("caption", "Caption (opsional)"),
      { key: "lightbox", kind: "checkbox", label: "Bisa diklik (lightbox)" },
    ],
  },

  cta_whatsapp: {
    type: "cta_whatsapp",
    label: "CTA WhatsApp",
    description: "Ajakan + tombol WhatsApp (ter-track)",
    icon: "MessageCircle",
    schema: z
      .object({
        title: str("Konsultasi gratis?"),
        description: longText(),
        buttonLabel: str("Chat WhatsApp"),
        phoneNumber: str(),
        presetMessage: str("Halo, saya tertarik dengan penawaran ini."),
      })
      .passthrough(),
    defaults: () => ({
      title: "Konsultasi gratis?",
      description: "Ceritakan kebutuhan Anda, kami balas segera.",
      buttonLabel: "Chat WhatsApp",
      phoneNumber: "",
      presetMessage: "Halo, saya tertarik dengan penawaran ini.",
    }),
    controls: [
      textControl("title", "Judul"),
      textareaControl("description", "Deskripsi"),
      textControl("buttonLabel", "Teks tombol"),
      {
        key: "phoneNumber",
        kind: "text",
        label: "Nomor WA (kosong = nomor default situs)",
        placeholder: "6281234567890",
      },
      textareaControl("presetMessage", "Pesan awal"),
    ],
  },

  faq: {
    type: "faq",
    label: "FAQ",
    description: "Akordeon pertanyaan (bikin schema FAQPage)",
    icon: "HelpCircle",
    schema: z
      .object({
        title: str("Pertanyaan Umum"),
        items: z
          .array(
            z.object({ id: str(), question: str("Pertanyaan"), answer: str() })
          )
          .default([]),
      })
      .passthrough(),
    defaults: () => ({
      title: "Pertanyaan Umum",
      items: [
        item({ question: "Berapa lama pengerjaannya?", answer: "Tergantung kompleksitas proyek." }),
        item({ question: "Apakah bisa revisi?", answer: "Bisa, sesuai paket yang dipilih." }),
      ],
    }),
    controls: [
      textControl("title", "Judul section"),
      repeater("items", "Daftar Q/A", "question", [
        textControl("question", "Pertanyaan"),
        textareaControl("answer", "Jawaban"),
      ]),
    ],
  },

  testimonial: {
    type: "testimonial",
    label: "Testimoni",
    description: "Kutipan klien + rating",
    icon: "Quote",
    schema: z
      .object({
        title: str(),
        items: z
          .array(
            z.object({
              id: str(),
              name: str("Nama Klien"),
              role: str(),
              imageUrl: str(),
              quote: str("Testimoni..."),
              rating: z.number().int().min(1).max(5).default(5),
            })
          )
          .default([]),
      })
      .passthrough(),
    defaults: () => ({
      title: "",
      items: [
        item({
          name: "Budi Santoso",
          role: "Pemilik Toko Online",
          imageUrl: "",
          quote: "Pelayanan cepat dan hasilnya melebihi ekspektasi.",
          rating: 5,
        }),
      ],
    }),
    controls: [
      textControl("title", "Judul section (opsional)"),
      repeater("items", "Testimoni", "name", [
        textControl("name", "Nama"),
        textControl("role", "Jabatan / usaha"),
        imageControl("imageUrl", "Foto (opsional)"),
        textareaControl("quote", "Kutipan"),
        { key: "rating", kind: "number", label: "Rating (1-5)" },
      ]),
    ],
  },

  gallery: {
    type: "gallery",
    label: "Galeri",
    description: "Grid gambar",
    icon: "Images",
    schema: z
      .object({
        title: str(),
        columns: z.enum(["2", "3", "4"]).default("3"),
        images: z
          .array(z.object({ id: str(), url: str(), alt: str() }))
          .default([]),
      })
      .passthrough(),
    defaults: () => ({ title: "", columns: "3", images: [] }),
    controls: [
      textControl("title", "Judul section (opsional)"),
      {
        key: "columns",
        kind: "select",
        label: "Jumlah kolom",
        options: [
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
        ],
      },
      repeater("images", "Gambar", "alt", [
        imageControl("url", "Gambar"),
        textControl("alt", "Alt gambar"),
      ]),
    ],
  },

  pricing: {
    type: "pricing",
    label: "Pricing Table",
    description: "Kartu paket harga",
    icon: "BadgeDollarSign",
    schema: z
      .object({
        title: str(),
        note: str(),
        items: z
          .array(
            z.object({
              id: str(),
              name: str("Paket"),
              price: str("Rp0"),
              period: str(),
              description: str(),
              features: str(),
              ctaLabel: str("Pilih"),
              ctaUrl: str("/kontak"),
              highlight: bool(false),
            })
          )
          .default([]),
      })
      .passthrough(),
    defaults: () => ({
      title: "",
      note: "",
      items: [
        item({
          name: "Starter",
          price: "Rp3jt",
          period: "/projek",
          description: "Untuk bisnis kecil",
          features: "Landing page\nRevisi 2x\nHosting 1 tahun",
          ctaLabel: "Pilih",
          ctaUrl: "/kontak",
          highlight: false,
        }),
      ],
    }),
    controls: [
      textControl("title", "Judul section (opsional)"),
      textControl("note", "Catatan di bawah tabel"),
      repeater("items", "Paket", "name", [
        textControl("name", "Nama paket"),
        textControl("price", "Harga"),
        textControl("period", "Satuan (mis. /projek)"),
        textControl("description", "Deskripsi singkat"),
        textareaControl("features", "Fitur (satu per baris)"),
        textControl("ctaLabel", "Teks tombol"),
        textControl("ctaUrl", "Link tombol"),
        { key: "highlight", kind: "checkbox", label: "Tonjolkan paket ini" },
      ]),
    ],
  },

  video: {
    type: "video",
    label: "Video",
    description: "Embed YouTube/Vimeo (lazy)",
    icon: "PlayCircle",
    schema: z
      .object({ url: str(), title: str() })
      .passthrough(),
    defaults: () => ({ url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", title: "Video" }),
    controls: [
      { key: "url", kind: "url", label: "URL YouTube / Vimeo" },
      textControl("title", "Judul (accessibility)"),
    ],
  },

  stats: {
    type: "stats",
    label: "Statistik",
    description: "Angka capaian (count-up)",
    icon: "BarChart3",
    schema: z
      .object({
        items: z
          .array(
            z.object({
              id: str(),
              value: str("0"),
              suffix: str(),
              label: str("Label"),
            })
          )
          .default([]),
      })
      .passthrough(),
    defaults: () => ({
      items: [
        item({ value: "150", suffix: "+", label: "Proyek selesai" }),
        item({ value: "98", suffix: "%", label: "Klien puas" }),
        item({ value: "5", suffix: " thn", label: "Pengalaman" }),
      ],
    }),
    controls: [
      repeater("items", "Statistik", "label", [
        textControl("value", "Angka"),
        textControl("suffix", "Akhiran (mis. +, %)"),
        textControl("label", "Label"),
      ]),
    ],
  },

  logo_strip: {
    type: "logo_strip",
    label: "Logo Klien",
    description: "Deretan logo (marquee halus)",
    icon: "Columns3",
    schema: z
      .object({
        title: str(),
        items: z
          .array(z.object({ id: str(), imageUrl: str(), name: str() }))
          .default([]),
      })
      .passthrough(),
    defaults: () => ({ title: "Dipercaya oleh", items: [] }),
    controls: [
      textControl("title", "Judul di atas logo (opsional)"),
      repeater("items", "Logo", "name", [
        imageControl("imageUrl", "Gambar logo"),
        textControl("name", "Nama"),
      ]),
    ],
  },

  lead_form: {
    type: "lead_form",
    label: "Form Lead",
    description: "Form masuk ke Inbox inquiry admin",
    icon: "FormInput",
    schema: z
      .object({
        title: str("Kirim pesan"),
        description: longText(),
        submitLabel: str("Kirim"),
        successMessage: str("Terima kasih! Kami akan segera menghubungi Anda."),
      })
      .passthrough(),
    defaults: () => ({
      title: "Kirim pesan",
      description: "Ceritakan kebutuhan Anda singkat saja.",
      submitLabel: "Kirim",
      successMessage: "Terima kasih! Kami akan segera menghubungi Anda.",
    }),
    controls: [
      textControl("title", "Judul"),
      textareaControl("description", "Deskripsi"),
      textControl("submitLabel", "Teks tombol"),
      textareaControl("successMessage", "Pesan sukses"),
    ],
  },
};

export const BLOCK_LIST: BlockDef[] = BLOCK_TYPES.map((t) => BLOCK_DEFS[t]);

/** Validasi + isi default props satu blok. Tidak valid → props default. */
export function parseBlockProps(
  type: BlockType,
  props: unknown
): Record<string, unknown> {
  const result = BLOCK_DEFS[type].schema.safeParse(props ?? {});
  return result.success
    ? (result.data as Record<string, unknown>)
    : BLOCK_DEFS[type].defaults();
}
