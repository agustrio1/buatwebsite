import { redirect } from "react-router";
import type { Route } from "./+types/new";
import { db } from "~/db";
import { cities } from "~/db/schema";
import { requireAdmin } from "~/lib/session.server";
import { citySchema, flattenZodErrors } from "~/lib/validation/city";
import { CityForm } from "~/components/admin/city-form";

function parseJsonArray(raw: FormDataEntryValue | null) {
  try {
    return JSON.parse(String(raw ?? "[]"));
  } catch {
    return [];
  }
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);
  const formData = await request.formData();

  const parsed = citySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    province: String(formData.get("province") ?? "") || null,
    h1: String(formData.get("h1") ?? "") || null,
    intro: String(formData.get("intro") ?? "") || null,
    localContext: String(formData.get("localContext") ?? "") || null,
    localChallenges: String(formData.get("localChallenges") ?? "") || null,
    whyWebsiteNeeded: String(formData.get("whyWebsiteNeeded") ?? "") || null,
    businessTypes: parseJsonArray(formData.get("businessTypes")),
    relevantServices: parseJsonArray(formData.get("relevantServices")),
    advantages: parseJsonArray(formData.get("advantages")),
    serviceAreas: parseJsonArray(formData.get("serviceAreas")),
    faqs: parseJsonArray(formData.get("faqs")),
    metaTitle: String(formData.get("metaTitle") ?? "") || null,
    metaDescription: String(formData.get("metaDescription") ?? "") || null,
    ctaTitle: String(formData.get("ctaTitle") ?? "") || null,
    ctaDescription: String(formData.get("ctaDescription") ?? "") || null,
    ctaWhatsappNumber: String(formData.get("ctaWhatsappNumber") ?? "") || null,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { errors: flattenZodErrors(parsed.error) };
  }

  const existingSlug = await db.query.cities.findFirst({
    where: (c, { eq }) => eq(c.slug, parsed.data.slug),
  });
  if (existingSlug) {
    return { errors: { slug: "Slug ini sudah dipakai kota lain" } };
  }

  await db.insert(cities).values(parsed.data);

  return redirect("/admin/cities");
}

export default function NewCity({ actionData }: Route.ComponentProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark mb-6">Tambah Kota</h1>
      <CityForm errors={actionData?.errors} />
    </div>
  );
}