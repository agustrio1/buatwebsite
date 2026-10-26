import { db } from "~/db";
import { services, projects, posts, inquiries, waClicks } from "~/db/schema";
import { eq, count, desc, gte } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { getAnalyticsSummary } from "~/lib/analytics.server";
import { AdminDashboardClient } from "~/components/admin/admin-dashboard-client";

type RankRow = { name: string | null; total: number };

const RANGE_DAYS = 30;

async function getWaStats(since: Date) {
  try {
    const where = gte(waClicks.createdAt, since);

    const top = (column: AnyPgColumn) =>
      db
        .select({ name: column, total: count() })
        .from(waClicks)
        .where(where)
        .groupBy(column)
        .orderBy(desc(count()))
        .limit(5);

    const [[{ value: total }], byPage, byLabel, byMessage, bySource] = await Promise.all([
      db.select({ value: count() }).from(waClicks).where(where),
      top(waClicks.page),
      top(waClicks.label),
      top(waClicks.waText),
      top(waClicks.source),
    ]);

    return {
      total,
      byPage: byPage as RankRow[],
      byLabel: byLabel as RankRow[],
      byMessage: byMessage as RankRow[],
      bySource: bySource as RankRow[],
    };
  } catch (err) {
    // Misalnya tabel wa_clicks belum di-push. Dashboard jangan ikut error.
    console.error("[dashboard] gagal ambil statistik klik WA:", err);
    return null;
  }
}

export default async function AdminDashboard() {
  const since = new Date(Date.now() - RANGE_DAYS * 24 * 60 * 60 * 1000);

  const [
    [{ value: servicesCount }],
    [{ value: projectsCount }],
    [{ value: postsCount }],
    [{ value: publishedPostsCount }],
    [{ value: newInquiriesCount }],
    [{ value: recentInquiriesCount }],
    recentInquiries,
    analytics,
    waStats,
  ] = await Promise.all([
    db.select({ value: count() }).from(services),
    db.select({ value: count() }).from(projects),
    db.select({ value: count() }).from(posts),
    db.select({ value: count() }).from(posts).where(eq(posts.status, "published")),
    db.select({ value: count() }).from(inquiries).where(eq(inquiries.status, "new")),
    db.select({ value: count() }).from(inquiries).where(gte(inquiries.createdAt, since)),
    db.query.inquiries.findMany({
      orderBy: [desc(inquiries.createdAt)],
      limit: 5,
    }),
    getAnalyticsSummary(30),
    getWaStats(since),
  ]);

  // Hanya kolom yang dibutuhkan klien; Date tidak ikut diserialisasi.
  const recentInquiriesSlim = recentInquiries.map((inq) => ({
    id: inq.id,
    name: inq.name,
    email: inq.email,
    phone: inq.phone,
    status: inq.status,
  }));

  return (
    <AdminDashboardClient
      servicesCount={servicesCount}
      projectsCount={projectsCount}
      postsCount={postsCount}
      publishedPostsCount={publishedPostsCount}
      newInquiriesCount={newInquiriesCount}
      recentInquiriesCount={recentInquiriesCount}
      recentInquiries={recentInquiriesSlim}
      analytics={analytics}
      waStats={waStats}
    />
  );
}
