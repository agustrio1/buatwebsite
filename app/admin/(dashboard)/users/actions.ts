"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "~/db";
import { users } from "~/db/schema";
import { requireAdmin } from "~/lib/session.server";

export async function createUser(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name"));
  const email = String(formData.get("email"));
  const role = String(formData.get("role")) as "admin" | "editor";
  const password = String(formData.get("password"));

  const passwordHash = await bcrypt.hash(password, 10);

  await db.insert(users).values({ name, email, role, passwordHash });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function updateUser(id: string, formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name"));
  const email = String(formData.get("email"));
  const role = String(formData.get("role")) as "admin" | "editor";
  const password = String(formData.get("password") ?? "");

  const updates: Record<string, unknown> = { name, email, role };

  if (password) {
    updates.passwordHash = await bcrypt.hash(password, 10);
  }

  await db.update(users).set(updates).where(eq(users.id, id));

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function deleteUser(id: string) {
  await requireAdmin();
  await db.delete(users).where(eq(users.id, id));
  revalidatePath("/admin/users");
}
