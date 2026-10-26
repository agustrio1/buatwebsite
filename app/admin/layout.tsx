import type { Metadata } from "next";
import { db } from "~/db";
import { requireAdmin } from "~/lib/session.server";
import { AdminShell } from "~/components/admin/admin-shell";
import { logoutAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Panel",
  robots: { index: false, follow: false },
};

/**
 * Padanan admin/layout.tsx versi React Router. Guard dipindah ke sini (server);
 * bagian interaktif sidebar/header ada di AdminShell (client). Outlet context
 * { role, userId } tidak diperlukan lagi: tiap halaman admin memanggil
 * requireAdmin() sendiri saat butuh (mis. untuk logActivity).
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role } = await requireAdmin();

  const settingsRows = await db.query.siteSettings.findMany();
  const settingsMap = Object.fromEntries(settingsRows.map((s) => [s.key, s.value]));
  const general = (settingsMap["general"] as Record<string, any>) ?? {};
  const brandIconUrl: string | undefined = general.iconUrl ?? general.logoUrl ?? undefined;
  const siteName: string = general.siteName ?? "Admin Panel";

  return (
    <AdminShell role={role} siteName={siteName} brandIconUrl={brandIconUrl} logoutAction={logoutAction}>
      {children}
    </AdminShell>
  );
}
