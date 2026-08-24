import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  decimal,
  integer,
  timestamp,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('role', ['admin', 'editor']);
export const postStatusEnum = pgEnum('post_status', ['draft', 'published']);
export const inquiryStatusEnum = pgEnum('inquiry_status', ['new', 'contacted', 'closed']);

// 1. Users Table (Admin Panel)
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').default('admin').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Services / Layanan Table
export const services = pgTable('services', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  summary: text('summary'),
  descriptionRich: jsonb('description_rich'), // Format JSON dari TipTap / Lexical / Quill
  
  // Fitur Fleksibilitas Harga
  isPriceVisible: boolean('is_price_visible').default(true).notNull(),
  priceAmount: decimal('price_amount', { precision: 12, scale: 2 }), // Angka murni jika ada
  priceLabel: varchar('price_label', { length: 100 }), // Contoh: "Mulai dari", "Nego", atau "Custom"
  priceUnit: varchar('price_unit', { length: 50 }), // Contoh: "/projek", "/bulan"
  
  badge: varchar('badge', { length: 50 }), // Contoh: "Paling Populer", "Best Value"
  isFeatured: boolean('is_featured').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Service Features Table
export const serviceFeatures = pgTable('service_features', {
  id: uuid('id').defaultRandom().primaryKey(),
  serviceId: uuid('service_id').references(() => services.id, { onDelete: 'cascade' }).notNull(),
  featureText: varchar('feature_text', { length: 255 }).notNull(),
  isIncluded: boolean('is_included').default(true).notNull(), // true: centang hijau, false: silang/disabled
  sortOrder: integer('sort_order').default(0).notNull(),
});

// 4. Portfolio Projects Table
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  clientName: varchar('client_name', { length: 255 }),
  summary: text('summary'),
  descriptionRich: jsonb('description_rich'), // Format Rich Text Editor
  liveDemoUrl: varchar('live_demo_url', { length: 500 }),
  techStack: varchar('tech_stack', { length: 100 }).array(), // Array: ['React', 'Tailwind', 'Laravel']
  
  // ImageKit Integration
  coverImageUrl: varchar('cover_image_url', { length: 500 }),
  coverImageId: varchar('cover_image_id', { length: 255 }), // fileId dari ImageKit untuk delete/update
  
  isFeatured: boolean('is_featured').default(false).notNull(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. Project Images (Galeri Detail Portofolio)
export const projectImages = pgTable('project_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  imageUrl: varchar('image_url', { length: 500 }).notNull(),
  imageId: varchar('image_id', { length: 255 }).notNull(), // fileId ImageKit
  altText: varchar('alt_text', { length: 255 }),
  sortOrder: integer('sort_order').default(0).notNull(),
});

// 6. Categories Table (Blog)
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
});

// 7. Posts / Blog Table
export const posts = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  summary: text('summary'),
  contentRich: jsonb('content_rich').notNull(), // Simpan output TipTap / Lexical / HTML
  
  // ImageKit Integration
  coverImageUrl: varchar('cover_image_url', { length: 500 }),
  coverImageId: varchar('cover_image_id', { length: 255 }),
  
  status: postStatusEnum('status').default('draft').notNull(),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 8. Inquiries / Contacts Table (Pesan Masuk / Request Quotation)
export const inquiries = pgTable('inquiries', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  companyName: varchar('company_name', { length: 255 }),
  serviceType: varchar('service_type', { length: 255 }), // Menautkan nama layanan yang dipilih
  message: text('message').notNull(),
  status: inquiryStatusEnum('status').default('new').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 9. Cities Table (untuk landing page per kota)
export const cities = pgTable('cities', {
  id: uuid('id').defaultRandom().primaryKey(),

  // 1. Informasi Kota
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  province: varchar('province', { length: 100 }),

  // 2. Konten Utama
  h1: varchar('h1', { length: 255 }),
  intro: text('intro'),
  localContext: text('local_context'),

  // 3. Kebutuhan Bisnis
  localChallenges: text('local_challenges'),
  whyWebsiteNeeded: text('why_website_needed'),
  businessTypes: jsonb('business_types'), // array string

  // 4. Layanan & Keunggulan
  relevantServices: jsonb('relevant_services'), // array string (manual, bukan relasi)
  advantages: jsonb('advantages'), // array string

  // 5. Area Layanan
  serviceAreas: jsonb('service_areas'), // array string

  // 6. FAQ Kota
  faqs: jsonb('faqs'), // array [{question, answer}]

  // 7. SEO & CTA
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: text('meta_description'),
  ctaTitle: varchar('cta_title', { length: 255 }),
  ctaDescription: text('cta_description'),
  ctaWhatsappNumber: varchar('cta_whatsapp_number', { length: 50 }),

  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

//  'siteSettings'
export const siteSettings = pgTable('site_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  value: jsonb('value'),
});


// Relations Setup
export const servicesRelations = relations(services, ({ many }) => ({
  features: many(serviceFeatures),
}));

export const serviceFeaturesRelations = relations(serviceFeatures, ({ one }) => ({
  service: one(services, {
    fields: [serviceFeatures.serviceId],
    references: [services.id],
  }),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  images: many(projectImages),
}));

export const projectImagesRelations = relations(projectImages, ({ one }) => ({
  project: one(projects, {
    fields: [projectImages.projectId],
    references: [projects.id],
  }),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
}));
