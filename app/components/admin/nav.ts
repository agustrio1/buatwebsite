import {
  LayoutDashboard,
  LayoutGrid,
  FolderKanban,
  FileText,
  Inbox,
  Users,
  Settings,
  MapPin,
  ArrowRightLeft,
  History,
  Images,
} from "lucide-react";

export type NavItem = {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

export type NavGroup = { label: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
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
      { label: "Media", path: "/admin/media", icon: Images },
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

export const allNavItems: NavItem[] = navGroups.flatMap((g) => g.items);
