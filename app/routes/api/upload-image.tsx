import type { Route } from "./+types/upload-image";
import { requireAdmin } from "~/lib/session.server";
import { imagekit } from "~/lib/imagekit-server";

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    return Response.json({ error: "File kosong" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploaded = await imagekit.upload({
    file: buffer,
    fileName: file.name,
    folder: "/content",
  });

  // Paksa delivery selalu WebP, terlepas dari Accept header klien,
  // supaya URL yang disimpan ke database konsisten formatnya.
  const webpUrl = `${uploaded.url}?tr=f-webp`;

  return Response.json({ url: webpUrl, fileId: uploaded.fileId });
}