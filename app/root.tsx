import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from "react-router";
import type { Route } from "./+types/root";
import { db } from "~/db";
import "./app.css";

export async function loader() {
  const rows = await db.query.siteSettings.findMany();
  const settings: Record<string, any> = {};

  for (const row of rows) {
    try {
      settings[row.key] =
        typeof row.value === "string" ? JSON.parse(row.value) : row.value;
    } catch {
      settings[row.key] = row.value;
    }
  }

  return { settings };
}

export function meta({ loaderData, location }: Route.MetaArgs) {
  const settings = loaderData?.settings ?? {};
  const seo = settings.seo ?? {};
  const general = settings.general ?? {};

  const siteName = general.siteName || "Website";
  const title = seo.metaTitle || siteName;
  const description =
    seo.metaDescription ||
    general.siteTagline ||
    "Jasa pembuatan website profesional.";
  const siteUrl = (general.siteUrl || "").replace(/\/$/, "");
  const canonicalUrl = siteUrl ? `${siteUrl}${location.pathname}` : undefined;
  const ogImage = seo.ogImageUrl || general.logoUrl;
  const twitterHandle = seo.twitterHandle;

  const tags: any[] = [
    { title },
    { name: "description", content: description },
    { name: "author", content: siteName },
    { name: "robots", content: seo.robotsIndex === false ? "noindex, nofollow" : "index, follow" },

    { name: "apple-mobile-web-app-title", content: siteName },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "default" },
    { name: "theme-color", content: "#f97316" },
    { name: "msapplication-navbutton-color", content: "#f97316" },

    { name: "language", content: "id" },
    { name: "geo.country", content: "id" },
    { name: "geo.placename", content: "Indonesia" },

    { property: "og:type", content: "website" },
    { property: "og:site_name", content: siteName },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:locale", content: "id_ID" },

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];

  if (seo.keywords && Array.isArray(seo.keywords) && seo.keywords.length > 0) {
    tags.push({ name: "keywords", content: seo.keywords.join(", ") });
  }

  if (canonicalUrl) {
    tags.push({ property: "og:url", content: canonicalUrl });
    tags.push({ tagName: "link", rel: "canonical", href: canonicalUrl });
    tags.push({ tagName: "link", rel: "alternate", hrefLang: "id", href: canonicalUrl });
    tags.push({ tagName: "link", rel: "alternate", hrefLang: "x-default", href: canonicalUrl });
  }

  if (ogImage) {
    tags.push({ property: "og:image", content: ogImage });
    tags.push({ property: "og:image:alt", content: title });
    tags.push({ name: "twitter:image", content: ogImage });
    tags.push({ name: "twitter:image:alt", content: title });
  }

  if (twitterHandle) {
    tags.push({ name: "twitter:site", content: twitterHandle });
  }

  if (seo.googleSearchConsoleCode) {
    tags.push({ name: "google-site-verification", content: seo.googleSearchConsoleCode });
  }

  if (general.faviconUrl) {
    tags.push({ tagName: "link", rel: "icon", href: general.faviconUrl });
    tags.push({ tagName: "link", rel: "shortcut icon", href: general.faviconUrl });
    tags.push({ tagName: "link", rel: "apple-touch-icon", sizes: "180x180", href: general.faviconUrl });
  }

  return tags;
}

function StructuredData() {
  const rootData = useRouteLoaderData<typeof loader>("root");
  const settings = rootData?.settings ?? {};
  const general = settings.general ?? {};
  const contact = settings.contact ?? {};

  const siteName = general.siteName || "Website";
  const siteUrl = (general.siteUrl || "").replace(/\/$/, "");

  if (!siteUrl) return null;

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: siteName,
    url: siteUrl,
    inLanguage: "id-ID",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/?s={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: siteName,
    alternateName: general.companyLegalName || undefined,
    url: siteUrl,
    inLanguage: "id-ID",
    logo: general.logoUrl
      ? {
          "@type": "ImageObject",
          url: general.logoUrl,
        }
      : undefined,
    contactPoint: contact.whatsappNumber
      ? [
          {
            "@type": "ContactPoint",
            telephone: contact.whatsappNumber,
            contactType: "customer service",
            areaServed: "ID",
            availableLanguage: ["Indonesian"],
          },
        ]
      : undefined,
    sameAs: [
      settings.socials?.instagram,
      settings.socials?.linkedin,
      settings.socials?.facebook,
      settings.socials?.tiktok,
      settings.socials?.youtube,
    ].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
    </>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <StructuredData />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let status = 500;
  let message = "Terjadi Kesalahan";
  let details = "Maaf, terjadi kesalahan yang tidak terduga.";

  if (isRouteErrorResponse(error)) {
    status = error.status;
    message = status === 404 ? "Halaman Tidak Ditemukan" : "Terjadi Kesalahan";
    details =
      status === 404
        ? "Halaman yang Anda cari tidak ada atau sudah dipindahkan."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center max-w-md">
        <p className="text-brand-500 font-bold text-6xl">{status}</p>
        <h1 className="text-2xl font-bold text-brand-dark mt-4">{message}</h1>
        <p className="text-slate-500 mt-2 leading-relaxed">{details}</p>
        <a
          href="/"
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium px-6 py-3 rounded-full mt-6 transition-colors"
        >
          Kembali ke Beranda
        </a>
        {import.meta.env.DEV && error instanceof Error && error.stack && (
          <pre className="mt-6 p-4 bg-slate-100 rounded-lg text-left text-xs overflow-x-auto text-slate-600">
            {error.stack}
          </pre>
        )}
      </div>
    </div>
  );
}
