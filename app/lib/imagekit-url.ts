export function resizeImage(url: string | null | undefined, width: number) {
  if (!url) return url;
  if (!url.includes("ik.imagekit.io")) return url;

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}tr=w-${width},q-75,f-webp`;
}