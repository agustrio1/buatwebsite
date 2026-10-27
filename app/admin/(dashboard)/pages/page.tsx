import Link from "next/link";
import { db } from "~/db";
import { pages } from "~/db/schema";
import { desc, count, and, ilike, eq } from "drizzle-orm";
import { parsePage, getPagination } from "~/lib/pagination";
import { Pagination } from "~/components/shared/pagination";
import { buttonVariants } from "~/components/ui/button";
import { PagesIndexClient, type PageRow } from "~/components/admin/pages-index-client";
import { deletePage } from "./actions";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function PagesIndex({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = parsePage(sp);
  const q = String(sp.q ?? "").trim();
  const statusFilter = String(sp.status ?? "");

  const conditions = [];
  if (q) conditions.push(ilike(pages.title, `%${q}%`));
  if (statusFilter === "draft" || statusFilter === "published") {
    conditions.push(eq(pages.status, statusFilter));
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ value: totalItems }] = await db.select({ value: count() }).from(pages).where(whereClause);
  const { limit, offset, currentPage, totalPages } = getPagination(page, totalItems, 10);

  const data = await db.query.pages.findMany({
    where: whereClause,
    orderBy: [desc(pages.updatedAt)],
    limit,
    offset,
  });

  const rows: PageRow[] = data.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    status: p.status,
    updatedAt: p.updatedAt,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-brand-dark">Halaman Custom</h1>
        <Link href="/admin/pages/new" className={buttonVariants()}>
          + Buat Halaman
        </Link>
      </div>

      <PagesIndexClient rows={rows} q={q} statusFilter={statusFilter} deletePageAction={deletePage} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/admin/pages"
        searchParams={sp}
      />
    </div>
  );
}
