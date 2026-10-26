import { Form, useNavigation } from "react-router";
import { Save } from "lucide-react";

type UserFormValues = {
  id?: string;
  name: string;
  email: string;
  role: "admin" | "editor";
};

export function UserForm({ defaultValues }: { defaultValues?: UserFormValues }) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Form method="post" className="space-y-4 max-w-md">
      {defaultValues?.id && <input type="hidden" name="id" value={defaultValues.id} />}

      <div>
        <label className="block text-sm font-medium mb-1">Nama</label>
        <input
          name="name"
          defaultValue={defaultValues?.name}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          name="email"
          type="email"
          defaultValue={defaultValues?.email}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Role</label>
        <select
          name="role"
          defaultValue={defaultValues?.role ?? "editor"}
          className="w-full border rounded px-3 py-2 bg-white"
        >
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          {defaultValues?.id ? "Password Baru (opsional)" : "Password"}
        </label>
        <input
          name="password"
          type="password"
          required={!defaultValues?.id}
          placeholder={defaultValues?.id ? "Kosongkan jika tidak diganti" : ""}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white px-5 py-2.5 rounded"
      >
        <Save size={16} /> {isSubmitting ? "Menyimpan..." : "Simpan User"}
      </button>
    </Form>
  );
}