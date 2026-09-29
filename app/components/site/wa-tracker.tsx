import { useEffect } from "react";

const WA_HREF = /^https?:\/\/(wa\.me|api\.whatsapp\.com)\//i;
const SOURCE_KEY = "wa_src";

function detectSource(): string {
  try {
    const utm = new URLSearchParams(window.location.search).get("utm_source");
    if (utm) return utm.slice(0, 100);
    if (document.referrer) {
      const host = new URL(document.referrer).hostname;
      if (host && host !== window.location.hostname) return host.slice(0, 100);
    }
  } catch {
    // abaikan
  }
  return "direct";
}

/** Sumber kunjungan (utm_source / referrer / direct), disimpan per sesi. */
export function getSource(): string {
  try {
    const saved = sessionStorage.getItem(SOURCE_KEY);
    if (saved) return saved;
    const src = detectSource();
    sessionStorage.setItem(SOURCE_KEY, src);
    return src;
  } catch {
    return detectSource();
  }
}

function getWaText(href: string): string | null {
  try {
    return new URL(href).searchParams.get("text");
  } catch {
    return null;
  }
}

export function WaTracker() {
  useEffect(() => {
    // Simpan sumber kunjungan dari halaman pertama sebelum user pindah halaman
    getSource();

    function onClick(e: MouseEvent) {
      const target = e.target as Element | null;
      const a = target?.closest?.("a") as HTMLAnchorElement | null;
      if (!a) return;

      const href = a.getAttribute("href") ?? "";
      if (!WA_HREF.test(href)) return;

      const page = window.location.pathname;
      if (page.startsWith("/admin")) return;

      const label = (a.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 255);
      const payload = {
        page,
        label,
        waText: getWaText(href),
        source: getSource(),
      };
      const body = JSON.stringify(payload);

      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon(
            "/api/track-wa",
            new Blob([body], { type: "application/json" })
          );
        } else {
          fetch("/api/track-wa", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        // tracking tidak boleh mengganggu klik
      }

      // Kirim juga ke GA4 (gtag) atau GTM (dataLayer) kalau sudah dimuat
      const w = window as any;
      const eventData = { page_path: page, link_text: label };
      if (typeof w.gtag === "function") {
        w.gtag("event", "whatsapp_click", eventData);
      } else if (Array.isArray(w.dataLayer)) {
        w.dataLayer.push({ event: "whatsapp_click", ...eventData });
      }
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}