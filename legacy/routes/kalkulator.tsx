import { useState } from "react";
import { Link, useOutletContext } from "react-router";
import type { Route } from "./+types/kalkulator";
import { ArrowRight, MessageCircle } from "lucide-react";
import { getPublicSettings } from "~/lib/settings.server";
import { buildWaLink } from "~/lib/format";
import { mergeMeta } from "~/lib/meta";
import {
  calcTotals,
  formatRupiah,
  normalizeCalculatorConfig,
} from "~/lib/price-calculator";

export async function loader() {
  const settings = await getPublicSettings();
  const config = normalizeCalculatorConfig(settings.price_calculator);

  if (!config.enabled || config.baseItems.length === 0) {
    throw new Response("Not found", { status: 404 });
  }

  return { config };
}

export function meta({ loaderData, matches }: Route.MetaArgs) {
  if (!loaderData?.config) return [{ title: "Halaman tidak ditemukan" }];

  const rootData = (matches as any[]).find((m) => m?.id === "root")?.loaderData;
  const general = rootData?.settings?.general ?? {};
  const siteName = general.siteName || "Website";
  const siteUrl = String(general.siteUrl || "").replace(/\/$/, "");

  const title = `Kalkulator Harga Pembuatan Website | ${siteName}`;
  const description =
    loaderData.config.intro ||
    "Hitung estimasi biaya pembuatan website bisnis Anda: pilih jenis website dan fitur tambahan, lihat kisaran harganya langsung.";

  const tags: Record<string, any>[] = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];

  if (siteUrl) {
    tags.push({ property: "og:url", content: `${siteUrl}/kalkulator` });
    tags.push({ tagName: "link", rel: "canonical", href: `${siteUrl}/kalkulator` });
  }

  return mergeMeta(matches as any[], tags);
}

export default function Kalkulator({ loaderData }: Route.ComponentProps) {
  const { config } = loaderData;
  const { settings } = useOutletContext<{ settings: Record<string, any> }>();
  const contact = settings.contact ?? {};
  const templates = settings.whatsapp_templates ?? {};

  const [baseId, setBaseId] = useState(config.baseItems[0].id);
  const [addonIds, setAddonIds] = useState<string[]>([]);

  const base = config.baseItems.find((item) => item.id === baseId) ?? config.baseItems[0];
  const addons = config.addonItems.filter((item) => addonIds.includes(item.id));
  const { min, max } = calcTotals(base, addons, config.rangePercent);
  const isRange = max > min;
  const totalText = isRange ? `${formatRupiah(min)} – ${formatRupiah(max)}` : formatRupiah(min);

  function toggleAddon(id: string) {
    setAddonIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const opening =
    templates.customQuotation ??
    "Halo Kak, saya ingin minta penawaran harga untuk projek website saya.";

  const message = [
    opening,
    "",
    `Jenis website: ${base.label}`,
    addons.length > 0 ? `Fitur tambahan: ${addons.map((a) => a.label).join(", ")}` : null,
    `Estimasi: ${totalText}`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  const waLink = buildWaLink(contact.whatsappNumber, message);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <span className="mb-4 inline-block rounded-full bg-brand-100 px-3 py-1.5 text-xs font-semibold text-brand-700">
          Kalkulator
        </span>
        <h1 className="text-2xl font-bold text-brand-dark md:text-4xl">
          {config.title || "Kalkulator Estimasi Harga Website"}
        </h1>
        {config.intro && (
          <p className="mt-3 leading-relaxed text-slate-500">{config.intro}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section>
            <h2 className="mb-3 font-semibold text-brand-dark">1. Pilih jenis website</h2>
            <div className="space-y-3">
              {config.baseItems.map((item) => {
                const selected = item.id === base.id;
                return (
                  <label
                    key={item.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
                      selected
                        ? "border-brand-500 bg-brand-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="base"
                      checked={selected}
                      onChange={() => setBaseId(item.id)}
                      className="mt-1 h-4 w-4 accent-brand-500"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-medium text-brand-dark">{item.label}</span>
                        <span className="shrink-0 text-sm font-semibold text-brand-600">
                          {formatRupiah(item.price)}
                        </span>
                      </div>
                      {item.description && (
                        <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          {config.addonItems.length > 0 && (
            <section>
              <h2 className="mb-3 font-semibold text-brand-dark">
                2. Tambah fitur (opsional)
              </h2>
              <div className="space-y-3">
                {config.addonItems.map((item) => {
                  const selected = addonIds.includes(item.id);
                  return (
                    <label
                      key={item.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
                        selected
                          ? "border-brand-500 bg-brand-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleAddon(item.id)}
                        className="mt-1 h-4 w-4 accent-brand-500"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <span className="font-medium text-brand-dark">{item.label}</span>
                          <span className="shrink-0 text-sm font-semibold text-brand-600">
                            {item.price > 0 ? `+ ${formatRupiah(item.price)}` : "Termasuk"}
                          </span>
                        </div>
                        {item.description && (
                          <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:col-span-1">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <p className="text-sm font-medium text-slate-500">Estimasi biaya</p>
            <p
              className="mt-1 text-2xl font-bold text-brand-dark md:text-3xl"
              aria-live="polite"
            >
              {totalText}
            </p>

            <ul className="mt-5 space-y-2 border-t border-slate-100 pt-5 text-sm text-slate-600">
              <li className="flex justify-between gap-3">
                <span className="min-w-0">{base.label}</span>
                <span className="shrink-0">{formatRupiah(base.price)}</span>
              </li>
              {addons.map((a) => (
                <li key={a.id} className="flex justify-between gap-3">
                  <span className="min-w-0">{a.label}</span>
                  <span className="shrink-0">
                    {a.price > 0 ? formatRupiah(a.price) : "Termasuk"}
                  </span>
                </li>
              ))}
            </ul>

            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-full bg-brand-500 px-6 py-3.5 font-medium text-white shadow-lg shadow-brand-500/20 transition-colors hover:bg-brand-600"
            >
              <MessageCircle size={18} />
              <span>Kirim Estimasi via WhatsApp</span>
            </a>

            <Link
              to="/#brief"
              className="mt-3 flex items-center justify-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-brand-600"
            >
              Atau isi brief singkat <ArrowRight size={14} />
            </Link>

            {config.note && (
              <p className="mt-5 text-xs leading-relaxed text-slate-400">{config.note}</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}