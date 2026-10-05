import type { Route } from "./+types/api.admin.presign";
import { createPresignedUpload } from "~/lib/r2-server";

const ALLOWED_FOLDERS = ["projects/cover", "projects/gallery"];

export async function action({ request }: Route.ActionArgs) {
  // WAJIB: pasang guard auth admin yang sama seperti route admin lain di sini.
  // Tanpa itu, siapa pun bisa minta URL upload ke bucket kamu.

  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: Record<string, any> = {};
  try {
    const parsed = await request.json();
    if (parsed && typeof parsed === "object") body = parsed as Record<string, any>;
  } catch {
    body = {};
  }

  const fileName = String(body.fileName ?? "");
  const contentType = String(body.contentType ?? "");
  const folder = String(body.folder ?? "");

  if (!fileName || !contentType.startsWith("image/")) {
    return Response.json({ error: "File harus berupa gambar" }, { status: 400 });
  }
  if (!ALLOWED_FOLDERS.includes(folder)) {
    return Response.json({ error: "Folder tidak valid" }, { status: 400 });
  }

  const result = await createPresignedUpload(fileName, folder, contentType);
  return Response.json(result);
}