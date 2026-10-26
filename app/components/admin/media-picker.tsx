"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Upload, Loader2, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/misc";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogCloseButton,
} from "~/components/ui/dialog";
import { toast } from "~/components/ui/toast";
import { resizeImage, buildSrcSet } from "~/lib/imagekit-url";
import type { MediaItem } from "~/lib/media.server";

/**
 * Dialog pemilih gambar dari pustaka media (gambar yang sedang dipakai konten),
 * plus unggah baru. Dipakai ImageUploadField & editor. onSelect mengirim URL.
 */
export function MediaPicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((d: { items?: MediaItem[] }) => {
        if (!cancelled) setItems(d.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
        if (!cancelled) toast("Gagal memuat pustaka media", "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/upload-image", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string };
      if (data?.url) {
        const url = data.url;
        setItems((prev) => [
          { url, key: url, source: "Baru diunggah", label: file.name },
          ...(prev ?? []),
        ]);
        onSelect(url);
        onClose();
        toast("Gambar terunggah & terpilih", "success");
      } else {
        toast("Upload gagal, coba lagi", "error");
      }
    } catch {
      toast("Upload gagal, coba lagi", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const q = query.trim().toLowerCase();
  const filtered = (items ?? []).filter(
    (it) => !q || it.url.toLowerCase().includes(q) || it.label.toLowerCase().includes(q)
  );

  return (
    <Dialog open={open} onClose={onClose} className="max-w-3xl">
      <DialogCloseButton onClose={onClose} />
      <DialogHeader>
        <DialogTitle>Pilih dari Pustaka Media</DialogTitle>
        <DialogDescription>
          Gambar yang sedang dipakai konten. Klik untuk memilih, atau unggah baru.
        </DialogDescription>
      </DialogHeader>

      <div className="flex items-center gap-2 px-5 py-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari gambar..."
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Unggah
        </Button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      </div>

      <div className="max-h-[52vh] overflow-y-auto px-5 pb-5">
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {filtered.map((it) => (
              <button
                key={it.url}
                type="button"
                onClick={() => {
                  onSelect(it.url);
                  onClose();
                }}
                title={it.label}
                className="group relative aspect-square overflow-hidden rounded-lg border border-border transition hover:border-brand-500 hover:ring-2 hover:ring-brand-500/30"
              >
                <img
                  src={resizeImage(it.url, 300) ?? it.url}
                  srcSet={buildSrcSet(it.url, 300)}
                  sizes="150px"
                  alt={it.label}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
                <span className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-1.5 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
                  {it.source}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <X size={24} className="text-slate-300" />
            <p className="text-sm text-muted-foreground">
              {q ? "Tidak ada gambar yang cocok." : "Belum ada gambar. Klik Unggah untuk menambah."}
            </p>
          </div>
        )}
      </div>
    </Dialog>
  );
}
