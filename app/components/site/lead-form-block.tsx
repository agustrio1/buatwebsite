"use client";

import { useActionState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { submitInquiry, type InquiryResult } from "~/lib/actions/inquiry";

/**
 * Blok "Form Lead" untuk Page Builder — memakai action inquiry yang sudah ada
 * (rate limit + penyimpanan ke tabel inquiries), dengan judul/pesan sukses dan
 * sumber yang bisa dikustomisasi per halaman.
 */
export function LeadFormBlock({
  title,
  description,
  submitLabel,
  successMessage,
  source,
}: {
  title: string;
  description: string;
  submitLabel: string;
  successMessage: string;
  source: string;
}) {
  const [data, formAction, isSubmitting] = useActionState(submitInquiry, {} as InquiryResult);

  if (data?.success) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <CheckCircle2 className="mx-auto text-green-600" size={32} />
        <p className="mt-3 font-semibold text-green-700">{successMessage || "Pesan terkirim"}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {title && <h3 className="text-lg font-bold text-brand-dark">{title}</h3>}
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}

      <form action={formAction} className="mt-4 space-y-3">
        <input type="hidden" name="source" value={source} />
        {data?.error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {data.error}
          </p>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input name="name" required placeholder="Nama" className="rounded-lg border border-slate-200 px-3 py-2.5" />
          <input name="email" type="email" required placeholder="Email" className="rounded-lg border border-slate-200 px-3 py-2.5" />
        </div>
        <input name="phone" placeholder="No. WhatsApp (opsional)" className="w-full rounded-lg border border-slate-200 px-3 py-2.5" />
        <textarea name="message" required rows={4} placeholder="Pesan Anda" className="w-full rounded-lg border border-slate-200 px-3 py-2.5" />
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
        >
          <Send size={16} /> {isSubmitting ? "Mengirim..." : submitLabel || "Kirim"}
        </button>
      </form>
    </div>
  );
}
