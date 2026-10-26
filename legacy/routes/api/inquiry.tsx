import type { Route } from "./+types/inquiry";
import { eq } from "drizzle-orm";
import { db } from "~/db";
import { inquiries, siteSettings } from "~/db/schema";
import { sendWhatsAppNotification } from "~/lib/fonnte.server";
import { inquiryRateLimiter, checkRateLimit, getClientIp } from "~/lib/rate-limit.server";

function clean(value: FormDataEntryValue | null, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}

// Nomor Indonesia: 08xx / 8xx / +62 / 62 -> 62xxxxxxxx
function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  else if (digits.startsWith("8")) digits = "62" + digits;
  if (digits.length < 10 || digits.length > 15) return null;
  return digits;
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response(null, { status: 405 });
  }

  const ip = getClientIp(request);
  const limitError = await checkRateLimit(inquiryRateLimiter, ip);
  if (limitError) {
    return { error: limitError };
  }

  const formData = await request.formData();

  // Honeypot: field ini tersembunyi, hanya bot yang mengisinya
  if (clean(formData.get("website"), 100)) {
    return { success: true };
  }

  const name = clean(formData.get("name"), 255);
  const phoneRaw = clean(formData.get("phone"), 50);
  const emailRaw = clean(formData.get("email"), 255);
  const companyName = clean(formData.get("companyName"), 255);
  const serviceType = clean(formData.get("serviceType"), 255);
  const budget = clean(formData.get("budget"), 100);
  const source = clean(formData.get("source"), 255);
  const message = clean(formData.get("message"), 2000);

  if (!name) return { error: "Nama wajib diisi." };

  const phone = normalizePhone(phoneRaw);
  if (!phone) return { error: "Nomor WhatsApp tidak valid." };

  if (emailRaw && !/^\S+@\S+\.\S+$/.test(emailRaw)) {
    return { error: "Format email tidak valid." };
  }

  await db.insert(inquiries).values({
    name,
    phone,
    email: emailRaw || null,
    companyName: companyName || null,
    serviceType: serviceType || null,
    budget: budget || null,
    source: source || null,
    message: message || "Brief dari form singkat (tanpa pesan tambahan).",
  });

  // Notifikasi WA ke admin, gagal pun form tetap dianggap sukses
  try {
    const contactSetting = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.key, "contact"),
    });
    const adminNumber =
      (contactSetting?.value as any)?.whatsappNumber ??
      (contactSetting?.value as any)?.phoneOffice;

    if (adminNumber) {
      const cleanNumber = String(adminNumber).replace(/\D/g, "");
      const waMessage =
        `📩 Brief baru dari website!\n\n` +
        `Nama: ${name}\n` +
        `WhatsApp: ${phone}\n` +
        (emailRaw ? `Email: ${emailRaw}\n` : "") +
        (companyName ? `Perusahaan: ${companyName}\n` : "") +
        (serviceType ? `Layanan: ${serviceType}\n` : "") +
        (budget ? `Budget: ${budget}\n` : "") +
        (source ? `Sumber: ${source}\n` : "") +
        (message ? `\nPesan:\n${message}` : "");

      await sendWhatsAppNotification(cleanNumber, waMessage);
    }
  } catch (err) {
    console.error("[inquiry] notifikasi WA gagal:", err);
  }

  return { success: true };
}