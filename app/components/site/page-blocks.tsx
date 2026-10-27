/**
 * Renderer blok Page Builder — SATU sumber kebenaran visual, dipakai oleh
 * halaman publik (server component) dan kanvas builder (client).
 * Tidak ada "use client" di sini; blok interaktif delegasi ke klien kecil.
 */

import type { JSONContent } from "@tiptap/react";
import {
  Zap,
  Rocket,
  ShieldCheck,
  Gauge,
  Palette,
  Code2,
  Globe,
  Smartphone,
  Search,
  Headset,
  TrendingUp,
  Users,
  Star,
  CheckCircle2,
  Wrench,
  HeartHandshake,
} from "lucide-react";
import { parseBlockProps } from "~/lib/page-builder/blocks";
import { COLUMN_RATIOS, type BlockNode, type PageDocument, type Section } from "~/lib/page-builder/types";
import { RichTextView } from "~/components/site/rich-text-view";
import { FaqAccordion } from "~/components/site/faq-accordion";
import { LeadFormBlock } from "~/components/site/lead-form-block";

const ICONS: Record<string, typeof Zap> = {
  Zap,
  Rocket,
  ShieldCheck,
  Gauge,
  Palette,
  Code2,
  Globe,
  Smartphone,
  Search,
  Headset,
  TrendingUp,
  Users,
  Star,
  CheckCircle2,
  Wrench,
  HeartHandshake,
};

// Kelas lebar kolom (grid 12) harus literal supaya terbaca Tailwind JIT.
const COL_SPAN: Record<(typeof COLUMN_RATIOS)[number], string> = {
  full: "md:col-span-12",
  half: "md:col-span-6",
  third: "md:col-span-4",
  "two-thirds": "md:col-span-8",
  quarter: "md:col-span-3",
};

const PADDING: Record<Section["padding"], string> = {
  none: "",
  sm: "py-6",
  md: "py-12 md:py-16",
  lg: "py-20 md:py-28",
};

export type BlockRenderCtx = {
  slug: string;
  whatsappNumber?: string | null;
};

// ---------- pembaca props ----------

const s = (p: Record<string, unknown>, k: string) => String(p[k] ?? "");
const b = (p: Record<string, unknown>, k: string) => p[k] === true;
const arr = (p: Record<string, unknown>, k: string) =>
  Array.isArray(p[k]) ? (p[k] as Record<string, unknown>[]) : [];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Rating ${rating} dari 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}
        />
      ))}
    </div>
  );
}

function youtubeOrVimeo(raw: string): string | null {
  try {
    const u = new URL(raw);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v") ?? u.pathname.split("/").filter(Boolean).pop();
      return v ? `https://www.youtube-nocookie.com/embed/${v}` : null;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.match(/\d+/)?.[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    /* bukan URL */
  }
  return null;
}

// ---------- blok ----------

function BlockViewInner({ block, ctx }: { block: BlockNode; ctx: BlockRenderCtx }) {
  const p = parseBlockProps(block.type, block.props);

  switch (block.type) {
    case "hero": {
      const buttons = arr(p, "buttons");
      const image = s(p, "imageUrl");
      const center = s(p, "align") === "center";
      const text = (
        <div className={center ? "text-center" : ""}>
          {s(p, "eyebrow") && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-600">
              {s(p, "eyebrow")}
            </p>
          )}
          <h2 className="text-3xl font-extrabold leading-tight text-brand-dark md:text-4xl">
            {s(p, "title")}
          </h2>
          {s(p, "subtitle") && (
            <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-lg">{s(p, "subtitle")}</p>
          )}
          {buttons.length > 0 && (
            <div className={`mt-6 flex flex-wrap gap-3 ${center ? "justify-center" : ""}`}>
              {buttons.map((btn, i) => (
                <a
                  key={String(btn.id ?? i)}
                  href={String(btn.url ?? "#")}
                  className={`rounded-full px-6 py-3 text-sm font-semibold transition-colors ${
                    i === 0
                      ? "bg-brand-500 text-white hover:bg-brand-600"
                      : "border border-slate-300 text-brand-dark hover:border-brand-400 hover:text-brand-600"
                  }`}
                >
                  {String(btn.label ?? "")}
                </a>
              ))}
            </div>
          )}
        </div>
      );
      return image ? (
        <div className="grid items-center gap-8 md:grid-cols-2">
          {text}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={s(p, "imageAlt")} className="w-full rounded-2xl object-cover shadow-lg" loading="lazy" />
        </div>
      ) : (
        text
      );
    }

    case "rich_text":
      return <RichTextView content={p.content as JSONContent} />;

    case "features": {
      const cols = s(p, "columns") || "3";
      const gridCls = cols === "2" ? "sm:grid-cols-2" : cols === "4" ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";
      return (
        <div>
          {s(p, "title") && <h2 className="mb-8 text-center text-2xl font-bold text-brand-dark">{s(p, "title")}</h2>}
          <div className={`grid grid-cols-1 gap-5 ${gridCls}`}>
            {arr(p, "items").map((it, i) => {
              const Icon = ICONS[String(it.icon ?? "Zap")] ?? Zap;
              return (
                <div key={String(it.id ?? i)} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-semibold text-brand-dark">{String(it.title ?? "")}</h3>
                  {String(it.description ?? "") && (
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{String(it.description)}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    case "image": {
      const url = s(p, "url");
      if (!url) return <p className="text-sm italic text-slate-400">(belum ada gambar)</p>;
      const img = (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={s(p, "alt")}
          className={`w-full object-cover ${b(p, "rounded") ? "rounded-2xl" : ""}`}
          loading="lazy"
        />
      );
      return (
        <figure>
          {b(p, "lightbox") ? (
            <a href={url} target="_blank" rel="noreferrer" className="block cursor-zoom-in">
              {img}
            </a>
          ) : (
            img
          )}
          {s(p, "caption") && (
            <figcaption className="mt-2 text-center text-sm text-slate-500">{s(p, "caption")}</figcaption>
          )}
        </figure>
      );
    }

    case "cta_whatsapp": {
      const phone = (s(p, "phoneNumber") || ctx.whatsappNumber || "").replace(/\D/g, "");
      const href = phone
        ? `https://wa.me/${phone}?text=${encodeURIComponent(s(p, "presetMessage"))}`
        : "#";
      return (
        <div className="rounded-3xl bg-gradient-to-r from-brand-500 to-brand-600 p-8 text-center text-white md:p-12">
          <h2 className="text-2xl font-bold md:text-3xl">{s(p, "title")}</h2>
          {s(p, "description") && <p className="mx-auto mt-3 max-w-xl text-white/85">{s(p, "description")}</p>}
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 font-semibold text-brand-700 shadow transition-transform hover:scale-[1.02]"
          >
            {s(p, "buttonLabel")}
          </a>
        </div>
      );
    }

    case "faq": {
      const faqs = arr(p, "items").map((it) => ({
        q: String(it.question ?? ""),
        a: String(it.answer ?? ""),
      }));
      return (
        <div>
          {s(p, "title") && <h2 className="mb-6 text-2xl font-bold text-brand-dark">{s(p, "title")}</h2>}
          <FaqAccordion faqs={faqs} />
        </div>
      );
    }

    case "testimonial": {
      return (
        <div>
          {s(p, "title") && <h2 className="mb-8 text-center text-2xl font-bold text-brand-dark">{s(p, "title")}</h2>}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {arr(p, "items").map((it, i) => (
              <figure key={String(it.id ?? i)} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <Stars rating={Math.min(5, Math.max(1, Number(it.rating) || 5))} />
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                  “{String(it.quote ?? "")}”
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  {String(it.imageUrl ?? "") && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={String(it.imageUrl)} alt="" className="h-10 w-10 rounded-full object-cover" loading="lazy" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-brand-dark">{String(it.name ?? "")}</p>
                    {String(it.role ?? "") && <p className="text-xs text-slate-500">{String(it.role)}</p>}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      );
    }

    case "gallery": {
      const cols = s(p, "columns") || "3";
      const gridCls = cols === "2" ? "sm:grid-cols-2" : cols === "4" ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";
      return (
        <div>
          {s(p, "title") && <h2 className="mb-6 text-2xl font-bold text-brand-dark">{s(p, "title")}</h2>}
          <div className={`grid grid-cols-1 gap-4 ${gridCls}`}>
            {arr(p, "images").map((im, i) =>
              String(im.url ?? "") ? (
                <a key={String(im.id ?? i)} href={String(im.url)} target="_blank" rel="noreferrer" className="cursor-zoom-in">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={String(im.url)} alt={String(im.alt ?? "")} className="aspect-square w-full rounded-xl object-cover transition-transform hover:scale-[1.02]" loading="lazy" />
                </a>
              ) : null
            )}
          </div>
        </div>
      );
    }

    case "pricing": {
      return (
        <div>
          {s(p, "title") && <h2 className="mb-8 text-center text-2xl font-bold text-brand-dark">{s(p, "title")}</h2>}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {arr(p, "items").map((it, i) => {
              const feats = String(it.features ?? "")
                .split("\n")
                .map((x) => x.trim())
                .filter(Boolean);
              const hot = it.highlight === true;
              return (
                <div
                  key={String(it.id ?? i)}
                  className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm ${
                    hot ? "border-brand-500 ring-2 ring-brand-100" : "border-slate-200"
                  }`}
                >
                  <h3 className="font-semibold text-brand-dark">{String(it.name ?? "")}</h3>
                  <p className="mt-2 text-2xl font-extrabold text-brand-600">
                    {String(it.price ?? "")}
                    {String(it.period ?? "") && (
                      <span className="text-sm font-medium text-slate-400">{String(it.period)}</span>
                    )}
                  </p>
                  {String(it.description ?? "") && (
                    <p className="mt-1 text-sm text-slate-500">{String(it.description)}</p>
                  )}
                  <ul className="mt-4 flex-1 space-y-2">
                    {feats.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-brand-500" /> {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={String(it.ctaUrl ?? "/kontak")}
                    className={`mt-6 rounded-full px-6 py-2.5 text-center text-sm font-semibold transition-colors ${
                      hot ? "bg-brand-500 text-white hover:bg-brand-600" : "border border-brand-300 text-brand-600 hover:bg-brand-50"
                    }`}
                  >
                    {String(it.ctaLabel ?? "Pilih")}
                  </a>
                </div>
              );
            })}
          </div>
          {s(p, "note") && <p className="mt-6 text-center text-sm text-slate-500">{s(p, "note")}</p>}
        </div>
      );
    }

    case "video": {
      const src = youtubeOrVimeo(s(p, "url"));
      if (!src) return <p className="text-sm italic text-slate-400">(URL video tidak dikenal — pakai YouTube/Vimeo)</p>;
      return (
        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl shadow-lg">
          <div className="aspect-video">
            <iframe
              src={src}
              title={s(p, "title") || "Video"}
              className="h-full w-full"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      );
    }

    case "stats": {
      return (
        <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
          {arr(p, "items").map((st, i) => (
            <div key={String(st.id ?? i)}>
              <p className="text-3xl font-extrabold text-brand-600 md:text-4xl">
                {String(st.value ?? "")}
                <span className="text-xl md:text-2xl">{String(st.suffix ?? "")}</span>
              </p>
              <p className="mt-1 text-sm text-slate-500">{String(st.label ?? "")}</p>
            </div>
          ))}
        </div>
      );
    }

    case "logo_strip": {
      return (
        <div>
          {s(p, "title") && (
            <p className="mb-5 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
              {s(p, "title")}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {arr(p, "items").map((lg, i) =>
              String(lg.imageUrl ?? "") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={String(lg.id ?? i)}
                  src={String(lg.imageUrl)}
                  alt={String(lg.name ?? "")}
                  title={String(lg.name ?? "")}
                  className="h-9 w-auto max-w-[140px] object-contain opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0 md:h-10"
                  loading="lazy"
                />
              ) : null
            )}
          </div>
        </div>
      );
    }

    case "lead_form": {
      return (
        <div className="mx-auto max-w-xl">
          <LeadFormBlock
            title={s(p, "title")}
            description={s(p, "description")}
            submitLabel={s(p, "submitLabel")}
            successMessage={s(p, "successMessage")}
            source={`page:${ctx.slug}`}
          />
        </div>
      );
    }

    default:
      return null;
  }
}

export function BlockView({ block, ctx }: { block: BlockNode; ctx: BlockRenderCtx }) {
  return <BlockViewInner block={block} ctx={ctx} />;
}

function SectionView({ section, ctx }: { section: Section; ctx: BlockRenderCtx }) {
  const bg = section.background ?? {};
  return (
    <section
      className={PADDING[section.padding] ?? PADDING.md}
      style={{
        backgroundColor: bg.color || undefined,
        backgroundImage: bg.imageUrl ? `url(${bg.imageUrl})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-6 md:gap-8">
          {section.columns.map((col) => (
            <div key={col.id} className={COL_SPAN[col.ratio] ?? "md:col-span-12"}>
              <div className="space-y-6">
                {col.blocks.map((block) => (
                  <BlockView key={block.id} block={block} ctx={ctx} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PageBlocks({
  document,
  ctx,
}: {
  document: PageDocument;
  ctx: BlockRenderCtx;
}) {
  return (
    <>
      {document.sections.map((section) => (
        <SectionView key={section.id} section={section} ctx={ctx} />
      ))}
    </>
  );
}

/** Kumpulkan semua pertanyaan FAQ dari dokumen untuk JSON-LD FAQPage. */
export function collectPageFaqs(document: PageDocument): { question: string; answer: string }[] {
  const out: { question: string; answer: string }[] = [];
  for (const sec of document.sections) {
    for (const col of sec.columns) {
      for (const block of col.blocks) {
        if (block.type === "faq" && Array.isArray(block.props.items)) {
          for (const it of block.props.items as Record<string, unknown>[]) {
            const q = String(it.question ?? "").trim();
            const a = String(it.answer ?? "").trim();
            if (q && a) out.push({ question: q, answer: a });
          }
        }
      }
    }
  }
  return out;
}
