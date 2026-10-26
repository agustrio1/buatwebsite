import { ServiceForm } from "~/components/admin/service-form";
import { createService } from "../actions";

export default function NewService() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark mb-6">Tambah Layanan</h1>
      <ServiceForm action={createService} />
    </div>
  );
}
