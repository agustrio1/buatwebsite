import { ImageResponse } from "next/og";

// Fallback og:image untuk halaman yang tidak punya gambar OG khusus.
// Dipakai lewat helper ogUrl() di ~/lib/seo — ukuran 1200x630 (rasio 1.91:1).
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const title = (url.searchParams.get("title") ?? "JadikanWeb").slice(0, 120);
  const subtitle = (url.searchParams.get("subtitle") ?? "").slice(0, 160);
  const label = (url.searchParams.get("label") ?? "JadikanWeb").slice(0, 40);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0f2a43 0%, #143c21 55%, #0f2a43 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* aksen */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 10,
            background: "linear-gradient(90deg, #f97316, #fbbf24)",
          }}
        />
        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#fdba74",
            marginBottom: 24,
            display: "flex",
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.15, display: "flex", flexWrap: "wrap" }}>
          {title.split(" ").map((word, i) => (
            <div key={i} style={{ display: "flex", marginRight: 16 }}>
              {word}
            </div>
          ))}
        </div>
        {subtitle ? (
          <div style={{ fontSize: 30, color: "#cbd5e1", marginTop: 28, lineHeight: 1.4, display: "flex" }}>
            {subtitle}
          </div>
        ) : null}
        <div style={{ fontSize: 24, color: "#94a3b8", marginTop: "auto", display: "flex" }}>
          jadikanweb.id — Jasa Pembuatan Website & Digital Marketing
        </div>
      </div>
    ),
    { ...size, headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } }
  );
}
