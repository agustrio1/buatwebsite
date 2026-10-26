import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "~/lib/cn";

type SearchParamsInput = Record<string, string | string[] | undefined>;

const base =
  "inline-flex items-center justify-center h-9 w-9 rounded-lg text-sm font-medium transition-colors select-none";
const inactive = "text-muted-foreground border border-border hover:bg-muted";
const disabled = "text-slate-300 border border-slate-100 pointer-events-none";

/**
 * Versi Next dari pagination lama. React Router mengambil URL aktif lewat
 * useSearchParams(); di App Router basePath + searchParams diteruskan dari
 * page, jadi komponen ini tetap berupa Server Component tanpa JS tambahan.
 *
 * Parameter lain (mis. filter di admin) tetap dipertahankan seperti sebelumnya.
 */
export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = {},
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: SearchParamsInput;
}) {
  if (totalPages <= 1) return null;

  function pageHref(page: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (key === "page" || value === undefined) continue;
      for (const v of Array.isArray(value) ? value : [value]) params.append(key, v);
    }
    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-8" aria-label="Navigasi halaman">
      <Link
        href={pageHref(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        className={cn(base, currentPage === 1 ? disabled : inactive)}
      >
        <ChevronLeft size={16} />
      </Link>

      {pages.map((p) => (
        <Link
          key={p}
          href={pageHref(p)}
          className={cn(
            base,
            p === currentPage ? "bg-brand-500 text-white shadow-sm" : inactive
          )}
        >
          {p}
        </Link>
      ))}

      <Link
        href={pageHref(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        className={cn(base, currentPage === totalPages ? disabled : inactive)}
      >
        <ChevronRight size={16} />
      </Link>
    </nav>
  );
}
