import { notFound } from "next/navigation";
import { getPublicSettings } from "~/lib/settings.server";
import { normalizeCalculatorConfig } from "~/lib/price-calculator";
import { buildMetadata } from "~/lib/metadata";
import { KalkulatorClient } from "~/components/site/kalkulator-client";

export const revalidate = 300;

export async function generateMetadata() {
  const settings = await getPublicSettings();
  const config = normalizeCalculatorConfig(settings.price_calculator);

  // Sama seperti meta() lama yang menjaga kasus loader sudah 404.
  if (!config.enabled || config.baseItems.length === 0) {
    return { title: "Halaman tidak ditemukan" };
  }

  const siteName = settings.general?.siteName || "Website";

  return buildMetadata({
    title: `Kalkulator Harga Pembuatan Website | ${siteName}`,
    description:
      config.intro ||
      "Hitung estimasi biaya pembuatan website bisnis Anda: pilih jenis website dan fitur tambahan, lihat kisaran harganya langsung.",
    path: "/kalkulator",
  });
}

export default async function Kalkulator() {
  const settings = await getPublicSettings();
  const config = normalizeCalculatorConfig(settings.price_calculator);

  if (!config.enabled || config.baseItems.length === 0) {
    notFound();
  }

  return (
    <KalkulatorClient
      config={config}
      contact={settings.contact ?? {}}
      templates={settings.whatsapp_templates ?? {}}
    />
  );
}
