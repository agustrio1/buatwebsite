// Helper penggabung kelas Tailwind tanpa dependensi (pengganti clsx + tailwind-merge).
// Mendukung string, angka, falsey, dan objek { kelas: kondisi } seperti clsx.
// Untuk bentrok Tailwind (mis. dua bg-*), cukup hindari menumpuk varian yang sama
// di pemanggil; komponen UI di sini sudah menjaga urutan kelas default -> override.
type ClassValue = string | number | null | undefined | false | Record<string, boolean | null | undefined>;

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === "string" || typeof input === "number") {
      out.push(String(input));
    } else if (typeof input === "object") {
      for (const [key, value] of Object.entries(input)) {
        if (value) out.push(key);
      }
    }
  }
  return out.join(" ");
}
