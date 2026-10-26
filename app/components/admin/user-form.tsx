"use client";

import { useTransition } from "react";
import { Save } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input, Select, Label } from "~/components/ui/input";

type UserFormValues = {
  id?: string;
  name: string;
  email: string;
  role: "admin" | "editor";
};

export function UserForm({
  action,
  defaultValues,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: UserFormValues;
}) {
  const [isPending, startTransition] = useTransition();
  const isSubmitting = isPending;

  return (
    <form action={(formData) => startTransition(() => action(formData))} className="w-full space-y-4">
      {defaultValues?.id && <input type="hidden" name="id" value={defaultValues.id} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label className="mb-1 block">Nama</Label>
          <Input name="name" defaultValue={defaultValues?.name} required />
        </div>
        <div>
          <Label className="mb-1 block">Email</Label>
          <Input name="email" type="email" defaultValue={defaultValues?.email} required />
        </div>
        <div>
          <Label className="mb-1 block">Role</Label>
          <Select name="role" defaultValue={defaultValues?.role ?? "editor"}>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
          </Select>
        </div>
        <div>
          <Label className="mb-1 block">
            {defaultValues?.id ? "Password Baru (opsional)" : "Password"}
          </Label>
          <Input
            name="password"
            type="password"
            required={!defaultValues?.id}
            placeholder={defaultValues?.id ? "Kosongkan jika tidak diganti" : ""}
          />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        <Save size={16} /> {isSubmitting ? "Menyimpan..." : "Simpan User"}
      </Button>
    </form>
  );
}
