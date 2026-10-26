import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.REDIS_KV_REST_API_URL!,
  token: process.env.REDIS_KV_REST_API_TOKEN!,
});

// Login: maksimal 5 percobaan per 5 menit per IP
export const loginRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "5 m"),
  prefix: "ratelimit:login",
  analytics: true,
});

// Inquiry form: maksimal 3 submission per 10 menit per IP
export const inquiryRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "10 m"),
  prefix: "ratelimit:inquiry",
  analytics: true,
});

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

// Helper: return null kalau lolos, atau pesan error kalau kena limit
export async function checkRateLimit(
  limiter: Ratelimit,
  key: string
): Promise<string | null> {
  try {
    const { success, reset } = await limiter.limit(key);
    if (success) return null;

    const waitMinutes = Math.max(1, Math.ceil((reset - Date.now()) / 1000 / 60));
    return `Terlalu banyak percobaan. Coba lagi dalam ${waitMinutes} menit.`;
  } catch (err) {
    // Redis error / infra gagal — fail open, jangan blokir user karena Upstash down
    console.error("Rate limiter error, failing open:", err);
    return null;
  }
}