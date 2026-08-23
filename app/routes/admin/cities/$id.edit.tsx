import { redirect } from "react-router";
import type { Route } from "./+types/$id.edit";
import { db } from "~/db";
import { cities } from "~/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { citySchema, flattenZodErrors } from "~/lib/validation/city";
import { CityForm } from "~/components/admin/city-form";

export async function loader({ params }: Route.LoaderArgs) {
  const city = await db.query.cities.findFirst({ where: eq(cities.id, params.id) });
  if (!city) throw new Response("Not found", { status: 404 });
  return { city };
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();

  const faqsRaw = String(formData.get("faqs") ?? "[]");
  let faqs;
  try {
    faqs = JSON.parse(faqsRaw);
  } catch {
    faqs = [];
  }

  const parsed = citySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    province: String(formData.get("province") ?? "") || null,
    intro: String(formData.get("intro") ?? "") || null,
    localContext: String(formData.get("localContext") ?? "") || null,
    faqs,
    metaTitle: String(formData.get("metaTitle") ?? "") || null,
    metaDescription: String(formData.get("metaDescription") ?? "") || null,
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

  await db.update(cities).set(parsed.data).where(eq(cities.id, params.id));

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
          faqs: city.faqs as { question: string; answer: string }[] | null,
        }}
      />
    </div>
  );
}