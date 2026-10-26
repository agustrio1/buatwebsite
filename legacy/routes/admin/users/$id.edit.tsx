import { redirect } from "react-router";
import type { Route } from "./+types/$id.edit";
import { db } from "~/db";
import { users } from "~/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { UserForm } from "~/components/admin/user-form";

export async function loader({ params }: Route.LoaderArgs) {
  const user = await db.query.users.findFirst({ where: eq(users.id, params.id) });
  if (!user) throw new Response("Not found", { status: 404 });
  return { user };
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const name = String(formData.get("name"));
  const email = String(formData.get("email"));
  const role = String(formData.get("role")) as "admin" | "editor";
  const password = String(formData.get("password") ?? "");

  const updates: Record<string, unknown> = { name, email, role };

  if (password) {
    updates.passwordHash = await bcrypt.hash(password, 10);
  }

  await db.update(users).set(updates).where(eq(users.id, params.id));

  return redirect("/admin/users");
}

export default function EditUser({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark mb-6">Edit User</h1>
      <UserForm defaultValues={{ id: user.id, name: user.name, email: user.email, role: user.role }} />
    </div>
  );
}