import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/misc";

/**
 * Placeholder loading untuk halaman daftar admin (pola judul + tombol + tabel).
 * Server-safe: hanya memakai Skeleton/Card yang tidak punya "use client".
 */
export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-9 w-32" />
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-border p-4">
          <Skeleton className="h-9 w-full max-w-sm" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="hidden h-4 w-24 sm:block" />
              <Skeleton className="hidden h-4 w-16 sm:block" />
              <Skeleton className="h-7 w-20 shrink-0" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
