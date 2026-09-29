import { resizeImage } from "~/lib/imagekit-url";

export type PortfolioProject = {
  id: string | number;
  title: string;
  coverImageUrl: string | null;
};

// Lebar kandidat srcset. Browser memilih yang pas dengan `sizes` x DPR layar.
const MARQUEE_WIDTHS = [480, 720, 960, 1280] as const;
const DEFAULT_WIDTH = 960;

// Kualitas sedikit lebih tinggi khusus marquee (gambar dirotasi + berisi
// teks kecil dari screenshot dashboard).
const MARQUEE_QUALITY = 85;

// Dilebihkan ~1.2x dari ukuran tampil asli (270/360/390px) untuk mengimbangi
// resampling akibat rotate, tanpa membuat mobile mengunduh gambar terlalu besar.
// Hasil: HP (DPR ~1.75) -> 720w, laptop -> 720w, retina desktop -> 1280w.
const MARQUEE_SIZES = "(max-width: 767px) 320px, (max-width: 1279px) 460px, 520px";

const EAGER_COUNT = 2;

// Rasio 16:10 sesuai .portfolio-card-image, mencegah layout shift.
const IMG_WIDTH = 960;
const IMG_HEIGHT = 600;

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
              eager={false}
              highPriority={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}