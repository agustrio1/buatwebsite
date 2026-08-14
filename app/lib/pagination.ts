const DEFAULT_PAGE_SIZE = 12;

export function parsePage(searchParams: URLSearchParams) {
  const page = Number(searchParams.get("page") ?? "1");
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
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