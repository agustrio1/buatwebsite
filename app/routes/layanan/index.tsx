import { Link } from "react-router";
import { servicePages } from "~/data/service-pages";
import { ArrowRight } from "lucide-react";

export default function LayananIndex() {
  return (
    <div>
      <section className="border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 text-center">
          <span className="inline-block bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            Layanan Kami
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-brand-dark">
            Solusi Lengkap Kebutuhan Website Anda
          </h1>
          <p className="text-slate-500 mt-4 leading-relaxed">
            Dari website profil sederhana hingga sistem bisnis custom — pilih layanan yang sesuai
            dengan kebutuhan Anda.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {servicePages.map((s) => (
            <Link
              key={s.slug}
              to={`/layanan/${s.slug}`}
              className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-brand-500 transition-colors"
            >
              <h2 className="font-semibold text-brand-dark">{s.title}</h2>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">{s.shortDesc}</p>
              <span className="flex items-center gap-1.5 text-sm text-brand-600 mt-4 font-medium">
                Pelajari lebih lanjut
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}