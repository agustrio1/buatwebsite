"use client";

import { useTransition } from "react";

/**
 * Padanan <Form method="post"> lama untuk aksi hapus satu baris. Server action
 * sudah di-bind dengan id barisnya di Server Component, jadi tidak perlu hidden
 * input/nama intent lagi. Konfirmasi sebelum submit dipertahankan persis.
 */
export function DeleteForm({
  action,
  confirmMessage,
  className = "inline",
  buttonClassName,
  children,
}: {
  action: () => Promise<void>;
  confirmMessage: string;
  className?: string;
  buttonClassName?: string;
  children: React.ReactNode;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        if (!window.confirm(confirmMessage)) return;
        startTransition(() => action());
        return Promise.resolve();
      }}
      className={className}
    >
      <button type="submit" disabled={isPending} className={buttonClassName}>
        {children}
      </button>
    </form>
  );
}
