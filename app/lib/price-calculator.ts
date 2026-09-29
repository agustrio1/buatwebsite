export type CalcItem = {
  id: string;
  label: string;
  price: number;
  description: string;
};

export type CalcConfig = {
  enabled: boolean;
  title: string;
  intro: string;
  note: string;
  rangePercent: number;
  baseItems: CalcItem[];
  addonItems: CalcItem[];
};

const MAX_ITEMS = 30;

function normalizeItems(input: unknown, prefix: string): CalcItem[] {
  if (!Array.isArray(input)) return [];
  return input
    .slice(0, MAX_ITEMS)
    .map((raw: any, i) => ({
      id: String(raw?.id || `${prefix}-${i + 1}`).slice(0, 50),
      label: String(raw?.label ?? "").trim().slice(0, 100),
      price: Math.max(0, Math.round(Number(raw?.price) || 0)),
      description: String(raw?.description ?? "").trim().slice(0, 200),
    }))
    .filter((item) => item.label);
}

/** Bentuk aman dari data settings mentah (boleh undefined / rusak). */
export function normalizeCalculatorConfig(raw: any): CalcConfig {
  return {
    enabled: raw?.enabled === true,
    title: String(raw?.title ?? "").trim().slice(0, 150),
    intro: String(raw?.intro ?? "").trim().slice(0, 500),
    note: String(raw?.note ?? "").trim().slice(0, 500),
    rangePercent: Math.min(100, Math.max(0, Math.round(Number(raw?.rangePercent) || 0))),
    baseItems: normalizeItems(raw?.baseItems, "base"),
    addonItems: normalizeItems(raw?.addonItems, "addon"),
  };
}

export function parseCalculatorConfig(json: string): CalcConfig | null {
  try {
    return normalizeCalculatorConfig(JSON.parse(json));
  } catch {
    return null;
  }
}

export function formatRupiah(amount: number): string {
  return `Rp${Math.round(amount).toLocaleString("id-ID")}`;
}

export function calcTotals(base: CalcItem, addons: CalcItem[], rangePercent: number) {
  const min = base.price + addons.reduce((sum, a) => sum + a.price, 0);
  const max = rangePercent > 0 ? Math.round(min * (1 + rangePercent / 100)) : min;
  return { min, max };
}