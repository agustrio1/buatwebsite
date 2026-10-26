"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { revalidateServicePages } from "~/lib/revalidate-public";
import { db } from "~/db";
import { services, serviceFeatures } from "~/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "~/lib/session.server";

type FeatureInput = { featureText: string; isIncluded: boolean };

function readFeatures(formData: FormData): FeatureInput[] {
  return JSON.parse(String(formData.get("featuresJson") ?? "[]")) as FeatureInput[];
}

function readValues(formData: FormData) {
  return {
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
  };
}

export async function createService(formData: FormData) {
  await requireAdmin();
  const features = readFeatures(formData);

  const [service] = await db.insert(services).values(readValues(formData)).returning();

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

  revalidateServicePages();
  revalidatePath("/admin/services");
  redirect("/admin/services");
}

export async function updateService(id: string, formData: FormData) {
  await requireAdmin();
  const features = readFeatures(formData);

  await db
    .update(services)
    .set({ ...readValues(formData), updatedAt: new Date() })
    .where(eq(services.id, id));

  // Ganti semua fitur lama dengan yang baru (sequential, no transaction)
  await db.delete(serviceFeatures).where(eq(serviceFeatures.serviceId, id));
  for (const [index, feature] of features.entries()) {
    if (!feature.featureText.trim()) continue;
    await db.insert(serviceFeatures).values({
      serviceId: id,
      featureText: feature.featureText,
      isIncluded: feature.isIncluded,
      sortOrder: index,
    });
  }

  revalidateServicePages();
  revalidatePath("/admin/services");
  redirect("/admin/services");
}

export async function deleteService(id: string) {
  await requireAdmin();
  await db.delete(services).where(eq(services.id, id));
  revalidateServicePages();
  revalidatePath("/admin/services");
}
