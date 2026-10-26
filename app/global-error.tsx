"use client";

/**
 * Boundary terakhir: kalau root layout itu sendiri yang error, file ini yang
 * merender <html>/<body> dari nol. Versi React Router tidak punya kasus seperti
 * ini (Layout-nya tidak pernah fetch), jadi ini murni jaring pengaman — styling
 * mengikuti ErrorBoundary lama seadanya tanpa dependensi pada globals.css.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body style={{ margin: 0, background: "#fff" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 1rem",
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: "28rem" }}>
            <p style={{ color: "#f97316", fontWeight: 700, fontSize: "3.75rem", margin: 0 }}>
              500
            </p>
            <h1 style={{ color: "#0f172a", fontWeight: 700, fontSize: "1.5rem", marginTop: "1rem" }}>
              Terjadi Kesalahan
            </h1>
            <p style={{ color: "#64748b", marginTop: "0.5rem", lineHeight: 1.625 }}>
              Maaf, terjadi kesalahan yang tidak terduga.
            </p>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "#f97316",
                color: "#fff",
                fontWeight: 500,
                padding: "0.75rem 1.5rem",
                borderRadius: "9999px",
                marginTop: "1.5rem",
                textDecoration: "none",
              }}
            >
              Kembali ke Beranda
            </a>
            {process.env.NODE_ENV === "development" && error?.stack && (
              <pre
                style={{
                  marginTop: "1.5rem",
                  padding: "1rem",
                  background: "#f1f5f9",
                  borderRadius: "0.5rem",
                  textAlign: "left",
                  fontSize: "0.75rem",
                  overflowX: "auto",
                  color: "#475569",
                }}
              >
                {error.stack}
              </pre>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
