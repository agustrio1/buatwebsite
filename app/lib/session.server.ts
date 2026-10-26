import { createHash } from "node:crypto";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type SessionData = {
  userId: string;
  role: "admin" | "editor";
};

// iron-session mewajibkan password minimal 32 karakter, sedangkan
// SESSION_SECRET di .env bisa lebih pendek. Diturunkan lewat SHA-256 supaya
// panjangnya selalu 64 karakter hex dan tidak perlu mengubah .env.
// Gagal cepat kalau secret kosong: jangan fallback ke string kosong yang
// ter-hash jadi konstanta publik (e3b0c442...) — itu membuat session bisa
// dipalsukan siapa pun tanpa memunculkan error saat start.
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET belum diset (lihat .env) — wajib untuk keamanan session.");
}
const sessionPassword = createHash("sha256").update(sessionSecret).digest("hex");

const sessionOptions = {
  cookieName: "__session",
  password: sessionPassword,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

/**
 * Versi Next dari createUserSession(): hanya menyimpan session.
 * Redirect dilakukan pemanggilnya (`redirect(redirectTo)`), karena
 * Server Action tidak boleh mengembalikan Response.
 */
export async function createUserSession(userId: string, role: "admin" | "editor") {
  const session = await getSession();
  session.userId = userId;
  session.role = role;
  await session.save();
}

export async function requireAdmin() {
  const session = await getSession();

  if (!session.userId || !session.role) {
    redirect("/login");
  }

  return { userId: session.userId, role: session.role };
}

export async function logout() {
  const session = await getSession();
  session.destroy();
}
