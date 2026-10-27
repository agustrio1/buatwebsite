/**
 * Model dokumen Page Builder.
 *
 * Hierarki dangkal & stabil (sesuai rencana): Section > Column > Block.
 * Props tiap blok divalidasi oleh skema zod di registry (blocks.ts).
 */

export const BLOCK_TYPES = [
  "hero",
  "rich_text",
  "features",
  "image",
  "cta_whatsapp",
  "faq",
  "testimonial",
  "gallery",
  "pricing",
  "video",
  "stats",
  "logo_strip",
  "lead_form",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export type BlockNode = {
  id: string;
  type: BlockType;
  props: Record<string, unknown>;
};

export const COLUMN_RATIOS = [
  "full",
  "half",
  "third",
  "two-thirds",
  "quarter",
] as const;

export type ColumnRatio = (typeof COLUMN_RATIOS)[number];

/** Lebar kolom dalam persen (12-col grid disederhanakan). */
export const COLUMN_WIDTH: Record<ColumnRatio, number> = {
  full: 100,
  half: 50,
  third: 33.3333,
  "two-thirds": 66.6667,
  quarter: 25,
};

export type Column = {
  id: string;
  ratio: ColumnRatio;
  blocks: BlockNode[];
};

export type SectionPadding = "none" | "sm" | "md" | "lg";

export type SectionBackground = {
  color?: string | null; // css color, mis. "#f8fafc"
  imageUrl?: string | null;
};

export type Section = {
  id: string;
  background: SectionBackground;
  padding: SectionPadding;
  columns: Column[];
};

export type PageDocument = {
  version: 1;
  sections: Section[];
};

/** ID acak pendek untuk node dokumen (bukan uuid — cukup untuk UI). */
export function nodeId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function emptyDocument(): PageDocument {
  return { version: 1, sections: [] };
}

export function newSection(columnRatio: ColumnRatio = "full"): Section {
  return {
    id: nodeId(),
    background: {},
    padding: "md",
    columns: [{ id: nodeId(), ratio: columnRatio, blocks: [] }],
  };
}
