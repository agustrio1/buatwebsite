import type { Metadata } from "next";
import { getSiteUrl } from "~/lib/seo";

type AnySettings = Record<string, any>;

/**
 * Padanan absoluteUrl yang sebelumnya diduplikasi di beberapa route.
 * Nilai relatif digabung dengan siteUrl, nilai absolut dipakai apa adanya.
 */
export function absoluteUrl(base: string, path?: string | null): string | undefined {
  if (!path) return undefined;
  return /^https?:\/\//i.test(path) ? path : `${base}${path}`;
}

export function siteNameFrom(settings: AnySettings): string {
  return (settings.general?.siteName as string) || "JadikanWeb";
}

/**
 * Metadata milik root layout. Tag yang tidak diset di sini atau tidak
 * ditimpa oleh halaman anak akan diwarisi otomatis oleh Next, jadi
 * perbandingan mergeMeta() versi React Router tidak diperlukan lagi.
 */
export function buildRootMetadata(settings: AnySettings): Metadata {
  const general: AnySettings = settings.general ?? {};
  const seo: AnySettings = settings.seo ?? {};

  const siteName = general.siteName || "Website";
  const siteUrl = (general.siteUrl || "").replace(/\/$/, "");
  const title = seo.metaTitle || siteName;
  const description =
    seo.metaDescription || general.siteTagline || "Jasa pembuatan website profesional.";
  const ogImage = seo.ogImageUrl || general.logoUrl;

  const metadata: Metadata = {
    metadataBase: siteUrl ? new URL(siteUrl) : undefined,
    title,
    description,
    authors: [{ name: siteName }],
    creator: siteName,
    keywords:
      Array.isArray(seo.keywords) && seo.keywords.length > 0 ? seo.keywords.join(", ") : undefined,
    // siteUrl versi root dipakai untuk canonical default; halaman anak menimpa
    // miliknya sendiri lewat buildMetadata({ path }).
    alternates: siteUrl ? { canonical: `${siteUrl}/` } : undefined,
    robots: {
      index: seo.robotsIndex !== false,
      follow: seo.robotsIndex !== false,
    },
    themeColor: "#f97316",
    appleWebApp: {
      title: siteName,
      capable: true,
      statusBarStyle: "default",
    },
    openGraph: {
      type: "website",
      siteName,
      title,
      description,
      locale: "id_ID",
      url: siteUrl ? `${siteUrl}/` : undefined,
      images: absoluteUrl(siteUrl, ogImage)
        ? [{ url: absoluteUrl(siteUrl, ogImage)!, alt: title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      site: seo.twitterHandle || undefined,
      title,
      description,
      images: absoluteUrl(siteUrl, ogImage) ? [absoluteUrl(siteUrl, ogImage)!] : undefined,
    },
    icons: general.faviconUrl
      ? {
          icon: general.faviconUrl,
          shortcut: general.faviconUrl,
          apple: [{ url: general.faviconUrl, sizes: "180x180" }],
        }
      : undefined,
    other: {
      "mobile-web-app-capable": "yes",
      "msapplication-navbutton-color": "#f97316",
      ...(seo.googleSearchConsoleCode
        ? { "google-site-verification": seo.googleSearchConsoleCode }
        : {}),
    },
  };

  return metadata;
}

export type PageMetadataInput = {
  title: string;
  description: string;
  /** Path tanpa domain, mis. "/blog" atau "/layanan/toko-online". */
  path: string;
  /** Judul untuk social card kalau beda dari title (mis. metaTitle). */
  socialTitle?: string;
  /** Nomor halaman; canonical ikut diset ?page=N seperti pageMeta() lama. */
  page?: number;
  /** Override canonical penuh (mis. kolom posts.canonicalUrl). */
  canonical?: string;
  siteUrl?: string;
  ogImage?: string;
  /** Beberapa gambar OG (mis. cover 1200/768/480). */
  ogImages?: string[];
  ogType?: "website" | "article";
  /** Dimensi OG image, hanya pasti kalau gambar di-resize manual. */
  ogImageDimensions?: { width: number; height: number };
  /** Alt og:image/twitter:image. Default: socialTitle (sama seperti lama untuk halaman tanpa alt khusus). */
  ogImageAlt?: string;
  noindex?: boolean;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
    author?: string;
  };
};

/**
 * Padanan pageMeta()/mergeMeta() versi React Router. Canonical selalu
 * dihitung eksplisit dari path supaya tidak bergantung pada canonical
 * warisan dari root.
 */
export async function buildMetadata(input: PageMetadataInput): Promise<Metadata> {
  const siteUrl = input.siteUrl ?? (await getSiteUrl());
  const path = input.path.length > 1 ? input.path.replace(/\/+$/, "") : input.path;

  const baseCanonical = input.canonical || `${siteUrl}${path}`;
  const canonical =
    input.page && input.page > 1 ? `${baseCanonical}?page=${input.page}` : baseCanonical;

  const socialTitle = input.socialTitle ?? input.title;
  const imageAlt = input.ogImageAlt ?? socialTitle;

  const images =
    input.ogImages ?? (input.ogImage ? [input.ogImage] : undefined);

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical },
    robots: input.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: input.ogType ?? "website",
      url: canonical,
      title: socialTitle,
      description: input.description,
      images: images?.length
        ? images.map((url) => ({
            url,
            alt: imageAlt,
            width: input.ogImageDimensions?.width,
            height: input.ogImageDimensions?.height,
          }))
        : undefined,
      // Field article:* hanya muncul kalau openGraph.type = "article";
      // Next menyalurkannya sebagai meta property article:published_time,
      // article:modified_time, article:section, article:author.
      ...(input.article
        ? {
            publishedTime: input.article.publishedTime,
            modifiedTime: input.article.modifiedTime,
            section: input.article.section,
            authors: input.article.author ? [input.article.author] : undefined,
          }
        : {}),
    } as Metadata["openGraph"],
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: input.description,
      images: images?.length ? images.map((url) => ({ url, alt: imageAlt })) : undefined,
    },
  };
}
