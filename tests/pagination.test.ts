import { describe, it, expect } from "vitest";
import {
  parsePage,
  getOffset,
  getPagination,
  DEFAULT_PAGE_SIZE,
} from "~/lib/pagination";

describe("pagination", () => {
  it("parsePage membaca nilai page dari searchParams Next & URLSearchParams", () => {
    expect(parsePage({})).toBe(1);
    expect(parsePage({ page: "3" })).toBe(3);
    expect(parsePage({ page: ["5", "6"] })).toBe(5); // nilai array ambil yang pertama
    expect(parsePage(new URLSearchParams("page=7"))).toBe(7);
  });

  it("parsePage menolak nilai tidak valid dan kembali ke 1", () => {
    expect(parsePage({ page: "abc" })).toBe(1);
    expect(parsePage({ page: "0" })).toBe(1);
    expect(parsePage({ page: "-4" })).toBe(1);
    expect(parsePage({ page: "2.9" })).toBe(2); // floor
  });

  it("getOffset memakai pageSize default dan custom", () => {
    expect(getOffset(1)).toBe(0);
    expect(getOffset(3)).toBe(2 * DEFAULT_PAGE_SIZE);
    expect(getOffset(2, 10)).toBe(10);
  });

  it("getPagination menghitung totalPages & menjepit halaman ke rentang valid", () => {
    const p = getPagination(1, 100, 12);
    expect(p.totalPages).toBe(9);
    expect(p.limit).toBe(12);

    const clamped = getPagination(999, 100, 12);
    expect(clamped.currentPage).toBe(9);
    expect(clamped.offset).toBe((9 - 1) * 12);

    // totalItems 0 tetap minimal 1 halaman.
    expect(getPagination(1, 0, 12).totalPages).toBe(1);
  });
});
