import { mergeAttributes } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Maximize2,
  Pencil,
  X,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

export type ImageAlign = "left" | "center" | "right" | "full";

const MIN_IMAGE_WIDTH_PX = 80;

const CAPTION_STYLE =
  "font-size:0.8125rem;color:#64748b;font-style:italic;text-align:center;margin:0.375rem 0 0 0;padding:0;line-height:1.4";

/**
 * Satu-satunya sumber kebenaran untuk style alignment/width gambar.
 * Dipakai baik oleh NodeView (editor) maupun renderHTML (halaman publik),
 * jadi tampilan di admin dan di publik selalu identik.
 */
function getImageStyle(align: ImageAlign, width: string | null): CSSProperties {
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

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});

type ImageAttrsState = {
  alt: string;
  title: string;
  caption: string;
};

function ResizableImageView({ node, updateAttributes, selected }: NodeViewProps) {
  const { src, alt, title, caption, width, align } = node.attrs as {
    src: string;
    alt: string | null;
    title: string | null;
    caption: string | null;
    width: string | null;
    align: ImageAlign;
  };

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  const handleResizeStart = useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault();
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const startX = event.clientX;
      const startWidthPx = wrapper.getBoundingClientRect().width;
      const containerWidthPx = wrapper.parentElement?.getBoundingClientRect().width ?? startWidthPx;

      setIsResizing(true);

      function handlePointerMove(moveEvent: PointerEvent) {
        const deltaPx = moveEvent.clientX - startX;
        const nextWidthPx = Math.max(MIN_IMAGE_WIDTH_PX, startWidthPx + deltaPx);
        const nextWidthPercent = Math.min(100, Math.round((nextWidthPx / containerWidthPx) * 100));
        updateAttributes({ width: `${nextWidthPercent}%` });
      }

      function handlePointerUp() {
        setIsResizing(false);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      }

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    },
    [updateAttributes]
  );

  function handleSaveDetails(values: ImageAttrsState) {
    updateAttributes({
      alt: values.alt.trim() || null,
      title: values.title.trim() || null,
      caption: values.caption.trim() || null,
    });
    setIsEditingDetails(false);
  }

  const wrapperStyle = getImageStyle(align, width);

  return (
    <NodeViewWrapper
      as="div"
      ref={wrapperRef}
      data-drag-handle
      className={`relative group ${selected ? "ring-2 ring-brand-400 rounded" : ""}`}
      style={wrapperStyle}
    >
      <img src={src} alt={alt ?? ""} title={title ?? undefined} className="block w-full h-auto rounded select-none" draggable={false} />

      {caption ? (
        <p className="text-xs text-slate-500 italic text-center mt-1.5">{caption}</p>
      ) : null}

      {selected && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-slate-800 rounded-lg shadow-lg px-1 py-1 z-10 whitespace-nowrap">
          <AlignButton icon={AlignLeft} label="Rata kiri" active={align === "left"} onClick={() => updateAttributes({ align: "left" })} />
          <AlignButton icon={AlignCenter} label="Tengah" active={align === "center"} onClick={() => updateAttributes({ align: "center" })} />
          <AlignButton icon={AlignRight} label="Rata kanan" active={align === "right"} onClick={() => updateAttributes({ align: "right" })} />
          <AlignButton icon={Maximize2} label="Lebar penuh" active={align === "full"} onClick={() => updateAttributes({ align: "full", width: null })} />
          <div className="w-px h-4 bg-slate-600 mx-0.5" />
          <AlignButton icon={Pencil} label="Edit detail gambar" active={false} onClick={() => setIsEditingDetails(true)} />
        </div>
      )}

      {selected && (
        <div
          onPointerDown={handleResizeStart}
          role="slider"
          aria-label="Ubah ukuran gambar"
          aria-valuenow={width ? parseInt(width, 10) : 100}
          className={[
            "absolute bottom-1 right-1 w-3.5 h-3.5 bg-brand-500 border-2 border-white rounded-full cursor-se-resize shadow transition-transform",
            isResizing ? "scale-125" : "",
          ].join(" ")}
        />
      )}

      {isEditingDetails && (
        <ImageDetailsModal
          initialAlt={alt ?? ""}
          initialTitle={title ?? ""}
          initialCaption={caption ?? ""}
          onCancel={() => setIsEditingDetails(false)}
          onSave={handleSaveDetails}
        />
      )}
    </NodeViewWrapper>
  );
}

function AlignButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-pressed={active}
      className={`p-1.5 rounded transition-colors ${active ? "bg-brand-500 text-white" : "text-slate-300 hover:bg-slate-700"}`}
    >
      <Icon size={14} />
    </button>
  );
}

/**
 * Modal terpusat, di-render via Portal langsung ke document.body agar tidak
 * pernah terpotong oleh overflow-hidden container manapun.
 *
 * PENTING: tombol "Simpan" sengaja type="button" (BUKAN type="submit" di
 * dalam <form>). Modal ini tidak butuh elemen <form> sama sekali — hanya
 * kumpulan <input>/<textarea> terkontrol React biasa. Ini menghindari kelas
 * bug "form ter-submit secara native tanpa sengaja" (menyebabkan navigasi/
 * reload halaman penuh dan semua perubahan hilang) yang bisa terjadi kalau
 * <form> tanpa action/method dibiarkan ada di DOM.
 */
function ImageDetailsModal({
  initialAlt,
  initialTitle,
  initialCaption,
  onCancel,
  onSave,
}: {
  initialAlt: string;
  initialTitle: string;
  initialCaption: string;
  onCancel: () => void;
  onSave: (values: ImageAttrsState) => void;
}) {
  const [altValue, setAltValue] = useState(initialAlt);
  const [titleValue, setTitleValue] = useState(initialTitle);
  const [captionValue, setCaptionValue] = useState(initialCaption);
  const altInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    altInputRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  function handleSaveClick() {
    onSave({ alt: altValue, title: titleValue, caption: captionValue });
  }

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
          <h4 className="text-base font-semibold text-slate-800">Detail Gambar</h4>
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Alt Text
              <span className="font-normal text-slate-400 ml-1">— untuk aksesibilitas & SEO</span>
            </label>
            <input
              ref={altInputRef}
              type="text"
              value={altValue}
              onChange={(event) => setAltValue(event.target.value)}
              placeholder="Deskripsi singkat isi gambar"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Title
              <span className="font-normal text-slate-400 ml-1">— muncul saat kursor diarahkan</span>
            </label>
            <input
              type="text"
              value={titleValue}
              onChange={(event) => setTitleValue(event.target.value)}
              placeholder="Judul tooltip gambar"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Caption
              <span className="font-normal text-slate-400 ml-1">— tampil di bawah gambar</span>
            </label>
            <textarea
              value={captionValue}
              onChange={(event) => setCaptionValue(event.target.value)}
              placeholder="Keterangan gambar untuk pembaca"
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveClick}
              className="px-4 py-2 text-sm font-medium bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}