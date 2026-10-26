const DEFAULT_PAGE_SIZE = 12;

/** Bentuk searchParams di App Router Next 16 (nilai bisa array atau undefined). */
export type PageParamValue = string | string[] | undefined;

/**
 * Menerima URLSearchParams (versi React Router) sekaligus object searchParams
 * milik Next, jadi semua call site lama tetap bisa dipakai.
 */
export function parsePage(
  searchParams: URLSearchParams | Record<string, PageParamValue>
) {
  const raw =
    searchParams instanceof URLSearchParams
      ? searchParams.get("page")
      : searchParams.page;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const page = Number(value ?? "1");
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export function getOffset(page: number, pageSize = DEFAULT_PAGE_SIZE) {
  return (page - 1) * pageSize;
}

export function getPagination(page: number, totalItems: number, pageSize = DEFAULT_PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  return {
    limit: pageSize,
    offset: (safePage - 1) * pageSize,
    currentPage: safePage,
    totalPages,
    totalItems,
  };
}

export { DEFAULT_PAGE_SIZE };