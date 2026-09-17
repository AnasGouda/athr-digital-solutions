import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  accessRole: varchar("accessRole", { length: 32 }).default("CUSTOMER").notNull(),
  avatarUrl: text("avatarUrl"),
  phone: varchar("phone", { length: 32 }),
  company: varchar("company", { length: 160 }),
  status: mysqlEnum("status", ["ACTIVE", "SUSPENDED"]).default("ACTIVE").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 140 }).notNull().unique(),
  nameAr: varchar("nameAr", { length: 180 }).notNull(),
  nameEn: varchar("nameEn", { length: 180 }).notNull(),
  descriptionAr: text("descriptionAr").notNull(),
  descriptionEn: text("descriptionEn").notNull(),
  icon: varchar("icon", { length: 64 }).notNull(),
  accent: varchar("accent", { length: 32 }).default("gold").notNull(),
  features: json("features").$type<string[]>().notNull(),
  technologies: json("technologies").$type<string[]>().notNull(),
  published: boolean("published").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 140 }).notNull().unique(),
  nameAr: varchar("nameAr", { length: 180 }).notNull(),
  nameEn: varchar("nameEn", { length: 180 }).notNull(),
  descriptionAr: text("descriptionAr").notNull(),
  descriptionEn: text("descriptionEn").notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).default("0").notNull(),
  images: json("images").$type<string[]>().notNull(),
  features: json("features").$type<string[]>().notNull(),
  status: mysqlEnum("status", ["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED").notNull(),
  demoUrl: text("demoUrl"),
  purchaseUrl: text("purchaseUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const caseStudies = mysqlTable("caseStudies", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 140 }).notNull().unique(),
  titleAr: varchar("titleAr", { length: 220 }).notNull(),
  titleEn: varchar("titleEn", { length: 220 }).notNull(),
  client: varchar("client", { length: 180 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  descriptionAr: text("descriptionAr").notNull(),
  descriptionEn: text("descriptionEn").notNull(),
  challengeAr: text("challengeAr").notNull(),
  challengeEn: text("challengeEn").notNull(),
  solutionAr: text("solutionAr").notNull(),
  solutionEn: text("solutionEn").notNull(),
  technologies: json("technologies").$type<string[]>().notNull(),
  results: json("results").$type<string[]>().notNull(),
  images: json("images").$type<string[]>().notNull(),
  projectUrl: text("projectUrl"),
  published: boolean("published").default(true).notNull(),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
});

export const testimonials = mysqlTable("testimonials", {
  id: int("id").autoincrement().primaryKey(),
  clientName: varchar("clientName", { length: 140 }).notNull(),
  company: varchar("company", { length: 160 }).notNull(),
  position: varchar("position", { length: 140 }).notNull(),
  avatar: text("avatar"),
  rating: int("rating").default(5).notNull(),
  messageAr: text("messageAr").notNull(),
  messageEn: text("messageEn").notNull(),
  published: boolean("published").default(true).notNull(),
});

export const faqs = mysqlTable("faqs", {
  id: int("id").autoincrement().primaryKey(),
  questionAr: varchar("questionAr", { length: 240 }).notNull(),
  questionEn: varchar("questionEn", { length: 240 }).notNull(),
  answerAr: text("answerAr").notNull(),
  answerEn: text("answerEn").notNull(),
  category: varchar("category", { length: 80 }).default("general").notNull(),
  published: boolean("published").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
});

export const pricingPlans = mysqlTable("pricingPlans", {
  id: int("id").autoincrement().primaryKey(),
  nameAr: varchar("nameAr", { length: 120 }).notNull(),
  nameEn: varchar("nameEn", { length: 120 }).notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  period: varchar("period", { length: 32 }).default("project").notNull(),
  features: json("features").$type<string[]>().notNull(),
  highlighted: boolean("highlighted").default(false).notNull(),
  ctaAr: varchar("ctaAr", { length: 80 }).notNull(),
  ctaEn: varchar("ctaEn", { length: 80 }).notNull(),
  published: boolean("published").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
});

export const blogPosts = mysqlTable("blogPosts", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  titleAr: varchar("titleAr", { length: 240 }).notNull(),
  titleEn: varchar("titleEn", { length: 240 }).notNull(),
  excerptAr: text("excerptAr").notNull(),
  excerptEn: text("excerptEn").notNull(),
  contentAr: text("contentAr").notNull(),
  contentEn: text("contentEn").notNull(),
  coverImage: text("coverImage"),
  author: varchar("author", { length: 140 }).notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  tags: json("tags").$type<string[]>().notNull(),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  status: mysqlEnum("status", ["DRAFT", "PUBLISHED"]).default("PUBLISHED").notNull(),
  seoTitle: varchar("seoTitle", { length: 240 }),
  seoDescription: text("seoDescription"),
});

export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull().references(() => users.id),
  serviceId: int("serviceId").references(() => services.id),
  name: varchar("name", { length: 220 }).notNull(),
  description: text("description").notNull(),
  status: mysqlEnum("status", ["PENDING", "PLANNING", "IN_PROGRESS", "REVIEW", "COMPLETED", "CANCELLED"]).default("PENDING").notNull(),
  progress: int("progress").default(0).notNull(),
  budget: decimal("budget", { precision: 12, scale: 2 }).default("0").notNull(),
  paidAmount: decimal("paidAmount", { precision: 12, scale: 2 }).default("0").notNull(),
  startDate: timestamp("startDate"),
  deadline: timestamp("deadline"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const projectTasks = mysqlTable("projectTasks", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().references(() => projects.id),
  assignedUserId: int("assignedUserId").references(() => users.id),
  title: varchar("title", { length: 220 }).notNull(),
  description: text("description"),
  priority: mysqlEnum("priority", ["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM").notNull(),
  status: mysqlEnum("status", ["TODO", "IN_PROGRESS", "REVIEW", "DONE"]).default("TODO").notNull(),
  dueDate: timestamp("dueDate"),
  progress: int("progress").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const milestones = mysqlTable("milestones", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().references(() => projects.id),
  title: varchar("title", { length: 220 }).notNull(),
  description: text("description"),
  dueDate: timestamp("dueDate"),
  status: mysqlEnum("status", ["PENDING", "IN_PROGRESS", "COMPLETED"]).default("PENDING").notNull(),
});

export const files = mysqlTable("files", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").references(() => projects.id),
  customerId: int("customerId").notNull().references(() => users.id),
  name: varchar("name", { length: 220 }).notNull(),
  fileKey: text("fileKey").notNull(),
  url: text("url").notNull(),
  mimeType: varchar("mimeType", { length: 120 }),
  size: int("size"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  invoiceNumber: varchar("invoiceNumber", { length: 60 }).notNull().unique(),
  customerId: int("customerId").notNull().references(() => users.id),
  projectId: int("projectId").references(() => projects.id),
  items: json("items").$type<{ label: string; quantity: number; price: number }[]>().notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 12, scale: 2 }).default("0").notNull(),
  tax: decimal("tax", { precision: 12, scale: 2 }).default("0").notNull(),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  paid: decimal("paid", { precision: 12, scale: 2 }).default("0").notNull(),
  dueDate: timestamp("dueDate"),
  status: mysqlEnum("status", ["DRAFT", "SENT", "PARTIALLY_PAID", "PAID", "OVERDUE"]).default("DRAFT").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull().references(() => users.id),
  invoiceId: int("invoiceId").references(() => invoices.id),
  projectId: int("projectId").references(() => projects.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  method: varchar("method", { length: 60 }).notNull(),
  transactionId: varchar("transactionId", { length: 180 }),
  receipt: text("receipt"),
  status: mysqlEnum("status", ["PENDING", "PAID", "FAILED", "REFUNDED"]).default("PENDING").notNull(),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const expenses = mysqlTable("expenses", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 220 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  projectId: int("projectId").references(() => projects.id),
  description: text("description"),
  receipt: text("receipt"),
  spentAt: timestamp("spentAt").defaultNow().notNull(),
});

export const projectRequests = mysqlTable("projectRequests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  company: varchar("company", { length: 160 }),
  service: varchar("service", { length: 160 }).notNull(),
  projectType: varchar("projectType", { length: 120 }).notNull(),
  budget: varchar("budget", { length: 80 }),
  deadline: varchar("deadline", { length: 80 }),
  description: text("description").notNull(),
  attachments: json("attachments").$type<string[]>().notNull(),
  status: mysqlEnum("status", ["NEW", "REVIEWING", "IN_PROGRESS", "COMPLETED", "ARCHIVED"]).default("NEW").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const contactMessages = mysqlTable("contactMessages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  company: varchar("company", { length: 160 }),
  subject: varchar("subject", { length: 220 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["NEW", "READ", "REPLIED", "ARCHIVED"]).default("NEW").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const supportTickets = mysqlTable("supportTickets", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull().references(() => users.id),
  subject: varchar("subject", { length: 220 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  priority: mysqlEnum("priority", ["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM").notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"]).default("OPEN").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const ticketMessages = mysqlTable("ticketMessages", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull().references(() => supportTickets.id),
  authorId: int("authorId").notNull().references(() => users.id),
  message: text("message").notNull(),
  attachmentUrl: text("attachmentUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  type: varchar("type", { length: 64 }).notNull(),
  title: varchar("title", { length: 220 }).notNull(),
  body: text("body").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  action: varchar("action", { length: 80 }).notNull(),
  entity: varchar("entity", { length: 80 }).notNull(),
  entityId: int("entityId"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const siteSettings = mysqlTable("siteSettings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Service = typeof services.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type ProjectRequest = typeof projectRequests.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type CaseStudy = typeof caseStudies.$inferSelect;
export type Product = typeof products.$inferSelect;
export type PricingPlan = typeof pricingPlans.$inferSelect;
export type FAQ = typeof faqs.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
