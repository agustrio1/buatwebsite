"use server";

import { db } from "~/db";
import { siteSettings } from "~/db/schema";
import { invalidateSettingsCache } from "~/lib/settings.server";
import { revalidateSettings } from "~/lib/revalidate-public";
import { parseCalculatorConfig } from "~/lib/price-calculator";
import { requireAdmin } from "~/lib/session.server";

export type SettingsResult = {
  success?: boolean;
  error?: string;
  key?: string;
};

export async function saveSettings(formData: FormData): Promise<SettingsResult> {
  await requireAdmin();

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

    case "brief_form":
      value = {
        budgetOptions: String(formData.get("budgetOptions") ?? "")
          .split("\n")
          .map((o) => o.trim().slice(0, 100))
          .filter(Boolean)
          .slice(0, 12),
      };
      break;

    case "price_calculator": {
      const config = parseCalculatorConfig(String(formData.get("configJson") ?? ""));
      if (!config) return { error: "Data kalkulator tidak valid." };
      value = config;
      break;
    }

    default:
      return { error: "Section tidak dikenali" };
  }

  await db
    .insert(siteSettings)
    .values({ key, value })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value } });

  // Supaya perubahan langsung terlihat (di instance yang sama)
  invalidateSettingsCache();

  // Bust cache halaman publik (ISR/SSG) yang membaca settings via layout.
  revalidateSettings();

  return { success: true, key };
}
