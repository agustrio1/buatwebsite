"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PanelLeft,
  X,
  LogOut,
  ChevronsUpDown,
  ChevronRight,
  Search,
} from "lucide-react";
import { navGroups, type NavItem } from "./nav";
import { CommandMenu } from "./command-menu";
import { Toaster } from "~/components/ui/toast";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/cn";

function isItemActive(item: NavItem, pathname: string) {
  return item.exact ? pathname === item.path : pathname.startsWith(item.path);
}

export function AdminShell({
  role,
  siteName,
  brandIconUrl,
  logoutAction,
  children,
}: {
  role: string;
  siteName: string;
  brandIconUrl?: string;
  logoutAction: () => Promise<void>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem("admin_sidebar_collapsed");
    if (saved === "1") setIsCollapsed(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("admin_sidebar_collapsed", isCollapsed ? "1" : "0");
  }, [isCollapsed]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Shortcut global command palette.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((p) => !p);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const activeItem = navGroups.flatMap((g) => g.items).find((item) => isItemActive(item, pathname));
  const sidebarWidthClass = isCollapsed ? "md:w-16" : "md:w-64";

  return (
    <div className="h-screen overflow-hidden bg-background flex text-foreground font-sans text-sm">
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
          " bg-card border-r border-border flex flex-col shrink-0 transition-all duration-200 ease-in-out " +
          (isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0")
        }
      >
        {/* Header */}
        <div className="h-14 flex items-center gap-2.5 px-3 border-b border-border shrink-0">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shrink-0 overflow-hidden">
            {brandIconUrl ? (
              <img src={brandIconUrl} alt={siteName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-sm">{siteName.slice(0, 1).toUpperCase()}</span>
            )}
          </div>
          {isCollapsed ? null : (
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate leading-tight">{siteName}</p>
              <p className="text-xs text-muted-foreground truncate leading-tight">Admin Panel</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden ml-auto p-1.5 text-slate-400 hover:text-foreground rounded-md transition-colors"
            aria-label="Tutup menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 min-h-0 overflow-y-auto px-2 py-3 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              {isCollapsed ? (
                <div className="h-px bg-border mx-2 mb-2" />
              ) : (
                <p className="px-2.5 pb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = isItemActive(item, pathname);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors",
                        isCollapsed && "justify-center",
                        isActive
                          ? "bg-brand-50 text-brand-700 font-medium"
                          : "text-slate-600 hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon size={17} className={isActive ? "text-brand-600" : "text-slate-400"} strokeWidth={2} />
                      {isCollapsed ? null : <span className="flex-1 truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer: user menu */}
        <div className="p-2 border-t border-border shrink-0">
          <DropdownMenu
            align="start"
            contentClassName="w-[calc(100%-1rem)] bottom-full mb-1.5 left-2 right-2 min-w-0"
            trigger={({ toggle }) => (
              <button
                type="button"
                onClick={toggle}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors",
                  isCollapsed && "justify-center"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center text-xs font-semibold uppercase shrink-0">
                  {role.slice(0, 2)}
                </div>
                {isCollapsed ? null : (
                  <>
                    <div className="min-w-0 text-left flex-1">
                      <p className="text-sm font-medium text-foreground capitalize truncate leading-tight">{role}</p>
                      <p className="text-xs text-muted-foreground truncate leading-tight">Admin</p>
                    </div>
                    <ChevronsUpDown size={14} className="text-slate-400 shrink-0" />
                  </>
                )}
              </button>
            )}
          >
            {(close) => (
              <>
                <DropdownLabel>
                  <span className="capitalize">{role}</span> · Sedang login
                </DropdownLabel>
                <DropdownSeparator />
                <form action={logoutAction}>
                  <DropdownItem
                    type="submit"
                    onClick={close}
                    className="text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut size={15} /> Logout
                  </DropdownItem>
                </form>
              </>
            )}
          </DropdownMenu>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 min-w-0 flex flex-col h-full">
        <header className="h-14 shrink-0 bg-card border-b border-border px-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (window.innerWidth < 768) {
                setIsSidebarOpen(true);
              } else {
                setIsCollapsed((prev) => !prev);
              }
            }}
            className="p-1.5 -ml-1 text-slate-500 hover:bg-muted rounded-md transition-colors"
            aria-label="Toggle sidebar"
          >
            <PanelLeft size={18} />
          </button>

          <div className="hidden sm:flex items-center gap-1.5 text-sm min-w-0">
            <span className="text-slate-400">Admin</span>
            <ChevronRight size={13} className="text-slate-300 shrink-0" />
            <span className="font-medium text-foreground truncate">{activeItem?.label ?? "Dashboard"}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 h-9 w-full sm:w-64 rounded-lg border border-border bg-muted/50 px-3 text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              <Search size={15} />
              <span className="hidden sm:inline truncate">Cari...</span>
              <kbd className="ml-auto hidden sm:inline rounded border border-border bg-card px-1.5 text-[11px] text-slate-400">
                {isMac ? "⌘K" : "Ctrl K"}
              </kbd>
            </button>
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6">
          <div className="w-full">{children}</div>
        </main>
      </div>

      <CommandMenu open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Toaster />
    </div>
  );
}
