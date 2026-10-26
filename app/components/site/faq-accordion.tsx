"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Akordeon FAQ home. useState(openFaq) sebelumnya ada di komponen Home;
 * dipisah ke client component supaya Home tetap Server Component. Markup dan
 * kelas dijaga persis seperti versi React Router, termasuk jawaban yang selalu
 * dirender (hidden) agar terbaca crawler.
 */
export function FaqAccordion({
  faqs,
}: {
  faqs: { q: string; a: string }[];
}) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white px-6">
      {faqs.map((item, i) => {
        const isOpen = openFaq === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              id={`faq-button-${i}`}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${i}`}
              onClick={() => setOpenFaq(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
            >
              <span className="font-medium text-brand-dark">{item.q}</span>
              <ChevronDown
                size={18}
                aria-hidden="true"
                className={`shrink-0 text-slate-400 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {/* Selalu dirender supaya teks jawaban ada di HTML untuk crawler */}
            <p
              id={`faq-panel-${i}`}
              role="region"
              aria-labelledby={`faq-button-${i}`}
              hidden={!isOpen}
              className="pb-5 text-sm leading-relaxed text-slate-500"
            >
              {item.a}
            </p>
          </div>
        );
      })}
    </div>
  );
}
