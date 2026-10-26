"use client";

import { useEffect } from "react";

/**
 * Padanan ErrorBoundary di root.tsx versi React Router. UI-nya dijaga persis
 * sama; hanya sumber status yang berubah (Next tidak mengenal
 * isRouteErrorResponse di error boundary).
 */
function ErrorView({
  status,
  message,
  details,
  stack,
}: {
  status: number;
  message: string;
  details: string;
  stack?: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center max-w-md">
        <p className="text-brand-500 font-bold text-6xl">{status}</p>
        <h1 className="text-2xl font-bold text-brand-dark mt-4">{message}</h1>
        <p className="text-slate-500 mt-2 leading-relaxed">{details}</p>

        <a
          href="/"
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium px-6 py-3 rounded-full mt-6 transition-colors"
        >
          Kembali ke Beranda
        </a>
        {stack && (
          <pre className="mt-6 p-4 bg-slate-100 rounded-lg text-left text-xs overflow-x-auto text-slate-600">
            {stack}
          </pre>
        )}
      </div>
    </div>
  );
}

export default function Error({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorView
      status={500}
      message="Terjadi Kesalahan"
      details={
        process.env.NODE_ENV === "development" && error.message
          ? error.message
          : "Maaf, terjadi kesalahan yang tidak terduga."
      }
      stack={
        process.env.NODE_ENV === "development" ? error.stack : undefined
      }
    />
  );
}
