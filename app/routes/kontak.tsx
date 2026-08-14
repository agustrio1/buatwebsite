import { useOutletContext } from "react-router";
import type { Route } from "./+types/kontak";
import { db } from "~/db";
import { inquiries, services, siteSettings } from "~/db/schema";
import { eq } from "drizzle-orm";
import { InquiryForm } from "~/components/site/inquiry-form";
import { sendWhatsAppNotification } from "~/lib/fonnte.server";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export async function loader() {
  const allServices = await db.query.services.findMany();
  return { services: allServices };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
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

export default function Kontak({ loaderData }: Route.ComponentProps) {
  const { settings } = useOutletContext<{ settings: Record<string, any> }>();
  const contact = settings.contact ?? {};
  const hours = settings.operational_hours ?? {};

  return (
    <div>
      <section className="border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 text-center">
          <span className="inline-block bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            Kontak
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-brand-dark">Hubungi Kami</h1>
          <p className="text-slate-500 mt-4 leading-relaxed">
            Ada pertanyaan atau ingin konsultasi proyek website Anda? Isi form di bawah atau hubungi
            kami langsung.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              {contact.address && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-brand-dark text-sm">Alamat</p>
                    <p className="text-sm text-slate-500 mt-0.5">{contact.address}</p>
                  </div>
                </div>
              )}
              {contact.emailPrimary && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-brand-dark text-sm">Email</p>
                    <p className="text-sm text-slate-500 mt-0.5">{contact.emailPrimary}</p>
                  </div>
                </div>
              )}
              {contact.phoneOffice && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-brand-dark text-sm">Telepon</p>
                    <p className="text-sm text-slate-500 mt-0.5">{contact.phoneOffice}</p>
                  </div>
                </div>
              )}
              {hours.workDays && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-brand-dark text-sm">Jam Operasional</p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {hours.workDays}, {hours.workHours}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {contact.googleMapsEmbedUrl && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 aspect-video">
                <iframe
                  src={contact.googleMapsEmbedUrl}
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi kami"
                />
              </div>
            )}
          </div>

          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
            <InquiryForm services={loaderData.services} />
          </div>
        </div>
      </section>
    </div>
  );
}