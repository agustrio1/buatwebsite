import { Node, mergeAttributes } from "@tiptap/core";

export type CalloutVariant = "info" | "success" | "warning" | "danger";

export const CALLOUT_VARIANTS: CalloutVariant[] = ["info", "success", "warning", "danger"];

/**
 * Blok "Callout" (kotak sorotan) ala Gutenberg notice.
 * Server-safe: hanya berisi atribut + renderHTML, sehingga dipakai bersama oleh
 * editor admin dan `generateHTML` di halaman publik (paritas render).
 * Styling lewat class `tiptap-callout--<variant>` yang didefinisikan di globals.css.
 */
export const Callout = Node.create<{ HTMLAttributes: Record<string, unknown> }>({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      variant: {
        default: "info" as CalloutVariant,
        parseHTML: (element) =>
          (element.getAttribute("data-callout") as CalloutVariant) || "info",
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-callout]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const variant = (node.attrs.variant as CalloutVariant) ?? "info";
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-callout": variant,
        class: `tiptap-callout tiptap-callout--${variant}`,
      }),
      0,
    ];
  },
});
