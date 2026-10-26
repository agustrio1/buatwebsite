import { redirect } from "react-router";
import type { Route } from "./+types/new";
import { db } from "~/db";
import { users } from "~/db/schema";
import bcrypt from "bcryptjs";
import { UserForm } from "~/components/admin/user-form";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const name = String(formData.get("name"));
  const email = String(formData.get("email"));
  const role = String(formData.get("role")) as "admin" | "editor";
  const password = String(formData.get("password"));

  const passwordHash = await bcrypt.hash(password, 10);

  await db.insert(users).values({ name, email, role, passwordHash });

  return redirect("/admin/users");
}

export default function NewUser() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark mb-6">Tambah User</h1>
      <UserForm />
    </div>
  );
}