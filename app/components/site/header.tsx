import { useState } from "react";
import { Link } from "react-router";
import { Menu, X, MessageCircle } from "lucide-react";
import { buildWaLink } from "~/lib/format";
import { resizeImage, buildSrcSet } from "~/lib/imagekit-url";

export function SiteHeader({ settings }: { settings: Record<string, any> }) {
  const [isOpen, setIsOpen] = useState(false);
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

  const waLink = buildWaLink(contact.whatsappNumber, templates.defaultConsultation);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 min-w-0">
          {general.logoUrl ? (
            <img
              src={resizeImage(general.logoUrl, 220)}
              srcSet={buildSrcSet(general.logoUrl, 220)}
              sizes="215px"
              width={215}
              height={56}
              alt={general.siteName}
              className="h-8 w-auto"
              fetchPriority="high"
            />
          ) : (
            <span className="font-bold text-lg text-brand-dark truncate">
              {general.siteName ?? "Website"}
            </span>
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {features.enableDirectWhatsAppInquiry !== false && (
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <MessageCircle size={16} /> Konsultasi
            </a>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            aria-label="Menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <nav className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 bg-brand-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg mt-2"
          >
            <MessageCircle size={16} /> Konsultasi via WhatsApp
          </a>
        </nav>
      )}
    </header>
  );
}