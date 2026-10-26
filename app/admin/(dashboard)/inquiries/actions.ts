"use server";

import { revalidatePath } from "next/cache";
import { eq, inArray } from "drizzle-orm";
import { db } from "~/db";
import { inquiries } from "~/db/schema";
import { requireAdmin } from "~/lib/session.server";
import { logActivity } from "~/lib/activity-log.server";

type InquiryStatus = "new" | "contacted" | "closed";

function revalidate() {
  revalidatePath("/admin/inquiries");
}

export async function updateInquiryStatus(id: string, status: string) {
  await requireAdmin();
  await db.update(inquiries).set({ status: status as InquiryStatus }).where(eq(inquiries.id, id));
  const inq = await db.query.inquiries.findFirst({ where: eq(inquiries.id, id) });
  await logActivity({
    action: "update",
    entityType: "inquiry",
    entityId: id,
    entityLabel: inq?.name,
    metadata: { newStatus: status },
  });
  revalidate();
}

export async function deleteInquiry(id: string) {
  await requireAdmin();
  const inq = await db.query.inquiries.findFirst({ where: eq(inquiries.id, id) });
  await db.delete(inquiries).where(eq(inquiries.id, id));
  await logActivity({
    action: "delete",
    entityType: "inquiry",
    entityId: id,
    entityLabel: inq?.name,
  });
  revalidate();
}

export async function bulkDeleteInquiries(ids: string[]) {
  await requireAdmin();
  if (ids.length === 0) return;
  const rows = await db.query.inquiries.findMany({ where: inArray(inquiries.id, ids) });
  await db.delete(inquiries).where(inArray(inquiries.id, ids));
  for (const row of rows) {
    await logActivity({
      action: "delete",
      entityType: "inquiry",
      entityId: row.id,
      entityLabel: row.name,
    });
  }
  revalidate();
}

export async function bulkUpdateInquiryStatus(ids: string[], status: string) {
  await requireAdmin();
  if (ids.length === 0) return;
  await db
    .update(inquiries)
    .set({ status: status as InquiryStatus })
    .where(inArray(inquiries.id, ids));
  const rows = await db.query.inquiries.findMany({ where: inArray(inquiries.id, ids) });
  for (const row of rows) {
    await logActivity({
      action: "update",
      entityType: "inquiry",
      entityId: row.id,
      entityLabel: row.name,
      metadata: { newStatus: status },
    });
  }
  revalidate();
}
