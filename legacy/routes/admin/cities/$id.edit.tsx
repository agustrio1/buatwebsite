import { redirect } from "react-router";
import type { Route } from "./+types/$id.edit";
import { db } from "~/db";
import { cities } from "~/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { citySchema, flattenZodErrors } from "~/lib/validation/city";
import { CityForm } from "~/components/admin/city-form";

function parseJsonArray(raw: FormDataEntryValue | null) {
  try {
    return JSON.parse(String(raw ?? "[]"));
  } catch {
    return [];
  }
}

export async function loader({ params }: Route.LoaderArgs) {
  const city = await db.query.cities.findFirst({ where: eq(cities.id, params.id) });
  if (!city) throw new Response("Not found", { status: 404 });
  return { city };
}

export async function action({ request, params }: Route.ActionArgs) {
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

  const slugTaken = await db.query.cities.findFirst({
    where: and(eq(cities.slug, parsed.data.slug), ne(cities.id, params.id)),
  });
  if (slugTaken) {
    return { errors: { slug: "Slug ini sudah dipakai kota lain" } };
  }

  await db
    .update(cities)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(cities.id, params.id));

  return redirect("/admin/cities");
}

export default function EditCity({ loaderData, actionData }: Route.ComponentProps) {
  const { city } = loaderData;

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark mb-6">Edit Kota</h1>
      <CityForm
        errors={actionData?.errors}
        defaultValues={{
          ...city,
          businessTypes: city.businessTypes as string[] | null,
          relevantServices: city.relevantServices as string[] | null,
          advantages: city.advantages as string[] | null,
          serviceAreas: city.serviceAreas as string[] | null,
          faqs: city.faqs as { question: string; answer: string }[] | null,
        }}
      />
    </div>
  );
}