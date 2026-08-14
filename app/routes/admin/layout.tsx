import { useState } from "react";
import { Outlet, Link, Form, useLoaderData, useLocation } from "react-router";
import type { Route } from "./+types/layout";
import { requireAdmin } from "~/lib/session.server";
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
  ChevronRight,
} from "lucide-react";
import { useNavigation } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  const { role, userId } = await requireAdmin(request);
  return { role, userId };
}

const navItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Layanan", path: "/admin/services", icon: LayoutGrid },
  { label: "Projek", path: "/admin/projects", icon: FolderKanban },
  { label: "Blog", path: "/admin/posts", icon: FileText },
  { label: "Inquiries", path: "/admin/inquiries", icon: Inbox },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Pengaturan", path: "/admin/settings", icon: Settings },
];

export default function AdminLayout() {
  const { role, userId } = useLoaderData<typeof loader>();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeItem = navItems.find((item) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
  );
  const navigation = useNavigation();
  const isLoading = navigation.state !== "idle";

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans">
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-brand-500 animate-pulse" />
      )}

      {/* Backdrop mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-brand-dark text-slate-300 flex flex-col transform transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">Admin Panel</p>
            <p className="text-xs text-slate-500 truncate">Jasa Pembuatan Website</p>
          </div>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden ml-auto p-1.5 text-slate-400 hover:text-white rounded-lg"
            aria-label="Tutup menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          <p className="px-3 pt-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            Menu
          </p>
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                  isActive
                    ? "bg-brand-500 text-white"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                }`}
              >
                <Icon size={18} className={isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"} />
                {item.label}
                {isActive && <ChevronRight size={16} className="ml-auto text-white/80" />}
              </Link>
            );
          })}
        </nav>

        {/* User & logout */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 mb-1">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-500 flex items-center justify-center text-xs font-semibold uppercase shrink-0">
              {role.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-200 capitalize truncate">{role}</p>
              <p className="text-xs text-slate-500">Sedang login</p>
            </div>
          </div>
          <Form method="post" action="/logout">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </Form>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
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
            <p className="text-xs text-slate-400">Admin</p>
            <h1 className="text-base font-semibold text-brand-dark truncate">
              {activeItem?.label ?? "Dashboard"}
            </h1>
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