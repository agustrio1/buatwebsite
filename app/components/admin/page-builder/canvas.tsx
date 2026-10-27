"use client";

import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Copy,
  ImageIcon,
  PanelTop,
  Plus,
  Trash2,
} from "lucide-react";
import { BLOCK_DEFS } from "~/lib/page-builder/blocks";
import type { BlockNode, Column, PageDocument, Section } from "~/lib/page-builder/types";
import { BlockView, type BlockRenderCtx } from "~/components/site/page-blocks";

// ---------- tipe bersama builder ----------

export type Location = { sectionId: string; colId: string };
export type Selection = { sectionId: string; colId?: string; blockId?: string };

/** Target drop hasil pembacaan data drag (dipakai kolom & kartu tambahan). */
export type DragTarget =
  | { kind: "move"; from: Location; blockId: string }
  | { kind: "insert"; blockType: string }
  | null;

// Kelas span kolom HARUS literal supaya dipindai Tailwind.
const COL_SPAN: Record<Column["ratio"], string> = {
  full: "md:col-span-12",
  half: "md:col-span-6",
  third: "md:col-span-4",
  "two-thirds": "md:col-span-8",
  quarter: "md:col-span-3",
};

// ---------- drop zone kolom ----------

function ColumnDropZone({
  loc,
  target,
  selected,
  onSelect,
  children,
}: {
  loc: Location;
  target: DragTarget;
  selected: boolean;
  onSelect: (sel: Selection) => void;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `col:${loc.sectionId}:${loc.colId}`,
    data: { loc },
  });

  return (
    <div
      ref={setNodeRef}
      onClick={(e) => {
        // Stop agar tidak bubbling ke <main> (deselect) saat memilih kolom.
        e.stopPropagation();
        onSelect({ sectionId: loc.sectionId, colId: loc.colId });
      }}
      className={`relative rounded-xl transition ${
        isOver && target
          ? "ring-2 ring-brand-500 bg-brand-50/60"
          : selected
            ? "ring-1 ring-brand-300"
            : ""
      }`}
    >
      {children}
      {isOver && target && (
        <div className="pointer-events-none absolute inset-x-3 top-1 z-10 rounded-md border-2 border-dashed border-brand-500 bg-white/80 px-2 py-1 text-[11px] font-semibold text-brand-700">
          {target.kind === "insert"
            ? `Letakkan di sini`
            : "Pindahkan ke sini"}
        </div>
      )}
    </div>
  );
}

// ---------- shell satu blok ----------

function ToolBtn({
  onClick,
  disabled,
  title,
  children,
  danger,
}: {
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`rounded p-1 transition disabled:opacity-30 ${
        danger ? "text-red-500 hover:bg-red-50" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

export function BlockShell({
  block,
  loc,
  index,
  count,
  isFirst,
  isLast,
  hasPrevCol,
  hasNextCol,
  selected,
  onSelect,
  onMove,
  onDuplicate,
  onDelete,
  onMoveColumn,
  ctx,
}: {
  block: BlockNode;
  loc: Location;
  index: number;
  count: number;
  isFirst: boolean;
  isLast: boolean;
  hasPrevCol: boolean;
  hasNextCol: boolean;
  selected: boolean;
  onSelect: (sel: Selection) => void;
  onMove: (loc: Location, id: string, dir: -1 | 1) => void;
  onDuplicate: (loc: Location, id: string) => void;
  onDelete: (loc: Location, id: string) => void;
  onMoveColumn: (from: Location, blockId: string, dir: -1 | 1) => void;
  ctx: BlockRenderCtx;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: `blk:${block.id}`,
      data: { loc, blockId: block.id, from: "canvas" },
    });

  const def = BLOCK_DEFS[block.type];
  const stop = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn();
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group/block relative rounded-lg ${isDragging ? "opacity-40" : ""}`}
    >
      {/* frame pointer-events-none supaya isi blok tetap bisa diklik/di-scroll */}
      <div
        className={`pointer-events-none rounded-lg ring-offset-2 transition ${
          selected ? "ring-2 ring-brand-500" : "group-hover/block:ring-1 group-hover/block:ring-brand-300"
        }`}
      />
      <div
        onClick={(e) => {
          // Stop agar tidak ditimpa handler kolom/induk & deselect di <main>.
          e.stopPropagation();
          onSelect({ ...loc, blockId: block.id });
        }}
        className={`rounded-lg ${selected ? "" : "cursor-move"}`}
        {...attributes}
        {...listeners}
      >
        <BlockView block={block} ctx={ctx} />
      </div>

      {/* toolbar mengambang */}
      <div
        className={`absolute -top-3 right-1 z-20 flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white px-1 shadow-md transition ${
          selected ? "opacity-100" : "opacity-0 group-hover/block:opacity-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="flex max-w-28 items-center gap-1 truncate px-1 text-[11px] font-bold text-brand-700">
          {def.label}
        </span>
        <span className="mx-0.5 h-4 w-px bg-slate-200" />
        <ToolBtn title="Turunkan" onClick={stop(() => onMove(loc, block.id, 1))} disabled={isLast}>
          <ArrowDown size={13} />
        </ToolBtn>
        <ToolBtn title="Naikkan" onClick={stop(() => onMove(loc, block.id, -1))} disabled={isFirst}>
          <ArrowUp size={13} />
        </ToolBtn>
        <ToolBtn
          title="Pindah ke kolom sebelumnya"
          onClick={stop(() => onMoveColumn(loc, block.id, -1))}
          disabled={!hasPrevCol}
        >
          <ArrowLeft size={13} />
        </ToolBtn>
        <ToolBtn
          title="Pindah ke kolom berikutnya"
          onClick={stop(() => onMoveColumn(loc, block.id, 1))}
          disabled={!hasNextCol}
        >
          <ArrowRight size={13} />
        </ToolBtn>
        <ToolBtn title="Duplikat" onClick={stop(() => onDuplicate(loc, block.id))}>
          <Copy size={13} />
        </ToolBtn>
        <ToolBtn title="Hapus" danger onClick={stop(() => onDelete(loc, block.id))}>
          <Trash2 size={13} />
        </ToolBtn>
        <span className="w-2 text-center text-[10px] font-bold text-slate-300">{index + 1}</span>
      </div>
    </div>
  );
}

// ---------- shell satu section ----------

const PAD_LABEL: Record<Section["padding"], string> = {
  none: "Tanpa jarak",
  sm: "Kecil",
  md: "Sedang",
  lg: "Besar",
};

export function SectionFrame({
  section,
  index,
  total,
  selection,
  dragTarget,
  document,
  ctx,
  onInlineEdit,
  onSelect,
  onChange,
  onSectionMove,
  onSectionDuplicate,
  onSectionDelete,
  onAddColumn,
  onAddBlockAt,
  onBlockMove,
  onBlockDuplicate,
  onBlockDelete,
  onBlockMoveColumn,
}: {
  section: Section;
  index: number;
  total: number;
  selection: Selection | null;
  dragTarget: DragTarget;
  document: PageDocument;
  ctx: BlockRenderCtx;
  onInlineEdit: (blockId: string, key: string, value: string) => void;
  onSelect: (sel: Selection) => void;
  onChange: (section: Section) => void;
  onSectionMove: (id: string, dir: -1 | 1) => void;
  onSectionDuplicate: (id: string) => void;
  onSectionDelete: (id: string) => void;
  onAddColumn: (sectionId: string) => void;
  onAddBlockAt: (loc: Location) => void;
  onBlockMove: (loc: Location, id: string, dir: -1 | 1) => void;
  onBlockDuplicate: (loc: Location, id: string) => void;
  onBlockDelete: (loc: Location, id: string) => void;
  onBlockMoveColumn: (from: Location, blockId: string, dir: -1 | 1) => void;
}) {
  const secSelected = selection?.sectionId === section.id && !selection.blockId;
  const bg = section.background ?? {};

  // ctx per blok: hanya blok terpilih yang dapat editing/onEdit (inline edit)
  const ctxFor = (blockId: string): BlockRenderCtx =>
    selection?.blockId === blockId && ctx.editing
      ? { ...ctx, onEdit: (key, value) => onInlineEdit(blockId, key, value) }
      : ctx;

  const setProp = <K extends keyof Section>(key: K, value: Section[K]) =>
    onChange({ ...section, [key]: value });

  const colCount = section.columns.length;

  return (
    <div className={`group/section relative ${secSelected ? "outline outline-2 -outline-offset-2 outline-brand-500" : ""}`}>
      {/* bilah alat section */}
      <div
        className={`absolute left-2 top-1 z-30 flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white/95 px-1.5 py-0.5 shadow-sm backdrop-blur transition ${
          secSelected ? "opacity-100" : "opacity-0 hover:opacity-100 group-hover/section:opacity-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onSelect({ sectionId: section.id })}
          className="px-1 text-[11px] font-bold text-brand-700"
          title="Pilih section (edit gaya di panel kanan)"
        >
          Section {index + 1}
        </button>
        <span className="mx-0.5 h-4 w-px bg-slate-200" />
        <label className="flex items-center gap-1 px-1 text-[11px] text-slate-500" title="Jarak atas-bawah">
          <select
            value={section.padding}
            onChange={(e) => setProp("padding", e.target.value as Section["padding"])}
            className="rounded border border-slate-200 bg-white px-1 py-0.5 text-[11px]"
          >
            {(Object.keys(PAD_LABEL) as Section["padding"][]).map((p) => (
              <option key={p} value={p}>
                {PAD_LABEL[p]}
              </option>
            ))}
          </select>
        </label>
        <ToolBtn
          title={bg.color || bg.imageUrl ? "Bersihkan latar" : "Warnai / gambari latar section"}
          onClick={stop2(() => {
            if (bg.color || bg.imageUrl) {
              onChange({ ...section, background: {} });
            } else {
              onSelect({ sectionId: section.id });
            }
          })}
        >
          <ImageIcon size={13} className={bg.color || bg.imageUrl ? "text-brand-600" : ""} />
        </ToolBtn>
        <ToolBtn title="Tambah kolom" onClick={stop2(() => onAddColumn(section.id))}>
          <Plus size={13} />
        </ToolBtn>
        <ToolBtn title="Duplikat section" onClick={stop2(() => onSectionDuplicate(section.id))}>
          <Copy size={13} />
        </ToolBtn>
        <ToolBtn title="Hapus section" danger onClick={stop2(() => onSectionDelete(section.id))} disabled={total <= 1}>
          <Trash2 size={13} />
        </ToolBtn>
        <span className="px-0.5 text-[10px] font-bold text-slate-300">{colCount} kol</span>
        <ToolBtn title="Naikkan section" onClick={stop2(() => onSectionMove(section.id, -1))} disabled={index === 0}>
          <ArrowUp size={13} />
        </ToolBtn>
        <ToolBtn title="Turunkan section" onClick={stop2(() => onSectionMove(section.id, 1))} disabled={index === total - 1}>
          <ArrowDown size={13} />
        </ToolBtn>
      </div>

      {/* body section */}
      <div
        className="min-h-16"
        style={{
          backgroundColor: bg.color || undefined,
          backgroundImage: bg.imageUrl ? `url(${bg.imageUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className={`grid grid-cols-1 gap-6 ${colCount > 1 ? "md:grid-cols-12" : ""}`}>
            {section.columns.map((col, ci) => {
              const loc: Location = { sectionId: section.id, colId: col.id };
              const colSelected =
                selection?.sectionId === section.id && selection.colId === col.id && !selection.blockId;
              return (
                <ColumnDropZone
                  key={col.id}
                  loc={loc}
                  target={dragTarget}
                  selected={colSelected}
                  onSelect={onSelect}
                >
                  <div
                    className={`space-y-5 rounded-xl p-2 transition ${
                      col.blocks.length === 0
                        ? "min-h-24 border-2 border-dashed border-slate-300 bg-white/50"
                        : ""
                    } ${colCount > 1 ? COL_SPAN[col.ratio] ?? "md:col-span-12" : ""}`}
                  >
                    {col.blocks.map((block, bi) => (
                      <BlockShell
                        key={block.id}
                        block={block}
                        loc={loc}
                        index={bi}
                        count={col.blocks.length}
                        isFirst={bi === 0}
                        isLast={bi === col.blocks.length - 1}
                        hasPrevCol={ci > 0}
                        hasNextCol={ci < colCount - 1}
                        selected={selection?.blockId === block.id}
                        onSelect={onSelect}
                        onMove={onBlockMove}
                        onDuplicate={onBlockDuplicate}
                        onDelete={onBlockDelete}
                        onMoveColumn={onBlockMoveColumn}
                        ctx={ctxFor(block.id)}
                      />
                    ))}
                    {col.blocks.length === 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddBlockAt(loc);
                        }}
                        className="flex w-full items-center justify-center gap-1.5 py-6 text-sm font-medium text-slate-400 transition hover:text-brand-600"
                      >
                        <Plus size={15} /> Tambah blok / seret ke sini
                      </button>
                    )}
                  </div>
                </ColumnDropZone>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const stop2 = (fn: () => void) => (e: React.MouseEvent) => {
  e.stopPropagation();
  fn();
};

/** Kartu kecil "Section baru" di antara section pada kanvas. */
export function AddSectionRow({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex justify-center py-1">
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-slate-300 bg-white/70 px-4 py-1.5 text-xs font-semibold text-slate-500 opacity-0 transition hover:border-brand-400 hover:text-brand-600 focus:opacity-100 group-hover/canvas:opacity-100"
      >
        <PanelTop size={13} /> Section baru
      </button>
    </div>
  );
}
