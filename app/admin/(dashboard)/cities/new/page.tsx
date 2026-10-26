import { CityForm } from "~/components/admin/city-form";
import { createCity } from "../actions";

export default function NewCity() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark mb-6">Tambah Kota</h1>
      <CityForm action={createCity} />
    </div>
  );
}
