import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import type { JSONContent } from "@tiptap/react";

const extensions = [
  StarterKit,
  Link.configure({ HTMLAttributes: { class: "text-brand-600 underline underline-offset-2" } }),
  Image.configure({ HTMLAttributes: { class: "rounded-xl max-w-full" } }),
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
      className="prose prose-sm sm:prose-base max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}