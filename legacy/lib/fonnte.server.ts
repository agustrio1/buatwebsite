import { db } from "~/db";
import { siteSettings } from "~/db/schema";
import { eq } from "drizzle-orm";

export async function sendWhatsAppNotification(target: string, message: string) {
  const setting = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.key, "integrations"),
  });
  const token = (setting?.value as any)?.fonnteToken;

  if (!token) {
    console.error("[Fonnte] Token belum diset di Admin > Pengaturan > Integrasi, notifikasi WA dilewati.");
    return;
  }

  try {
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ target, message }),
    });

    const data = await res.json();
    if (!data.status) {
      console.error("[Fonnte] Gagal kirim notifikasi:", data);
    }
  } catch (err) {
    console.error("[Fonnte] Error saat kirim notifikasi:", err);
  }
}