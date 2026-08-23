import { redirect } from "react-router";
import type { Route } from "./+types/new";
import { db } from "~/db";
import { cities } from "~/db/schema";
import { requireAdmin } from "~/lib/session.server";
import { citySchema, flattenZodErrors } from "~/lib/validation/city";
import { CityForm } from "~/components/admin/city-form";

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);
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