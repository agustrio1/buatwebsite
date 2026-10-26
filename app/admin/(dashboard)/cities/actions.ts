"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { revalidateCityPages } from "~/lib/revalidate-public";
import { eq, and, ne, inArray } from "drizzle-orm";
import { db } from "~/db";
import { cities } from "~/db/schema";
import { requireAdmin } from "~/lib/session.server";
import { citySchema, flattenZodErrors } from "~/lib/validation/city";
import type { CityFormState } from "~/components/admin/city-form";

function parseJsonArray(raw: FormDataEntryValue | null) {
  try {
    return JSON.parse(String(raw ?? "[]"));
  } catch {
    return [];
  }
}

function parseCity(formData: FormData) {
  return citySchema.safeParse({
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
}

export async function createCity(
  _prevState: CityFormState,
  formData: FormData
): Promise<CityFormState> {
  await requireAdmin();

  const parsed = parseCity(formData);
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

  revalidateCityPages([parsed.data.slug]);
  revalidatePath("/admin/cities");
  redirect("/admin/cities");
}

export async function updateCity(
  id: string,
  _prevState: CityFormState,
  formData: FormData
): Promise<CityFormState> {
  await requireAdmin();

  const parsed = parseCity(formData);
  if (!parsed.success) {
    return { errors: flattenZodErrors(parsed.error) };
  }

  const slugTaken = await db.query.cities.findFirst({
    where: and(eq(cities.slug, parsed.data.slug), ne(cities.id, id)),
  });
  if (slugTaken) {
    return { errors: { slug: "Slug ini sudah dipakai kota lain" } };
  }

  const before = await db.query.cities.findFirst({
    where: eq(cities.id, id),
    columns: { slug: true },
  });

  await db
    .update(cities)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(cities.id, id));

  revalidateCityPages([parsed.data.slug, before?.slug]);
  revalidatePath("/admin/cities");
  redirect("/admin/cities");
}

export async function deleteCity(id: string) {
  await requireAdmin();
  const city = await db.query.cities.findFirst({
    where: eq(cities.id, id),
    columns: { slug: true },
  });
  await db.delete(cities).where(eq(cities.id, id));
  revalidateCityPages([city?.slug]);
  revalidatePath("/admin/cities");
}

export async function bulkDeleteCities(ids: string[]) {
  await requireAdmin();
  if (ids.length === 0) return;
  const rows = await db.query.cities.findMany({
    where: inArray(cities.id, ids),
    columns: { slug: true },
  });
  await db.delete(cities).where(inArray(cities.id, ids));
  revalidateCityPages(rows.map((r) => r.slug));
  revalidatePath("/admin/cities");
}

export async function bulkSetCitiesActive(ids: string[], value: boolean) {
  await requireAdmin();
  if (ids.length === 0) return;
  const rows = await db.query.cities.findMany({
    where: inArray(cities.id, ids),
    columns: { slug: true },
  });
  await db
    .update(cities)
    .set({ isActive: value, updatedAt: new Date() })
    .where(inArray(cities.id, ids));
  revalidateCityPages(rows.map((r) => r.slug));
  revalidatePath("/admin/cities");
}
