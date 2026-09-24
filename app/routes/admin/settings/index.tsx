import { useState } from "react";
import { Form, useLoaderData, useSearchParams, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/index";
import { db } from "~/db";
import { siteSettings } from "~/db/schema";
import { ImageUploadField } from "~/components/admin/image-upload-field";
import {
  Building2,
  Search,
  Phone,
  Share2,
  Sparkles,
  Clock,
  ToggleLeft,
  MessageCircle,
  Save,
  CheckCircle2,
  KeyRound,
} from "lucide-react";

export async function loader() {
  const rows = await db.query.siteSettings.findMany();
  const settings: Record<string, any> = {};
  for (const row of rows) settings[row.key] = row.value;
  return { settings };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const key = String(formData.get("key"));
  let value: Record<string, unknown>;

  switch (key) {
    case "general":
      value = {
        siteName: String(formData.get("siteName") ?? ""),
        siteTagline: String(formData.get("siteTagline") ?? ""),
        siteUrl: String(formData.get("siteUrl") ?? "").replace(/\/$/, ""),
        companyLegalName: String(formData.get("companyLegalName") ?? ""),
        logoUrl: String(formData.get("logoUrl") ?? ""),
        logoDarkUrl: String(formData.get("logoDarkUrl") ?? ""),
        faviconUrl: String(formData.get("faviconUrl") ?? ""),
        copyrightText: String(formData.get("copyrightText") ?? ""),
        maintenanceMode: formData.get("maintenanceMode") === "true",
      };
      break;

    case "seo":
      value = {
        metaTitle: String(formData.get("metaTitle") ?? ""),
        metaDescription: String(formData.get("metaDescription") ?? ""),
        keywords: String(formData.get("keywords") ?? "")
          .split(",").map((k) => k.trim()).filter(Boolean),
        ogImageUrl: String(formData.get("ogImageUrl") ?? ""),
        twitterHandle: String(formData.get("twitterHandle") ?? ""),
        googleAnalyticsId: String(formData.get("googleAnalyticsId") ?? ""),
        googleTagManagerId: String(formData.get("googleTagManagerId") ?? ""),
        googleSearchConsoleCode: String(formData.get("googleSearchConsoleCode") ?? ""),
        robotsIndex: formData.get("robotsIndex") === "true",
      };
      break;

    case "contact":
      value = {
        emailPrimary: String(formData.get("emailPrimary") ?? ""),
        emailSupport: String(formData.get("emailSupport") ?? ""),
        whatsappNumber: String(formData.get("whatsappNumber") ?? ""),
        phoneOffice: String(formData.get("phoneOffice") ?? ""),
        address: String(formData.get("address") ?? ""),
        province: String(formData.get("province") ?? ""),
        postalCode: String(formData.get("postalCode") ?? ""),
        googleMapsEmbedUrl: String(formData.get("googleMapsEmbedUrl") ?? ""),
        coordinates: {
          lat: Number(formData.get("lat") ?? 0),
          lng: Number(formData.get("lng") ?? 0),
        },
      };
      break;

    case "socials":
      value = {
        instagram: String(formData.get("instagram") ?? ""),
        linkedin: String(formData.get("linkedin") ?? ""),
        github: String(formData.get("github") ?? ""),
        youtube: String(formData.get("youtube") ?? ""),
        facebook: String(formData.get("facebook") ?? ""),
        tiktok: String(formData.get("tiktok") ?? ""),
      };
      break;

    case "hero":
      value = {
        badgeText: String(formData.get("badgeText") ?? ""),
        headline: String(formData.get("headline") ?? ""),
        subheadline: String(formData.get("subheadline") ?? ""),
        ctaPrimaryText: String(formData.get("ctaPrimaryText") ?? ""),
        ctaPrimaryUrl: String(formData.get("ctaPrimaryUrl") ?? ""),
        ctaSecondaryText: String(formData.get("ctaSecondaryText") ?? ""),
        ctaSecondaryUrl: String(formData.get("ctaSecondaryUrl") ?? ""),
      };
      break;

    case "operational_hours":
      value = {
        workDays: String(formData.get("workDays") ?? ""),
        workHours: String(formData.get("workHours") ?? ""),
        timezone: String(formData.get("timezone") ?? ""),
        isSupport24_7: formData.get("isSupport24_7") === "true",
        closedDays: String(formData.get("closedDays") ?? "")
          .split(",").map((d) => d.trim()).filter(Boolean),
      };
      break;

    case "features":
      value = {
        showPricingSection: formData.get("showPricingSection") === "true",
        showPortfolioDemoLinks: formData.get("showPortfolioDemoLinks") === "true",
        showBlogSection: formData.get("showBlogSection") === "true",
        showTestimonials: formData.get("showTestimonials") === "true",
        enableDirectWhatsAppInquiry: formData.get("enableDirectWhatsAppInquiry") === "true",
        enableDarkModeToggle: formData.get("enableDarkModeToggle") === "true",
      };
      break;

    case "whatsapp_templates":
      value = {
        defaultConsultation: String(formData.get("defaultConsultation") ?? ""),
        packageInquiry: String(formData.get("packageInquiry") ?? ""),
        customQuotation: String(formData.get("customQuotation") ?? ""),
      };
      break;

    case "integrations":
      value = {
        fonnteToken: String(formData.get("fonnteToken") ?? ""),
        gaPropertyId: String(formData.get("gaPropertyId") ?? ""),
        gaServiceAccountJson: String(formData.get("gaServiceAccountJson") ?? ""),
      };
      break;

    default:
      return { error: "Section tidak dikenali" };
  }

  await db
    .insert(siteSettings)
    .values({ key, value })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value } });

  return { success: true, key };
}

const sections = [
  { key: "general", label: "Umum", icon: Building2 },
  { key: "seo", label: "SEO & Meta", icon: Search },
  { key: "contact", label: "Kontak", icon: Phone },
  { key: "socials", label: "Sosial Media", icon: Share2 },
  { key: "hero", label: "Hero Section", icon: Sparkles },
  { key: "operational_hours", label: "Jam Operasional", icon: Clock },
  { key: "features", label: "Fitur", icon: ToggleLeft },
  { key: "whatsapp_templates", label: "Template WA", icon: MessageCircle },
  { key: "integrations", label: "Integrasi", icon: KeyRound },
] as const;

export default function SettingsIndex() {
  const { settings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [searchParams, setSearchParams] = useSearchParams();

  const activeKey = searchParams.get("tab") ?? "general";
  const activeSection = sections.find((s) => s.key === activeKey) ?? sections[0];

  function switchTab(key: string) {
    setSearchParams({ tab: key });
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-dark">Pengaturan</h1>
        <p className="text-sm text-slate-400 mt-1.5">Konfigurasi umum website kamu.</p>
      </div>

      {actionData?.success && (
        <div className="flex items-center gap-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-4 py-3 mb-5 text-sm font-medium">
          <CheckCircle2 size={16} /> Pengaturan berhasil disimpan.
        </div>
      )}
      {actionData?.error && (
        <div className="bg-rose-50 text-rose-600 border border-rose-200 rounded-xl px-4 py-3 mb-5 text-sm font-medium">
          {actionData.error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Tab nav */}
        <div className="md:w-60 shrink-0">
          <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 -mx-1 px-1 md:mx-0 md:px-0">
            {sections.map((s) => {
              const Icon = s.icon;
              const isActive = s.key === activeKey;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => switchTab(s.key)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap shrink-0 md:shrink text-left transition-all duration-150 ${
                    isActive
                      ? "bg-brand-500 text-white shadow-sm shadow-brand-500/20"
                      : "text-slate-500 hover:bg-white hover:text-slate-700"
                  }`}
                >
                  <Icon size={16} className={isActive ? "text-white" : "text-slate-400"} />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-5 hidden md:block">
            <h2 className="text-lg font-semibold text-brand-dark">{activeSection.label}</h2>
          </div>

          {activeKey === "general" && <GeneralForm data={settings.general} isSubmitting={isSubmitting} />}
          {activeKey === "seo" && <SeoForm data={settings.seo} isSubmitting={isSubmitting} />}
          {activeKey === "contact" && <ContactForm data={settings.contact} isSubmitting={isSubmitting} />}
          {activeKey === "socials" && <SocialsForm data={settings.socials} isSubmitting={isSubmitting} />}
          {activeKey === "hero" && <HeroForm data={settings.hero} isSubmitting={isSubmitting} />}
          {activeKey === "operational_hours" && (
            <OperationalHoursForm data={settings.operational_hours} isSubmitting={isSubmitting} />
          )}
          {activeKey === "features" && <FeaturesForm data={settings.features} isSubmitting={isSubmitting} />}
          {activeKey === "whatsapp_templates" && (
            <WhatsappTemplatesForm data={settings.whatsapp_templates} isSubmitting={isSubmitting} />
          )}
          {activeKey === "integrations" && (
            <IntegrationsForm data={settings.integrations} isSubmitting={isSubmitting} />
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-5">
      {children}
    </div>
  );
}

function CardHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="pb-1">
      <h3 className="text-sm font-semibold text-brand-dark">{title}</h3>
      {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-slate-700">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1.5">{hint}</p>}
    </div>
  );
}

function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm shadow-brand-500/20 transition-colors"
    >
      <Save size={16} /> {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
    </button>
  );
}

const inputClass =
  "w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-colors";
const checkboxRow = "flex items-center gap-2.5 text-sm text-slate-600";
const checkboxClass = "w-4 h-4 accent-brand-500 rounded";

function GeneralForm({ data, isSubmitting }: { data?: any; isSubmitting: boolean }) {
  return (
    <Form method="post" className="space-y-5">
      <input type="hidden" name="key" value="general" />
      <Card>
        <CardHeader title="Identitas Situs" description="Nama dan informasi dasar website kamu" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nama Situs">
            <input name="siteName" defaultValue={data?.siteName} className={inputClass} />
          </Field>
          <Field label="Nama Legal Perusahaan">
            <input name="companyLegalName" defaultValue={data?.companyLegalName} className={inputClass} />
          </Field>
        </div>
        <Field label="Tagline">
          <input name="siteTagline" defaultValue={data?.siteTagline} className={inputClass} />
        </Field>
        <Field
          label="URL Situs"
          hint="Domain utama tanpa slash di akhir, contoh: https://jadikanweb.id — dipakai untuk canonical URL dan data terstruktur SEO"
        >
          <input
            name="siteUrl"
            defaultValue={data?.siteUrl}
            placeholder="https://jadikanweb.id"
            className={inputClass}
          />
        </Field>
        <Field label="Copyright Text">
          <input name="copyrightText" defaultValue={data?.copyrightText} className={inputClass} />
        </Field>
        <label className={checkboxRow}>
          <input type="checkbox" name="maintenanceMode" value="true" defaultChecked={data?.maintenanceMode} className={checkboxClass} />
          Aktifkan Mode Maintenance
        </label>
      </Card>

      <Card>
        <CardHeader title="Logo & Favicon" description="Upload gambar langsung, tidak perlu tempel URL manual" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <ImageUploadField name="logoUrl" label="Logo" defaultValue={data?.logoUrl} aspect="aspect-[4/3]" />
          <ImageUploadField name="logoDarkUrl" label="Logo (Dark Mode)" defaultValue={data?.logoDarkUrl} aspect="aspect-[4/3]" />
          <ImageUploadField name="faviconUrl" label="Favicon" defaultValue={data?.faviconUrl} aspect="aspect-square" />
        </div>
      </Card>

      <SubmitButton isSubmitting={isSubmitting} />
    </Form>
  );
}

function SeoForm({ data, isSubmitting }: { data?: any; isSubmitting: boolean }) {
  return (
    <Form method="post" className="space-y-5">
      <input type="hidden" name="key" value="seo" />
      <Card>
        <CardHeader title="Meta Tags" />
        <Field label="Meta Title">
          <input name="metaTitle" defaultValue={data?.metaTitle} className={inputClass} />
        </Field>
        <Field label="Meta Description">
          <textarea name="metaDescription" defaultValue={data?.metaDescription} rows={3} className={inputClass} />
        </Field>
        <Field label="Keywords" hint="Pisahkan dengan koma">
          <input name="keywords" defaultValue={data?.keywords?.join(", ")} className={inputClass} />
        </Field>
        <Field label="Twitter Handle">
          <input name="twitterHandle" defaultValue={data?.twitterHandle} className={inputClass} />
        </Field>
      </Card>

      <Card>
        <CardHeader title="Open Graph Image" description="Gambar yang muncul saat link dibagikan ke sosial media" />
        <ImageUploadField name="ogImageUrl" label="OG Image" defaultValue={data?.ogImageUrl} aspect="aspect-video" />
      </Card>

      <Card>
        <CardHeader title="Analytics & Verification" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Google Analytics ID">
            <input name="googleAnalyticsId" defaultValue={data?.googleAnalyticsId} className={inputClass} />
          </Field>
          <Field label="Google Tag Manager ID">
            <input name="googleTagManagerId" defaultValue={data?.googleTagManagerId} className={inputClass} />
          </Field>
        </div>
        <Field label="Google Search Console Code">
          <input name="googleSearchConsoleCode" defaultValue={data?.googleSearchConsoleCode} className={inputClass} />
        </Field>
        <label className={checkboxRow}>
          <input type="checkbox" name="robotsIndex" value="true" defaultChecked={data?.robotsIndex} className={checkboxClass} />
          Izinkan mesin pencari mengindeks situs
        </label>
      </Card>

      <SubmitButton isSubmitting={isSubmitting} />
    </Form>
  );
}

function ContactForm({ data, isSubmitting }: { data?: any; isSubmitting: boolean }) {
  return (
    <Form method="post" className="space-y-5">
      <input type="hidden" name="key" value="contact" />
      <Card>
        <CardHeader title="Informasi Kontak" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Email Utama">
            <input name="emailPrimary" type="email" defaultValue={data?.emailPrimary} className={inputClass} />
          </Field>
          <Field label="Email Support">
            <input name="emailSupport" type="email" defaultValue={data?.emailSupport} className={inputClass} />
          </Field>
          <Field label="Nomor WhatsApp" hint="Format: 62812xxxxxxx">
            <input name="whatsappNumber" defaultValue={data?.whatsappNumber} className={inputClass} />
          </Field>
          <Field label="Telepon Kantor">
            <input name="phoneOffice" defaultValue={data?.phoneOffice} className={inputClass} />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader title="Alamat & Lokasi" />
        <Field label="Alamat">
          <textarea name="address" defaultValue={data?.address} rows={2} className={inputClass} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Provinsi">
            <input name="province" defaultValue={data?.province} className={inputClass} />
          </Field>
          <Field label="Kode Pos">
            <input name="postalCode" defaultValue={data?.postalCode} className={inputClass} />
          </Field>
        </div>
        <Field label="Google Maps Embed URL">
          <input name="googleMapsEmbedUrl" defaultValue={data?.googleMapsEmbedUrl} className={inputClass} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Latitude">
            <input name="lat" type="number" step="any" defaultValue={data?.coordinates?.lat} className={inputClass} />
          </Field>
          <Field label="Longitude">
            <input name="lng" type="number" step="any" defaultValue={data?.coordinates?.lng} className={inputClass} />
          </Field>
        </div>
      </Card>

      <SubmitButton isSubmitting={isSubmitting} />
    </Form>
  );
}

function SocialsForm({ data, isSubmitting }: { data?: any; isSubmitting: boolean }) {
  const fields = ["instagram", "linkedin", "github", "youtube", "facebook", "tiktok"] as const;
  return (
    <Form method="post" className="space-y-5">
      <input type="hidden" name="key" value="socials" />
      <Card>
        <CardHeader title="Tautan Sosial Media" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <Field key={f} label={f.charAt(0).toUpperCase() + f.slice(1)}>
              <input name={f} defaultValue={data?.[f]} className={inputClass} />
            </Field>
          ))}
        </div>
      </Card>
      <SubmitButton isSubmitting={isSubmitting} />
    </Form>
  );
}

function HeroForm({ data, isSubmitting }: { data?: any; isSubmitting: boolean }) {
  return (
    <Form method="post" className="space-y-5">
      <input type="hidden" name="key" value="hero" />
      <Card>
        <CardHeader title="Konten Hero Section" />
        <Field label="Badge Text">
          <input name="badgeText" defaultValue={data?.badgeText} className={inputClass} />
        </Field>
        <Field label="Headline">
          <textarea name="headline" defaultValue={data?.headline} rows={2} className={inputClass} />
        </Field>
        <Field label="Subheadline">
          <textarea name="subheadline" defaultValue={data?.subheadline} rows={2} className={inputClass} />
        </Field>
      </Card>

      <Card>
        <CardHeader title="Call to Action" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="CTA Utama - Teks">
            <input name="ctaPrimaryText" defaultValue={data?.ctaPrimaryText} className={inputClass} />
          </Field>
          <Field label="CTA Utama - URL">
            <input name="ctaPrimaryUrl" defaultValue={data?.ctaPrimaryUrl} className={inputClass} />
          </Field>
          <Field label="CTA Sekunder - Teks">
            <input name="ctaSecondaryText" defaultValue={data?.ctaSecondaryText} className={inputClass} />
          </Field>
          <Field label="CTA Sekunder - URL">
            <input name="ctaSecondaryUrl" defaultValue={data?.ctaSecondaryUrl} className={inputClass} />
          </Field>
        </div>
      </Card>

      <SubmitButton isSubmitting={isSubmitting} />
    </Form>
  );
}

function OperationalHoursForm({ data, isSubmitting }: { data?: any; isSubmitting: boolean }) {
  return (
    <Form method="post" className="space-y-5">
      <input type="hidden" name="key" value="operational_hours" />
      <Card>
        <CardHeader title="Jam Operasional" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Hari Kerja">
            <input name="workDays" defaultValue={data?.workDays} className={inputClass} />
          </Field>
          <Field label="Jam Kerja">
            <input name="workHours" defaultValue={data?.workHours} className={inputClass} />
          </Field>
        </div>
        <Field label="Timezone">
          <input name="timezone" defaultValue={data?.timezone} className={inputClass} />
        </Field>
        <Field label="Hari Libur" hint="Pisahkan dengan koma">
          <input name="closedDays" defaultValue={data?.closedDays?.join(", ")} className={inputClass} />
        </Field>
        <label className={checkboxRow}>
          <input type="checkbox" name="isSupport24_7" value="true" defaultChecked={data?.isSupport24_7} className={checkboxClass} />
          Support tersedia 24/7
        </label>
      </Card>
      <SubmitButton isSubmitting={isSubmitting} />
    </Form>
  );
}

function FeaturesForm({ data, isSubmitting }: { data?: any; isSubmitting: boolean }) {
  const toggles = [
    { name: "showPricingSection", label: "Tampilkan Section Pricing" },
    { name: "showPortfolioDemoLinks", label: "Tampilkan Link Demo Portofolio" },
    { name: "showBlogSection", label: "Tampilkan Section Blog" },
    { name: "showTestimonials", label: "Tampilkan Testimonial" },
    { name: "enableDirectWhatsAppInquiry", label: "Aktifkan Inquiry Langsung via WhatsApp" },
    { name: "enableDarkModeToggle", label: "Aktifkan Toggle Dark Mode" },
  ] as const;

  return (
    <Form method="post" className="space-y-5">
      <input type="hidden" name="key" value="features" />
      <Card>
        <CardHeader title="Fitur Website" />
        <div className="space-y-1">
          {toggles.map((t) => (
            <label key={t.name} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
              <span className="text-sm text-slate-700">{t.label}</span>
              <input
                type="checkbox"
                name={t.name}
                value="true"
                defaultChecked={data?.[t.name]}
                className="w-4 h-4 accent-brand-500 rounded"
              />
            </label>
          ))}
        </div>
      </Card>
      <SubmitButton isSubmitting={isSubmitting} />
    </Form>
  );
}

function WhatsappTemplatesForm({ data, isSubmitting }: { data?: any; isSubmitting: boolean }) {
  return (
    <Form method="post" className="space-y-5">
      <input type="hidden" name="key" value="whatsapp_templates" />
      <Card>
        <CardHeader title="Template Pesan WhatsApp" />
        <Field label="Template Konsultasi Default">
          <textarea name="defaultConsultation" defaultValue={data?.defaultConsultation} rows={2} className={inputClass} />
        </Field>
        <Field label="Template Tanya Paket" hint="Gunakan {packageName} untuk nama paket dinamis">
          <textarea name="packageInquiry" defaultValue={data?.packageInquiry} rows={2} className={inputClass} />
        </Field>
        <Field label="Template Custom Quotation">
          <textarea name="customQuotation" defaultValue={data?.customQuotation} rows={2} className={inputClass} />
        </Field>
      </Card>
      <SubmitButton isSubmitting={isSubmitting} />
    </Form>
  );
}

function IntegrationsForm({ data, isSubmitting }: { data?: any; isSubmitting: boolean }) {
  return (
    <Form method="post" className="space-y-5">
      <input type="hidden" name="key" value="integrations" />
      <Card>
        <CardHeader title="Notifikasi WhatsApp" />
        <Field label="Fonnte API Token" hint="Dipakai untuk kirim notifikasi WhatsApp saat ada inquiry baru">
          <input
            name="fonnteToken"
            type="password"
            autoComplete="off"
            defaultValue={data?.fonnteToken}
            className={inputClass}
          />
        </Field>
      </Card>

      <Card>
        <CardHeader title="Google Analytics (GA4)" />
        <Field label="Property ID" hint="Angka doang, dari GA4 Admin > Property Settings">
          <input
            name="gaPropertyId"
            defaultValue={data?.gaPropertyId}
            placeholder="123456789"
            className={inputClass}
          />
        </Field>
        <Field
          label="Service Account JSON"
          hint="Paste seluruh isi file JSON kredensial service account di sini"
        >
          <textarea
            name="gaServiceAccountJson"
            defaultValue={data?.gaServiceAccountJson}
            rows={8}
            placeholder='{"type": "service_account", "project_id": "...", ...}'
            className={`${inputClass} font-mono text-xs`}
          />
        </Field>
      </Card>

      <SubmitButton isSubmitting={isSubmitting} />
    </Form>
  );
}