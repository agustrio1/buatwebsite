import { mergeAttributes } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import type { CSSProperties } from "react";

export type ImageAlign = "left" | "center" | "right" | "full";

const CAPTION_STYLE =
  "font-size:0.8125rem;color:#64748b;font-style:italic;text-align:center;margin:0.375rem 0 0 0;padding:0;line-height:1.4";

/**
 * Satu-satunya sumber kebenaran untuk style alignment/width gambar.
 * Dipakai baik oleh NodeView (editor) maupun renderHTML (halaman publik),
 * jadi tampilan di admin dan di publik selalu identik.
 */
export function getImageStyle(align: ImageAlign, width: string | null): CSSProperties {
  const effectiveWidth = width ?? (align === "full" ? "100%" : "fit-content");
  const base: CSSProperties = { width: effectiveWidth, maxWidth: "100%" };

  switch (align) {
    case "left":
      return { ...base, float: "left", margin: "0.25rem 1.25rem 1rem 0" };
    case "right":
      return { ...base, float: "right", margin: "0.25rem 0 1rem 1.25rem" };
    case "full":
      return { ...base, display: "block", margin: "1rem 0" };
    case "center":
    default:
      return { ...base, display: "block", marginLeft: "auto", marginRight: "auto" };
  }
}

function kebabCase(key: string): string {
  return key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function styleObjectToCssString(style: CSSProperties): string {
  return Object.entries(style)
    .map(([key, value]) => `${kebabCase(key)}:${value}`)
    .join(";");
}

/**
 * Ekstensi gambar yang aman untuk Server Component: hanya berisi atribut +
 * renderHTML (dipakai generateHTML di halaman publik). NodeView React yang
 * butuh hook/portal dipisah ke resizable-image-view.tsx ("use client").
 */
export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => element.style.width || null,
        renderHTML: () => ({}),
      },
      align: {
        default: "center" as ImageAlign,
        parseHTML: (element) => (element.getAttribute("data-align") as ImageAlign) || "center",
        renderHTML: () => ({}),
      },
      caption: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-caption") || null,
        renderHTML: () => ({}),
      },
    };
  },

  // PENTING: width/align/caption sengaja punya renderHTML: () => ({}) di atas
  // (biar tidak otomatis nongol sebagai atribut HTML literal). Efeknya, TipTap
  // MENGHAPUS ketiga key itu dari `HTMLAttributes` sebelum sampai di sini —
  // jadi kita WAJIB baca nilainya langsung dari `node.attrs`, BUKAN dari
  // `HTMLAttributes` (yang mana selalu undefined untuk ketiganya).
  renderHTML({ node, HTMLAttributes }) {
    const width = (node.attrs.width as string | null) ?? null;
    const align = (node.attrs.align as ImageAlign) ?? "center";
    const caption = (node.attrs.caption as string | null) ?? null;

    const style = styleObjectToCssString(getImageStyle(align, width));

    const imgAttrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
      style,
      "data-align": align,
    });

    if (!caption) {
      return ["img", imgAttrs];
    }

    // Caption pakai inline style (bukan cuma class), karena elemen ini
    // dirender di dalam wrapper ".prose" (Tailwind Typography) di halaman
    // publik. Plugin itu punya default styling sendiri untuk <figcaption>
    // yang bisa menang lawan class custom biasa. Inline style selalu
    // menang di atas selector class apa pun, jadi tampilannya konsisten
    // di mana pun elemen ini dirender.
    return [
      "figure",
      { "data-caption": caption, style: "margin:0" },
      ["img", imgAttrs],
      ["figcaption", { class: "tiptap-image-caption", style: CAPTION_STYLE }, caption],
    ];
  },
});
