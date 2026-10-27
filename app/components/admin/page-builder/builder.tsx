"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useActionState,
} from "react";
import Link from "next/link";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {
  ArrowLeft,
  Eye,
  Laptop,
  Redo2,
  Save,
  Smartphone,
  Tablet,
  Undo2,
} from "lucide-react";
import {
  BLOCK_DEFS,
  parseBlockProps,
} from "~/lib/page-builder/blocks";
import {
  newSection,
  nodeId,
  type BlockNode,
  type BlockType,
  type Column,
  type PageDocument,
  type Section,
} from "~/lib/page-builder/types";
import type { PageFormErrors } from "~/lib/validation/custom-page";
import { Button } from "~/components/ui/button";
import { Select } from "~/components/ui/input";
import { toast } from "~/components/ui/toast";
import {
  Dialog,
  DialogCloseButton,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { Palette } from "./palette";
import { Inspector } from "./inspector";
import {
  AddSectionRow,
  SectionFrame,
  type DragTarget,
  type Location,
  type Selection,
} from "./canvas";
import type { BlockRenderCtx } from "~/components/site/page-blocks";

export type PageData = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  content: unknown;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
  canonicalUrl: string | null;
  noindex: boolean | null;
};

type SaveState = { errors?: PageFormErrors; savedAt?: number } | null;

type BuilderAction = (
  prev: SaveState,
  formData: FormData
) => Promise<SaveState>;

const DEVICES = {
  desktop: { icon: Laptop, max: "100%" },
  tablet: { icon: Tablet, max: "768px" },
  mobile: { icon: Smartphone, max: "390px" },
} as const;

function loadDocument(raw: unknown): PageDocument {
  const doc = raw && typeof raw === "object" ? (raw as PageDocument) : null;
  const sections = Array.isArray(doc?.sections) ? doc.sections : [];
  return {
    version: 1,
    sections: sections.map((sec) => ({
      ...sec,
      background: sec.background ?? {},
      padding: sec.padding ?? "md",
      columns: (Array.isArray(sec.columns) ? sec.columns : []).map((col) => ({
        ...col,
        blocks: (Array.isArray(col.blocks) ? col.blocks : []).map((b) => ({
          ...b,
          props: parseBlockProps(b.type, b.props),
        })),
      })),
    })),
  };
}

// ---------- helper murni (di luar komponen) ----------

const findLoc = (doc: PageDocument, loc: Location) =>
  doc.sections.find((s) => s.id === loc.sectionId)?.columns.find((c) => c.id === loc.colId);

const colCountAt = (doc: PageDocument, sectionId: string) =>
  doc.sections.find((s) => s.id === sectionId)?.columns.length ?? 0;

const lastColumn = (doc: PageDocument): Location | null => {
  const sec = doc.sections[doc.sections.length - 1];
  if (!sec) return null;
  const col = sec.columns[sec.columns.length - 1];
  return col ? { sectionId: sec.id, colId: col.id } : null;
};

function mapColumn(
  doc: PageDocument,
  loc: Location,
  fn: (blocks: BlockNode[]) => BlockNode[]
): PageDocument | null {
  let changed = false;
  const sections = doc.sections.map((sec) => {
    if (sec.id !== loc.sectionId) return sec;
    const columns = sec.columns.map((col) => {
      if (col.id !== loc.colId) return col;
      changed = true;
      return { ...col, blocks: fn(col.blocks) };
    });
    return { ...sec, columns };
  });
  return changed ? { ...doc, sections } : null;
}

export function Builder({
  page,
  siteName,
  whatsappNumber,
  action,
}: {
  page: PageData;
  siteName: string;
  whatsappNumber: string | null;
  action: BuilderAction;
}) {
  const [doc, setDoc] = useState<PageDocument>(() => loadDocument(page.content));
  const docRef = useRef(doc);
  useEffect(() => {
    docRef.current = doc;
  }, [doc]);

  // undo/redo — stack in-memory
  const pastRef = useRef<PageDocument[]>([]);
  const futureRef = useRef<PageDocument[]>([]);
  const [, bumpHist] = useState(0);

  const commit = useCallback((next: PageDocument | ((d: PageDocument) => PageDocument | null)) => {
    const cur = docRef.current;
    const resolved = typeof next === "function" ? next(cur) : next;
    if (!resolved || resolved === cur) return;
    pastRef.current = [...pastRef.current.slice(-49), cur];
    futureRef.current = [];
    docRef.current = resolved;
    setDoc(resolved);
    bumpHist((n) => n + 1);
  }, []);

  const undo = useCallback(() => {
    const past = pastRef.current;
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    pastRef.current = past.slice(0, -1);
    futureRef.current = [docRef.current, ...futureRef.current];
    docRef.current = prev;
    setDoc(prev);
    bumpHist((n) => n + 1);
  }, []);

  const redo = useCallback(() => {
    const future = futureRef.current;
    if (future.length === 0) return;
    const next = future[0];
    futureRef.current = future.slice(1);
    pastRef.current = [...pastRef.current, docRef.current];
    docRef.current = next;
    setDoc(next);
    bumpHist((n) => n + 1);
  }, []);

  const [selection, setSelection] = useState<Selection | null>(null);
  const [device, setDevice] = useState<keyof typeof DEVICES>("desktop");
  const [activeDrag, setActiveDrag] = useState<DragTarget>(null);
  const [pickerLoc, setPickerLoc] = useState<Location | null>(null);
  const [status, setStatus] = useState(page.status);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState<SaveState, FormData>(action, null);
  const errors = state?.errors;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 8 } })
  );

  // ---------- operasi dokumen ----------

  const addBlock = useCallback(
    (type: BlockType, at?: Location) => {
      const block: BlockNode = { id: nodeId(), type, props: BLOCK_DEFS[type].defaults() };
      commit((d) => {
        let loc = at ?? null;
        if (!loc) {
          if (selection) {
            const sec = d.sections.find((s) => s.id === selection.sectionId);
            loc =
              (sec?.columns.find((c) => c.id === selection.colId) &&
                { sectionId: sec!.id, colId: selection.colId! }) ||
              (sec?.columns[0] && { sectionId: sec.id, colId: sec.columns[0].id }) ||
              null;
          }
          loc = loc ?? lastColumn(d);
        }
        if (!loc) return { ...d, sections: [newSection()] };
        if (!findLoc(d, loc)) return null;
        return mapColumn(d, loc, (blocks) => [...blocks, block]);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [commit, selection]
  );

  const moveBlock = useCallback(
    (loc: Location, id: string, dir: -1 | 1) =>
      commit((d) =>
        mapColumn(d, loc, (blocks) => {
          const i = blocks.findIndex((b) => b.id === id);
          const j = i + dir;
          if (i < 0 || j < 0 || j >= blocks.length) return blocks;
          const next = [...blocks];
          [next[i], next[j]] = [next[j], next[i]];
          return next;
        })
      ),
    [commit]
  );

  const duplicateBlock = useCallback(
    (loc: Location, id: string) =>
      commit((d) =>
        mapColumn(d, loc, (blocks) => {
          const i = blocks.findIndex((b) => b.id === id);
          if (i < 0) return blocks;
          const copy: BlockNode = {
            ...blocks[i],
            id: nodeId(),
            props: JSON.parse(JSON.stringify(blocks[i].props)),
          };
          return [...blocks.slice(0, i + 1), copy, ...blocks.slice(i + 1)];
        })
      ),
    [commit]
  );

  const deleteBlock = useCallback(
    (loc: Location, id: string) => {
      commit((d) => mapColumn(d, loc, (blocks) => blocks.filter((b) => b.id !== id)));
      setSelection((sel) => (sel?.blockId === id ? { ...sel, blockId: undefined } : sel));
    },
    [commit]
  );

  const moveBlockColumn = useCallback(
    (from: Location, blockId: string, dir: -1 | 1) =>
      commit((d) => {
        const sec = d.sections.find((s) => s.id === from.sectionId);
        if (!sec) return null;
        const ci = sec.columns.findIndex((c) => c.id === from.colId);
        const tj = ci + dir;
        if (ci < 0 || tj < 0 || tj >= sec.columns.length) return null;
        const src = sec.columns[ci];
        const dst = sec.columns[tj];
        const block = src.blocks.find((b) => b.id === blockId);
        if (!block) return null;
        const columns = sec.columns.map((c, i) =>
          i === ci
            ? { ...c, blocks: c.blocks.filter((b) => b.id !== blockId) }
            : i === tj
              ? { ...c, blocks: [...c.blocks, block] }
              : c
        );
        return {
          ...d,
          sections: d.sections.map((s) => (s.id === sec.id ? { ...s, columns } : s)),
        };
      }),
    [commit]
  );

  const addColumn = useCallback(
    (sectionId: string) =>
      commit((d) => ({
        ...d,
        sections: d.sections.map((s) =>
          s.id === sectionId
            ? { ...s, columns: [...s.columns, { id: nodeId(), ratio: "third" as Column["ratio"], blocks: [] }] }
            : s
        ),
      })),
    [commit]
  );

  const updateSection = useCallback(
    (sec: Section) =>
      commit((d) => ({ ...d, sections: d.sections.map((s) => (s.id === sec.id ? sec : s)) })),
    [commit]
  );

  const addSection = useCallback(
    (atIndex?: number) => {
      const sec = newSection();
      commit((d) => {
        const sections = [...d.sections];
        sections.splice(atIndex ?? sections.length, 0, sec);
        return { ...d, sections };
      });
      setSelection({ sectionId: sec.id });
    },
    [commit]
  );

  const moveSection = useCallback(
    (id: string, dir: -1 | 1) =>
      commit((d) => {
        const i = d.sections.findIndex((s) => s.id === id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= d.sections.length) return null;
        const sections = [...d.sections];
        [sections[i], sections[j]] = [sections[j], sections[i]];
        return { ...d, sections };
      }),
    [commit]
  );

  const duplicateSection = useCallback(
    (id: string) =>
      commit((d) => {
        const i = d.sections.findIndex((s) => s.id === id);
        if (i < 0) return null;
        const clone: Section = JSON.parse(JSON.stringify(d.sections[i]));
        clone.id = nodeId();
        clone.columns = clone.columns.map((c) => ({
          ...c,
          id: nodeId(),
          blocks: c.blocks.map((b) => ({ ...b, id: nodeId() })),
        }));
        const sections = [...d.sections];
        sections.splice(i + 1, 0, clone);
        return { ...d, sections };
      }),
    [commit]
  );

  const deleteSection = useCallback(
    (id: string) => {
      commit((d) =>
        d.sections.length <= 1 ? null : { ...d, sections: d.sections.filter((s) => s.id !== id) }
      );
      setSelection((sel) => (sel?.sectionId === id ? null : sel));
    },
    [commit]
  );

  const updateBlockProps = useCallback(
    (blockId: string, props: Record<string, unknown>) => {
      for (const sec of docRef.current.sections) {
        for (const col of sec.columns) {
          if (col.blocks.some((b) => b.id === blockId)) {
            const loc = { sectionId: sec.id, colId: col.id };
            commit((d) => mapColumn(d, loc, (blocks) =>
              blocks.map((b) => (b.id === blockId ? { ...b, props } : b))
            ));
            return;
          }
        }
      }
    },
    [commit]
  );

  // ---------- dnd ----------

  const onDragStart = (e: DragStartEvent) => {
    const data = e.active.data.current as { from?: string; blockType?: string; loc?: Location; blockId?: string } | undefined;
    if (data?.from === "palette" && data.blockType) {
      setActiveDrag({ kind: "insert", blockType: data.blockType });
    } else if (data?.from === "canvas" && data.loc && data.blockId) {
      setActiveDrag({ kind: "move", from: data.loc, blockId: data.blockId });
    } else {
      setActiveDrag(null);
    }
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActiveDrag(null);
    const { active, over } = e;
    if (!over) return;
    const data = active.data.current as
      | { from?: string; blockType?: string; loc?: Location; blockId?: string }
      | undefined;
    const to = over.data.current as { loc?: Location } | undefined;
    if (!to?.loc) return;

    if (data?.from === "palette" && data.blockType) {
      addBlock(data.blockType as BlockType, to.loc);
      return;
    }
    if (data?.from === "canvas" && data.loc && data.blockId) {
      const from = data.loc;
      const blockId = data.blockId;
      if (from.colId === to.loc.colId) {
        commit((d) =>
          mapColumn(d, from, (blocks) => {
            const oldI = blocks.findIndex((b) => b.id === blockId);
            let newI = (over.id as string).startsWith("blk:")
              ? blocks.findIndex((b) => b.id === (over.id as string).slice(4))
              : blocks.length - 1;
            if (oldI < 0 || newI < 0 || oldI === newI) return blocks;
            const next = [...blocks];
            const [moved] = next.splice(oldI, 1);
            newI = newI > oldI ? newI - 1 : newI;
            next.splice(newI, 0, moved);
            return next;
          })
        );
      } else if (findLoc(docRef.current, to.loc)) {
        commit((d) => {
          const moved = findLoc(d, from)?.blocks.find((b) => b.id === blockId);
          if (!moved) return null;
          const without = mapColumn(d, from, (blocks) => blocks.filter((b) => b.id !== blockId));
          return without && mapColumn(without, to.loc!, (blocks) => [...blocks, moved]);
        });
      }
    }
  };

  // Deteksi tabrakan standar dnd-kit: titik tengah item terdekat
  const collisionDetection = closestCenter;

  // ---------- keyboard ----------

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      const typing =
        t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
      if (!(e.ctrlKey || e.metaKey) || typing) return;
      if (e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key.toLowerCase() === "z" && e.shiftKey) || e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      } else if (e.key === "s") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  // ---------- simpan ----------

  useEffect(() => {
    if (state?.savedAt) toast("Halaman tersimpan", "success");
    if (errors?.content) toast(errors.content, "error");
    if (errors?.slug) toast(errors.slug, "error");
    if (errors?.title) toast(errors.title, "error");
  }, [state, errors]);

  const ctx: BlockRenderCtx = useMemo(
    () => ({ slug: page.slug, whatsappNumber }),
    [page.slug, whatsappNumber]
  );

  const selectedSection = selection ? doc.sections.find((s) => s.id === selection.sectionId) ?? null : null;
  const selectedBlock = selection?.blockId
    ? selectedSection?.columns.flatMap((c) => c.blocks).find((b) => b.id === selection.blockId) ?? null
    : null;

  const totalBlocks = doc.sections.reduce(
    (n, s) => n + s.columns.reduce((m, c) => m + c.blocks.length, 0),
    0
  );

  const activeLabel =
    activeDrag?.kind === "insert"
      ? BLOCK_DEFS[activeDrag.blockType as BlockType]?.label
      : activeDrag?.kind === "move"
        ? "Pindahkan blok"
        : null;

  return (
    <div className="flex h-[calc(100dvh-64px)] flex-col overflow-hidden bg-slate-100">
      {/* ===== toolbar ===== */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2 shadow-sm">
        <Link
          href="/admin/pages"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-brand-200 hover:text-brand-600"
          aria-label="Kembali ke daftar halaman"
        >
          <ArrowLeft size={17} />
        </Link>
        <div className="min-w-0">
          <p className="truncate text-xs text-slate-400">
            /{page.slug} · {totalBlocks} blok
          </p>
          <h1 className="truncate text-sm font-bold text-brand-dark">{page.title}</h1>
        </div>

        <div className="mx-auto flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          {(Object.keys(DEVICES) as (keyof typeof DEVICES)[]).map((d) => {
            const Icon = DEVICES[d].icon;
            return (
              <button
                key={d}
                type="button"
                title={d}
                onClick={() => setDevice(d)}
                className={`rounded-md p-1.5 transition ${
                  device === d ? "bg-white text-brand-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Icon size={15} />
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={undo}
            disabled={pastRef.current.length === 0}
            title="Undo (Ctrl+Z)"
            className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
          >
            <Undo2 size={15} />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={futureRef.current.length === 0}
            title="Redo (Ctrl+Shift+Z)"
            className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
          >
            <Redo2 size={15} />
          </button>

          <Select value={status} onChange={(e) => setStatus(e.target.value as "draft" | "published")} className="w-28">
            <option value="draft">Draft</option>
            <option value="published">Publish</option>
          </Select>

          {status === "published" && (
            <a
              href={`/${page.slug}`}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100 sm:inline-flex"
            >
              <Eye size={14} /> Lihat
            </a>
          )}

          <Button type="submit" size="sm" disabled={isPending} className="gap-1.5">
            <Save size={14} /> {isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>

      {/* ===== tiga panel ===== */}
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveDrag(null)}
      >
        <div className="flex min-h-0 flex-1">
          <Palette onAdd={(t) => addBlock(t)} />

          {/* form menyimpan field dasar + dokumen + slot SEO (dipakai savePage) */}
          <form
            ref={formRef}
            action={formAction}
          >
            <input type="hidden" name="content" value={JSON.stringify(doc)} />
            <input type="hidden" name="status" value={status} />
            <input type="hidden" name="title" value={page.title} />
            <input type="hidden" name="slug" value={page.slug} />
            <input type="hidden" name="metaTitle" value={page.metaTitle ?? ""} />
            <input type="hidden" name="metaDescription" value={page.metaDescription ?? ""} />
            <input type="hidden" name="ogImageUrl" value={page.ogImageUrl ?? ""} />
            <input type="hidden" name="canonicalUrl" value={page.canonicalUrl ?? ""} />
            <input type="hidden" name="noindex" value={page.noindex ? "true" : "false"} />

            <main
              className="min-w-0 flex-1 overflow-y-auto p-4"
              onClick={() => setSelection(null)}
            >
              <SortableContext
                items={doc.sections.flatMap((s) => s.columns.flatMap((c) => c.blocks.map((b) => `blk:${b.id}`)))}
                strategy={verticalListSortingStrategy}
              >
                <div
                  className="group/canvas mx-auto min-h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-[max-width]"
                  style={{ maxWidth: DEVICES[device].max }}
                >
                  <p className="border-b border-slate-100 bg-slate-50/80 px-4 py-2 text-xs text-slate-400">
                    Pratinjau {siteName} · <strong>/{page.slug}</strong>
                  </p>

                  {doc.sections.length === 0 ? (
                    <div className="flex min-h-96 flex-col items-center justify-center gap-3 p-8 text-center">
                      <p className="text-sm font-semibold text-slate-500">Halaman masih kosong</p>
                      <p className="max-w-xs text-xs text-slate-400">
                        Seret blok dari panel kiri ke sini, atau mulai dengan section kosong.
                      </p>
                      <Button type="button" size="sm" onClick={() => addSection()}>
                        + Section pertama
                      </Button>
                    </div>
                  ) : (
                    <div>
                      {doc.sections.map((sec, i) => (
                        <div key={sec.id}>
                          <AddSectionRow onAdd={() => addSection(i)} />
                          <SectionFrame
                            section={sec}
                            index={i}
                            total={doc.sections.length}
                            selection={selection}
                            dragTarget={activeDrag}
                            document={doc}
                            ctx={ctx}
                            onSelect={setSelection}
                            onChange={updateSection}
                            onSectionMove={moveSection}
                            onSectionDuplicate={duplicateSection}
                            onSectionDelete={deleteSection}
                            onAddColumn={addColumn}
                            onAddBlockAt={(loc) => setPickerLoc(loc)}
                            onBlockMove={moveBlock}
                            onBlockDuplicate={duplicateBlock}
                            onBlockDelete={deleteBlock}
                            onBlockMoveColumn={moveBlockColumn}
                          />
                        </div>
                      ))}
                      <AddSectionRow onAdd={() => addSection()} />
                    </div>
                  )}
                </div>
              </SortableContext>
            </main>
          </form>

          <Inspector
            section={selectedSection}
            block={selectedBlock}
            onSectionChange={updateSection}
            onBlockPropsChange={(props) => {
              if (selection?.blockId) updateBlockProps(selection.blockId, props);
            }}
          />
        </div>

        {/* chip ikut kursor saat menyeret dari palette */}
        {activeDrag && activeLabel && (
          <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-brand-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg">
            {activeLabel}
          </div>
        )}
      </DndContext>

      {/* dialog pilih blok untuk kolom kosong / tombol + blok */}
      <Dialog open={!!pickerLoc} onClose={() => setPickerLoc(null)} className="max-w-md">
        <DialogCloseButton onClose={() => setPickerLoc(null)} />
        <DialogHeader>
          <DialogTitle>Tambah blok</DialogTitle>
          <DialogDescription>Pilih blok yang akan ditambahkan ke kolom ini.</DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[60vh] grid-cols-2 gap-2 overflow-y-auto p-5">
          {Object.values(BLOCK_DEFS).map((def) => (
            <button
              key={def.type}
              type="button"
              onClick={() => {
                if (pickerLoc) addBlock(def.type, pickerLoc);
                setPickerLoc(null);
              }}
              className="rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-brand-400 hover:shadow-sm"
            >
              <span className="block text-sm font-semibold text-brand-dark">{def.label}</span>
              <span className="block text-[11px] leading-snug text-slate-500">{def.description}</span>
            </button>
          ))}
        </div>
      </Dialog>
    </div>
  );
}
