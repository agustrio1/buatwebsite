"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "~/db";
import { inquiries, siteSettings } from "~/db/schema";
import { sendWhatsAppNotification } from "~/lib/fonnte.server";
import { inquiryRateLimiter, checkRateLimit, getIpFromHeaders } from "~/lib/rate-limit.server";

export type InquiryResult = { success?: boolean; error?: string };

/**
 * Padanan action() di routes/kontak.tsx lama. Logika (rate limit, validasi,
 * insert, notifikasi WA yang gagal-pun-tetap-sukses) disalin apa adanya;
 * request tidak lagi diteruskan dari route, tapi header dibaca lewat
 * next/headers yang punya bentuk sama.
 */
export async function submitInquiry(
  _prev: InquiryResult,
  formData: FormData
): Promise<InquiryResult> {
  const limitError = await checkRateLimit(
    inquiryRateLimiter,
    getIpFromHeaders(await headers())
  );
  if (limitError) {
    return { error: limitError };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    return { error: "Nama, email, dan pesan wajib diisi." };
  }

  const phone = String(formData.get("phone") ?? "") || null;
  const companyName = String(formData.get("companyName") ?? "") || null;
  const serviceType = String(formData.get("serviceType") ?? "") || null;

  await db.insert(inquiries).values({
    name,
    email,
    phone,
    companyName,
    serviceType,
    message,
  });

  // Kirim notifikasi WA ke admin, gagal-pun form tetap dianggap sukses
  const contactSetting = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.key, "contact"),
  });
  const adminNumber =
    (contactSetting?.value as any)?.whatsappNumber ??
    (contactSetting?.value as any)?.phoneOffice;

  if (adminNumber) {
    const cleanNumber = String(adminNumber).replace(/\D/g, "");
    const waMessage =
      `📩 Inquiry baru dari website!\n\n` +
      `Nama: ${name}\n` +
      `Email: ${email}\n` +
      (phone ? `Telepon: ${phone}\n` : "") +
      (companyName ? `Perusahaan: ${companyName}\n` : "") +
      (serviceType ? `Layanan: ${serviceType}\n` : "") +
      `\nPesan:\n${message}`;

    await sendWhatsAppNotification(cleanNumber, waMessage);
  }

  return { success: true };
}
