import { useState, useEffect, useRef } from "react";
import { Outlet, Link, Form, useLoaderData, useLocation, useNavigation } from "react-router";
import type { Route } from "./+types/layout";
import { requireAdmin } from "~/lib/session.server";
import { db } from "~/db";
import { siteSettings } from "~/db/schema";
import {
  LayoutDashboard,
  LayoutGrid,
  FolderKanban,
  FileText,
  Inbox,
  Users,
  Settings,
  PanelLeft,
  X,
  LogOut,
  MapPin,
  ChevronsUpDown,
  ChevronRight,
  ArrowRightLeft,
  History,
} from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
  const { role, userId } = await requireAdmin(request);

  const settingsRows = await db.query.siteSettings.findMany();
  const settingsMap = Object.fromEntries(settingsRows.map((s) => [s.key, s.value]));
  const general = (settingsMap["general"] as Record<string, any>) ?? {};
  const brandIconUrl: string | undefined = general.iconUrl ?? general.logoUrl ?? undefined;
  const siteName: string = general.siteName ?? "Admin Panel";

  return { role, userId, brandIconUrl, siteName };
}

type NavItem = {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: "Utama",
    items: [{ label: "Dashboard", path: "/admin", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Konten",
    items: [
      { label: "Layanan", path: "/admin/services", icon: LayoutGrid },
      { label: "Kota", path: "/admin/cities", icon: MapPin },
      { label: "Projek", path: "/admin/projects", icon: FolderKanban },
      { label: "Blog", path: "/admin/posts", icon: FileText },
    ],
  },
  {
    label: "Kelola",
    items: [
      { label: "Inquiries", path: "/admin/inquiries", icon: Inbox },
      { label: "Redirects", path: "/admin/redirects", icon: ArrowRightLeft },
      { label: "Users", path: "/admin/users", icon: Users },
      { label: "Activity Log", path: "/admin/activity-log", icon: History },
      { label: "Pengaturan", path: "/admin/settings", icon: Settings },
    ],
  },
];

function isItemActive(item: NavItem, pathname: string) {
  return item.exact ? pathname === item.path : pathname.startsWith(item.path);
}

export default function AdminLayout() {
  const { role, userId, brandIconUrl, siteName } = useLoaderData<typeof loader>();
  const location = useLocation();
  const navigation = useNavigation();
  const isLoading = navigation.state !== "idle";

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("admin_sidebar_collapsed");
    if (saved === "1") setIsCollapsed(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("admin_sidebar_collapsed", isCollapsed ? "1" : "0");
  }, [isCollapsed]);

  useEffect(() => {
    setIsSidebarOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const activeItem = navGroups.flatMap((g) => g.items).find((item) => isItemActive(item, location.pathname));
  const sidebarWidthClass = isCollapsed ? "md:w-14" : "md:w-64";

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex text-slate-900 font-sans text-sm">
      {isLoading ? (
        <div className="fixed top-0 left-0 right-0 z-60 h-0.5 bg-brand-500 animate-pulse" />
      ) : null}

      {isSidebarOpen ? (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden"
        />
      ) : null}

      {/* Sidebar */}
      <aside
        className={
          "fixed md:static inset-y-0 left-0 z-50 h-full w-64 " +
          sidebarWidthClass +
          " bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-200 ease-in-out " +
          (isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0")
        }
      >
        {/* Header */}
        <div className="h-14 flex items-center gap-2 px-3 border-b border-slate-200 shrink-0">
          <div className="w-7 h-7 rounded-md bg-brand-500 flex items-center justify-center shrink-0 overflow-hidden">
            {brandIconUrl ? (
              <img src={brandIconUrl} alt={siteName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-xs">{siteName.slice(0, 1).toUpperCase()}</span>
            )}
          </div>
          {isCollapsed ? null : (
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate leading-tight">{siteName}</p>
              <p className="text-xs text-slate-400 truncate leading-tight">Admin Panel</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden ml-auto p-1.5 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
            aria-label="Tutup menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 min-h-0 overflow-y-auto px-2 py-3 space-y-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              {isCollapsed ? (
                <div className="h-px bg-slate-100 mx-2 mb-2" />
              ) : (
                <p className="px-2 pb-1.5 text-[11px] font-medium text-slate-400 tracking-wide">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = isItemActive(item, location.pathname);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={isCollapsed ? item.label : undefined}
                      className={
                        "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors " +
                        (isCollapsed ? "justify-center " : "") +
                        (isActive
                          ? "bg-slate-100 text-slate-900 font-medium"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")
                      }
                    >
                      <Icon size={16} className={isActive ? "text-brand-600" : "text-slate-400"} strokeWidth={2} />
                      {isCollapsed ? null : <span className="flex-1 truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer: user menu */}
        <div className="p-2 border-t border-slate-200 shrink-0 relative" ref={userMenuRef}>
          {isUserMenuOpen ? (
            <div className="absolute bottom-full left-2 right-2 mb-1 bg-white border border-slate-200 rounded-lg shadow-md py-1 overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-800 capitalize truncate">{role}</p>
                <p className="text-xs text-slate-400">Sedang login</p>
              </div>
              <Form method="post" action="/logout">
                <button
                  type="submit"
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </Form>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className={
              "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-slate-50 transition-colors " +
              (isCollapsed ? "justify-center" : "")
            }
          >
            <div className="w-7 h-7 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center text-xs font-semibold uppercase shrink-0">
              {role.slice(0, 2)}
            </div>
            {isCollapsed ? null : (
              <>
                <div className="min-w-0 text-left flex-1">
                  <p className="text-sm font-medium text-slate-800 capitalize truncate leading-tight">{role}</p>
                  <p className="text-xs text-slate-400 truncate leading-tight">Admin</p>
                </div>
                <ChevronsUpDown size={14} className="text-slate-400 shrink-0" />
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 min-w-0 flex flex-col h-full">
        <header className="h-14 shrink-0 bg-white border-b border-slate-200 px-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (window.innerWidth < 768) {
                setIsSidebarOpen(true);
              } else {
                setIsCollapsed((prev) => !prev);
              }
            }}
            className="p-1.5 -ml-1 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
            aria-label="Toggle sidebar"
          >
            <PanelLeft size={18} />
          </button>

          <div className="h-4 w-px bg-slate-200" />

          <div className="flex items-center gap-1.5 text-sm min-w-0">
            <span className="text-slate-400">Admin</span>
            <ChevronRight size={13} className="text-slate-300 shrink-0" />
            <span className="font-medium text-slate-800 truncate">{activeItem?.label ?? "Dashboard"}</span>
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ role, userId }} />
          </div>
        </main>
      </div>
    </div>
  );
}