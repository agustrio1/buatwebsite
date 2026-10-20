import { useEffect, useRef } from "react";
import { Form, useLoaderData, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/index";
import { db } from "~/db";
import { redirects } from "~/db/schema";
import { eq, desc } from "drizzle-orm";
import { Trash2, Plus, ArrowRight } from "lucide-react";
import { invalidateRedirectCache } from "~/lib/redirects.server";

const ALLOWED_STATUS = [301, 302, 307, 308];
const PROTECTED_PREFIXES = ["/admin", "/api", "/login", "/logout", "/sitemap", "/robots.txt", "/rss.xml"];

// Hasil: path internal rapi (tanpa slash akhir), URL eksternal apa adanya, atau null kalau tidak valid
function normalizePath(raw: string, opts: { allowExternal: boolean; allowQuery: boolean }) {
  const value = raw.trim();
  if (!value) return null;

  if (/^https?:\/\//i.test(value)) {
    if (!opts.allowExternal) return null;
    try {
      return new URL(value).toString();
    } catch {
      return null;
    }
  }

  if (!value.startsWith("/") || value.startsWith("//")) return null;
  if (/\s/.test(value)) return null;
  if (!opts.allowQuery && /[?#]/.test(value)) return null;

  return value.length > 1 ? value.replace(/\/+$/, "") : value;
}

// Ikuti rantai redirect dari tujuan baru. Kalau kembali ke path asal, berarti loop.
async function wouldLoop(fromPath: string, toPath: string) {
  let current = toPath;
  for (let i = 0; i < 10; i++) {
    if (current === fromPath) return true;
    if (!current.startsWith("/")) return false;
    const next = await db.query.redirects.findFirst({ where: eq(redirects.fromPath, current) });
    if (!next) return false;
    current = next.toPath;
  }
  return true;
}

export async function loader() {
  const data = await db.query.redirects.findMany({ orderBy: [desc(redirects.createdAt)] });
  return { redirects: data };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const fromPath = normalizePath(String(formData.get("fromPath") ?? ""), {
      allowExternal: false,
      allowQuery: false,
    });
    const toPath = normalizePath(String(formData.get("toPath") ?? ""), {
      allowExternal: true,
      allowQuery: true,
    });
    const statusCode = Number(formData.get("statusCode") ?? 301);

    if (!fromPath) {
      return {
        ok: false,
        error: "Path asal harus diawali / dan tidak boleh mengandung spasi, ? atau #",
      };
    }
    if (!toPath) {
      return {
        ok: false,
        error: "Path tujuan harus diawali / atau berupa URL lengkap (https://...)",
      };
    }
    if (!ALLOWED_STATUS.includes(statusCode)) {
      return { ok: false, error: "Status code tidak valid" };
    }
    if (fromPath === "/") {
      return { ok: false, error: "Homepage tidak boleh dijadikan path asal" };
    }
    if (PROTECTED_PREFIXES.some((p) => fromPath === p || fromPath.startsWith(`${p}/`))) {
      return { ok: false, error: "Path ini dilindungi dan tidak boleh di-redirect" };
    }
    if (fromPath === toPath) {
      return { ok: false, error: "Path asal dan tujuan tidak boleh sama" };
    }

    const existing = await db.query.redirects.findFirst({ where: eq(redirects.fromPath, fromPath) });
    if (existing) {
      return { ok: false, error: "Path asal ini sudah terdaftar" };
    }

    if (await wouldLoop(fromPath, toPath)) {
      return { ok: false, error: "Redirect ini akan membuat loop. Cek redirect yang sudah ada." };
    }

    // Ratakan rantai: redirect lama yang menuju path asal ini langsung diarahkan ke tujuan baru
    await db.update(redirects).set({ toPath }).where(eq(redirects.toPath, fromPath));

    await db.insert(redirects).values({ fromPath, toPath, statusCode });
    invalidateRedirectCache();
    return { ok: true, error: null };
  }

  if (intent === "delete") {
    const id = String(formData.get("id") ?? "");
    if (!id) return { ok: false, error: "ID tidak valid" };
    await db.delete(redirects).where(eq(redirects.id, id));
    invalidateRedirectCache();
    return { ok: true, error: null };
  }

  return { ok: false, error: "Aksi tidak dikenal" };
}

export default function RedirectsIndex() {
  const { redirects: redirectList } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isCreating =
    navigation.state === "submitting" && navigation.formData?.get("intent") === "create";
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (navigation.state === "idle" && actionData?.ok) {
      formRef.current?.reset();
    }
  }, [navigation.state, actionData]);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-dark">Redirect Management</h1>
        <p className="text-sm text-slate-400 mt-1">
          Alihkan URL lama ke URL baru, mencegah 404 saat slug berubah.
        </p>
      </div>

      {actionData?.error && (
        <div className="bg-rose-50 text-rose-600 border border-rose-200 rounded-lg px-4 py-3 mb-4 text-sm">
          {actionData.error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-5">
        <Form method="post" ref={formRef} className="space-y-3">
          <input type="hidden" name="intent" value="create" />
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Dari (path lama)</label>
              <input
                name="fromPath"
                placeholder="/blog/artikel-lama"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="hidden sm:flex items-center justify-center pb-2">
              <ArrowRight size={16} className="text-slate-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Ke (path baru)</label>
              <input
                name="toPath"
                placeholder="/blog/artikel-baru"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              name="statusCode"
              defaultValue="301"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="301">301 - Permanen</option>
              <option value="302">302 - Sementara</option>
              <option value="307">307 - Sementara (method tetap)</option>
              <option value="308">308 - Permanen (method tetap)</option>
            </select>
            <button
              type="submit"
              disabled={isCreating}
              className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium ml-auto"
            >
              <Plus size={15} /> {isCreating ? "Menyimpan..." : "Tambah Redirect"}
            </button>
          </div>
        </Form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {redirectList.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm font-mono">
                <span className="text-slate-500 truncate">{r.fromPath}</span>
                <ArrowRight size={13} className="text-slate-300 shrink-0" />
                <span className="text-slate-800 truncate">{r.toPath}</span>
              </div>
              <span
                className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  r.statusCode === 301 || r.statusCode === 308
                    ? "bg-slate-100 text-slate-500"
                    : "bg-amber-50 text-amber-600"
                }`}
              >
                {r.statusCode}
              </span>
            </div>
            <Form method="post">
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="id" value={r.id} />
              <button
                type="submit"
                aria-label={`Hapus redirect ${r.fromPath}`}
                onClick={(e) => {
                  if (!confirm(`Hapus redirect "${r.fromPath}"?`)) e.preventDefault();
                }}
                className="text-slate-400 hover:text-rose-600 shrink-0 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </Form>
          </div>
        ))}
        {redirectList.length === 0 && (
          <p className="text-sm text-slate-400 italic px-4 py-6 text-center">
            Belum ada redirect terdaftar.
          </p>
        )}
      </div>
    </div>
  );
}