import { db } from "~/db";
import { projects } from "~/db/schema";
import { desc, count, and, or, ilike, eq } from "drizzle-orm";
import { parsePage, getPagination } from "~/lib/pagination";
import { Pagination } from "~/components/shared/pagination";
import { ProjectsIndexClient, type ProjectRow } from "~/components/admin/projects-index-client";
import { deleteProject, bulkDeleteProjects, bulkSetProjectsFeatured } from "./actions";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ProjectsIndex({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = parsePage(sp);
  const q = String(sp.q ?? "").trim();
  const featuredFilter = String(sp.featured ?? "");

  const conditions = [];
  if (q) {
    conditions.push(or(ilike(projects.title, `%${q}%`), ilike(projects.clientName, `%${q}%`)));
  }
  if (featuredFilter === "yes") conditions.push(eq(projects.isFeatured, true));
  if (featuredFilter === "no") conditions.push(eq(projects.isFeatured, false));
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ value: totalItems }] = await db
    .select({ value: count() })
    .from(projects)
    .where(whereClause);
  const { limit, offset, currentPage, totalPages } = getPagination(page, totalItems, 12);

  const data = await db.query.projects.findMany({
    where: whereClause,
    orderBy: [desc(projects.createdAt)],
    limit,
    offset,
  });

  const rows: ProjectRow[] = data.map((p) => ({
    id: p.id,
    title: p.title,
    clientName: p.clientName,
    coverImageUrl: p.coverImageUrl,
    techStack: p.techStack,
  }));

  return (
    <div>
      <ProjectsIndexClient
        rows={rows}
        q={q}
        featuredFilter={featuredFilter}
        deleteProjectAction={deleteProject}
        bulkDeleteAction={bulkDeleteProjects}
        bulkSetFeaturedAction={bulkSetProjectsFeatured}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/admin/projects"
        searchParams={sp}
      />
    </div>
  );
}
