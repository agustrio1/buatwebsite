import { createPresignedUpload } from "~/lib/r2-server";
import { requireAdmin } from "~/lib/session.server";

const ALLOWED_FOLDERS = ["projects/cover", "projects/gallery"];

// Padanan action() di routes/api.admin.presign.ts lama.
// Perbaikan yang direncanakan di Phase 6 (Assumption 5): guard auth admin kini
// dipasang — sebelumnya endpoint ini terbuka sehingga siapa pun bisa minta URL
// upload ke bucket. Hanya dipanggil dari komponen admin, jadi tidak ada alur sah
// yang terpengaruh.
export async function POST(request: Request) {
  await requireAdmin();

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
