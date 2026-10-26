"use server";

import { redirect } from "next/navigation";
import { logout } from "~/lib/session.server";

// Padanan Form method="post" action="/logout" versi React Router: menghancurkan
// session lalu mengembalikan user ke halaman login.
export async function logoutAction() {
  await logout();
  redirect("/login");
}
