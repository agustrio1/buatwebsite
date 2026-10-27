import { cache } from "react";
import { notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db } from "~/db";
import { pages } from "~/db/schema";
import { getPublicSettings } from "~/lib/settings.server";
import { getSiteUrl, ogUrl } from "~/lib/seo";
import { safeJsonLd } from "~/lib/json-ld";
import { buildMetadata, siteNameFrom } from "~/lib/metadata";
import { parsePageContent } from "~/lib/validation/custom-page";
import { emptyDocument, type PageDocument } from "~/lib/page-builder/types";
import { PageBlocks, collectPageFaqs } from "~/components/site/page-blocks";

// Sama seperti layout (site): ISR 5 menit, di-bust lebih cepat lewat
// revalidateCustomPages() dari admin.
export const revalidate = 300;

function toWaNumber(raw: unknown) {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
}

// Prerender seluruh halaman custom published saat build; slug baru dibuat
// on-demand lalu di-cache (ISR) setelahnya.
export async function generateStaticParams() {
  const rows = await db.query.pages.findMany({
    where: eq(pages.status, "published"),
    columns: { slug: true },
  });
  return rows.map((r) => ({ slug: r.slug }));
}

const getCustomPageData = cache(async (slug: string) => {
  const [page, settings, siteUrl] = await Promise.all([
    db.query.pages.findFirst({
      where: and(eq(pages.slug, slug), eq(pages.status, "published")),
    }),
    getPublicSettings(),
    getSiteUrl(),
  ]);

  if (!page) return null;

  const parsed = parsePageContent(
    page.content ? JSON.stringify(page.content) : null
  ) as PageDocument | null;
  const document: PageDocument =
    parsed && Array.isArray(parsed.sections) ? parsed : emptyDocument();

  const general = (settings.general as Record<string, any>) ?? {};
  const contact = (settings.contact as Record<string, any>) ?? {};
  const siteName = siteNameFrom(settings);

  const canonicalUrl = page.canonicalUrl || `${siteUrl}/${page.slug}`;
  const description =
    page.metaDescription ||
    general.siteTagline ||
    `${page.title} — informasi dari ${siteName}.`;
  const ogImage = page.ogImageUrl
    ? (/^https?:\/\//i.test(page.ogImageUrl) ? page.ogImageUrl : `${siteUrl}${page.ogImageUrl}`)
    : ogUrl({ siteUrl, title: page.title, subtitle: description, label: siteName });

  const faqs = collectPageFaqs(document);

  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebPage",
      "@id": `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: page.metaTitle || page.title,
      description,
      inLanguage: "id-ID",
      isPartOf: { "@type": "WebSite", "@id": `${siteUrl}/#website` },
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: page.title, item: canonicalUrl },
      ],
    },
  ];

  if (faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }

  const jsonLd = { "@context": "https://schema.org", "@graph": graph };

  return {
    page: {
      title: page.title,
      slug: page.slug,
      metaTitle: page.metaTitle,
      noindex: page.noindex,
    },
    document,
    jsonLd,
    canonicalUrl,
    description,
    ogImage,
    ogIsGenerated: !page.ogImageUrl,
    siteName,
    whatsappNumber: toWaNumber(contact.whatsappNumber || contact.phoneOffice) || null,
  };
});

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const data = await getCustomPageData(slug);
  if (!data) return { title: "Halaman tidak ditemukan" };

  const { page, canonicalUrl, siteName, description, ogImage, ogIsGenerated } = data;
  const title = page.metaTitle || `${page.title} | ${siteName}`;

  return buildMetadata({
    title,
    socialTitle: page.metaTitle || page.title,
    description,
    path: `/${page.slug}`,
    canonical: canonicalUrl,
    ogImage,
    ogImageAlt: page.title,
    ogImageDimensions: ogIsGenerated ? { width: 1200, height: 630 } : undefined,
    ogType: "website",
    noindex: page.noindex ?? undefined,
  });
}

export default async function CustomPage({ params }: { params: Params }) {
  const { slug } = await params;
  const data = await getCustomPageData(slug);
  if (!data) notFound();

  const { page, document, jsonLd, whatsappNumber } = data;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      {/* h1 disembunyikan bila section pertama sudah memakai blok Hero */}
      <h1 className="sr-only">{page.title}</h1>
      <PageBlocks
        document={document}
        ctx={{ slug: page.slug, whatsappNumber }}
      />
    </>
  );
}
