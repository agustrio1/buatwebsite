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

  return Response.json({ url: uploaded.url });
}