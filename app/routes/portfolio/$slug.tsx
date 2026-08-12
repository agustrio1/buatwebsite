import { Link } from "react-router";
import type { Route } from "./+types/$slug";
import { db } from "~/db";
import { projects, projectImages } from "~/db/schema";
import { eq, asc } from "drizzle-orm";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { RichTextView } from "~/components/site/rich-text-view";
import type { JSONContent } from "@tiptap/react";

export async function loader({ params }: Route.LoaderArgs) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.slug, params.slug),
    with: { images: { orderBy: [asc(projectImages.sortOrder)] } },
  });

  if (!project) throw new Response("Not found", { status: 404 });

  return { project };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data?.project) return [{ title: "Projek tidak ditemukan" }];
  return [
    { title: data.project.title },
    { name: "description", content: data.project.summary ?? "" },
  ];
}

export default function PortfolioDetail({ loaderData }: Route.ComponentProps) {
  const { project } = loaderData;

  return (
    <article className="max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-16">
      <Link
        to="/projek"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 transition-colors mb-8"
      >
        <ArrowLeft size={16} /> Kembali ke Portofolio
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-brand-dark leading-tight">
            {project.title}
          </h1>
          {project.clientName && (
            <p className="text-slate-500 mt-2">{project.clientName}</p>
          )}
        </div>
        {project.liveDemoUrl && (
          <a
            href={project.liveDemoUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg shrink-0"
          >
            Lihat Demo <ExternalLink size={16} />
          </a>
        )}
      </div>

      {project.techStack && project.techStack.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-5">
          {project.techStack.map((t) => (
            <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
              {t}
            </span>
          ))}
        </div>
      )}

      {project.coverImageUrl && (
        <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 mt-8">
          <img src={project.coverImageUrl} alt={project.title} className="w-full h-full object-cover" />
        </div>
      )}

      {project.summary && (
        <p className="text-lg text-slate-500 italic leading-relaxed mt-8 border-l-2 border-brand-200 pl-4">
          {project.summary}
        </p>
      )}

      <div className="mt-8">
        <RichTextView content={project.descriptionRich as JSONContent | null} />
      </div>

      {project.images.length > 0 && (
        <div className="mt-10">
          <h2 className="font-semibold text-brand-dark mb-4">Galeri</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {project.images.map((img) => (
              <div key={img.id} className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                <img src={img.imageUrl} alt={img.altText ?? project.title} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}