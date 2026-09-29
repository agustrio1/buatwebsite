type MetaTag = Record<string, any>;

function metaKey(tag: MetaTag): string | null {
  if ("title" in tag) return "title";
  if (tag.name) return `name:${tag.name}`;
  if (tag.property) return `property:${tag.property}`;
  if (tag.tagName === "link" && tag.rel) return `link:${tag.rel}:${tag.hrefLang ?? ""}`;
  return null;
}

/**
 * meta() milik route anak menimpa meta root sepenuhnya. Fungsi ini
 * mempertahankan tag dari route induk (og:image, robots, favicon, dst)
 * kecuali yang ditimpa oleh tag milik route ini.
 *
 * Pemakaian:
 *   export function meta({ matches }: Route.MetaArgs) {
 *     return mergeMeta(matches, [{ title: "..." }, ...]);
 *   }
 */
export function mergeMeta(matches: any[], own: MetaTag[]): MetaTag[] {
  const ownKeys = new Set(
    own.map(metaKey).filter((key): key is string => key !== null)
  );

  const inherited = matches
    .flatMap((match) => (match?.meta ?? []) as MetaTag[])
    .filter((tag) => {
      const key = metaKey(tag);
      return key === null || !ownKeys.has(key);
    });

  return [...inherited, ...own];
}