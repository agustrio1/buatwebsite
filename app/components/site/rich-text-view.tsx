import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

export function RichTextView({ content }: { content: JSONContent | null }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ HTMLAttributes: { class: "text-brand-600 underline underline-offset-2" } }),
      Image.configure({ HTMLAttributes: { class: "rounded-xl max-w-full" } }),
    ],
    content: content ?? { type: "doc", content: [{ type: "paragraph" }] },
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base max-w-none",
      },
    },
  });

  if (!editor) {
    return <div className="min-h-[200px] bg-slate-50 rounded-xl animate-pulse" />;
  }

  return <EditorContent editor={editor} />;
}