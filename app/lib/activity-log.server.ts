import { db } from "~/db";
import { activityLogs } from "~/db/schema";

type LogParams = {
  userId?: string | null;
  userName?: string | null;
  action: "create" | "update" | "delete";
  entityType: string;
  entityId?: string | null;
  entityLabel?: string | null;
  metadata?: Record<string, unknown>;
};

export async function logActivity(params: LogParams) {
  try {
    await db.insert(activityLogs).values({
      userId: params.userId ?? null,
      userName: params.userName ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      entityLabel: params.entityLabel ?? null,
      metadata: params.metadata ?? null,
    });
  } catch (err) {
    // Jangan sampai gagal logging bikin action utama ikut gagal
    console.error("Failed to log activity:", err);
  }
}