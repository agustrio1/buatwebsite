import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/index";
import { db } from "~/db";
import { services, projects, posts, inquiries } from "~/db/schema";
import { eq, count, desc } from "drizzle-orm";
import {
  LayoutGrid,
  FolderKanban,
  FileText,
  Inbox,
  ArrowRight,
  Mail,
} from "lucide-react";

export async function loader() {
  const [
    [{ value: servicesCount }],
    [{ value: projectsCount }],
    [{ value: postsCount }],
    [{ value: publishedPostsCount }],
    [{ value: newInquiriesCount }],
    recentInquiries,
  ] = await Promise.all([
    db.select({ value: count() }).from(services),
    db.select({ value: count() }).from(projects),
    db.select({ value: count() }).from(posts),
    db.select({ value: count() }).from(posts).where(eq(posts.status, "published")),
    db.select({ value: count() }).from(inquiries).where(eq(inquiries.status, "new")),
    db.query.inquiries.findMany({
      orderBy: [desc(inquiries.createdAt)],
      limit: 5,
    }),
  ]);

  return {
    servicesCount,
    projectsCount,
    postsCount,
    publishedPostsCount,
    newInquiriesCount,
    recentInquiries,
  };
}

export default function AdminDashboard({ loaderData }: Route.ComponentProps) {
  const {
    servicesCount,
    projectsCount,
    postsCount,
    publishedPostsCount,
    newInquiriesCount,
    recentInquiries,
  } = loaderData;

  const stats = [
    {
      label: "Layanan",
      value: servicesCount,
      href: "/admin/services",
      icon: LayoutGrid,
    },
    {
      label: "Projek",
      value: projectsCount,
      href: "/admin/projects",
      icon: FolderKanban,
    },
    {
      label: "Artikel",
      value: postsCount,
      sub: `${publishedPostsCount} published`,
      href: "/admin/posts",
      icon: FileText,
    },
    {
      label: "Inquiry Baru",
      value: newInquiriesCount,
      href: "/admin/inquiries",
      icon: Inbox,
      highlight: newInquiriesCount > 0,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Ringkasan aktivitas website kamu.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              to={s.href}
              className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    s.highlight ? "bg-brand-500/10 text-brand-500" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Icon size={20} />
                </div>
                <ArrowRight
                  size={16}
                  className="text-slate-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all"
                />
              </div>
              <p className="text-2xl font-bold text-brand-dark mt-3">{s.value}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
              {s.sub && <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>}
            </Link>
          );
        })}
      </div>

      {/* Recent inquiries */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-brand-dark">Inquiry Terbaru</h2>
          <Link
            to="/admin/inquiries"
            className="text-sm text-brand-600 hover:underline flex items-center gap-1"
          >
            Lihat semua <ArrowRight size={14} />
          </Link>
        </div>

        <div className="divide-y">
          {recentInquiries.map((inq) => (
            <div key={inq.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                  <Mail size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-brand-dark truncate">{inq.name}</p>
                  <p className="text-xs text-slate-400 truncate">{inq.email}</p>
                </div>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded shrink-0 ${
                  inq.status === "new"
                    ? "bg-amber-100 text-amber-700"
                    : inq.status === "contacted"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {inq.status}
              </span>
            </div>
          ))}
          {recentInquiries.length === 0 && (
            <p className="text-sm text-slate-400 italic px-5 py-8 text-center">
              Belum ada inquiry masuk.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}