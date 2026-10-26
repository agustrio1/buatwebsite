"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Search,
  CornerDownLeft,
  FileText,
  FolderKanban,
  LayoutGrid,
  MapPin,
  Users,
  Inbox,
  ArrowRightLeft,
} from "lucide-react";
import { allNavItems, type NavItem } from "./nav";
import { cn } from "~/lib/cn";

type ResultItem = {
  key: string;
  href: string;
  label: string;
  sublabel?: string;
  group: string;
  icon: React.ReactNode;
};

const RESOURCE_ICONS: Record<string, React.ReactNode> = {
  posts: <FileText size={16} />,
  projects: <FolderKanban size={16} />,
  services: <LayoutGrid size={16} />,
  cities: <MapPin size={16} />,
  users: <Users size={16} />,
  inquiries: <Inbox size={16} />,
  redirects: <ArrowRightLeft size={16} />,
};

type ApiGroup = { type: string; label: string; items: { id: string; label: string; sublabel?: string; href: string }[] };

export function CommandMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<ApiGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);

  // Reset setiap kali dibuka.
  useEffect(() => {
    if (open) {
      setQuery("");
      setGroups([]);
      setActive(0);
      const t = setTimeout(() => inputRef.current?.focus(), 20);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Debounced API search.
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setGroups([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as { groups: ApiGroup[] };
        setGroups(data.groups ?? []);
      } catch {
        /* aborted / jaringan: abaikan */
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query, open]);

  const items = useMemo<ResultItem[]>(() => {
    const ql = query.trim().toLowerCase();
    const menu: ResultItem[] = allNavItems
      .filter((n: NavItem) => !ql || n.label.toLowerCase().includes(ql))
      .slice(0, ql ? 8 : 10)
      .map((n) => ({
        key: `menu-${n.path}`,
        href: n.path,
        label: n.label,
        group: "Menu",
        icon: <n.icon size={16} />,
      }));
    const dyn: ResultItem[] = groups.flatMap((g) =>
      g.items.map((it) => ({
        key: `${g.type}-${it.id}`,
        href: it.href,
        label: it.label,
        sublabel: it.sublabel,
        group: g.label,
        icon: RESOURCE_ICONS[g.type] ?? <FileText size={16} />,
      }))
    );
    return [...menu, ...dyn];
  }, [query, groups]);

  // Jaga indeks aktif dalam batas.
  useEffect(() => {
    setActive((a) => (a >= items.length ? 0 : a));
  }, [items.length]);

  function go(href: string) {
    onClose();
    router.push(href);
  }

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (items.length ? (a + 1) % items.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (items.length ? (a - 1 + items.length) % items.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const it = items[active];
      if (it) go(it.href);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  if (!open) return null;

  // Kelompokkan berurutan untuk render + pemisahan grup.
  let lastGroup = "";

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        <div className="flex items-center gap-2.5 border-b border-border px-4">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Cari menu, artikel, projek, layanan, kota, user..."
            className="h-14 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
          {loading ? <Loader2 size={16} className="animate-spin text-slate-400" /> : null}
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
          {items.length === 0 ? (
            <div className="px-3 py-10 text-center text-sm text-muted-foreground">
              {query.trim().length >= 2 ? "Tidak ada hasil." : "Mulai ketik untuk mencari."}
            </div>
          ) : (
            items.map((it, idx) => {
              const showGroup = it.group !== lastGroup;
              lastGroup = it.group;
              return (
                <div key={it.key}>
                  {showGroup ? (
                    <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      {it.group}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => go(it.href)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      idx === active ? "bg-muted text-foreground" : "text-slate-600"
                    )}
                  >
                    <span className="text-slate-400 shrink-0">{it.icon}</span>
                    <span className="flex-1 truncate font-medium">{it.label}</span>
                    {it.sublabel ? (
                      <span className="truncate text-xs text-slate-400 max-w-40">{it.sublabel}</span>
                    ) : null}
                    {idx === active ? <CornerDownLeft size={13} className="text-slate-400 shrink-0" /> : null}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-border px-4 py-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-muted px-1">↑</kbd>
            <kbd className="rounded border border-border bg-muted px-1">↓</kbd> navigasi
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-muted px-1">↵</kbd> buka
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-muted px-1">esc</kbd> tutup
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}
