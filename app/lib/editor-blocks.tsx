import type { Editor } from "@tiptap/react";
import {
  Pilcrow,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  SquareCheck,
  Quote,
  Code,
  Table as TableIcon,
  ImagePlus,
  Minus,
  Info,
  CircleCheck,
  TriangleAlert,
  CircleX,
  type LucideIcon,
} from "lucide-react";
import type { CalloutVariant } from "~/lib/tiptap-extensions/callout";

export type BlockCtx = {
  editor: Editor;
  openImagePicker: () => void;
};

export type BlockCommand = {
  id: string;
  title: string;
  subtitle: string;
  keywords: string[];
  icon: LucideIcon;
  section: string;
  run: (ctx: BlockCtx) => void;
};

export function insertCallout(editor: Editor, variant: CalloutVariant) {
  editor
    .chain()
    .focus()
    .insertContent({
      type: "callout",
      attrs: { variant },
      content: [{ type: "paragraph" }],
    })
    .run();
}

function calloutCmd(
  variant: CalloutVariant,
  title: string,
  subtitle: string,
  icon: LucideIcon,
  keywords: string[]
): BlockCommand {
  return {
    id: `callout-${variant}`,
    title,
    subtitle,
    keywords,
    icon,
    section: "Sorotan",
    run: ({ editor }) => insertCallout(editor, variant),
  };
}

export const BLOCK_COMMANDS: BlockCommand[] = [
  {
    id: "paragraph",
    title: "Teks biasa",
    subtitle: "Paragraf standar",
    keywords: ["teks", "paragraf", "text", "paragraph"],
    icon: Pilcrow,
    section: "Basis",
    run: ({ editor }) => editor.chain().focus().setParagraph().run(),
  },
  {
    id: "heading1",
    title: "Judul 1",
    subtitle: "Heading besar",
    keywords: ["h1", "judul", "heading", "besar"],
    icon: Heading1,
    section: "Basis",
    run: ({ editor }) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    id: "heading2",
    title: "Judul 2",
    subtitle: "Heading sedang",
    keywords: ["h2", "judul", "heading"],
    icon: Heading2,
    section: "Basis",
    run: ({ editor }) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    id: "heading3",
    title: "Judul 3",
    subtitle: "Heading kecil",
    keywords: ["h3", "judul", "heading"],
    icon: Heading3,
    section: "Basis",
    run: ({ editor }) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    id: "bulletList",
    title: "Daftar berpoin",
    subtitle: "Bullet list",
    keywords: ["list", "poin", "bullet", "ul"],
    icon: List,
    section: "Basis",
    run: ({ editor }) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    id: "orderedList",
    title: "Daftar bernomor",
    subtitle: "Numbered list",
    keywords: ["list", "nomor", "ordered", "ol"],
    icon: ListOrdered,
    section: "Basis",
    run: ({ editor }) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    id: "taskList",
    title: "Checklist",
    subtitle: "Daftar tugas",
    keywords: ["checklist", "tugas", "task", "todo", "kotak"],
    icon: SquareCheck,
    section: "Basis",
    run: ({ editor }) => editor.chain().focus().toggleTaskList().run(),
  },
  {
    id: "quote",
    title: "Kutipan",
    subtitle: "Blockquote",
    keywords: ["quote", "kutipan", "blockquote"],
    icon: Quote,
    section: "Basis",
    run: ({ editor }) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    id: "code",
    title: "Blok kode",
    subtitle: "Code block",
    keywords: ["code", "kode", "snippet"],
    icon: Code,
    section: "Basis",
    run: ({ editor }) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    id: "table",
    title: "Tabel",
    subtitle: "3 x 3 dengan header",
    keywords: ["table", "tabel", "kolom"],
    icon: TableIcon,
    section: "Media & Data",
    run: ({ editor }) =>
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  {
    id: "image",
    title: "Gambar",
    subtitle: "Unggah dari perangkat",
    keywords: ["image", "gambar", "foto", "upload", "picture"],
    icon: ImagePlus,
    section: "Media & Data",
    run: ({ openImagePicker }) => openImagePicker(),
  },
  {
    id: "divider",
    title: "Garis pemisah",
    subtitle: "Horizontal rule",
    keywords: ["divider", "garis", "rule", "hr", "separator"],
    icon: Minus,
    section: "Media & Data",
    run: ({ editor }) => editor.chain().focus().setHorizontalRule().run(),
  },
  calloutCmd("info", "Callout: Info", "Sorotan biru", Info, ["callout", "info", "catatan", "sorotan"]),
  calloutCmd("success", "Callout: Sukses", "Sorotan hijau", CircleCheck, ["callout", "sukses", "success", "bagus"]),
  calloutCmd("warning", "Callout: Peringatan", "Sorotan kuning", TriangleAlert, ["callout", "peringatan", "warning", "hati"]),
  calloutCmd("danger", "Callout: Bahaya", "Sorotan merah", CircleX, ["callout", "bahaya", "danger", "error"]),
];
