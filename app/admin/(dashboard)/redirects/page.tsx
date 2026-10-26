import { db } from "~/db";
import { redirects } from "~/db/schema";
import { desc } from "drizzle-orm";
import { RedirectsClient, type RedirectRow } from "~/components/admin/redirects-client";
import { createRedirect, deleteRedirect } from "./actions";

export default async function RedirectsIndex() {
  const data = await db.query.redirects.findMany({ orderBy: [desc(redirects.createdAt)] });

  const rows: RedirectRow[] = data.map((r) => ({
    id: r.id,
    fromPath: r.fromPath,
    toPath: r.toPath,
    statusCode: r.statusCode,
  }));

  return (
    <RedirectsClient
      rows={rows}
      createAction={createRedirect}
      deleteAction={deleteRedirect}
    />
  );
}
