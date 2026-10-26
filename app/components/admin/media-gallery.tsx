"use client";

import { useMemo, useRef, useState } from "react";
import { Search, Upload, Copy, ExternalLink, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { EmptyState } from "~/components/ui/misc";
import { toast } from "~/components/ui/toast";
import type { MediaItem } from "~/lib/media.server";

export function MediaGallery({ initialItems }: { initialItems: MediaItem[] }) {
  const [items, setItems] = useState<MediaItem[]>(initialItems);
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      !q
        ? items
        : items.filter(
            (it) =>
              it.url.toLowerCase().includes(q) ||
              it.label.toLowerCase().includes(q) ||
              it.source.toLowerCase().includes(q)
          ),
    [items, q]
  );

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast("URL disalin", "success");
    } catch {
      toast("Gagal menyalin", "error");
    }
  }

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
        setItems((prev) => [
          { url: data.url!, key: data.url!, source: "Baru diunggah", label: file.name },
          ...prev,
        ]);
        toast("Gambar terunggah", "success");
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

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Media</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kumpulan gambar yang sedang dipakai di konten. {items.length} gambar.
          </p>
        </div>
        <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Unggah gambar
        </Button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      </div>

      <Card className="p-4 mb-4">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari gambar / sumber..."
            className="pl-8"
          />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ImageIcon size={28} />}
            title={q ? "Tidak ada gambar yang cocok" : "Belum ada gambar"}
            description={q ? "Coba kata kunci lain." : "Unggah gambar lewat form konten atau tombol Unggah di atas."}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((it) => (
            <Card key={it.url} className="overflow-hidden">
              <div className="aspect-square bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.url} alt={it.label} loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="p-2.5 space-y-1.5">
                <Badge variant="secondary" className="text-[10px]">{it.source}</Badge>
                <p className="truncate text-xs text-slate-500" title={it.label}>{it.label}</p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => copy(it.url)}
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-border py-1 text-xs text-foreground hover:bg-muted transition-colors"
                  >
                    <Copy size={12} /> Salin
                  </button>
                  <a
                    href={it.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-md border border-border p-1.5 text-slate-500 hover:bg-muted transition-colors"
                    aria-label="Buka gambar"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
