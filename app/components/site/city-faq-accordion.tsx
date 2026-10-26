"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type CityFaq = { question: string; answer: string };

/**
 * Akordeon FAQ kota. useState(openFaq) sebelumnya ada di CityServicePage;
 * dipisah ke client component supaya halaman tetap Server Component. Panel
 * jawaban selalu dirender (hidden saat tertutup) persis seperti lama, supaya
 * teksnya ada di HTML untuk crawler.
 */
export function CityFaqAccordion({ faqs }: { faqs: CityFaq[] }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-5">
      {faqs.map((faq, i) => {
        const isOpen = openFaq === i;
        return (
          <div key={i}>
            <button
              type="button"
              id={`city-faq-button-${i}`}
              aria-expanded={isOpen}
              aria-controls={`city-faq-panel-${i}`}
              onClick={() => setOpenFaq(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 py-4 text-left"
            >
              <span className="font-medium text-brand-dark text-sm">{faq.question}</span>
              <ChevronDown
                size={16}
                aria-hidden="true"
                className={`shrink-0 text-slate-400 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {/* Selalu dirender supaya teks jawaban ada di HTML untuk crawler */}
            <p
              id={`city-faq-panel-${i}`}
              role="region"
              aria-labelledby={`city-faq-button-${i}`}
              hidden={!isOpen}
              className="pb-4 text-sm leading-relaxed text-slate-500"
            >
              {faq.answer}
            </p>
          </div>
        );
      })}
    </div>
  );
}
