import { db } from "~/db";
import { services } from "~/db/schema";
import { asc, count } from "drizzle-orm";
import { parsePage, getPagination } from "~/lib/pagination";
import { Pagination } from "~/components/shared/pagination";
import { ServicesIndexClient, type ServiceRow } from "~/components/admin/services-index-client";
import { deleteService, bulkDeleteServices, bulkSetServicesFeatured } from "./actions";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ServicesIndex({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = parsePage(sp);

  const [{ value: totalItems }] = await db.select({ value: count() }).from(services);
  const { limit, offset, currentPage, totalPages } = getPagination(page, totalItems, 10);

  const data = await db.query.services.findMany({
    orderBy: [asc(services.sortOrder)],
    limit,
    offset,
  });

  const rows: ServiceRow[] = data.map((s) => ({
    id: s.id,
    title: s.title,
    isPriceVisible: s.isPriceVisible,
    priceLabel: s.priceLabel,
    priceAmount: s.priceAmount,
    priceUnit: s.priceUnit,
    badge: s.badge,
    isFeatured: s.isFeatured,
    sortOrder: s.sortOrder,
  }));

  return (
    <div>
      <ServicesIndexClient
        rows={rows}
        deleteServiceAction={deleteService}
        bulkDeleteAction={bulkDeleteServices}
        bulkSetFeaturedAction={bulkSetServicesFeatured}
      />
      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/admin/services" searchParams={sp} />
    </div>
  );
}
