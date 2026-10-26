import { describe, it, expect } from "vitest";
import {
  normalizeCalculatorConfig,
  parseCalculatorConfig,
  calcTotals,
  formatRupiah,
} from "~/lib/price-calculator";

describe("normalizeCalculatorConfig", () => {
  it("mengembalikan bentuk default untuk input rusak/kosong", () => {
    const c = normalizeCalculatorConfig(undefined);
    expect(c.enabled).toBe(false);
    expect(c.rangePercent).toBe(0);
    expect(c.baseItems).toEqual([]);
    expect(c.addonItems).toEqual([]);
  });

  it("memfilter item tanpa label dan mem-bulatkan harga negatif ke 0", () => {
    const c = normalizeCalculatorConfig({
      enabled: true,
      rangePercent: 250,
      baseItems: [
        { id: "a", label: "  Landing Page  ", price: -500 },
        { id: "b", label: "   ", price: 100 }, // label kosong -> dibuang
      ],
    });
    expect(c.rangePercent).toBe(100); // dijepit max 100
    expect(c.baseItems).toHaveLength(1);
    expect(c.baseItems[0].label).toBe("Landing Page");
    expect(c.baseItems[0].price).toBe(0);
  });
});

describe("parseCalculatorConfig", () => {
  it("mem-parse JSON valid dan mengembalikan null untuk JSON rusak", () => {
    expect(parseCalculatorConfig(`{"enabled":true,"title":"X"}`)?.title).toBe("X");
    expect(parseCalculatorConfig("bukan json")).toBeNull();
  });
});

describe("calcTotals", () => {
  it("menjumlahkan base + addons lalu memberi rentang sesuai rangePercent", () => {
    const base = { id: "b", label: "B", price: 1_000_000, description: "" };
    const addons = [
      { id: "a1", label: "A1", price: 200_000, description: "" },
      { id: "a2", label: "A2", price: 300_000, description: "" },
    ];
    const withRange = calcTotals(base, addons, 10);
    expect(withRange.min).toBe(1_500_000);
    expect(withRange.max).toBe(1_650_000);

    const noRange = calcTotals(base, addons, 0);
    expect(noRange.max).toBe(noRange.min);
  });
});

describe("formatRupiah", () => {
  it("memformat dengan prefiks Rp dan pemisah ribuan id-ID", () => {
    expect(formatRupiah(1500000)).toBe("Rp1.500.000");
    expect(formatRupiah(0)).toBe("Rp0");
  });
});
