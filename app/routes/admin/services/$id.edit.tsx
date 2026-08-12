import { redirect } from "react-router";
import type { Route } from "./+types/$id.edit";
import { db } from "~/db";
import { services, serviceFeatures } from "~/db/schema";
import { eq } from "drizzle-orm";
import { ServiceForm } from "~/components/admin/service-form";

export async function loader({ params }: Route.LoaderArgs) {
  const service = await db.query.services.findFirst({
    where: eq(services.id, params.id),
    with: { features: { orderBy: (f, { asc }) => [asc(f.sortOrder)] } },
  });

  if (!service) throw new Response("Not found", { status: 404 });

  return { service };
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const features = JSON.parse(String(formData.get("featuresJson") ?? "[]")) as {
    featureText: string;
    isIncluded: boolean;
  }[];

  await db
    .update(services)
    .set({
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
      updatedAt: new Date(),
    })
    .where(eq(services.id, params.id));

  // Ganti semua fitur lama dengan yang baru (sequential, no transaction)
  await db.delete(serviceFeatures).where(eq(serviceFeatures.serviceId, params.id));
  for (const [index, feature] of features.entries()) {
    if (!feature.featureText.trim()) continue;
    await db.insert(serviceFeatures).values({
      serviceId: params.id,
      featureText: feature.featureText,
      isIncluded: feature.isIncluded,
      sortOrder: index,
    });
  }

  return redirect("/admin/services");
}

export default function EditService({ loaderData }: Route.ComponentProps) {
  const { service } = loaderData;

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark mb-6">Edit Layanan</h1>
      <ServiceForm
        defaultValues={{
          id: service.id,
          title: service.title,
          slug: service.slug,
          summary: service.summary,
          isPriceVisible: service.isPriceVisible,
          priceAmount: service.priceAmount,
          priceLabel: service.priceLabel,
          priceUnit: service.priceUnit,
          badge: service.badge,
          isFeatured: service.isFeatured,
          sortOrder: service.sortOrder,
          features: service.features,
        }}
      />
    </div>
  );
}