const WORKER_BASE_URL = "cdn.enterprisejadikanweb.biz.id";

const DEFAULT_QUALITY = 80;

export function resizeImage(
  url: string | null | undefined,
  width: number,
  quality: number = DEFAULT_QUALITY
) {
  if (!url) return url;
  const baseUrl = url.split("?")[0];
  return `${baseUrl}?width=${width}&quality=${quality}`;
}

export function buildSrcSet(
  url: string | null | undefined,
  baseWidth: number,
  quality: number = DEFAULT_QUALITY
) {
  if (!url) return undefined;

  const widths = [baseWidth, Math.round(baseWidth * 1.5), baseWidth * 2];

  return widths
    .map((w) => `${resizeImage(url, w, quality)} ${w}w`)
    .join(", ");
}