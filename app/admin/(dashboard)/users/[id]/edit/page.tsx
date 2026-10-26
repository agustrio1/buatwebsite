import { notFound } from "next/navigation";
import { db } from "~/db";
import { users } from "~/db/schema";
import { eq } from "drizzle-orm";
import { UserForm } from "~/components/admin/user-form";
import { updateUser } from "../../actions";

type Params = Promise<{ id: string }>;

export default async function EditUser({ params }: { params: Params }) {
  const { id } = await params;

  const user = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!user) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark mb-6">Edit User</h1>
      <UserForm
        action={updateUser.bind(null, user.id)}
        defaultValues={{ id: user.id, name: user.name, email: user.email, role: user.role }}
      />
    </div>
  );
}
