import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Menu, X } from "lucide-react";
import { buildWaLink } from "~/lib/format";
import { resizeImage, buildSrcSet } from "~/lib/imagekit-url";

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.001 2C6.478 2 2 6.477 2 12c0 1.87.505 3.68 1.464 5.26L2 22l4.865-1.446A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12.001 2zm0 18.2a8.16 8.16 0 01-4.16-1.14l-.298-.177-3.046.905.905-3.02-.194-.309A8.163 8.163 0 013.8 12c0-4.522 3.679-8.2 8.201-8.2 4.523 0 8.2 3.678 8.2 8.2 0 4.523-3.677 8.2-8.2 8.2z" />
    </svg>
  );
}

export function SiteHeader({ settings }: { settings: Record<string, any> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const general = settings.general ?? {};
  const contact = settings.contact ?? {};
  const templates = settings.whatsapp_templates ?? {};
  const features = settings.features ?? {};

  const navItems = [
    { label: "Layanan", to: "/#layanan" },
    { label: "Projek", to: "/projek" },
    ...(features.showBlogSection !== false ? [{ label: "Blog", to: "/blog" }] : []),
    { label: "Kontak", to: "/kontak" },
  ];

  const logoUrl: string | undefined = general.logoUrl ?? undefined;
  const logoSrc: string | undefined = logoUrl ? resizeImage(logoUrl, 220) : undefined;
  const logoSrcSet: string | undefined = logoUrl ? buildSrcSet(logoUrl, 220) : undefined;
  const waLink = buildWaLink(contact.whatsappNumber, templates.defaultConsultation);

  return (
    <header className={isScrolled ? "sticky top-0 z-40 transition-all duration-300 bg-white/80 backdrop-blur-lg shadow-sm border-b border-slate-100" : "sticky top-0 z-40 transition-all duration-300 bg-white/60 backdrop-blur-md border-b border-transparent"}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-17.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 min-w-0 shrink-0">
          {logoSrc ? (
            <img src={logoSrc} srcSet={logoSrcSet} sizes="215px" width={215} height={56} alt={general.siteName} className="h-8 w-auto" fetchPriority="high" />
          ) : (
            <span className="font-bold text-lg text-brand-dark truncate">{general.siteName ?? "Website"}</span>
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-1 bg-slate-50/80 rounded-full px-1.5 py-1.5 border border-slate-100">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} className="px-4 py-2 rounded-full text-sm font-medium text-slate-600 hover:text-brand-600 hover:bg-white hover:shadow-sm transition-all duration-200">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          {features.enableDirectWhatsAppInquiry !== false ? (
            <a href={waLink} target="_blank" rel="noreferrer" className="hidden sm:flex items-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
              <WhatsAppIcon size={17} />
              Konsultasi
            </a>
          ) : null}
          <button type="button" onClick={() => setIsOpen(!isOpen)} className="md:hidden relative w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-full transition-colors" aria-label="Menu" aria-expanded={isOpen}>
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {isOpen ? (
        <nav className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-all duration-200">
              {item.label}
            </Link>
          ))}
          {features.enableDirectWhatsAppInquiry !== false ? (
            <a href={waLink} target="_blank" rel="noreferrer" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white text-sm font-semibold px-4 py-3 rounded-xl mt-3 shadow-sm">
              <WhatsAppIcon size={18} />
              Konsultasi via WhatsApp
            </a>
          ) : null}
        </nav>
      ) : null}
    </header>
  );
}