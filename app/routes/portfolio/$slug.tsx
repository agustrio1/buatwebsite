import { Link } from "react-router";
import { useEffect, useState } from "react";
import type { Route } from "./+types/$slug";
import { db } from "~/db";
import { projects, projectImages } from "~/db/schema";
import { eq, asc } from "drizzle-orm";
import { ArrowLeft, ExternalLink, X, ChevronLeft, ChevronRight } from "lucide-react";
import { RichTextView } from "~/components/site/rich-text-view";
import type { JSONContent } from "@tiptap/react";

export function headers() {
  return {
    "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=600",
  };
}

export async function loader({ params }: Route.LoaderArgs) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.slug, params.slug),
    with: { images: { orderBy: [asc(projectImages.sortOrder)] } },
  });

  if (!project) throw new Response("Not found", { status: 404 });

  return { project };
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData?.project) return [{ title: "Projek tidak ditemukan" }];
  return [
    { title: loaderData.project.title },
    { name: "description", content: loaderData.project.summary ?? "" },
  ];
}

type GalleryImage = {
  id: string | number;
  imageUrl: string;
  altText: string | null;
};

function GalleryLightbox({
  images,
  title,
}: {
  images: GalleryImage[];
  title: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const close = () => setOpenIndex(null);

  const showPrev = () =>
    setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));

  const showNext = () =>
    setOpenIndex((i) => (i === null ? null : (i + 1) % images.length));

  useEffect(() => {
    if (openIndex === null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [openIndex, images.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;

    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) showPrev();
      else showNext();
    }

    setTouchStartX(null);
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((img, index) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="aspect-square rounded-xl overflow-hidden bg-slate-100 group cursor-zoom-in"
          >
            <img
              src={img.imageUrl}
              alt={img.altText ?? title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4"
          onClick={close}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Tutup"
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
          >
            <X size={28} />
          </button>

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showPrev();
              }}
              aria-label="Sebelumnya"
              className="absolute left-2 md:left-6 text-white/80 hover:text-white p-2"
            >
              <ChevronLeft size={32} />
            </button>
          )}

          <img
            src={images[openIndex].imageUrl}
            alt={images[openIndex].altText ?? title}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-full object-contain rounded-lg select-none"
          />

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showNext();
              }}
              aria-label="Berikutnya"
              className="absolute right-2 md:right-6 text-white/80 hover:text-white p-2"
            >
              <ChevronRight size={32} />
            </button>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
              {openIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
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
          <GalleryLightbox images={project.images} title={project.title} />
        </div>
      )}
    </article>
  );
}
