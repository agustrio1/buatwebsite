"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { BLOCK_DEFS } from "~/lib/page-builder/blocks";
import type { ControlDef } from "~/lib/page-builder/blocks";
import { COLUMN_RATIOS, nodeId, type BlockNode, type Section } from "~/lib/page-builder/types";
import type { Selection } from "./canvas";
import { Input, Textarea, Select, Label } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { MediaPicker } from "~/components/admin/media-picker";

// ---------- kontrol tunggal ----------

/** Editor JSON khusus kontrol "editor" (konten TipTap rich_text). */
function RichJsonField({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const json = (() => {
    try {
      return JSON.stringify(value ?? { type: "doc", content: [] }, null, 1);
    } catch {
      return "{}";
    }
  })();
  const [raw, setRaw] = useState(json);
  const [dirty, setDirty] = useState(false);
  const invalid = dirty && !rawValid(raw, json);

  return (
    <div className="space-y-1">
      <Textarea
        rows={10}
        value={raw}
        onChange={(e) => {
          setRaw(e.target.value);
          setDirty(true);
        }}
        onBlur={() => {
          setDirty(false);
          try {
            onChange(JSON.parse(raw));
          } catch {
            setRaw(json); // JSON rusak: kembalikan nilai terakhir yang valid
          }
        }}
        className="font-mono text-[11px]"
      />
      {invalid && (
        <p className="text-[11px] text-amber-600">
          JSON belum valid — perbaikan akan dibatalkan bila keluar dari kotak ini.
        </p>
      )}
      <p className="text-[11px] text-slate-400">
        Format JSON TipTap. Saran: tulis teks biasa lewat inline edit di kanvas, pakai kotak ini
        untuk struktur lanjutan.
      </p>
    </div>
  );
}

function rawValid(raw: string, fallback: string): boolean {
  try {
    JSON.parse(raw);
    return true;
  } catch {
    return raw === fallback;
  }
}

function getValue(control: ControlDef, value: unknown): string {
  if (value == null) return "";
  return String(value);
}

function normalize(control: ControlDef, raw: string): unknown {
  if (control.kind === "number") return raw === "" ? "" : Number(raw);
  if (control.kind === "checkbox") return raw === "true";
  return raw;
}

function ControlField({
  control,
  value,
  onChange,
  onPickImage,
}: {
  control: ControlDef;
  value: unknown;
  onChange: (v: unknown) => void;
  onPickImage: (apply: (url: string) => void) => void;
}) {
  switch (control.kind) {
    case "textarea":
    case "editor":
      return (
        <Textarea
          rows={control.kind === "editor" ? 8 : 3}
          value={getValue(control, value)}
          onChange={(e) => onChange(e.target.value)}
          className="text-xs font-mono"
        />
      );
    case "select":
      return (
        <Select value={getValue(control, value)} onChange={(e) => onChange(e.target.value)}>
          {(control.options ?? []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      );
    case "color":
      return (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(getValue(control, value)) ? getValue(control, value) : "#ffffff"}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-12 cursor-pointer rounded border border-slate-200 bg-white p-1"
          />
          <Input
            value={getValue(control, value)}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#rrggbb atau transparan"
            className="flex-1"
          />
          {getValue(control, value) && (
            <button type="button" title="Hapus warna" onClick={() => onChange("")} className="text-slate-400 hover:text-red-500">
              <X size={14} />
            </button>
          )}
        </div>
      );
    case "checkbox":
      return (
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 accent-brand-500"
          />
          {control.label}
        </label>
      );
    case "image": {
      const url = getValue(control, value);
      return (
        <div className="space-y-1.5">
          {url ? (
            <div className="relative overflow-hidden rounded-lg border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-24 w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute right-1 top-1 rounded bg-black/60 p-1 text-white hover:bg-red-500"
                title="Hapus gambar"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ) : (
            <Input
              value={url}
              onChange={(e) => onChange(e.target.value)}
              placeholder="URL gambar"
              className="text-xs"
            />
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onPickImage((u) => onChange(u))}
          >
            <ImagePlus size={14} /> {url ? "Ganti gambar" : "Pilih gambar"}
          </Button>
        </div>
      );
    }
    case "number":
      return (
        <Input
          type="number"
          value={getValue(control, value)}
          onChange={(e) => onChange(normalize(control, e.target.value))}
        />
      );
    default:
      // text / url / repeater ditangani pemanggil
      return (
        <Input
          value={getValue(control, value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={control.placeholder}
        />
      );
  }
}

// ---------- repeater ----------

function RepeaterField({
  control,
  items,
  onChange,
  onPickImage,
}: {
  control: ControlDef;
  items: Record<string, unknown>[];
  onChange: (items: Record<string, unknown>[]) => void;
  onPickImage: (apply: (url: string) => void) => void;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const update = (i: number, key: string, v: unknown) =>
    onChange(items.map((it, j) => (j === i ? { ...it, [key]: v } : it)));

  return (
    <div className="space-y-1.5">
      {items.map((it, i) => {
        const title = String(it[control.itemTitleKey ?? "label"] ?? "") || `Item ${i + 1}`;
        const open = openIdx === i;
        return (
          <div key={String(it.id ?? i)} className="rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center gap-1 px-2 py-1.5">
              <button
                type="button"
                onClick={() => setOpenIdx(open ? null : i)}
                className="flex min-w-0 flex-1 items-center gap-1.5 text-left text-xs font-semibold text-slate-700"
              >
                {open ? <ChevronDown size={13} /> : <ChevronUp size={13} className="rotate-90" />}
                <span className="truncate">{title}</span>
              </button>
              <button
                type="button"
                title="Geser ke atas"
                disabled={i === 0}
                onClick={() => {
                  const next = [...items];
                  [next[i - 1], next[i]] = [next[i], next[i - 1]];
                  onChange(next);
                }}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
              >
                <ChevronUp size={13} />
              </button>
              <button
                type="button"
                title="Geser ke bawah"
                disabled={i === items.length - 1}
                onClick={() => {
                  const next = [...items];
                  [next[i + 1], next[i]] = [next[i], next[i + 1]];
                  onChange(next);
                }}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
              >
                <ChevronDown size={13} />
              </button>
              <button
                type="button"
                title="Hapus item"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="rounded p-0.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 size={13} />
              </button>
            </div>
            {open && (
              <div className="space-y-2.5 border-t border-slate-100 px-2.5 py-2.5">
                {(control.itemControls ?? []).map((c) => (
                  <div key={c.key}>
                    {c.kind !== "checkbox" && c.kind !== "repeater" && (
                      <Label className="mb-1 block text-[11px] font-medium text-slate-500">{c.label}</Label>
                    )}
                    <ControlField
                      control={c}
                      value={it[c.key]}
                      onChange={(v) => update(i, c.key, v)}
                      onPickImage={onPickImage}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => {
          const fresh: Record<string, unknown> = { id: nodeId() };
          for (const c of control.itemControls ?? []) {
            if (c.kind !== "repeater") fresh[c.key] = c.kind === "checkbox" ? false : "";
          }
          onChange([...items, fresh]);
          setOpenIdx(items.length);
        }}
      >
        <Plus size={13} /> Tambah item
      </Button>
    </div>
  );
}

// ---------- panel blok ----------

function BlockPanel({
  block,
  onChangeProps,
  onPickImage,
}: {
  block: BlockNode;
  onChangeProps: (props: Record<string, unknown>) => void;
  onPickImage: (apply: (url: string) => void) => void;
}) {
  const def = BLOCK_DEFS[block.type];

  // Kontrol "editor" (JSON TipTap) butuh penanganan khusus di luar alur string.
  const editorControls = def.controls.filter((c) => c.kind === "editor");

  return (
    <div className="space-y-3.5">
      <div>
        <p className="text-sm font-bold text-brand-dark">{def.label}</p>
        <p className="text-[11px] text-slate-400">{def.description}</p>
      </div>
      {editorControls.map((c) => (
        <div key={c.key}>
          <Label className="mb-1 block text-[11px] font-medium text-slate-500">{c.label}</Label>
          <RichJsonField
            // key memaksa reset state textarea saat blok lain dipilih
            key={`${block.id}:${c.key}`}
            value={block.props[c.key]}
            onChange={(v) => onChangeProps({ ...block.props, [c.key]: v })}
          />
        </div>
      ))}
      {def.controls.filter((c) => c.kind !== "editor").map((c) => {
        const value = block.props[c.key];
        if (c.kind === "repeater") {
          const items = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
          return (
            <div key={c.key}>
              <Label className="mb-1 block text-[11px] font-medium text-slate-500">{c.label}</Label>
              <RepeaterField
                control={c}
                items={items}
                onChange={(next) => onChangeProps({ ...block.props, [c.key]: next })}
                onPickImage={onPickImage}
              />
            </div>
          );
        }
        if (c.kind === "checkbox") {
          return (
            <ControlField
              key={c.key}
              control={c}
              value={value}
              onChange={(v) => onChangeProps({ ...block.props, [c.key]: v })}
              onPickImage={onPickImage}
            />
          );
        }
        return (
          <div key={c.key}>
            <Label className="mb-1 block text-[11px] font-medium text-slate-500">{c.label}</Label>
            <ControlField
              control={c}
              value={value}
              onChange={(v) => onChangeProps({ ...block.props, [c.key]: v })}
              onPickImage={onPickImage}
            />
          </div>
        );
      })}
    </div>
  );
}

// ---------- panel section ----------

const RATIO_LABEL: Record<(typeof COLUMN_RATIOS)[number], string> = {
  full: "Lebar penuh",
  half: "1/2",
  third: "1/3",
  "two-thirds": "2/3",
  quarter: "1/4",
};

function SectionPanel({
  section,
  onChange,
  onPickImage,
}: {
  section: Section;
  onChange: (s: Section) => void;
  onPickImage: (apply: (url: string) => void) => void;
}) {
  const bg = section.background ?? {};
  return (
    <div className="space-y-3.5">
      <p className="text-sm font-bold text-brand-dark">Gaya Section</p>

      <div>
        <Label className="mb-1 block text-[11px] font-medium text-slate-500">Warna latar</Label>
        <ControlField
          control={{ key: "color", kind: "color", label: "Warna" }}
          value={bg.color ?? ""}
          onChange={(v) => onChange({ ...section, background: { ...bg, color: String(v) || null } })}
          onPickImage={onPickImage}
        />
      </div>

      <div>
        <Label className="mb-1 block text-[11px] font-medium text-slate-500">Gambar latar (opsional)</Label>
        <ControlField
          control={{ key: "imageUrl", kind: "image", label: "Gambar" }}
          value={bg.imageUrl ?? ""}
          onChange={(v) => onChange({ ...section, background: { ...bg, imageUrl: String(v) || null } })}
          onPickImage={onPickImage}
        />
      </div>

      <div>
        <Label className="mb-1 block text-[11px] font-medium text-slate-500">Jarak atas-bawah</Label>
        <Select
          value={section.padding}
          onChange={(e) => onChange({ ...section, padding: e.target.value as Section["padding"] })}
        >
          {(["none", "sm", "md", "lg"] as const).map((p) => (
            <option key={p} value={p}>
              {p === "none" ? "Tanpa jarak" : p === "sm" ? "Kecil" : p === "md" ? "Sedang" : "Besar"}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label className="mb-1 block text-[11px] font-medium text-slate-500">Lebar kolom</Label>
        <div className="space-y-1.5">
          {section.columns.map((col, i) => (
            <div key={col.id} className="flex items-center gap-2">
              <span className="w-12 shrink-0 text-xs text-slate-500">Kol {i + 1}</span>
              <Select
                value={col.ratio}
                onChange={(e) =>
                  onChange({
                    ...section,
                    columns: section.columns.map((c, j) =>
                      j === i ? { ...c, ratio: e.target.value as Section["columns"][number]["ratio"] } : c
                    ),
                  })
                }
                className="flex-1"
              >
                {COLUMN_RATIOS.map((r) => (
                  <option key={r} value={r}>
                    {RATIO_LABEL[r]}
                  </option>
                ))}
              </Select>
            </div>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-slate-400">
          Di layar kecil semua kolom otomatis menumpuk penuh.
        </p>
      </div>
    </div>
  );
}

// ---------- inspector ----------

export function Inspector({
  section,
  block,
  onSectionChange,
  onBlockPropsChange,
}: {
  section: Section | null;
  block: BlockNode | null;
  onSectionChange: (s: Section) => void;
  onBlockPropsChange: (props: Record<string, unknown>) => void;
}) {
  const [pick, setPick] = useState<{ apply: (url: string) => void } | null>(null);
  const onPickImage = (apply: (url: string) => void) => setPick({ apply });

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-2.5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Inspektur</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {block ? (
          <BlockPanel block={block} onChangeProps={onBlockPropsChange} onPickImage={onPickImage} />
        ) : section ? (
          <SectionPanel section={section} onChange={onSectionChange} onPickImage={onPickImage} />
        ) : (
          <div className="mt-8 space-y-3 px-2 text-center">
            <p className="text-sm font-semibold text-slate-600">Belum ada yang dipilih</p>
            <p className="text-xs leading-relaxed text-slate-400">
              Klik blok di kanvas untuk mengedit isinya, atau klik label "Section" di pojok section
              untuk mengubah warna, latar, dan jaraknya.
            </p>
          </div>
        )}
      </div>

      <MediaPicker
        open={!!pick}
        onClose={() => setPick(null)}
        onSelect={(url) => pick?.apply(url)}
      />
    </aside>
  );
}
