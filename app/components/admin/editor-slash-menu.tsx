"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "~/lib/cn";
import { BLOCK_COMMANDS, type BlockCtx } from "~/lib/editor-blocks";

export type SlashItem = (typeof BLOCK_COMMANDS)[number];

export type SlashCommandListHandle = {
  onKeyDown: (event: KeyboardEvent) => boolean;
};

type Props = {
  query: string;
  ctx: BlockCtx;
  command: (item: SlashItem) => void;
};

/**
 * Daftar blok yang muncul saat mengetik "/" (slash menu). Dipakai lewat
 * ReactRenderer dari @tiptap/suggestion; penempatan ditangani props.mount().
 */
export const SlashCommandList = forwardRef<SlashCommandListHandle, Props>(
  ({ query, ctx, command }, ref) => {
    const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();
      if (!q) return BLOCK_COMMANDS;
      return BLOCK_COMMANDS.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.keywords.some((k) => k.includes(q))
      );
    }, [query]);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => setSelectedIndex(0), [query]);

    useEffect(() => {
      const el = listRef.current?.querySelector<HTMLElement>(
        `[data-index="${selectedIndex}"]`
      );
      el?.scrollIntoView({ block: "nearest" });
    }, [selectedIndex]);

    const selectItem = (index: number) => {
      const item = filtered[index];
      if (item) command(item);
    };

    useImperativeHandle(ref, () => ({
      onKeyDown(event) {
        if (event.key === "ArrowUp") {
          setSelectedIndex((i) => (i <= 0 ? filtered.length - 1 : i - 1));
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((i) => (i >= filtered.length - 1 ? 0 : i + 1));
          return true;
        }
        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }
        if (event.key === "Escape") {
          return true;
        }
        return false;
      },
    }));

    if (filtered.length === 0) {
      return (
        <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground shadow-lg">
          Tidak ada blok yang cocok.
        </div>
      );
    }

    return (
      <div
        ref={listRef}
        className="max-h-72 w-64 overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-xl"
      >
        {filtered.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              data-index={index}
              onClick={() => selectItem(index)}
              onMouseMove={() => setSelectedIndex(index)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                index === selectedIndex ? "bg-brand-50" : "hover:bg-muted"
              )}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/60 text-slate-600">
                <Icon size={16} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-foreground">
                  {item.title}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {item.subtitle}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    );
  }
);
SlashCommandList.displayName = "SlashCommandList";
