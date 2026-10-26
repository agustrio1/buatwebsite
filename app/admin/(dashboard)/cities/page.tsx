import { db } from "~/db";
import { cities } from "~/db/schema";
import { asc } from "drizzle-orm";
import { CitiesIndexClient, type CityRow } from "~/components/admin/cities-index-client";
import { deleteCity, bulkDeleteCities, bulkSetCitiesActive } from "./actions";

export default async function CitiesIndex() {
  const data = await db.query.cities.findMany({
    orderBy: [asc(cities.sortOrder), asc(cities.name)],
  });

  const rows: CityRow[] = data.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    province: c.province,
    isActive: c.isActive,
  }));

  return (
    <CitiesIndexClient
      rows={rows}
      deleteCityAction={deleteCity}
      bulkDeleteAction={bulkDeleteCities}
      bulkSetActiveAction={bulkSetCitiesActive}
    />
  );
}
