"use client";

import { useState } from "react";
import { List } from "lucide-react";

type TocItem = { id: string; text: string; level: number };

/**
 * Daftar isi artikel. useState(isTocOpen) sebelumnya ada di BlogDetail;
 * dipisah ke client component supaya halaman tetap Server Component. Link
 * daftar isi selalu dirender (hidden saat tertutup) persis seperti lama.
 */
export function TocNav({ toc }: { toc: TocItem[] }) {
  const [isTocOpen, setIsTocOpen] = useState(true);

  if (toc.length === 0) return null;

  return (
    <nav aria-label="Daftar isi" className="mt-8 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
      <button
        type="button"
        aria-expanded={isTocOpen}
        onClick={() => setIsTocOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2 px-5 py-4 text-sm font-semibold text-brand-dark"
      >
        <span className="flex items-center gap-2">
          <List size={16} />
          Daftar Isi
        </span>
        <span className={`transition-transform duration-200 ${isTocOpen ? "rotate-180" : ""}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {/* Selalu dirender supaya link daftar isi ada di HTML */}
      <ul hidden={!isTocOpen} className="space-y-1.5 text-sm px-5 pb-5">
        {toc.map((item) => {
          const indentClass = item.level === 3 ? "ml-4" : "ml-0";
          return (
            <li key={item.id} className={indentClass}>
              <a href={`#${item.id}`} className="text-slate-600 hover:text-brand-600 transition-colors">{item.text}</a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
