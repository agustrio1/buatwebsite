"use client";

import { useDraggable } from "@dnd-kit/core";
import {
  Sparkles,
  Type,
  LayoutGrid,
  Image,
  MessageCircle,
  HelpCircle,
  Quote,
  Images,
  BadgeDollarSign,
  Play,
  BarChart3,
  Landmark,
  FormInput,
  GripVertical,
} from "lucide-react";
import { BLOCK_LIST } from "~/lib/page-builder/blocks";
import type { BlockType } from "~/lib/page-builder/types";

// Nama ikon dipakai sebagai string di registry supaya tahan server/client.
const ICONS: Record<string, React.ComponentType<any>> = {
  Sparkles,
  Type,
  LayoutGrid,
  Image,
  MessageCircle,
  HelpCircle,
  Quote,
  Images,
  BadgeDollarSign,
  Play,
  BarChart3,
  Landmark,
  FormInput,
};

function PaletteItem({
  type,
  onAdd,
}: {
  type: BlockType;
  onAdd: (type: BlockType) => void;
}) {
  const def = BLOCK_LIST.find((b) => b.type === type)!;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${type}`,
    data: { from: "palette", blockType: type },
  });
  const Icon = ICONS[def.icon] ?? Sparkles;

  return (
    <button
      type="button"
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => onAdd(type)}
      className={`flex w-full items-start gap-2.5 rounded-lg border border-slate-200 bg-white p-2.5 text-left transition hover:border-brand-400 hover:shadow-sm active:cursor-grabbing ${
        isDragging ? "opacity-40" : ""
      }`}
      title="Seret ke kanvas atau klik untuk menambah"
    >
      <span className="mt-0.5 text-brand-600">
        <Icon size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-brand-dark">{def.label}</span>
        <span className="block text-xs leading-snug text-slate-500">{def.description}</span>
      </span>
      <GripVertical size={14} className="mt-1 shrink-0 text-slate-300" />
    </button>
  );
}

/** Panel kiri builder: daftar 13 blok, draggable & klik-untuk-tambah. */
export function Palette({ onAdd }: { onAdd: (type: BlockType) => void }) {
  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-slate-200 bg-slate-50">
      <div className="border-b border-slate-200 px-3 py-2.5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Blok</p>
        <p className="mt-0.5 text-[11px] text-slate-400">Seret ke kanvas, atau klik untuk menambah di akhir.</p>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {BLOCK_LIST.map((b) => (
          <PaletteItem key={b.type} type={b.type} onAdd={onAdd} />
        ))}
      </div>
    </aside>
  );
}
