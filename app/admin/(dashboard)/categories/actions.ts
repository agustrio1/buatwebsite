"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "~/db";
import { categories } from "~/db/schema";
import { requireAdmin } from "~/lib/session.server";
import { logActivity } from "~/lib/activity-log.server";

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const [inserted] = await db.insert(categories).values({ name, slug }).returning();

  await logActivity({
    action: "create",
    entityType: "category",
    entityId: inserted.id,
    entityLabel: name,
  });

  revalidatePath("/"); // kategori tampil di kartu artikel beranda
  revalidatePath("/admin/categories");
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const cat = await db.query.categories.findFirst({ where: eq(categories.id, id) });
  await db.delete(categories).where(eq(categories.id, id));

  await logActivity({
    action: "delete",
    entityType: "category",
    entityId: id,
    entityLabel: cat?.name,
  });

  revalidatePath("/");
  revalidatePath("/admin/categories");
}
