"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const GTM_PATTERN = /^GTM-[A-Z0-9]{4,10}$/;
const GA_PATTERN = /^G-[A-Z0-9]{6,12}$/;
// Nilai contoh seperti GTM-XXXXXXX atau G-XXXXXXXXXX dianggap tidak valid.
const PLACEHOLDER_PATTERN = /^(GTM|G)-X+$/;

function cleanTrackingId(value: unknown, pattern: RegExp): string {
  const id = typeof value === "string" ? value.trim().toUpperCase() : "";
  if (!id || PLACEHOLDER_PATTERN.test(id)) return "";
  return pattern.test(id) ? id : "";
}

/**
 * GTM / GA dimuat malas (lazy) setelah interaksi pertama atau 5 detik, sama
 * seperti perilaku site-layout versi React Router.
 */
function Tracking({ settings }: { settings: Record<string, any> }) {
  const gtmId = cleanTrackingId(settings.seo?.googleTagManagerId, GTM_PATTERN);
  const gaId = cleanTrackingId(settings.seo?.googleAnalyticsId, GA_PATTERN);

  useEffect(() => {
    if (!gtmId && !gaId) return;
    if (document.getElementById("gtm-script") || document.getElementById("ga-script")) return;

    const events: (keyof WindowEventMap)[] = ["scroll", "mousemove", "touchstart", "keydown", "click"];
    let loaded = false;
    let fallbackTimer: ReturnType<typeof setTimeout>;

    function cleanup() {
      events.forEach((ev) => window.removeEventListener(ev, loadTracking));
      clearTimeout(fallbackTimer);
    }

    function loadTracking() {
      if (loaded) return;
      loaded = true;
      cleanup();

      if (gtmId) {
        const script = document.createElement("script");
        script.id = "gtm-script";
        script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`;
        document.head.appendChild(script);
      } else if (gaId) {
        const loaderScript = document.createElement("script");
        loaderScript.id = "ga-script";
        loaderScript.async = true;
        loaderScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(loaderScript);

        const config = document.createElement("script");
        config.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`;
        document.head.appendChild(config);
      }
    }

    events.forEach((ev) => window.addEventListener(ev, loadTracking, { once: true, passive: true }));
    fallbackTimer = setTimeout(loadTracking, 5000);

    return cleanup;
  }, [gtmId, gaId]);

  return null;
}

/**
 * Padanan `useNavigation()` React Router: garis progres di atas halaman selama
 * navigasi client-side berlangsung.
 */
function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    function onSessionStart() {
      setIsLoading(true);
    }
    function onSessionEnd() {
      setIsLoading(false);
    }

    const originalPush = router.push.bind(router);
    const originalReplace = router.replace.bind(router);
    const originalRefresh = router.refresh.bind(router);

    router.push = ((href: Parameters<typeof router.push>[0]) => {
      setIsLoading(true);
      return originalPush(href);
    }) as typeof router.push;
    router.replace = ((href: Parameters<typeof router.replace>[0]) => {
      setIsLoading(true);
      return originalReplace(href);
    }) as typeof router.replace;
    router.refresh = (() => {
      setIsLoading(true);
      return originalRefresh();
    }) as typeof router.refresh;

    window.addEventListener("focus", onSessionEnd);
    window.addEventListener("blur", onSessionStart);

    return () => {
      router.push = originalPush;
      router.replace = originalReplace;
      router.refresh = originalRefresh;
      window.removeEventListener("focus", onSessionEnd);
      window.removeEventListener("blur", onSessionStart);
    };
  }, [router]);

  if (!isLoading) return null;

  return <div className="fixed top-0 left-0 right-0 z-60 h-0.5 bg-brand-500 animate-pulse" />;
}

export function SiteClient({ settings }: { settings: Record<string, any> }) {
  return (
    <Suspense fallback={null}>
      <Tracking settings={settings} />
      <NavigationProgress />
    </Suspense>
  );
}
