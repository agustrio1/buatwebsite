"use client";

import { useState, useTransition } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogCloseButton,
} from "~/components/ui/dialog";

/**
 * Tombol hapus satu baris dengan konfirmasi lewat Dialog (pengganti window.confirm).
 * Server action sudah di-bind dengan id barisnya oleh pemanggil, jadi cukup dipanggil
 * ulang saat konfirmasi. API prop dibuat kompatibel dengan pemakaian lama.
 */
export function DeleteForm({
  action,
  confirmMessage,
  title = "Hapus data?",
  className = "inline",
  buttonClassName,
  children,
}: {
  action: () => Promise<void>;
  confirmMessage: string;
  title?: string;
  className?: string;
  buttonClassName?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function close() {
    if (!isPending) setOpen(false);
  }

  function handleConfirm() {
    startTransition(async () => {
      await action();
      setOpen(false);
    });
  }

  return (
    <>
      <span className={className}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={isPending}
          className={buttonClassName}
        >
          {children}
        </button>
      </span>

      <Dialog open={open} onClose={close}>
        <DialogCloseButton onClose={close} />
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle size={18} className="shrink-0 text-rose-500" />
            {title}
          </DialogTitle>
          <DialogDescription>{confirmMessage}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Menghapus..." : "Hapus"}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
