import type { Route } from "./+types/upload-image";
import { requireAdmin } from "~/lib/session.server";
import { uploadToR2 } from "~/lib/r2-server";

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    return Response.json({ error: "File kosong" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploaded = await uploadToR2(buffer, file.name, "content", file.type);

  return Response.json({ url: uploaded.url, fileId: uploaded.key });
}