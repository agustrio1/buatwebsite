import { redirect } from "react-router";
import type { Route } from "./+types/new";
import { db } from "~/db";
import { services, serviceFeatures } from "~/db/schema";
import { ServiceForm } from "~/components/admin/service-form";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const features = JSON.parse(String(formData.get("featuresJson") ?? "[]")) as {
    featureText: string;
    isIncluded: boolean;
  }[];

  const [service] = await db
    .insert(services)
    .values({
      title: String(formData.get("title")),
      slug: String(formData.get("slug")),
      summary: String(formData.get("summary") ?? "") || null,
      isPriceVisible: formData.get("isPriceVisible") === "true",
      priceAmount: String(formData.get("priceAmount") ?? "") || null,
      priceLabel: String(formData.get("priceLabel") ?? "") || null,
      priceUnit: String(formData.get("priceUnit") ?? "") || null,
      badge: String(formData.get("badge") ?? "") || null,
      isFeatured: formData.get("isFeatured") === "true",
      sortOrder: Number(formData.get("sortOrder") ?? 0),
    })
    .returning();

  // neon-http nggak support db.transaction(), jadi insert fitur sequential
  for (const [index, feature] of features.entries()) {
    if (!feature.featureText.trim()) continue;
    await db.insert(serviceFeatures).values({
      serviceId: service.id,
      featureText: feature.featureText,
      isIncluded: feature.isIncluded,
      sortOrder: index,
    });
  }

  return redirect("/admin/services");
}

export default function NewService() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark mb-6">Tambah Layanan</h1>
      <ServiceForm />
    </div>
  );
}