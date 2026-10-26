import { requireAdmin } from "~/lib/session.server";
import { uploadToR2 } from "~/lib/r2-server";

// Padanan action() di routes/api/upload-image.tsx lama. requireAdmin() versi Next
// membaca cookie internal, jadi tidak perlu meneruskan request.
export async function POST(request: Request) {
  await requireAdmin();

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    return Response.json({ error: "File kosong" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploaded = await uploadToR2(buffer, file.name, "content", file.type);

  return Response.json({ url: uploaded.url, fileId: uploaded.key });
}
