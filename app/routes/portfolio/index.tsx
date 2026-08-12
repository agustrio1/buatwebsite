import { Link } from "react-router";
import type { Route } from "./+types/index";
import { db } from "~/db";
import { projects } from "~/db/schema";
import { desc } from "drizzle-orm";
import { ExternalLink } from "lucide-react";

export async function loader() {
  const allProjects = await db.query.projects.findMany({
    orderBy: [desc(projects.createdAt)],
  });
  return { projects: allProjects };
}

export default function PortfolioIndex({ loaderData }: Route.ComponentProps) {
  const { projects } = loaderData;

  return (
    <div>
      <section className="border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 text-center">
          <span className="inline-block bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            Portofolio
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-brand-dark">Projek yang Sudah Kami Kerjakan</h1>
          <p className="text-slate-500 mt-4 leading-relaxed">
            Kumpulan website yang sudah kami bangun untuk klien dari berbagai industri.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <Link
                key={p.id}
                to={`/projek/${p.slug}`}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 group"
              >
                <div className="aspect-video bg-slate-100 overflow-hidden">
                  {p.coverImageUrl && (
                    <img
                      src={p.coverImageUrl}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <div className="p-5">
                  <h2 className="font-semibold text-lg text-brand-dark">{p.title}</h2>
                  {p.clientName && <p className="text-sm text-slate-400 mt-0.5">{p.clientName}</p>}
                  {p.summary && <p className="text-sm text-slate-500 mt-2 line-clamp-2">{p.summary}</p>}
                  {p.techStack && p.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {p.techStack.slice(0, 4).map((t) => (
                        <span key={t} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {p.liveDemoUrl && (
                    <span className="flex items-center gap-1.5 text-sm text-brand-600 mt-4">
                      Lihat Demo <ExternalLink size={14} />
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-400 py-16">Belum ada projek yang ditampilkan.</p>
        )}
      </section>
    </div>
  );
}