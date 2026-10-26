"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "~/db";
import { users } from "~/db/schema";
import { createUserSession } from "~/lib/session.server";
import { loginRateLimiter, checkRateLimit, getIpFromHeaders } from "~/lib/rate-limit.server";

export type LoginState = { error?: string } | null;

// Padanan action() di routes/login.tsx lama. Rate limit per-IP kini membaca
// header lewat next/headers (bentuk sama dengan request.headers versi RR).
export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const limitError = await checkRateLimit(
    loginRateLimiter,
    getIpFromHeaders(await headers())
  );
  if (limitError) {
    return { error: limitError };
  }

  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) return { error: "Email atau password salah" };

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return { error: "Email atau password salah" };

  await createUserSession(user.id, user.role);
  redirect("/admin");
}
