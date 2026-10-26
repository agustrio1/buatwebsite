import { UserForm } from "~/components/admin/user-form";
import { createUser } from "../actions";

export default function NewUser() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark mb-6">Tambah User</h1>
      <UserForm action={createUser} />
    </div>
  );
}
