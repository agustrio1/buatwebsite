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
 * Route tanpa export meta (mis. layout) mendapat salinan meta induknya,
 * jadi tag root bisa muncul dobel di matches. Karena itu tag dengan key
 * yang sama dipakai sekali saja, yang paling dekat ke route ini menang.
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

  const inherited = new Map<string, MetaTag>();
  for (const match of matches) {
    for (const tag of (match?.meta ?? []) as MetaTag[]) {
      const key = metaKey(tag);
      if (key !== null && ownKeys.has(key)) continue;
      inherited.set(key ?? JSON.stringify(tag), tag);
    }
  }

  return [...inherited.values(), ...own];
}

export function pageMeta(
  matches: any[],
  o: { title: string; description: string; page?: number }
): MetaTag[] {
  const page = o.page ?? 1;

  const parentCanonical = matches
    .flatMap((m) => (m?.meta ?? []) as MetaTag[])
    .find((t) => t.tagName === "link" && t.rel === "canonical")?.href as
    | string
    | undefined;

  const canonical = parentCanonical
    ? parentCanonical + (page > 1 ? `?page=${page}` : "")
    : undefined;

  const own: MetaTag[] = [
    { title: o.title },
    { name: "description", content: o.description },
    { property: "og:title", content: o.title },
    { property: "og:description", content: o.description },
    { name: "twitter:title", content: o.title },
    { name: "twitter:description", content: o.description },
  ];

  if (canonical) {
    own.push(
      { property: "og:url", content: canonical },
      { tagName: "link", rel: "canonical", href: canonical },
      { tagName: "link", rel: "alternate", hrefLang: "id", href: canonical },
      { tagName: "link", rel: "alternate", hrefLang: "x-default", href: canonical }
    );
  }

  return mergeMeta(matches, own);
}