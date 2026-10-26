import { Suspense } from "react";
import { db } from "~/db";
import { SettingsClient } from "~/components/admin/settings-client";

export default async function SettingsIndex() {
  const rows = await db.query.siteSettings.findMany();
  const settings: Record<string, any> = {};
  for (const row of rows) settings[row.key] = row.value;

  return (
    <Suspense fallback={null}>
      <SettingsClient settings={settings} />
    </Suspense>
  );
}
