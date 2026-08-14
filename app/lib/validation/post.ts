import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const postSchema = z.object({
  title: z.string().trim().min(3, "Judul minimal 3 karakter").max(255),
  slug: z
    .string()
    .trim()
    .min(3, "Slug minimal 3 karakter")
    .max(255)
    .regex(slugRegex, "Slug cuma boleh huruf kecil, angka, dan tanda strip (-)"),
  summary: z.string().trim().max(500).nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  status: z.enum(["draft", "published"]),
});

export type PostFormErrors = Partial<Record<keyof z.infer<typeof postSchema>, string>>;

export function flattenZodErrors(error: z.ZodError): PostFormErrors {
  const errors: PostFormErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof PostFormErrors;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}