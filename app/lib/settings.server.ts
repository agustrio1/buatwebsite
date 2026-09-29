import { db } from "~/db";

// SECURITY: key ini TIDAK BOLEH dikirim ke client.
// Tambahkan key lain di sini kalau nanti ada credential/secret baru.
const PRIVATE_SETTINGS_KEYS = ["integrations"];

// Settings jarang berubah, jadi TTL dibuat lebih panjang agar lebih jarang
// menyentuh database. Perubahan dari admin tetap terlihat langsung di instance
// yang sama lewat invalidateSettingsCache(); di instance lain maksimal
// tertunda sebesar TTL ini.
const CACHE_TTL_MS = 5 * 60_000;

type SettingsMap = Record<string, any>;

let cachedSettings: { data: SettingsMap; expiresAt: number } | null = null;

// Menyimpan query yang sedang berjalan supaya request bersamaan
// berbagi satu query, bukan masing-masing query ke database.
let inflight: Promise<SettingsMap> | null = null;

async function fetchSettingsFromDb(): Promise<SettingsMap> {
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

  return settings;
}

/**
 * Settings publik (sudah difilter dari key rahasia), dengan cache in-memory.
 * Dipakai bersama oleh root loader dan site-layout loader supaya database
 * tidak di-query berulang untuk data yang jarang berubah.
 *
 * - Request bersamaan berbagi satu query (dedupe).
 * - Jika database gagal dan masih ada data lama, data lama dipakai
 *   supaya halaman tidak ikut error.
 */
export async function getPublicSettings(): Promise<SettingsMap> {
  const now = Date.now();
  if (cachedSettings && cachedSettings.expiresAt > now) {
    return cachedSettings.data;
  }

  if (inflight) return inflight;

  inflight = fetchSettingsFromDb()
    .then((data) => {
      cachedSettings = { data, expiresAt: Date.now() + CACHE_TTL_MS };
      return data;
    })
    .catch((error) => {
      if (cachedSettings) {
        // Fallback ke data lama; coba lagi ke database pada request berikutnya.
        return cachedSettings.data;
      }
      throw error;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

/** Panggil ini setelah admin menyimpan settings supaya perubahan langsung terlihat. */
export function invalidateSettingsCache() {
  cachedSettings = null;
}