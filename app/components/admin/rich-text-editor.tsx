import { useRef, useState } from "react";
import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  LinkIcon,
  Unlink,
  ImagePlus,
  Undo,
  Redo,
  Loader2,
  TableIcon,
  Trash2,
  Rows3,
  Columns3,
} from "lucide-react";

const emptyDoc: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

const tableCss = `
.tiptap-table-wrapper table {
  border-collapse: collapse !important;
  table-layout: fixed !important;
  width: 100% !important;
  margin: 1.25rem 0 !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 8px !important;
  overflow: hidden !important;
}
.tiptap-table-wrapper td,
.tiptap-table-wrapper th {
  border: 1px solid #cbd5e1 !important;
  padding: 8px 12px !important;
  vertical-align: top !important;
  box-sizing: border-box !important;
  position: relative !important;
  min-width: 1em !important;
}
.tiptap-table-wrapper th {
  background-color: #f1f5f9 !important;
  font-weight: 600 !important;
  text-align: left !important;
  color: #1e293b !important;
}
.tiptap-table-wrapper tr:nth-child(even) td {
  background-color: #f8fafc !important;
}
.tiptap-table-wrapper .selectedCell {
  background-color: rgba(59, 130, 246, 0.15) !important;
}
.tiptap-table-wrapper .column-resize-handle {
  position: absolute !important;
  right: -2px !important;
  top: 0 !important;
  bottom: -2px !important;
  width: 4px !important;
  background-color: #3b82f6 !important;
  pointer-events: none !important;
}
.tiptap-table-wrapper .resize-cursor {
  cursor: col-resize !important;
}
.tiptap-table-wrapper p {
  margin: 0 !important;
}
`;

export function RichTextEditor({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: JSONContent | null;
}) {
  const [content, setContent] = useState<JSONContent>(defaultValue ?? emptyDoc);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { class: "text-brand-600 underline underline-offset-2" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full" },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: defaultValue ?? emptyDoc,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none min-h-[200px] px-3 py-2.5 focus:outline-none tiptap-table-wrapper",
      },
    },
    onUpdate: ({ editor }) => setContent(editor.getJSON()),
  });

  function setLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Masukkan URL tautan:", previousUrl ?? "");

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  function insertTable() {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/upload-image", { method: "POST", body: fd });
      const data = await res.json();

      if (data.url) {
        editor.chain().focus().setImage({ src: data.url }).run();
      } else {
        alert("Upload gambar gagal");
      }
    } catch {
      alert("Upload gambar gagal");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  if (!editor) {
    return <div className="border rounded-lg min-h-62 bg-slate-50 animate-pulse" />;
  }

  const isInTable = editor.isActive("table");

  return (
    <div className="border rounded-lg overflow-hidden">
      <style>{tableCss}</style>

      <div className="flex flex-wrap items-center gap-1 border-b bg-slate-50 px-2 py-1.5">
        <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough size={16} />
        </ToolbarButton>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        <ToolbarButton
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 size={16} />
        </ToolbarButton>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        <ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={16} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={16} />
        </ToolbarButton>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        <ToolbarButton active={editor.isActive("link")} onClick={setLink}>
          <LinkIcon size={16} />
        </ToolbarButton>
        {editor.isActive("link") && (
          <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()}>
            <Unlink size={16} />
          </ToolbarButton>
        )}
        <ToolbarButton onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
          {isUploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        <div className="w-px h-5 bg-slate-200 mx-1" />

        <ToolbarButton active={isInTable} onClick={insertTable}>
          <TableIcon size={16} />
        </ToolbarButton>

        {isInTable && (
          <>
            <ToolbarButton onClick={() => editor.chain().focus().addRowAfter().run()}>
              <Rows3 size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().addColumnAfter().run()}>
              <Columns3 size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().deleteRow().run()}>
              <Rows3 size={16} className="opacity-50" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().deleteColumn().run()}>
              <Columns3 size={16} className="opacity-50" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().deleteTable().run()}>
              <Trash2 size={16} className="text-rose-500" />
            </ToolbarButton>
          </>
        )}

        <div className="w-px h-5 bg-slate-200 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>
          <Undo size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()}>
          <Redo size={16} />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />

      <input type="hidden" name={name} value={JSON.stringify(content)} />
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        active ? "bg-brand-500 text-white" : "text-slate-500 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}