import { resizeImage } from "~/lib/imagekit-url";

export type PortfolioProject = {
  id: string | number;
  title: string;
  coverImageUrl: string | null;
};

// Lebar kandidat untuk srcset. Browser memilih yang paling pas dengan
// `sizes` x DPR layar. AVIF dari Worker menjaga ukuran file tetap kecil.
const MARQUEE_WIDTHS = [640, 960, 1280, 1600] as const;
const DEFAULT_WIDTH = 1280;

// Kualitas sedikit lebih tinggi khusus marquee karena gambar dirotasi
// (resampling) dan berisi teks kecil dari screenshot dashboard.
const MARQUEE_QUALITY = 85;

// Sengaja dilebihkan ~1.5x dari ukuran tampil asli (270/360/390px) agar
// browser memilih gambar lebih besar. Ini mengimbangi resampling akibat
// rotate di .portfolio-showcase sehingga gambar tetap tajam.
const MARQUEE_SIZES = "(max-width: 767px) 400px, (max-width: 1279px) 540px, 600px";

const EAGER_COUNT = 2;

// Rasio 16:10 sesuai .portfolio-card-image, mencegah layout shift.
const IMG_WIDTH = 1280;
const IMG_HEIGHT = 800;

function buildMarqueeSrcSet(url: string): string | undefined {
  const entries = MARQUEE_WIDTHS.map((w) => {
    const resized = resizeImage(url, w, MARQUEE_QUALITY);
    return resized ? `${resized} ${w}w` : null;
  }).filter((entry): entry is string => entry !== null);

  return entries.length > 0 ? entries.join(", ") : undefined;
}

function MarqueeCard({
  project,
  eager,
  highPriority,
}: {
  project: PortfolioProject;
  eager: boolean;
  highPriority: boolean;
}) {
  const src = project.coverImageUrl
    ? (resizeImage(project.coverImageUrl, DEFAULT_WIDTH, MARQUEE_QUALITY) ?? undefined)
    : undefined;
  const srcSet = project.coverImageUrl
    ? buildMarqueeSrcSet(project.coverImageUrl)
    : undefined;

  return (
    <div className="portfolio-card">
      <div className="portfolio-card-image">
        {src ? (
          <img
            src={src}
            srcSet={srcSet}
            sizes={MARQUEE_SIZES}
            width={IMG_WIDTH}
            height={IMG_HEIGHT}
            alt={project.title}
            loading={eager ? "eager" : "lazy"}
            fetchPriority={highPriority ? "high" : "auto"}
            decoding="async"
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-slate-400">
            {project.title}
          </div>
        )}
      </div>
      <div className="portfolio-card-label">{project.title}</div>
    </div>
  );
}

export function PortfolioMarquee({ projects }: { projects: PortfolioProject[] }) {
  if (!projects.length) return null;

  const row1 = [...projects, ...projects];
  const reversed = [...projects].reverse();
  const row2 = [...reversed, ...reversed];

  return (
    <div className="portfolio-showcase">
      <div className="portfolio-fade portfolio-fade-left" />
      <div className="portfolio-fade portfolio-fade-right" />

      <div className="portfolio-marquee">
        <div className="portfolio-track portfolio-track-left">
          {row1.map((project, index) => (
            <MarqueeCard
              key={`portfolio-row-1-${project.id}-${index}`}
              project={project}
              eager={index < EAGER_COUNT}
              highPriority={index === 0}
            />
          ))}
        </div>
      </div>

      <div className="portfolio-marquee portfolio-marquee-second">
        <div className="portfolio-track portfolio-track-right">
          {row2.map((project, index) => (
            <MarqueeCard
              key={`portfolio-row-2-${project.id}-${index}`}
              project={project}
              eager={index < EAGER_COUNT}
              highPriority={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}