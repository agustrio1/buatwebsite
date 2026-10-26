import { z } from "zod";

/**
 * Validasi environment terpusat dengan fail-fast untuk variabel inti.
 * - Variabel inti (DB & session) WAJIB ada; kalau hilang langsung error jelas
   saat start, bukan kegagalan misterius di kemudian hari.
 * - Variabel layanan opsional (R2/Redis/ImageKit) dibiarkan optional supaya
   build/dev tetap jalan saat kredensialnya belum dipasang; pemakai fungsi
   terkait tetap asumsikan nilainya ada saat runtime.
 * - Dilewati saat `next build` (NEXT_PHASE) atau saat SKIP_ENV_VALIDATION=1,
   supaya proses build/typecheck tidak gagal hanya karena env belum tersedia.
 */
const optionalString = z.preprocess(
  (v) => (v === "" || v === undefined ? undefined : v),
  z.string().optional()
);

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Inti — wajib
  DATABASE_URL: z.string().min(1, "DATABASE_URL belum diset"),
  SESSION_SECRET: z.string().min(1, "SESSION_SECRET belum diset (wajib untuk keamanan session)"),

  // Cloudflare R2 (upload gambar)
  R2_ACCOUNT_ID: optionalString,
  R2_ACCESS_KEY_ID: optionalString,
  R2_SECRET_ACCESS_KEY: optionalString,
  R2_BUCKET_NAME: optionalString,
  R2_PUBLIC_URL: optionalString,

  // Upstash Redis (rate limiting)
  REDIS_KV_REST_API_URL: optionalString,
  REDIS_KV_REST_API_TOKEN: optionalString,

  // ImageKit (legacy)
  IMAGEKIT_PUBLIC_KEY: optionalString,
  IMAGEKIT_PRIVATE_KEY: optionalString,
  IMAGEKIT_URL_ENDPOINT: optionalString,
});

function validateEnv() {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const flat = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`❌ Environment tidak valid:\n${flat}`);
  }
  return parsed.data;
}

const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
const skip = process.env.SKIP_ENV_VALIDATION === "1" || process.env.NODE_ENV === "test";

export const env = skip || isBuildPhase ? (process.env as z.infer<typeof EnvSchema>) : validateEnv();
