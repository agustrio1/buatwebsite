import { Link, useSearchParams } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const [searchParams] = useSearchParams();

  if (totalPages <= 1) return null;

  function pageHref(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    return `?${params.toString()}`;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-8" aria-label="Navigasi halaman">
      <Link
        to={pageHref(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        className={`flex items-center justify-center w-9 h-9 rounded-lg border text-sm ${
          currentPage === 1
            ? "text-slate-300 border-slate-100 pointer-events-none"
            : "text-slate-500 border-slate-200 hover:bg-slate-50"
        }`}
      >
        <ChevronLeft size={16} />
      </Link>

      {pages.map((p) => (
        <Link
          key={p}
          to={pageHref(p)}
          className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium ${
            p === currentPage
              ? "bg-brand-500 text-white"
              : "text-slate-500 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          {p}
        </Link>
      ))}

      <Link
        to={pageHref(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        className={`flex items-center justify-center w-9 h-9 rounded-lg border text-sm ${
          currentPage === totalPages
            ? "text-slate-300 border-slate-100 pointer-events-none"
            : "text-slate-500 border-slate-200 hover:bg-slate-50"
        }`}
      >
        <ChevronRight size={16} />
      </Link>
    </nav>
  );
}