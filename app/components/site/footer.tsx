import { Link } from "react-router";
import { MapPin, Mail, Phone } from "lucide-react";
import { servicePages } from "~/data/service-pages";

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.013-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.013-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.25A3.25 3.25 0 1 1 12 8.75a3.25 3.25 0 0 1 0 6.5zm5.4-8.85a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.114 20.452H3.558V9h3.556v11.452z" />
    </svg>
  );
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.523 2 12 2z" />
    </svg>
  );
}

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21.582 7.186a2.51 2.51 0 0 0-1.768-1.778C18.254 5 12 5 12 5s-6.254 0-7.814.408a2.51 2.51 0 0 0-1.768 1.778C2 8.756 2 12 2 12s0 3.244.418 4.814a2.51 2.51 0 0 0 1.768 1.778C5.746 19 12 19 12 19s6.254 0 7.814-.408a2.51 2.51 0 0 0 1.768-1.778C22 15.244 22 12 22 12s0-3.244-.418-4.814zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.022 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.878h2.773l-.443 2.91h-2.33v7.03C18.343 21.244 22 17.082 22 12.06z" />
    </svg>
  );
}

function TiktokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
    </svg>
  );
}

const socialIcons: Record<string, (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element> = {
  instagram: InstagramIcon,
  linkedin: LinkedinIcon,
  github: GithubIcon,
  youtube: YoutubeIcon,
  facebook: FacebookIcon,
  tiktok: TiktokIcon,
};

const navigasiLinks = [
  { label: "Beranda", to: "/" },
  { label: "Portofolio", to: "/projek" },
  { label: "Blog", to: "/blog" },
  { label: "Harga", to: "/#layanan" },
  { label: "Kontak", to: "/#kontak" },
];

export function SiteFooter({ settings }: { settings: Record<string, any> }) {
  const general = settings.general ?? {};
  const contact = settings.contact ?? {};
  const socials = settings.socials ?? {};

  const socialEntries = Object.entries(socials).filter(
    ([key, url]) => url && socialIcons[key]
  ) as [string, string][];

  return (
    <footer id="kontak" className="bg-white text-slate-600 border-t border-slate-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h3 className="text-slate-900 font-semibold mb-3">{general.siteName ?? "Website"}</h3>
          <p className="text-sm leading-relaxed text-slate-500">{general.siteTagline}</p>
          {socialEntries.length > 0 && (
            <div className="flex gap-3 mt-4">
              {socialEntries.map(([key, url]) => {
                const Icon = socialIcons[key];
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-brand-500 hover:text-white transition-colors border border-slate-200/60"
                  >
                    <Icon width={16} height={16} />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-slate-900 font-semibold mb-3">Navigasi</h3>
          <div className="flex flex-col gap-2 text-sm">
            {navigasiLinks.map((item) => (
              <Link key={item.to} to={item.to} className="hover:text-brand-600 transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-slate-900 font-semibold mb-3">Layanan Kami</h3>
          <div className="flex flex-col gap-2 text-sm">
            {servicePages.map((s) => (
              <Link key={s.slug} to={`/layanan/${s.slug}`} className="hover:text-brand-600 transition-colors">
                {s.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <h3 className="text-slate-900 font-semibold mb-3">Legal</h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/legal/syarat-ketentuan" className="hover:text-brand-600 transition-colors">
                Syarat & Ketentuan
              </Link>
              <Link to="/legal/kebijakan-privasi" className="hover:text-brand-600 transition-colors">
                Kebijakan Privasi
              </Link>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-slate-900 font-semibold mb-3">Kontak</h3>
            {contact.address && (
              <p className="flex items-start gap-2 text-sm text-slate-500">
                <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" /> {contact.address}
              </p>
            )}
            {contact.emailPrimary && (
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <Mail size={16} className="shrink-0 text-slate-400" /> {contact.emailPrimary}
              </p>
            )}
            {contact.phoneOffice && (
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <Phone size={16} className="shrink-0 text-slate-400" /> {contact.phoneOffice}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 py-5 text-center text-xs text-slate-400">
        {general.copyrightText ?? `© ${new Date().getFullYear()} ${general.siteName ?? ""}`}
      </div>
    </footer>
  );
}
