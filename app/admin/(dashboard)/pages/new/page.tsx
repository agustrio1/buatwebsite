import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageNewForm } from "~/components/admin/page-new-form";
import { createPage } from "../actions";

export default function NewPage() {
  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/pages"
          className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-brand-600 hover:border-brand-200 transition-colors"
          aria-label="Kembali ke daftar halaman"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="min-w-0">
          <p className="text-xs text-slate-400">Halaman</p>
          <h1 className="text-xl md:text-2xl font-bold text-brand-dark truncate">Buat Halaman Custom</h1>
        </div>
      </div>

      <PageNewForm action={createPage} />
    </div>
  );
}
