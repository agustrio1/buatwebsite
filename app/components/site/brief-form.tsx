import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { Send, CheckCircle2 } from "lucide-react";
import { getSource } from "~/components/site/wa-tracker";

// Dipakai kalau settings.brief_form.budgetOptions belum diisi di admin
const DEFAULT_BUDGET_OPTIONS = [
  "Di bawah Rp2 juta",
  "Rp2 – 5 juta",
  "Rp5 – 15 juta",
  "Di atas Rp15 juta",
  "Belum tahu, butuh saran",
];

type BriefFormProps = {
  services: { id: string; title: string }[];
  budgetOptions?: string[];
};

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-300 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

export function BriefForm({ services, budgetOptions }: BriefFormProps) {
  const fetcher = useFetcher<{ success?: boolean; error?: string }>();
  const isSubmitting = fetcher.state !== "idle";
  const [meta, setMeta] = useState({ source: "", page: "" });

  useEffect(() => {
    setMeta({ source: getSource(), page: window.location.pathname });
  }, []);

  const budgets =
    budgetOptions && budgetOptions.length > 0 ? budgetOptions : DEFAULT_BUDGET_OPTIONS;
  const source = meta.source ? `${meta.source} → ${meta.page}` : "";

  if (fetcher.data?.success) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <CheckCircle2 className="mx-auto text-green-600" size={32} />
        <p className="mt-3 font-semibold text-green-700">Brief Anda sudah kami terima</p>
        <p className="mt-1 text-sm text-green-600">
          Kami akan menghubungi Anda lewat WhatsApp secepatnya.
        </p>
      </div>
    );
  }

  return (
    <fetcher.Form method="post" action="/api/inquiry" className="relative space-y-4">
      {fetcher.data?.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {fetcher.data.error}
        </p>
      )}

      <input type="hidden" name="source" value={source} />

      {/* Honeypot anti-spam: jangan diisi */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Nama</label>
          <input name="name" required autoComplete="name" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>No. WhatsApp</label>
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            required
            autoComplete="tel"
            placeholder="0812xxxxxxxx"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {services.length > 0 && (
          <div>
            <label className={labelClass}>Yang dibutuhkan</label>
            <select name="serviceType" defaultValue="" className={inputClass}>
              <option value="">Pilih layanan (opsional)</option>
              {services.map((s) => (
                <option key={s.id} value={s.title}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className={labelClass}>Kisaran budget</label>
          <select name="budget" defaultValue="" className={inputClass}>
            <option value="">Pilih budget (opsional)</option>
            {budgets.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Ceritakan singkat kebutuhan Anda</label>
        <textarea
          name="message"
          rows={3}
          placeholder="Contoh: toko online untuk produk kue, butuh pembayaran online"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Email (opsional)</label>
        <input name="email" type="email" autoComplete="email" className={inputClass} />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-medium text-white shadow-lg shadow-brand-500/20 transition-colors hover:bg-brand-600 disabled:opacity-50 sm:w-auto"
      >
        <Send size={16} /> {isSubmitting ? "Mengirim..." : "Kirim Brief"}
      </button>
    </fetcher.Form>
  );
}