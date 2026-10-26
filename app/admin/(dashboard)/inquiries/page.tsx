import { db } from "~/db";
import { inquiries } from "~/db/schema";
import { eq, desc, and, or, ilike } from "drizzle-orm";
import { InquiriesIndexClient, type InquiryRow } from "~/components/admin/inquiries-index-client";
import {
  updateInquiryStatus,
  deleteInquiry,
  bulkDeleteInquiries,
  bulkUpdateInquiryStatus,
} from "./actions";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function InquiriesIndex({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = String(sp.q ?? "").trim();
  const statusFilter = String(sp.status ?? "");

  const conditions = [];
  if (q) {
    conditions.push(
      or(
        ilike(inquiries.name, `%${q}%`),
        ilike(inquiries.email, `%${q}%`),
        ilike(inquiries.phone, `%${q}%`)
      )
    );
  }
  if (statusFilter === "new" || statusFilter === "contacted" || statusFilter === "closed") {
    conditions.push(eq(inquiries.status, statusFilter));
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const data = await db.query.inquiries.findMany({
    where: whereClause,
    orderBy: [desc(inquiries.createdAt)],
  });

  const rows: InquiryRow[] = data.map((inq) => ({
    id: inq.id,
    name: inq.name,
    email: inq.email,
    phone: inq.phone,
    companyName: inq.companyName,
    serviceType: inq.serviceType,
    message: inq.message,
    budget: inq.budget,
    source: inq.source,
    status: inq.status,
  }));

  return (
    <InquiriesIndexClient
      rows={rows}
      q={q}
      statusFilter={statusFilter}
      updateStatusAction={updateInquiryStatus}
      deleteAction={deleteInquiry}
      bulkDeleteAction={bulkDeleteInquiries}
      bulkStatusAction={bulkUpdateInquiryStatus}
    />
  );
}
