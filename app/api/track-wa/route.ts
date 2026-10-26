import { isbot } from "isbot";
import { db } from "~/db";
import { waClicks } from "~/db/schema";

function clip(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  return v ? v.slice(0, max) : null;
}

// Padanan action() di routes/api/track-wa.tsx lama: catat klik WA, abaikan bot.
export async function POST(request: Request) {
  // Bot tidak dihitung
  if (isbot(request.headers.get("user-agent") ?? "")) {
    return new Response(null, { status: 204 });
  }

  let data: any;
  try {
    data = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const page = clip(data?.page, 500);
  if (!page) return new Response(null, { status: 400 });

  try {
    await db.insert(waClicks).values({
      page,
      label: clip(data?.label, 255),
      waText: clip(data?.waText, 500),
      source: clip(data?.source, 255),
    });
  } catch (err) {
    console.error("[track-wa] gagal simpan:", err);
  }

  return new Response(null, { status: 204 });
}
