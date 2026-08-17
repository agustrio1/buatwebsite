import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import type { Route } from "./+types/root";
import { db } from "~/db";
import "./app.css";

export async function loader() {
  const rows = await db.query.siteSettings.findMany();
  const settings: Record<string, any> = {};

  for (const row of rows) {
    try {
      settings[row.key] =
        typeof row.value === "string" ? JSON.parse(row.value) : row.value;
    } catch {
      settings[row.key] = row.value;
    }
  }

  return { settings };
}

export function meta({ loaderData }: Route.MetaArgs) {
  const settings = loaderData?.settings ?? {};
  const seo = settings.seo ?? {};
  const general = settings.general ?? {};

  return [
    { title: seo.metaTitle || general.siteName || "Website" },
    {
      name: "description",
      content:
        seo.metaDescription ||
        general.siteTagline ||
        "Jasa pembuatan website profesional.",
    },
  ];
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let status = 500;
  let message = "Terjadi Kesalahan";
  let details = "Maaf, terjadi kesalahan yang tidak terduga.";

  if (isRouteErrorResponse(error)) {
    status = error.status;
    message = status === 404 ? "Halaman Tidak Ditemukan" : "Terjadi Kesalahan";
    details =
      status === 404
        ? "Halaman yang Anda cari tidak ada atau sudah dipindahkan."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
  }

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
        {import.meta.env.DEV && error instanceof Error && error.stack && (
          <pre className="mt-6 p-4 bg-slate-100 rounded-lg text-left text-xs overflow-x-auto text-slate-600">
            {error.stack}
          </pre>
        )}
      </div>
    </div>
  );
}