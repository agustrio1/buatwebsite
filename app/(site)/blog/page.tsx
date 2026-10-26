import Link from "next/link";
import { desc, eq, count } from "drizzle-orm";
import { db } from "~/db";
import { posts } from "~/db/schema";
import { User } from "lucide-react";
import { parsePage, getPagination } from "~/lib/pagination";
import { Pagination } from "~/components/shared/pagination";
import { resizeImage, buildSrcSet } from "~/lib/imagekit-url";
import { buildMetadata } from "~/lib/metadata";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }) {
  const page = parsePage(await searchParams);
  const suffix = page > 1 ? ` - Halaman ${page}` : "";
  return buildMetadata({
    title: `Blog & Artikel Seputar Website dan SEO${suffix} | JadikanWeb`,
    description:
      "Tips, panduan, dan insight seputar pembuatan website, SEO, dan strategi bisnis online untuk membantu bisnis Anda bertumbuh." +
      (page > 1 ? ` Halaman ${page}.` : ""),
    path: "/blog",
    page,
  });
}

export default async function BlogIndex({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = parsePage(sp);

  const [{ value: totalItems }] = await db
    .select({ value: count() })
    .from(posts)
    .where(eq(posts.status, "published"));

  const { limit, offset, currentPage, totalPages } = getPagination(page, totalItems);

  const allPosts = await db.query.posts.findMany({
    where: eq(posts.status, "published"),
    orderBy: [desc(posts.publishedAt)],
    with: { category: true, author: true },
    limit,
    offset,
  });

  return (
    <div>
      <section className="border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 text-center">
          <span className="inline-block bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            Blog
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-brand-dark">Blog & Artikel</h1>
          <p className="text-slate-500 mt-4 leading-relaxed">
            Tips, panduan, dan insight seputar pembuatan website, SEO, dan strategi bisnis online
            untuk membantu bisnis Anda bertumbuh.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        {allPosts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 group"
                >
                  <div className="aspect-video bg-slate-100 overflow-hidden">
                    {post.coverImageUrl && (
                      <img
                        src={resizeImage(post.coverImageUrl, 640) ?? undefined}
                        srcSet={buildSrcSet(post.coverImageUrl, 640)}
                        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                        alt={post.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    {post.category && (
                      <span className="text-xs font-medium text-brand-600">{post.category.name}</span>
                    )}
                    <h2 className="font-semibold text-lg text-brand-dark mt-1.5 leading-snug line-clamp-2">
                      {post.title}
                    </h2>
                    {post.summary && (
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">{post.summary}</p>
                    )}
                    {post.author && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-4">
                        <User size={14} /> {post.author.name}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/blog"
              searchParams={sp}
            />
          </>
        ) : (
          <p className="text-center text-slate-400 py-16">Belum ada artikel yang dipublikasikan.</p>
        )}
      </section>
    </div>
  );
}
