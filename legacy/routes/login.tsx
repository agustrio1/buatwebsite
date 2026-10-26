import { Form, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/login";
import { db } from "~/db";
import { users } from "~/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createUserSession } from "~/lib/session.server";
import { loginRateLimiter, checkRateLimit, getClientIp } from "~/lib/rate-limit.server";
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

export async function action({ request }: Route.ActionArgs) {
  const ip = getClientIp(request);
  const limitError = await checkRateLimit(loginRateLimiter, ip);
  if (limitError) {
    return { error: limitError };
  }

  const formData = await request.formData();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) return { error: "Email atau password salah" };

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return { error: "Email atau password salah" };

  return createUserSession(user.id, user.role, "/admin");
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen flex bg-white">
      {/* Panel kiri — identitas brand, tersembunyi di mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-brand-dark">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl" />

        <div className="relative flex flex-col justify-between p-12 xl:p-16 w-full">
          <span className="text-white font-bold text-lg tracking-tight">jadikanweb.id</span>

          <div className="max-w-sm">
            {/* Mockup jendela browser sebagai elemen signature */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden shadow-2xl mb-10">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/10">
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
              </div>
              <div className="p-5 space-y-2.5">
                <div className="h-2.5 w-3/4 rounded-full bg-brand-500/60" />
                <div className="h-2 w-full rounded-full bg-white/10" />
                <div className="h-2 w-5/6 rounded-full bg-white/10" />
                <div className="flex gap-2 pt-2">
                  <div className="h-8 w-24 rounded-lg bg-brand-500/80" />
                  <div className="h-8 w-16 rounded-lg bg-white/10" />
                </div>
              </div>
            </div>

            <h1 className="text-white text-2xl xl:text-3xl font-bold leading-snug">
              Kelola website klien Anda dari satu tempat.
            </h1>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Panel admin untuk mengatur layanan, portofolio, artikel, dan inquiry yang masuk.
            </p>
          </div>

          <p className="text-slate-500 text-xs">© {new Date().getFullYear()} jadikanweb.id</p>
        </div>
      </div>

      {/* Panel kanan — form login */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 text-center">
            <span className="text-brand-dark font-bold text-lg">jadikanweb.id</span>
          </div>

          <h2 className="text-2xl font-bold text-brand-dark">Masuk ke Admin</h2>
          <p className="text-slate-500 text-sm mt-1.5">
            Masukkan email dan password akun admin Anda.
          </p>

          {actionData?.error && (
            <div className="mt-6 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{actionData.error}</span>
            </div>
          )}

          <Form method="post" className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="nama@perusahaan.com"
                  className="w-full border border-slate-300 rounded-lg pl-10 pr-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-shadow"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full border border-slate-300 rounded-lg pl-10 pr-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-shadow"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/60 text-white font-medium rounded-lg px-4 py-2.5 text-sm transition-colors mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}