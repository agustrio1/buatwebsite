const SKIP_TYPES = ["image/svg+xml", "image/gif"];

async function toWebp(file: File, maxSize = 2000, quality = 0.82): Promise<File> {
  if (!file.type.startsWith("image/") || SKIP_TYPES.includes(file.type)) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality)
    );
    if (!blob || blob.type !== "image/webp") return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], name, { type: "image/webp" });
  } catch {
    return file;
  }
}

export async function uploadDirect(file: File, folder: string) {
  const processed = await toWebp(file);

  const presignRes = await fetch("/api/admin/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: processed.name,
      contentType: processed.type,
      folder,
    }),
  });
  if (!presignRes.ok) throw new Error("Gagal minta URL upload");

  const { uploadUrl, url, key } = (await presignRes.json()) as {
    uploadUrl: string;
    url: string;
    key: string;
  };

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": processed.type },
    body: processed,
  });
  if (!putRes.ok) throw new Error("Gagal upload ke R2");

  return { url, key };
}