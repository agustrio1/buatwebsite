import { ilike, or } from "drizzle-orm";
import { db } from "~/db";
import { cities, inquiries, posts, projects, redirects, services, users } from "~/db/schema";
import { requireAdmin } from "~/lib/session.server";

// Cari lintas resource untuk command palette admin. Hanya untuk admin.
// Tiap grup dibatasi 5 hasil. Bentuk respons: { groups: [{ type, items: [...] }] }.

type Item = { id: string; label: string; sublabel?: string; href: string };
type Group = { type: string; label: string; items: Item[] };

function like(q: string) {
  // Escape wildcard ILIKE agar pencarian harfiah.
  return `%${q.replace(/[\\%_]/g, (m) => "\\" + m)}%`;
}

export async function GET(request: Request) {
  await requireAdmin();

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return Response.json({ groups: [] as Group[] });
  }

  const term = like(q);

  const [postRows, projectRows, serviceRows, cityRows, userRows, inquiryRows, redirectRows] =
    await Promise.all([
      db
        .select({ id: posts.id, title: posts.title, slug: posts.slug })
        .from(posts)
        .where(or(ilike(posts.title, term), ilike(posts.slug, term)))
        .orderBy(posts.id)
        .limit(5),
      db
        .select({ id: projects.id, title: projects.title, slug: projects.slug })
        .from(projects)
        .where(or(ilike(projects.title, term), ilike(projects.slug, term)))
        .orderBy(projects.id)
        .limit(5),
      db
        .select({ id: services.id, title: services.title, slug: services.slug })
        .from(services)
        .where(or(ilike(services.title, term), ilike(services.slug, term)))
        .orderBy(services.id)
        .limit(5),
      db
        .select({ id: cities.id, name: cities.name, slug: cities.slug })
        .from(cities)
        .where(or(ilike(cities.name, term), ilike(cities.slug, term)))
        .orderBy(cities.id)
        .limit(5),
      db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(or(ilike(users.name, term), ilike(users.email, term)))
        .orderBy(users.id)
        .limit(5),
      db
        .select({ id: inquiries.id, name: inquiries.name, email: inquiries.email })
        .from(inquiries)
        .where(or(ilike(inquiries.name, term), ilike(inquiries.email, term)))
        .orderBy(inquiries.id)
        .limit(5),
      db
        .select({ id: redirects.id, fromPath: redirects.fromPath, toPath: redirects.toPath })
        .from(redirects)
        .where(or(ilike(redirects.fromPath, term), ilike(redirects.toPath, term)))
        .limit(5),
    ]);

  const groups: Group[] = [
    {
      type: "posts",
      label: "Artikel",
      items: postRows.map((r) => ({ id: r.id, label: r.title, sublabel: `/${r.slug}`, href: `/admin/posts/${r.id}/edit` })),
    },
    {
      type: "projects",
      label: "Projek",
      items: projectRows.map((r) => ({ id: r.id, label: r.title, sublabel: `/${r.slug}`, href: `/admin/projects/${r.id}/edit` })),
    },
    {
      type: "services",
      label: "Layanan",
      items: serviceRows.map((r) => ({ id: r.id, label: r.title, sublabel: `/${r.slug}`, href: `/admin/services/${r.id}/edit` })),
    },
    {
      type: "cities",
      label: "Kota",
      items: cityRows.map((r) => ({ id: r.id, label: r.name, sublabel: `/${r.slug}`, href: `/admin/cities/${r.id}/edit` })),
    },
    {
      type: "users",
      label: "Users",
      items: userRows.map((r) => ({ id: r.id, label: r.name, sublabel: r.email, href: `/admin/users/${r.id}/edit` })),
    },
    {
      type: "inquiries",
      label: "Inquiries",
      items: inquiryRows.map((r) => ({ id: r.id, label: r.name, sublabel: r.email ?? undefined, href: `/admin/inquiries` })),
    },
    {
      type: "redirects",
      label: "Redirects",
      items: redirectRows.map((r) => ({ id: r.id, label: r.fromPath, sublabel: `→ ${r.toPath}`, href: `/admin/redirects` })),
    },
  ].filter((g) => g.items.length > 0);

  return Response.json({ groups });
}
