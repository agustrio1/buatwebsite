"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw, LogOut } from "lucide-react";
import { buttonVariants } from "~/lib/button-variants";

/**
 * Error boundary khusus segment admin. Dibungkus AdminShell, jadi sidebar/header
 * tetap ada saat terjadi error di salah satu halaman dashboard. `reset` dari Next
 * memungkinkan retry tanpa reload penuh.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
          <AlertTriangle size={28} />
        </div>
        <p className="text-3xl font-bold text-brand-dark">Terjadi kesalahan</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {process.env.NODE_ENV === "development" && error.message
            ? error.message
            : "Maaf, terjadi kesalahan yang tidak terduga pada halaman ini."}
        </p>
        {error.digest && (
          <p className="mt-1 text-xs text-slate-400">Ref: {error.digest}</p>
        )}
        <div className="mt-6 flex items-center justify-center gap-2">
          <button type="button" onClick={reset} className={buttonVariants()}>
            <RotateCw size={15} /> Coba lagi
          </button>
          <a href="/admin" className={buttonVariants({ variant: "outline" })}>
            <LogOut size={15} /> ke Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
