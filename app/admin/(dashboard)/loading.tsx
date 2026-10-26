import { ListSkeleton } from "~/components/admin/list-skeleton";

// Menutupi semua halaman daftar di dalam route group (dashboard) saat navigasi,
// jadi tidak perlu satu loading.tsx per resource.
export default function AdminLoading() {
  return <ListSkeleton />;
}
