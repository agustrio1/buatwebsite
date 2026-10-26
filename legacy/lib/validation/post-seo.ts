export const SCHEMA_TYPES = ["BlogPosting", "Article", "NewsArticle", "None"] as const;
export type SchemaType = (typeof SCHEMA_TYPES)[number];

export type SeoErrors = Partial<
  Record<"metaTitle" | "metaDescription" | "canonicalUrl" | "customJsonLd", string>
>;

export type SeoValues = {
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  noindex: boolean;
  schemaType: SchemaType;
  customJsonLd: string | null;
};

export function parseSeoFields(formData: FormData): { values: SeoValues; errors: SeoErrors } {
  const errors: SeoErrors = {};

  const metaTitle = String(formData.get("metaTitle") ?? "").trim() || null;
  const metaDescription = String(formData.get("metaDescription") ?? "").trim() || null;
  const canonicalUrl = String(formData.get("canonicalUrl") ?? "").trim() || null;
  const noindex = formData.get("noindex") === "on";

  if (metaTitle && metaTitle.length > 255) {
    errors.metaTitle = "Maksimal 255 karakter";
  }
  if (metaDescription && metaDescription.length > 500) {
    errors.metaDescription = "Maksimal 500 karakter";
  }
  if (canonicalUrl) {
    if (!/^https?:\/\//i.test(canonicalUrl)) {
      errors.canonicalUrl = "Harus diawali http:// atau https://";
    } else if (canonicalUrl.length > 500) {
      errors.canonicalUrl = "Maksimal 500 karakter";
    }
  }

  const rawSchema = String(formData.get("schemaType") ?? "BlogPosting");
  const schemaType: SchemaType = (SCHEMA_TYPES as readonly string[]).includes(rawSchema)
    ? (rawSchema as SchemaType)
    : "BlogPosting";

  let customJsonLd: string | null = null;
  const rawCustom = String(formData.get("customJsonLd") ?? "").trim();
  if (rawCustom) {
    try {
      const parsed = JSON.parse(rawCustom);
      if (typeof parsed !== "object" || parsed === null) {
        errors.customJsonLd = "JSON-LD harus berupa object atau array";
      } else {
        customJsonLd = JSON.stringify(parsed, null, 2);
      }
    } catch {
      errors.customJsonLd = "JSON tidak valid. Cek koma, kutip, dan kurung.";
    }
  }

  return {
    values: { metaTitle, metaDescription, canonicalUrl, noindex, schemaType, customJsonLd },
    errors,
  };
}