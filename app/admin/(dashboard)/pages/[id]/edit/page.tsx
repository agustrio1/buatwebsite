import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "~/db";
import { pages } from "~/db/schema";
import { getPublicSettings } from "~/lib/settings.server";
import { siteNameFrom } from "~/lib/metadata";
import { Builder, type PageData } from "~/components/admin/page-builder/builder";
import { savePage } from "../../actions";

type Params = Promise<{ id: string }>;

function toWaNumber(raw: unknown) {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (!digits) return null;
  return digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
}

export default async function PageBuilderRoute({ params }: { params: Params }) {
  const { id } = await params;

  const [page, settings] = await Promise.all([
    db.query.pages.findFirst({ where: eq(pages.id, id) }),
    getPublicSettings(),
  ]);
  if (!page) notFound();

  const data: PageData = {
    id: page.id,
    title: page.title,
    slug: page.slug,
    status: page.status,
    content: page.content,
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
    ogImageUrl: page.ogImageUrl,
    canonicalUrl: page.canonicalUrl,
    noindex: page.noindex ?? false,
  };

  const contact = (settings.contact as Record<string, any>) ?? {};

  return (
    <Builder
      page={data}
      siteName={siteNameFrom(settings)}
      whatsappNumber={toWaNumber(contact.whatsappNumber || contact.phoneOffice)}
      action={savePage.bind(null, page.id)}
    />
  );
}
