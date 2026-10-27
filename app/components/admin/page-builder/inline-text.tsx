"use client";

import { useEffect, useRef } from "react";
import type { BlockRenderCtx } from "~/components/site/page-blocks";

/**
 * Teks yang bisa diedit langsung di kanvas builder (contentEditable).
 * Dipakai page-blocks.tsx hanya ketika ctx.editing aktif — di halaman
 * publik komponen ini merender teks biasa, tanpa JS tambahan.
 */
export function InlineText({
  ctx,
  k,
  v,
}: {
  ctx: BlockRenderCtx;
  k: string;
  v: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && el.textContent !== v) el.textContent = v;
  }, [v]);

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      role="textbox"
      data-edit-key={k}
      className="cursor-text outline-none focus:rounded focus:ring-2 focus:ring-brand-400/70"
      onClick={(e) => {
        e.stopPropagation();
        ref.current?.focus();
      }}
      onBlur={() => ctx.onEdit?.(k, ref.current?.textContent ?? "")}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === "Escape") {
          e.preventDefault();
          (e.currentTarget as HTMLElement).blur();
        }
      }}
    >
      {v}
    </span>
  );
}

/**
 * Editor inline untuk props kompleks (JSON TipTap rich_text). Teks polos
 * multi-baris; bila isJson, nilai harus parse-able sebelum di-commit.
 */
export function InlineTextarea({
  ctx,
  k,
  v,
  isJson,
  placeholder,
}: {
  ctx: BlockRenderCtx;
  k: string;
  v: string;
  isJson?: boolean;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) el.value = v;
  }, [v]);

  return (
    <div className="mb-3 space-y-1">
      <p className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
        ✏️ {k === "content" ? "Konten (JSON TipTap)" : k}
      </p>
      <textarea
        ref={ref}
        rows={6}
        placeholder={placeholder}
        onClick={(e) => e.stopPropagation()}
        onBlur={() => {
          const raw = ref.current?.value ?? "";
          if (isJson) {
            try {
              JSON.parse(raw);
            } catch {
              ref.current!.value = v; // JSON rusak: kembalikan nilai lama
              return;
            }
          }
          ctx.onEdit?.(k, raw);
        }}
        className="w-full rounded-lg border border-brand-300 bg-brand-50/40 p-2 font-mono text-[11px] text-slate-700 outline-none focus:ring-2 focus:ring-brand-400/60"
      />
    </div>
  );
}
