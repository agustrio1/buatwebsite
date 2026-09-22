import { useState, useEffect } from "react";
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
  Menu,
  X,
  LogOut,
  MapPin,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
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
      { label: "Users", path: "/admin/users", icon: Users },
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

  useEffect(() => {
    const saved = window.localStorage.getItem("admin_sidebar_collapsed");
    if (saved === "1") setIsCollapsed(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("admin_sidebar_collapsed", isCollapsed ? "1" : "0");
  }, [isCollapsed]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const activeItem = navGroups.flatMap((g) => g.items).find((item) => isItemActive(item, location.pathname));

  const sidebarWidthClass = isCollapsed ? "md:w-20" : "md:w-72";

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans">
      {isLoading ? (
        <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-brand-500 animate-pulse" />
      ) : null}

      {isSidebarOpen ? (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
        />
      ) : null}

      <aside
        className={
          "fixed md:static inset-y-0 left-0 z-50 w-72 " +
          sidebarWidthClass +
          " bg-brand-dark text-slate-300 flex flex-col transition-all duration-200 ease-in-out " +
          (isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0")
        }
      >
        <div className="flex items-center gap-3 px-5 py-6 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shrink-0 overflow-hidden">
            {brandIconUrl ? (
              <img src={brandIconUrl} alt={siteName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-sm">{siteName.slice(0, 1).toUpperCase()}</span>
            )}
          </div>
          {isCollapsed ? null : (
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{siteName}</p>
              <p className="text-xs text-slate-500 truncate">Admin Panel</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden ml-auto p-1.5 text-slate-400 hover:text-white rounded-lg"
            aria-label="Tutup menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label}>
              {isCollapsed ? (
                <div className="h-px bg-white/5 mx-2 mb-2" />
              ) : (
                <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
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
                        "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 " +
                        (isCollapsed ? "justify-center " : "") +
                        (isActive
                          ? "bg-white/10 text-white"
                          : "text-slate-400 hover:text-slate-100 hover:bg-white/5")
                      }
                    >
                      {isActive ? (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-brand-500" />
                      ) : null}
                      <Icon size={18} className={isActive ? "text-brand-400" : "text-slate-500 group-hover:text-slate-300"} />
                      {isCollapsed ? null : (
                        <span className="flex-1 truncate">{item.label}</span>
                      )}
                      {isActive && !isCollapsed ? (
                        <ChevronRight size={15} className="text-slate-500" />
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5">
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="hidden md:flex w-full items-center gap-2 px-3 py-2 mb-1 text-xs font-medium text-slate-500 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-colors"
          >
            {isCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
            {isCollapsed ? null : <span>Ciutkan menu</span>}
          </button>

          <div className={"flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 mb-1 " + (isCollapsed ? "justify-center" : "")}>
            <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-semibold uppercase shrink-0 ring-1 ring-brand-500/30">
              {role.slice(0, 2)}
            </div>
            {isCollapsed ? null : (
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-200 capitalize truncate">{role}</p>
                <p className="text-xs text-slate-500">Sedang login</p>
              </div>
            )}
          </div>

          <Form method="post" action="/logout">
            <button
              type="submit"
              title={isCollapsed ? "Logout" : undefined}
              className={
                "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors " +
                (isCollapsed ? "justify-center" : "")
              }
            >
              <LogOut size={18} />
              {isCollapsed ? null : "Logout"}
            </button>
          </Form>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 md:px-8 py-3.5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            aria-label="Buka menu"
          >
            <Menu size={22} />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Admin</span>
              <ChevronRight size={12} />
              <span className="text-slate-500">{activeItem?.label ?? "Dashboard"}</span>
            </div>
            <h1 className="text-base font-semibold text-brand-dark truncate">
              {activeItem?.label ?? "Dashboard"}
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 pl-3 pr-1.5 py-1.5 rounded-full border border-slate-200 bg-white">
              <div className="w-7 h-7 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center text-xs font-semibold uppercase">
                {role.slice(0, 2)}
              </div>
              <span className="text-sm font-medium text-slate-600 capitalize pr-1">{role}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ role, userId }} />
          </div>
        </main>
      </div>
    </div>
  );
}