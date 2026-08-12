import { Link } from "react-router";
import type { Route } from "./+types/$slug";
import { servicePages } from "~/data/service-pages";
import { useOutletContext } from "react-router";
import { ArrowLeft, Check, MessageCircle } from "lucide-react";
import { buildWaLink } from "~/lib/format";

export function loader({ params }: Route.LoaderArgs) {
  const service = servicePages.find((s) => s.slug === params.slug);
  if (!service) throw new Response("Not found", { status: 404 });
  return { service };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data?.service) return [{ title: "Layanan tidak ditemukan" }];
  return [
    { title: data.service.title },
    { name: "description", content: data.service.shortDesc },
  ];
}

export default function LayananDetail({ loaderData }: Route.ComponentProps) {
  const { service } = loaderData;
  const { settings } = useOutletContext<{ settings: Record<string, any> }>();

  const contact = settings.contact ?? {};
  const templates = settings.whatsapp_templates ?? {};
  const waLink = buildWaLink(
    contact.whatsappNumber,
    (templates.packageInquiry ?? "Halo, saya berminat dengan layanan {packageName}").replace(
      "{packageName}",
      service.title
    )
  );

  return (
    <article className="max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-16">
      <Link
        to="/layanan"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 transition-colors mb-8"
      >
        <ArrowLeft size={16} /> Kembali ke Layanan
      </Link>

      <h1 className="text-2xl md:text-4xl font-bold text-brand-dark leading-tight">
        {service.title}
      </h1>
      <p className="text-lg text-slate-500 mt-4 leading-relaxed">{service.shortDesc}</p>

      <p className="text-slate-600 leading-relaxed mt-8">{service.intro}</p>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mt-8">
        <h2 className="font-semibold text-brand-dark mb-4">Yang Anda dapatkan</h2>
        <ul className="space-y-3">
          {service.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
              <Check size={16} className="text-brand-500 mt-0.5 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <a
        href={waLink}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium px-6 py-3.5 rounded-full mt-8 transition-colors shadow-lg shadow-brand-500/20"
      >
        <MessageCircle size={18} /> Konsultasi Layanan Ini
      </a>
    </article>
  );
}