import { type RouteConfig, route, layout } from "@react-router/dev/routes";

export default [
  layout("routes/site-layout.tsx", [
  route("", "routes/home.tsx"),
  route("projek", "routes/portfolio/index.tsx"),
  route("projek/:slug", "routes/portfolio/$slug.tsx"),
  route("blog", "routes/blog/index.tsx"),
  route("blog/:slug", "routes/blog/$slug.tsx"),
  route("layanan", "routes/layanan/index.tsx"),
route("layanan/:slug", "routes/layanan/$slug.tsx"),
route("legal/syarat-ketentuan", "routes/legal/syarat-ketentuan.tsx"),
route("legal/kebijakan-privasi", "routes/legal/kebijakan-privasi.tsx"),
route("kontak", "routes/kontak.tsx"),
]),
  route("login", "routes/login.tsx"),
  route("logout", "routes/logout.tsx"),
  route("api/upload-image", "routes/api/upload-image.tsx"),
  
  route("robots.txt", "routes/robots.tsx"),
route("sitemap-index.xml", "routes/sitemap-index.tsx"),
route("sitemap-1.xml", "routes/sitemap-1.tsx"),
route("sitemap-2.xml", "routes/sitemap-2.tsx"),
route("sitemap-3.xml", "routes/sitemap-3.tsx"),
route("llms.txt", "routes/llms.tsx"),

  layout("routes/admin/layout.tsx", [
    route("admin", "routes/admin/index.tsx"), // <-- diganti dari index()
    route("admin/services", "routes/admin/services/index.tsx"),
    route("admin/services/new", "routes/admin/services/new.tsx"),
    route("admin/services/:id/edit", "routes/admin/services/$id.edit.tsx"),
    route("admin/projects", "routes/admin/projects/index.tsx"),
    route("admin/projects/new", "routes/admin/projects/new.tsx"),
    route("admin/projects/:id/edit", "routes/admin/projects/$id.edit.tsx"),
    route("admin/categories", "routes/admin/categories/index.tsx"),
    route("admin/posts", "routes/admin/posts/index.tsx"),
    route("admin/posts/new", "routes/admin/posts/new.tsx"),
    route("admin/posts/:id/edit", "routes/admin/posts/$id.edit.tsx"),
    route("admin/inquiries", "routes/admin/inquiries/index.tsx"),
    route("admin/users", "routes/admin/users/index.tsx"),
    route("admin/users/new", "routes/admin/users/new.tsx"),
    route("admin/users/:id/edit", "routes/admin/users/$id.edit.tsx"),
    route("admin/settings", "routes/admin/settings/index.tsx"),
  ]),
] satisfies RouteConfig;