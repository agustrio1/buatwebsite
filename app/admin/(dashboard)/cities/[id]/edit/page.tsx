import { notFound } from "next/navigation";
import { db } from "~/db";
import { cities } from "~/db/schema";
import { eq } from "drizzle-orm";
import { CityForm } from "~/components/admin/city-form";
import { updateCity } from "../../actions";

type Params = Promise<{ id: string }>;

export default async function EditCity({ params }: { params: Params }) {
  const { id } = await params;

  const city = await db.query.cities.findFirst({ where: eq(cities.id, id) });
  if (!city) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark mb-6">Edit Kota</h1>
      <CityForm
        action={updateCity.bind(null, city.id)}
        defaultValues={{
          ...city,
          businessTypes: city.businessTypes as string[] | null,
          relevantServices: city.relevantServices as string[] | null,
          advantages: city.advantages as string[] | null,
          serviceAreas: city.serviceAreas as string[] | null,
          faqs: city.faqs as { question: string; answer: string }[] | null,
        }}
      />
    </div>
  );
}
