import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { ResizableImage } from "~/lib/tiptap-extensions/resizable-image";
import { Callout } from "~/lib/tiptap-extensions/callout";
import type { JSONContent } from "@tiptap/react";

// Harus mencerminkan ekstensi yang dipakai editor admin (rich-text-editor.tsx)
// supaya blok yang dibuat di admin (heading 1-6, underline, highlight, checklist,
// text-align, callout) dirender identik di halaman publik.
const extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3, 4, 5, 6] },
    link: { HTMLAttributes: { class: "text-brand-600 underline underline-offset-2" } },
  }),
  Highlight,
  TaskList,
  TaskItem.configure({ nested: true }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  ResizableImage.configure({ HTMLAttributes: { class: "rounded-xl" } }),
  Table.configure({ HTMLAttributes: { class: "tiptap-table-wrapper" } }),
  TableRow,
  TableHeader,
  TableCell,
  Callout,
];

export function richTextToHtml(content: JSONContent | null): string {
  if (!content) return "";
  return generateHTML(content, extensions);
}

export function RichTextView({ content }: { content: JSONContent | null }) {
  const html = richTextToHtml(content);

  if (!html) {
    return null;
  }

  return (
    <div
      className="prose prose-sm sm:prose-base max-w-none tiptap-table-wrapper"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
