import { db } from "~/db";
import { posts, categories } from "~/db/schema";
import { desc, count, and, ilike, eq, asc } from "drizzle-orm";
import { parsePage, getPagination } from "~/lib/pagination";
import { Pagination } from "~/components/shared/pagination";
import { PostsIndexClient, type PostRow } from "~/components/admin/posts-index-client";
import { deletePost, bulkDeletePosts } from "./actions";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function PostsIndex({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = parsePage(sp);
  const q = String(sp.q ?? "").trim();
  const statusFilter = String(sp.status ?? "");
  const categoryFilter = String(sp.category ?? "");

  const conditions = [];
  if (q) conditions.push(ilike(posts.title, `%${q}%`));
  if (statusFilter === "draft" || statusFilter === "published") {
    conditions.push(eq(posts.status, statusFilter));
  }
  if (categoryFilter) conditions.push(eq(posts.categoryId, categoryFilter));
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ value: totalItems }] = await db.select({ value: count() }).from(posts).where(whereClause);
  const { limit, offset, currentPage, totalPages } = getPagination(page, totalItems, 10);

  const data = await db.query.posts.findMany({
    where: whereClause,
    orderBy: [desc(posts.createdAt)],
    with: { category: true, author: true },
    limit,
    offset,
  });

  const categoryList = await db.query.categories.findMany({ orderBy: [asc(categories.name)] });

  const rows: PostRow[] = data.map((p) => ({
    id: p.id,
    title: p.title,
    categoryName: p.category?.name ?? null,
    status: p.status,
    authorName: p.author?.name ?? null,
  }));

  return (
    <div>
      <PostsIndexClient
        rows={rows}
        categoryList={categoryList}
        q={q}
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        deletePostAction={deletePost}
        bulkDeleteAction={bulkDeletePosts}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/admin/posts"
        searchParams={sp}
      />
    </div>
  );
}
