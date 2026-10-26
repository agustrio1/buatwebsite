"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "~/lib/cn";

export type ToastType = "success" | "error" | "info";
type ToastItem = { id: number; message: string; type: ToastType };

// Emitor modul-level sederhana (tanpa library/context) supaya toast() bisa
// dipanggil dari komponen client mana pun, sementara <Toaster/> cukup dipasang
// satu kali di shell.
let handler: ((item: ToastItem) => void) | null = null;
let seq = 0;

export function toast(message: string, type: ToastType = "success") {
  handler?.({ id: ++seq, message, type });
}

const ICON: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={18} className="text-green-500" />,
  error: <AlertTriangle size={18} className="text-red-500" />,
  info: <Info size={18} className="text-sky-500" />,
};

const ACCENT: Record<ToastType, string> = {
  success: "border-l-green-500",
  error: "border-l-red-500",
  info: "border-l-sky-500",
};

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    handler = (item) => {
      setItems((prev) => [...prev, item]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== item.id));
      }, 4000);
    };
    return () => {
      handler = null;
    };
  }, []);

  function dismiss(id: number) {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }

  if (items.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            "pointer-events-auto flex items-start gap-2.5 rounded-lg border border-l-4 border-border bg-card px-4 py-3 shadow-lg",
            ACCENT[t.type]
          )}
        >
          <span className="mt-0.5 shrink-0">{ICON[t.type]}</span>
          <span className="flex-1 text-sm text-foreground">{t.message}</span>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            aria-label="Tutup notifikasi"
            className="shrink-0 text-slate-400 transition-colors hover:text-foreground"
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
