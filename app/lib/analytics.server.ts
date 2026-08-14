import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { db } from "~/db";
import { siteSettings } from "~/db/schema";
import { eq } from "drizzle-orm";

async function getAnalyticsClient() {
  const setting = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.key, "integrations"),
  });
  const value = setting?.value as any;
  const propertyId = value?.gaPropertyId;
  const credentialsRaw = value?.gaServiceAccountJson;

  if (!propertyId || !credentialsRaw) {
    return null;
  }

  let credentials;
  try {
    credentials = JSON.parse(credentialsRaw);
  } catch {
    console.error("[GA4] Service Account JSON tidak valid");
    return null;
  }

  const client = new BetaAnalyticsDataClient({
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
  });

  return { client, propertyId: `properties/${propertyId}` };
}

export async function getAnalyticsSummary(days = 30) {
  const ctx = await getAnalyticsClient();
  if (!ctx) return null;

  const { client, propertyId } = ctx;
  const dateRange = { startDate: `${days}daysAgo`, endDate: "today" };

  try {
    const [summaryReport] = await client.runReport({
      property: propertyId,
      dateRanges: [dateRange],
      metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }, { name: "sessions" }],
    });

    const [trendReport] = await client.runReport({
      property: propertyId,
      dateRanges: [dateRange],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    const [topPagesReport] = await client.runReport({
      property: propertyId,
      dateRanges: [dateRange],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
    });

    const [sourcesReport] = await client.runReport({
      property: propertyId,
      dateRanges: [dateRange],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 8,
    });

    const summaryRow = summaryReport.rows?.[0];

    return {
      totalUsers: Number(summaryRow?.metricValues?.[0]?.value ?? 0),
      totalPageViews: Number(summaryRow?.metricValues?.[1]?.value ?? 0),
      totalSessions: Number(summaryRow?.metricValues?.[2]?.value ?? 0),
      trend: (trendReport.rows ?? []).map((row) => ({
        date: row.dimensionValues?.[0]?.value ?? "",
        users: Number(row.metricValues?.[0]?.value ?? 0),
        pageViews: Number(row.metricValues?.[1]?.value ?? 0),
      })),
      topPages: (topPagesReport.rows ?? []).map((row) => ({
        path: row.dimensionValues?.[0]?.value ?? "",
        views: Number(row.metricValues?.[0]?.value ?? 0),
      })),
      sources: (sourcesReport.rows ?? []).map((row) => ({
        channel: row.dimensionValues?.[0]?.value ?? "",
        sessions: Number(row.metricValues?.[0]?.value ?? 0),
      })),
    };
  } catch (err) {
    console.error("[GA4] Gagal ambil data analytics:", err);
    return null;
  }
}