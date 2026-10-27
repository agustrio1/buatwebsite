"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import {
  useEditor,
  EditorContent,
  ReactRenderer,
  type JSONContent,
} from "@tiptap/react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import { Extension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Suggestion from "@tiptap/suggestion";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { ResizableImageEditable as ResizableImage } from "~/lib/tiptap-extensions/resizable-image-view";
import { Callout } from "~/lib/tiptap-extensions/callout";
import { BLOCK_COMMANDS } from "~/lib/editor-blocks";
import { compressImage } from "~/lib/image-compress";
import {
  SlashCommandList,
  type SlashCommandListHandle,
} from "./editor-slash-menu";
import { DropdownMenu, DropdownItem, DropdownLabel } from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/cn";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  List,
  ListOrdered,
  SquareCheck,
  Quote,
  Code,
  Heading2,
  Plus,
  LinkIcon,
  Unlink,
  ImagePlus,
  Undo,
  Redo,
  Loader2,
  Save,
  Table as TableIcon,
  Trash2,
  Rows3,
  Columns3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
} from "lucide-react";

const EMPTY_DOC: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

const EDITOR_CONTENT_CSS = `
.tiptap-content table {
  border-collapse: collapse !important;
  table-layout: fixed !important;
  width: 100% !important;
  margin: 1.25rem 0 !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 8px !important;
  overflow: hidden !important;
}
.tiptap-content td,
.tiptap-content th {
  border: 1px solid #cbd5e1 !important;
  padding: 8px 12px !important;
  vertical-align: top !important;
  box-sizing: border-box !important;
  position: relative !important;
  min-width: 1em !important;
}
.tiptap-content th {
  background-color: #f1f5f9 !important;
  font-weight: 600 !important;
  text-align: left !important;
  color: #1e293b !important;
}
.tiptap-content tr:nth-child(even) td {
  background-color: #f8fafc !important;
}
.tiptap-content .selectedCell {
  background-color: rgba(59, 130, 246, 0.15) !important;
}
.tiptap-content .column-resize-handle {
  position: absolute !important;
  right: -2px !important;
  top: 0 !important;
  bottom: -2px !important;
  width: 4px !important;
  background-color: #3b82f6 !important;
  pointer-events: none !important;
}
.tiptap-content .resize-cursor {
  cursor: col-resize !important;
}
.tiptap-content p {
  margin: 0 0 0.75em 0 !important;
}
.tiptap-content ul[data-type="taskList"] {
  list-style: none;
  padding-left: 0;
}
.tiptap-content ul[data-type="taskList"] li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}
.tiptap-content ul[data-type="taskList"] li > label {
  margin-top: 0.3rem;
}
.tiptap-content mark {
  background-color: #fde68a;
  padding: 0.05em 0.2em;
  border-radius: 0.25rem;
}
.tiptap-content u {
  text-decoration: underline;
}
.tiptap-content::after {
  content: "";
  display: table;
  clear: both;
}
.is-empty::before {
  content: attr(data-placeholder);
  color: #94a3b8;
  float: left;
  height: 0;
  pointer-events: none;
}
`;

export function RichTextEditor({
  name,
  defaultValue,
  onUpdate,
  autosaveKey,
}: {
  name: string;
  defaultValue?: JSONContent | null;
  onUpdate?: (json: JSONContent) => void;
  autosaveKey?: string;
}) {
  const [content, setContent] = useState<JSONContent>(defaultValue ?? EMPTY_DOC);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<string | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const openImageRef = useRef<() => void>(() => {});

  // Kunci draf di localStorage; autosave hanya aktif bila autosaveKey diberikan.
  const draftId = autosaveKey ? `tiptap-draft:${autosaveKey}` : null;

  // Slash menu: daftar blok saat mengetik "/" di awal baris kosong.
  const slashExtension = useMemo(
    () =>
      Extension.create({
        name: "slashMenu",
        addProseMirrorPlugins() {
          const editor = this.editor;
          return [
            Suggestion({
              editor,
              char: "/",
              startOfLine: true,
              command: ({ editor: ed, range, props }) => {
                ed.chain().focus().deleteRange(range).run();
                props?.run?.({ editor: ed, openImagePicker: () => openImageRef.current() });
              },
              render: () => {
                let component: ReactRenderer<SlashCommandListHandle> | null = null;
                let unmount: (() => void) | null = null;

                const makeProps = (props: any) => ({
                  query: props.query,
                  ctx: {
                    editor: props.editor,
                    openImagePicker: () => openImageRef.current(),
                  },
                  command: (item: (typeof BLOCK_COMMANDS)[number]) => props.command(item),
                });

                return {
                  onStart: (props) => {
                    component = new ReactRenderer(SlashCommandList, {
                      editor: props.editor,
                      props: makeProps(props),
                    });
                    unmount = props.mount(component.element);
                  },
                  onUpdate: (props) => {
                    component?.updateProps(makeProps(props));
                  },
                  onKeyDown: ({ event }) => {
                    if (event.key === "Escape") return true;
                    return component?.ref?.onKeyDown(event) ?? false;
                  },
                  onExit: () => {
                    unmount?.();
                    component?.destroy();
                    component = null;
                    unmount = null;
                  },
                };
              },
            }),
          ];
        },
      }),
    []
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { class: "text-brand-600 underline underline-offset-2" },
        },
      }),
      // Tempel teks markdown (mis. copas dari catatan/ChatGPT di HP) otomatis
      // jadi rich text: heading, list, tabel, bold, kode, dll.
      Markdown.configure({
        html: true,
        linkify: true,
        breaks: false,
        tightLists: true,
        transformPastedText: true,
        transformCopiedText: false,
      }),
      Highlight,
      TaskList,
      TaskItem.configure({ nested: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: 'Tulis sesuatu... ketik "/" untuk menyisipkan blok' }),
      CharacterCount,
      ResizableImage.configure({ HTMLAttributes: { class: "rounded-lg" } }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Callout.configure({ HTMLAttributes: {} }),
      slashExtension,
    ],
    content: defaultValue ?? EMPTY_DOC,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "tiptap-content prose prose-sm sm:prose-base max-w-none min-h-[220px] px-3 py-2.5 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      setContent(json);
      onUpdate?.(json);
      // Autosave debounce 800ms ke localStorage (aman kalau tab tertutup).
      if (draftId) {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
          try {
            window.localStorage.setItem(draftId, JSON.stringify(json));
            setDraftSavedAt(Date.now());
          } catch {
            /* storage penuh / tidak tersedia */
          }
        }, 800);
      }
    },
  });

  // Saat mount: tawarkan pemulihan kalau ada draf yang belum di-submit.
  useEffect(() => {
    if (!draftId) return;
    try {
      const raw = window.localStorage.getItem(draftId);
      if (raw && raw !== JSON.stringify(defaultValue ?? EMPTY_DOC)) {
        setPendingDraft(raw);
      }
    } catch {
      try {
        window.localStorage.removeItem(draftId);
      } catch {
        /* ignore */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId]);

  // Bersihkan draf saat form disubmit (server action yang menyimpan).
  useEffect(() => {
    if (!editor || !draftId) return;
    const form = editor.view.dom.closest("form");
    if (!form) return;
    const clearDraft = () => {
      try {
        window.localStorage.removeItem(draftId);
      } catch {
        /* ignore */
      }
      setPendingDraft(null);
    };
    form.addEventListener("submit", clearDraft);
    return () => form.removeEventListener("submit", clearDraft);
  }, [editor, draftId]);

  function saveDraftNow() {
    if (!draftId || !editor) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    try {
      window.localStorage.setItem(draftId, JSON.stringify(editor.getJSON()));
      setDraftSavedAt(Date.now());
    } catch {
      /* ignore */
    }
  }

  function restoreDraft() {
    if (!pendingDraft || !editor) return;
    try {
      editor.commands.setContent(JSON.parse(pendingDraft) as JSONContent, { emitUpdate: true });
    } catch {
      /* draf rusak, buang saja */
    }
    setPendingDraft(null);
  }

  function discardDraft() {
    if (draftId) {
      try {
        window.localStorage.removeItem(draftId);
      } catch {
        /* ignore */
      }
    }
    setPendingDraft(null);
    setDraftSavedAt(null);
  }

  // Sambungkan command "image" (slash/floating) ke input file.
  openImageRef.current = () => fileInputRef.current?.click();

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

  async function handleImageSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !editor) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", await compressImage(file));
      const response = await fetch("/api/upload-image", { method: "POST", body: formData });
      const data = await response.json();
      if (data.url) {
        editor.chain().focus().setImage({ src: data.url }).run();
      } else {
        alert("Upload gambar gagal");
      }
    } catch {
      alert("Upload gambar gagal");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  if (!editor) {
    return <div className="min-h-62 rounded-lg border border-input bg-muted/40 animate-pulse" />;
  }

  const isInTable = editor.isActive("table");

  return (
    <div className="overflow-hidden rounded-lg border border-input">
      <style>{EDITOR_CONTENT_CSS}</style>

      {/* Toolbar atas */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 px-2 py-1.5">
        {/* Block inserter (+) */}
        <DropdownMenu
          align="start"
          contentClassName="max-h-80 w-64 overflow-y-auto"
          trigger={({ toggle }) => (
            <button
              type="button"
              onClick={toggle}
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50"
              title="Sisipkan blok"
            >
              <Plus size={16} /> Blok
            </button>
          )}
        >
          {(close) => {
            let lastSection = "";
            return BLOCK_COMMANDS.map((cmd) => {
              const header = cmd.section !== lastSection ? cmd.section : null;
              lastSection = cmd.section;
              const Icon = cmd.icon;
              return (
                <div key={cmd.id}>
                  {header ? <DropdownLabel>{header}</DropdownLabel> : null}
                  <DropdownItem
                    onClick={() => {
                      cmd.run({ editor, openImagePicker: () => fileInputRef.current?.click() });
                      close();
                    }}
                  >
                    <Icon size={15} className="text-slate-500" /> {cmd.title}
                  </DropdownItem>
                </div>
              );
            });
          }}
        </DropdownMenu>

        <Divider />

        <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={16} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough size={16} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()}>
          <Highlighter size={16} />
        </ToolbarButton>

        <Divider />

        {/* Heading dropdown */}
        <DropdownMenu
          align="start"
          trigger={({ toggle }) => (
            <button
              type="button"
              onClick={toggle}
              className={cn(
                "flex items-center gap-1 rounded-md px-2 py-1.5 text-slate-500 hover:bg-slate-200",
                editor.isActive("heading") && "bg-slate-200 text-slate-700"
              )}
              title="Judul"
            >
              <Heading2 size={16} /> <ChevronDown size={13} />
            </button>
          )}
        >
          {(close) => (
            <>
              <DropdownLabel>Paragraf</DropdownLabel>
              <DropdownItem
                onClick={() => {
                  editor.chain().focus().setParagraph().run();
                  close();
                }}
              >
                Teks biasa
              </DropdownItem>
              <DropdownLabel>Heading</DropdownLabel>
              {[1, 2, 3, 4, 5, 6].map((level) => (
                <DropdownItem
                  key={level}
                  onClick={() => {
                    editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run();
                    close();
                  }}
                >
                  Judul {level}
                </DropdownItem>
              ))}
            </>
          )}
        </DropdownMenu>

        <Divider />

        <ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={16} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()}>
          <SquareCheck size={16} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={16} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Code size={16} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft size={16} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenter size={16} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRight size={16} />
        </ToolbarButton>

        <Divider />

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
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
        <ToolbarButton active={isInTable} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
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

        <Divider />

        <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>
          <Undo size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()}>
          <Redo size={16} />
        </ToolbarButton>
      </div>

      {pendingDraft && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <span>Draf lokal yang belum tersimpan ke server ditemukan. Pulihkan untuk melanjutkan menulis.</span>
          <span className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={restoreDraft}
              className="rounded-md bg-amber-600 px-2 py-1 font-medium text-white hover:bg-amber-700"
            >
              Pulihkan
            </button>
            <button
              type="button"
              onClick={discardDraft}
              className="rounded-md border border-amber-300 px-2 py-1 hover:bg-amber-100"
            >
              Buang
            </button>
          </span>
        </div>
      )}

      <EditorContent editor={editor} />

      {/* BubbleMenu: toolbar mengambang saat seleksi teks */}
      <BubbleMenu editor={editor} className="z-50">
        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-card p-1 shadow-lg">
          <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold size={15} />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic size={15} />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <UnderlineIcon size={15} />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
            <Strikethrough size={15} />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()}>
            <Highlighter size={15} />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive("link")} onClick={setLink}>
            <LinkIcon size={15} />
          </ToolbarButton>
        </div>
      </BubbleMenu>

      {/* FloatingMenu: inserter blok cepat saat baris kosong */}
      <FloatingMenu editor={editor} className="z-50">
        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-card p-1 shadow-lg">
          {BLOCK_COMMANDS.slice(0, 8).map((cmd) => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.id}
                type="button"
                title={cmd.title}
                onClick={() => cmd.run({ editor, openImagePicker: () => fileInputRef.current?.click() })}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-slate-600 hover:bg-muted"
              >
                <Icon size={14} />
              </button>
            );
          })}
        </div>
      </FloatingMenu>

      <div className="flex items-center justify-between border-t border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
        <span>{editor.storage.characterCount.words()} kata</span>
        <span className="flex items-center gap-3">
          {autosaveKey && (
            <button
              type="button"
              onClick={saveDraftNow}
              title="Simpan draf ke perangkat ini"
              className="flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-slate-200 hover:text-slate-700"
            >
              <Save size={13} />
              {draftSavedAt
                ? `Draf ${new Date(draftSavedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`
                : "Simpan draf"}
            </button>
          )}
          <span>{editor.storage.characterCount.characters()} karakter</span>
        </span>
      </div>

      <input type="hidden" name={name} value={JSON.stringify(content)} />
    </div>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-border" />;
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
      className={cn(
        "rounded p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        active ? "bg-brand-500 text-white" : "text-slate-500 hover:bg-slate-200"
      )}
    >
      {children}
    </button>
  );
}
