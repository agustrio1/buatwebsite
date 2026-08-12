import { Form, useActionData } from "react-router";
import type { Route } from "./+types/login";
import { db } from "~/db";
import { users } from "~/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createUserSession } from "~/lib/session.server";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) return { error: "Email atau password salah" };

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return { error: "Email atau password salah" };

  return createUserSession(user.id, user.role, "/admin");
}

export default function Login() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark">
      <Form method="post" className="bg-white p-8 rounded-lg w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-brand-dark">Login Admin</h1>
        {actionData?.error && (
          <p className="text-red-500 text-sm">{actionData.error}</p>
        )}
        <input name="email" type="email" placeholder="Email" required
          className="w-full border rounded px-3 py-2" />
        <input name="password" type="password" placeholder="Password" required
          className="w-full border rounded px-3 py-2" />
        <button type="submit"
          className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded px-3 py-2">
          Masuk
        </button>
      </Form>
    </div>
  );
}