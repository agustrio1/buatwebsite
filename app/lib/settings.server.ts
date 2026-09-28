import { db } from "~/db";

// SECURITY: key ini TIDAK BOLEH dikirim ke client.
// Tambahkan key lain di sini kalau nanti ada credential/secret baru.
const PRIVATE_SETTINGS_KEYS = ["integrations"];

const CACHE_TTL_MS = 60_000;

type SettingsMap = Record<string, any>;

let cachedSettings: { data: SettingsMap; expiresAt: number } | null = null;

/**
 * Settings publik (sudah difilter dari key rahasia), dengan cache in-memory.
 * Dipakai bersama oleh root loader dan site-layout loader supaya Neon
 * tidak di-query berulang untuk data yang jarang berubah.
 */
export async function getPublicSettings(): Promise<SettingsMap> {
  const now = Date.now();
  if (cachedSettings && cachedSettings.expiresAt > now) {
    return cachedSettings.data;
  }

  const rows = await db.query.siteSettings.findMany();
  const settings: SettingsMap = {};

  for (const row of rows) {
    if (PRIVATE_SETTINGS_KEYS.includes(row.key)) continue;

    try {
      settings[row.key] = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
    } catch {
      settings[row.key] = row.value;
    }
  }

  cachedSettings = { data: settings, expiresAt: now + CACHE_TTL_MS };
  return settings;
}

/** Panggil ini setelah admin menyimpan settings supaya perubahan langsung terlihat. */
export function invalidateSettingsCache() {
  cachedSettings = null;
}