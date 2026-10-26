import type { Route } from "./+types/logout";
import { logout } from "~/lib/session.server";

export async function action({ request }: Route.ActionArgs) {
  return logout(request);
}