/**
 * Kompresi gambar sisi-klien sebelum upload.
 *
 * Foto HP modern (4-12 MB) sering melewati batas payload server action /
 * function (4,5 MB di Vercel) dan memperlambat upload. Resize ke tepi
 * terpanjang 1920px + encode ulang (JPEG/WebP quality 0.82) umumnya
 * menurunkan ukuran 80-95% tanpa terlihat beda di web.
 *
 * Semua fungsi aman dipanggil dari komponen client; gagal parse/detect →
 * file asli dikembalikan apa adanya (debounce-friendly, tidak pernah error).
 */

const DEFAULT_MAX_EDGE = 1920;
const DEFAULT_QUALITY = 0.82;
/** File di bawah ukuran ini tidak diutak-atik (sudah cukup kecil). */
const SKIP_BELOW_BYTES = 300 * 1024;

export type CompressOptions = {
  maxEdge?: number;
  quality?: number;
};

/** Ganti isi FileList sebuah <input type="file"> (mis. dengan hasil kompresi). */
export function setInputFiles(input: HTMLInputElement, files: File[]) {
  const dt = new DataTransfer();
  for (const f of files) dt.items.add(f);
  input.files = dt.files;
}

function swapExtension(name: string, type: string): string {
  const ext = type === "image/jpeg" ? ".jpg" : type === "image/webp" ? ".webp" : "";
  if (!ext) return name;
  return name.replace(/\.(jpe?g|png|webp|gif|bmp|avif|heic|heif)$/i, "") + ext;
}

/**
 * Kompresi satu gambar. SVG dan GIF (animasi) dikembalikan apa adanya.
 * Bila hasil kompresi justru lebih besar (sudah termampet baik), file
 * asli dipakai lagi.
 */
export async function compressImage(file: File, opts?: CompressOptions): Promise<File> {
  const maxEdge = opts?.maxEdge ?? DEFAULT_MAX_EDGE;
  const quality = opts?.quality ?? DEFAULT_QUALITY;

  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }
  if (file.size <= SKIP_BELOW_BYTES) return file;

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close?.();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();

    // PNG diwebp-kan (pertahankan transparansi + jauh lebih kecil);
    // lainnya jadi JPEG. Fallback bila browser tak dukung webp: cek via canvas.
    const wantsAlpha = file.type === "image/png";
    const type = wantsAlpha ? "image/webp" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, type, quality);
    });
    const result =
      blob ??
      (wantsAlpha
        ? await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
        : null);
    if (!result || result.size >= file.size) return file;

    const outType = wantsAlpha && blob === null ? "image/png" : type;
    return new File([result], swapExtension(file.name, outType), {
      type: outType,
      lastModified: Date.now(),
    });
  } catch {
    // createImageBitmap gagal (format eksotis dsb.) → pakai file asli.
    return file;
  }
}
