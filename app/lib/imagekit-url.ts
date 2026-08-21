export function resizeImage(url: string | null | undefined, width: number) {
  if (!url) return url;
  if (!url.includes("ik.imagekit.io")) return url;

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}tr=w-${width},q-80,f-webp`;
}

export function buildSrcSet(url: string | null | undefined, baseWidth: number) {
  if (!url) return undefined;
  if (!url.includes("ik.imagekit.io")) return undefined;

  const widths = [baseWidth, Math.round(baseWidth * 1.5), baseWidth * 2];

  return widths
    .map((w) => `${resizeImage(url, w)} ${w}w`)
    .join(", ");
}
