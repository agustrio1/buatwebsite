const WORKER_BASE_URL = "cdn.enterprisejadikanweb.biz.id";

export function resizeImage(url: string | null | undefined, width: number) {
  if (!url) return url;
  const baseUrl = url.split("?")[0];
  return `${baseUrl}?width=${width}&quality=80`;
}

export function buildSrcSet(url: string | null | undefined, baseWidth: number) {
  if (!url) return undefined;

  const widths = [baseWidth, Math.round(baseWidth * 1.5), baseWidth * 2];

  return widths
    .map((w) => `${resizeImage(url, w)} ${w}w`)
    .join(", ");
}