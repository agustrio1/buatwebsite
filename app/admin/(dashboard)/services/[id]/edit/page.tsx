import { notFound } from "next/navigation";
import { db } from "~/db";
import { services, serviceFeatures } from "~/db/schema";
import { eq, asc } from "drizzle-orm";
import { ServiceForm } from "~/components/admin/service-form";
import { updateService } from "../../actions";

type Params = Promise<{ id: string }>;

export default async function EditService({ params }: { params: Params }) {
  const { id } = await params;

  const service = await db.query.services.findFirst({
    where: eq(services.id, id),
    with: { features: { orderBy: [asc(serviceFeatures.sortOrder)] } },
  });

  if (!service) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark mb-6">Edit Layanan</h1>
      <ServiceForm
        action={updateService.bind(null, service.id)}
        defaultValues={{
          id: service.id,
          title: service.title,
          slug: service.slug,
          summary: service.summary,
          isPriceVisible: service.isPriceVisible,
          priceAmount: service.priceAmount,
          priceLabel: service.priceLabel,
          priceUnit: service.priceUnit,
          badge: service.badge,
          isFeatured: service.isFeatured,
          sortOrder: service.sortOrder,
          features: service.features,
        }}
      />
    </div>
  );
}
