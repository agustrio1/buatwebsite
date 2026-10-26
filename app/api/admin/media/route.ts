import { requireAdmin } from "~/lib/session.server";
import { listUsedMedia } from "~/lib/media.server";

// Daftar gambar yang sedang dipakai konten, untuk MediaPicker di form/editor.
export async function GET() {
  await requireAdmin();
  const items = await listUsedMedia();
  return Response.json({ items });
}
