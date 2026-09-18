import { and, count, desc, eq, gte, inArray, ne, sum } from "drizzle-orm";
import { storagePut } from "./storage";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  auditLogs,
  blogPosts,
  caseStudies,
  contactMessages,
  expenses,
  faqs,
  invoices,
  files,
  milestones,
  notifications,
  payments,
  pricingPlans,
  products,
  projectRequests,
  projectTasks,
  projects,
  services,
  siteSettings,
  supportTickets,
  testimonials,
  ticketMessages,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { sendWelcomeEmail } from "./email";

let _db: ReturnType<typeof drizzle> | null = null;
let seedPromise: Promise<void> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.openId, user.openId)).limit(1);
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod", "avatarUrl", "phone", "company"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
    values.accessRole = "SUPER_ADMIN";
    updateSet.accessRole = "SUPER_ADMIN";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  if (!existing.length) {
    const created = await db.select({ id: users.id }).from(users).where(eq(users.openId, user.openId)).limit(1);
    if (created[0]) {
      await db.insert(notifications).values({ userId: created[0].id, type: "WELCOME", title: "Welcome to ATHR", body: "Your account is ready. Explore your workspace, projects, files, and support messages.", read: false });
      if (user.email) {
        try { await sendWelcomeEmail({ to: user.email, name: user.name }); }
        catch (error) { console.warn("[Email] Welcome email delivery failed:", error instanceof Error ? error.message : error); }
      }
    }
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function updateUserProfile(userId: number, input: { name?: string; phone?: string | null; company?: string | null; avatarData?: string; avatarMimeType?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const values: Partial<typeof users.$inferInsert> = {};
  if (input.name !== undefined) values.name = input.name;
  if (input.phone !== undefined) values.phone = input.phone;
  if (input.company !== undefined) values.company = input.company;
  if (input.avatarData && input.avatarMimeType) {
    const extension = input.avatarMimeType.split("/")[1] || "jpg";
    const buffer = Buffer.from(input.avatarData.replace(/^data:[^;]+;base64,/, ""), "base64");
    if (buffer.length > 5_000_000) throw new Error("Avatar must be smaller than 5 MB");
    const uploaded = await storagePut(`avatars/${userId}-${Date.now()}.${extension}`, buffer, input.avatarMimeType);
    values.avatarUrl = uploaded.url;
  }
  if (!Object.keys(values).length) return getUserById(userId);
  await db.update(users).set(values).where(eq(users.id, userId));
  return getUserById(userId);
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result[0];
}

export async function getPublicContent() {
  const db = await getDb();
  if (!db) return { services: [], products: [], caseStudies: [], testimonials: [], faqs: [], pricingPlans: [], blogPosts: [], settings: {} };
  await seedPublicContent();
  const [serviceRows, productRows, caseRows, testimonialRows, faqRows, planRows, postRows, settingRows] = await Promise.all([
    db.select().from(services).where(eq(services.published, true)).orderBy(services.sortOrder),
    db.select().from(products).where(eq(products.status, "PUBLISHED")).orderBy(desc(products.createdAt)),
    db.select().from(caseStudies).where(eq(caseStudies.published, true)).orderBy(desc(caseStudies.publishedAt)),
    db.select().from(testimonials).where(eq(testimonials.published, true)),
    db.select().from(faqs).where(eq(faqs.published, true)).orderBy(faqs.sortOrder),
    db.select().from(pricingPlans).where(eq(pricingPlans.published, true)).orderBy(pricingPlans.sortOrder),
    db.select().from(blogPosts).where(eq(blogPosts.status, "PUBLISHED")).orderBy(desc(blogPosts.publishedAt)).limit(6),
    db.select().from(siteSettings),
  ]);
  return {
    services: serviceRows,
    products: productRows,
    caseStudies: caseRows,
    testimonials: testimonialRows,
    faqs: faqRows,
    pricingPlans: planRows,
    blogPosts: postRows,
    settings: Object.fromEntries(settingRows.map(item => [item.key, item.value])),
  };
}

export async function getPublicService(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  await seedPublicContent();
  const rows = await db.select().from(services).where(and(eq(services.slug, slug), eq(services.published, true))).limit(1);
  return rows[0];
}

export async function getPublicBlog(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  await seedPublicContent();
  const rows = await db.select().from(blogPosts).where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, "PUBLISHED"))).limit(1);
  return rows[0];
}

export async function getPublicCaseStudy(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  await seedPublicContent();
  const rows = await db.select().from(caseStudies).where(and(eq(caseStudies.slug, slug), eq(caseStudies.published, true))).limit(1);
  return rows[0];
}

export async function getPublicProduct(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  await seedPublicContent();
  const rows = await db.select().from(products).where(and(eq(products.slug, slug), eq(products.status, "PUBLISHED"))).limit(1);
  return rows[0];
}

export async function createContactMessage(input: typeof contactMessages.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = await db.insert(contactMessages).values(input);
  return { id: Number(result[0].insertId) };
}

export async function createProjectRequest(input: typeof projectRequests.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = await db.insert(projectRequests).values(input);
  return { id: Number(result[0].insertId) };
}

export async function getCustomerPortal(userId: number) {
  const db = await getDb();
  if (!db) return { projects: [], invoices: [], payments: [], tickets: [], notifications: [], tasks: [], milestones: [], files: [] };
  const customerProjects = await db.select().from(projects).where(eq(projects.customerId, userId)).orderBy(desc(projects.updatedAt));
  const projectIds = customerProjects.map(project => project.id);
  const [customerInvoices, customerPayments, tickets, customerNotifications] = await Promise.all([
    db.select().from(invoices).where(eq(invoices.customerId, userId)).orderBy(desc(invoices.createdAt)),
    db.select().from(payments).where(eq(payments.customerId, userId)).orderBy(desc(payments.createdAt)),
    db.select().from(supportTickets).where(eq(supportTickets.customerId, userId)).orderBy(desc(supportTickets.updatedAt)),
    db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(12),
  ]);
  const ticketIds = tickets.map(ticket => ticket.id);
  const customerMessages = ticketIds.length ? await db.select().from(ticketMessages).where(inArray(ticketMessages.ticketId, ticketIds)).orderBy(desc(ticketMessages.createdAt)) : [];
  const [tasks, projectMilestones, customerFiles] = await Promise.all([
    projectIds.length ? db.select().from(projectTasks).where(inArray(projectTasks.projectId, projectIds)) : Promise.resolve([]),
    projectIds.length ? db.select().from(milestones).where(inArray(milestones.projectId, projectIds)) : Promise.resolve([]),
    db.select().from(files).where(eq(files.customerId, userId)),
  ]);
  return { projects: customerProjects, invoices: customerInvoices, payments: customerPayments, tickets, notifications: customerNotifications, messages: customerMessages, tasks, milestones: projectMilestones, files: customerFiles };
}

export async function getAdminOverview() {
  const db = await getDb();
  if (!db) return { customers: 0, newCustomers: 0, activeProjects: 0, completedProjects: 0, pendingProjects: 0, overdueProjects: 0, openTickets: 0, pendingRequests: 0, teamMembers: 0, paidInvoices: 0, unpaidInvoices: 0, outstandingInvoices: "0", revenue: "0", expenses: "0", profit: "0", cashFlow: "0" };
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const [[customerCount], [newCustomerCount], [activeProjectCount], [completedProjectCount], [pendingProjectCount], [overdueProjectCount], [ticketCount], [requestCount], [teamCount], [paidInvoiceCount], [unpaidInvoiceCount], [revenue], [expenseTotal], [invoiceTotals]] = await Promise.all([
    db.select({ value: count() }).from(users).where(eq(users.accessRole, "CUSTOMER")),
    db.select({ value: count() }).from(users).where(and(eq(users.accessRole, "CUSTOMER"), gte(users.createdAt, monthStart))),
    db.select({ value: count() }).from(projects).where(eq(projects.status, "IN_PROGRESS")),
    db.select({ value: count() }).from(projects).where(eq(projects.status, "COMPLETED")),
    db.select({ value: count() }).from(projects).where(eq(projects.status, "PENDING")),
    db.select({ value: count() }).from(projects).where(and(gte(projects.deadline, new Date(0)), eq(projects.status, "IN_PROGRESS"))),
    db.select({ value: count() }).from(supportTickets).where(eq(supportTickets.status, "OPEN")),
    db.select({ value: count() }).from(projectRequests).where(eq(projectRequests.status, "NEW")),
    db.select({ value: count() }).from(users).where(ne(users.accessRole, "CUSTOMER")),
    db.select({ value: count() }).from(invoices).where(eq(invoices.status, "PAID")),
    db.select({ value: count() }).from(invoices).where(ne(invoices.status, "PAID")),
    db.select({ value: sum(payments.amount) }).from(payments).where(eq(payments.status, "PAID")),
    db.select({ value: sum(expenses.amount) }).from(expenses),
    db.select({ total: sum(invoices.total), paid: sum(invoices.paid) }).from(invoices).where(ne(invoices.status, "PAID")),
  ]);
  const revenueValue = Number(revenue?.value ?? 0);
  const expenseValue = Number(expenseTotal?.value ?? 0);
  const outstandingValue = Number(invoiceTotals?.total ?? 0) - Number(invoiceTotals?.paid ?? 0);
  return { customers: Number(customerCount?.value ?? 0), newCustomers: Number(newCustomerCount?.value ?? 0), activeProjects: Number(activeProjectCount?.value ?? 0), completedProjects: Number(completedProjectCount?.value ?? 0), pendingProjects: Number(pendingProjectCount?.value ?? 0), overdueProjects: Number(overdueProjectCount?.value ?? 0), openTickets: Number(ticketCount?.value ?? 0), pendingRequests: Number(requestCount?.value ?? 0), teamMembers: Number(teamCount?.value ?? 0), paidInvoices: Number(paidInvoiceCount?.value ?? 0), unpaidInvoices: Number(unpaidInvoiceCount?.value ?? 0), outstandingInvoices: String(outstandingValue), revenue: String(revenue?.value ?? 0), expenses: String(expenseTotal?.value ?? 0), profit: String(revenueValue - expenseValue), cashFlow: String(revenueValue - expenseValue) };
}

export async function getAdminRequests() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projectRequests).orderBy(desc(projectRequests.createdAt)).limit(50);
}

export async function getAdminCustomers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).where(eq(users.accessRole, "CUSTOMER")).orderBy(desc(users.createdAt)).limit(100);
}

export async function getAdminProjects() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).orderBy(desc(projects.updatedAt)).limit(100);
}

export async function getAdminResourceData() {
  const db = await getDb();
  if (!db) return { tasks: [], invoices: [], payments: [], expenses: [], messages: [], notifications: [], auditLogs: [], team: [], settings: [], support: [] };
  const [taskRows, invoiceRows, paymentRows, expenseRows, messageRows, notificationRows, auditRows, teamRows, settingRows, supportRows] = await Promise.all([
    db.select().from(projectTasks).orderBy(desc(projectTasks.updatedAt)).limit(100),
    db.select().from(invoices).orderBy(desc(invoices.createdAt)).limit(100),
    db.select().from(payments).orderBy(desc(payments.createdAt)).limit(100),
    db.select().from(expenses).orderBy(desc(expenses.spentAt)).limit(100),
    db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(100),
    db.select().from(notifications).orderBy(desc(notifications.createdAt)).limit(100),
    db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100),
    db.select().from(users).where(ne(users.accessRole, "CUSTOMER")).orderBy(desc(users.createdAt)).limit(100),
    db.select().from(siteSettings).orderBy(siteSettings.key),
    db.select().from(supportTickets).orderBy(desc(supportTickets.updatedAt)).limit(100),
  ]);
  return { tasks: taskRows, invoices: invoiceRows, payments: paymentRows, expenses: expenseRows, messages: messageRows, notifications: notificationRows, auditLogs: auditRows, team: teamRows, settings: settingRows, support: supportRows };
}

export async function updateProjectRequestStatus(id: number, status: "NEW" | "REVIEWING" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED") {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(projectRequests).set({ status }).where(eq(projectRequests.id, id));
  return { success: true };
}

export async function createSupportTicket(input: typeof supportTickets.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = await db.insert(supportTickets).values(input);
  return { id: Number(result[0].insertId) };
}

export async function addTicketMessage(input: typeof ticketMessages.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = await db.insert(ticketMessages).values(input);
  return { id: Number(result[0].insertId) };
}

export async function getFinancialReportData() {
  const db = await getDb();
  if (!db) return { payments: [], expenses: [], invoices: [], monthly: [] };
  const [paymentRows, expenseRows, invoiceRows] = await Promise.all([
    db.select().from(payments).where(eq(payments.status, "PAID")).orderBy(desc(payments.createdAt)).limit(500),
    db.select().from(expenses).orderBy(desc(expenses.spentAt)).limit(500),
    db.select().from(invoices).orderBy(desc(invoices.createdAt)).limit(500),
  ]);
  const monthMap = new Map<string, { month: string; income: number; expenses: number; profit: number }>();
  for (const row of paymentRows) { const month = new Date(row.paidAt ?? row.createdAt).toISOString().slice(0, 7); const item = monthMap.get(month) ?? { month, income: 0, expenses: 0, profit: 0 }; item.income += Number(row.amount); item.profit = item.income - item.expenses; monthMap.set(month, item); }
  for (const row of expenseRows) { const month = new Date(row.spentAt).toISOString().slice(0, 7); const item = monthMap.get(month) ?? { month, income: 0, expenses: 0, profit: 0 }; item.expenses += Number(row.amount); item.profit = item.income - item.expenses; monthMap.set(month, item); }
  return { payments: paymentRows, expenses: expenseRows, invoices: invoiceRows, monthly: Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month)) };
}

export async function createAdminProject(input: typeof projects.$inferInsert, actorId: number) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  const result = await db.insert(projects).values(input); const id = Number(result[0].insertId);
  await recordAuditLog({ userId: actorId, action: "CREATE", entity: "project", entityId: id, metadata: { name: input.name } }); return { id };
}

export async function updateAdminProject(id: number, input: Partial<typeof projects.$inferInsert>, actorId: number) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.update(projects).set(input).where(eq(projects.id, id));
  await recordAuditLog({ userId: actorId, action: "UPDATE", entity: "project", entityId: id, metadata: input }); return { success: true };
}

export async function archiveCustomer(id: number, actorId: number) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.update(users).set({ status: "SUSPENDED" }).where(eq(users.id, id));
  await recordAuditLog({ userId: actorId, action: "ARCHIVE", entity: "customer", entityId: id }); return { success: true };
}

export async function updateCustomer(id: number, input: Pick<typeof users.$inferInsert, "name" | "email" | "phone" | "company" | "status">, actorId: number) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.update(users).set(input).where(and(eq(users.id, id), eq(users.accessRole, "CUSTOMER")));
  await recordAuditLog({ userId: actorId, action: "UPDATE", entity: "customer", entityId: id, metadata: input }); return { success: true };
}

export async function createCustomer(input: { name: string; email: string; phone?: string | null; company?: string | null }, actorId: number) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  const result = await db.insert(users).values({ openId: `admin-created-${crypto.randomUUID()}`, name: input.name, email: input.email, phone: input.phone ?? null, company: input.company ?? null, role: "user", accessRole: "CUSTOMER", status: "ACTIVE" });
  const id = Number(result[0].insertId); await recordAuditLog({ userId: actorId, action: "CREATE", entity: "customer", entityId: id, metadata: { email: input.email } }); return { id };
}

export async function createBlogPost(input: typeof blogPosts.$inferInsert, actorId: number) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable"); const result = await db.insert(blogPosts).values(input); const id = Number(result[0].insertId);
  await recordAuditLog({ userId: actorId, action: "CREATE", entity: "blog_post", entityId: id, metadata: { slug: input.slug } }); return { id };
}

export async function updateBlogPost(id: number, input: Partial<typeof blogPosts.$inferInsert>, actorId: number) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.update(blogPosts).set(input).where(eq(blogPosts.id, id));
  await recordAuditLog({ userId: actorId, action: "UPDATE", entity: "blog_post", entityId: id, metadata: input }); return { success: true };
}

export async function deleteBlogPost(id: number, actorId: number) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.delete(blogPosts).where(eq(blogPosts.id, id));
  await recordAuditLog({ userId: actorId, action: "DELETE", entity: "blog_post", entityId: id }); return { success: true };
}

export async function uploadReceipt(input: { entity: "payment" | "expense"; id: number; fileName: string; mimeType: string; data: string; actorId: number }) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  const cleanName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
  const buffer = Buffer.from(input.data.replace(/^data:[^;]+;base64,/, ""), "base64");
  const uploaded = await storagePut(`receipts/${input.entity}/${input.id}-${cleanName}`, buffer, input.mimeType);
  if (input.entity === "payment") await db.update(payments).set({ receipt: uploaded.url }).where(eq(payments.id, input.id));
  else await db.update(expenses).set({ receipt: uploaded.url }).where(eq(expenses.id, input.id));
  await recordAuditLog({ userId: input.actorId, action: "ATTACH_RECEIPT", entity: input.entity, entityId: input.id, metadata: { fileName: cleanName, mimeType: input.mimeType, url: uploaded.url, size: buffer.length } });
  return uploaded;
}

export async function recordAuditLog(input: typeof auditLogs.$inferInsert) {
  const db = await getDb(); if (!db) return { id: 0 };
  const result = await db.insert(auditLogs).values(input); return { id: Number(result[0].insertId) };
}

async function seedPublicContent() {
  if (!seedPromise) seedPromise = seedPublicContentImpl().catch(error => { seedPromise = null; throw error; });
  await seedPromise;
  await ensureProducts();
}

async function ensureProducts() {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select({ value: count() }).from(products);
  if (Number(existing[0]?.value ?? 0) > 0) return;
  await db.insert(products).values([
    { slug: "athr-portal", nameAr: "بوابة أثر", nameEn: "ATHR Portal", descriptionAr: "مساحة عميل جاهزة لمتابعة المشاريع، الملفات، الفواتير والدعم في تجربة واحدة.", descriptionEn: "A ready-to-brand client space for projects, files, invoices, and support in one experience.", category: "SaaS", price: "0", images: [], features: ["بوابة عميل", "تحديثات المشروع", "فواتير ودعم", "صلاحيات آمنة"], status: "PUBLISHED" },
    { slug: "athr-ops", nameAr: "أثر للعمليات", nameEn: "ATHR Ops", descriptionAr: "لوحة تشغيل تربط الطلبات، المشاريع، الفريق والمؤشرات في مساحة عملية.", descriptionEn: "An operations workspace connecting requests, projects, teams, and signals in one place.", category: "Operations", price: "0", images: [], features: ["لوحة مؤشرات", "إدارة الطلبات", "صلاحيات الفريق", "سجل تدقيق"], status: "PUBLISHED" },
  ]);
}

async function seedPublicContentImpl() {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select({ value: count() }).from(services);
  if (Number(existing[0]?.value ?? 0) > 0) return;
  await db.insert(services).values([
    { slug: "web-development", nameAr: "تطوير الويب", nameEn: "Web Development", descriptionAr: "نبني منصات ويب سريعة، آمنة وقابلة للتوسع تحوّل أهدافك إلى تجارب رقمية مؤثرة.", descriptionEn: "We build fast, secure, scalable web platforms that turn your goals into high-impact digital experiences.", icon: "Globe2", features: ["منصات SaaS", "متاجر رقمية", "بوابات العملاء"], technologies: ["React", "TypeScript", "Node.js"], sortOrder: 1 },
    { slug: "ai-solutions", nameAr: "حلول الذكاء الاصطناعي", nameEn: "AI Solutions", descriptionAr: "نحوّل البيانات والعمليات إلى أنظمة ذكية تساعد فريقك على النمو بثقة.", descriptionEn: "We transform data and operations into intelligent systems that help your team grow with confidence.", icon: "Sparkles", features: ["مساعدات ذكية", "استخراج البيانات", "أتمتة القرار"], technologies: ["LLM", "Python", "Vector Search"], sortOrder: 2 },
    { slug: "product-design", nameAr: "تصميم المنتجات", nameEn: "Product Design", descriptionAr: "تجارب واضحة وجميلة تجمع بين الاستراتيجية، UX والهوية البصرية.", descriptionEn: "Clear, beautiful experiences blending strategy, UX, and visual identity.", icon: "PenTool", features: ["بحث المستخدم", "UX/UI", "Design Systems"], technologies: ["Figma", "Prototyping", "Design Tokens"], sortOrder: 3 },
    { slug: "automation", nameAr: "الأتمتة", nameEn: "Automation", descriptionAr: "نربط أدواتك ونختصر الأعمال المتكررة لنمنح فريقك وقتاً لما يستحق.", descriptionEn: "We connect your tools and remove repetitive work so your team can focus on what matters.", icon: "Workflow", features: ["تكاملات API", "سير العمل", "تقارير تلقائية"], technologies: ["REST", "Webhooks", "Cloud"], sortOrder: 4 },
    { slug: "mobile-apps", nameAr: "تطبيقات الجوال", nameEn: "Mobile Applications", descriptionAr: "تطبيقات جوال أصلية وعابرة للمنصات مصممة لأداء حقيقي.", descriptionEn: "Native and cross-platform mobile apps designed for real-world performance.", icon: "Smartphone", features: ["iOS و Android", "تجارب سلسة", "إشعارات"], technologies: ["React Native", "Expo", "Push"], sortOrder: 5 },
    { slug: "cloud-solutions", nameAr: "الحلول السحابية", nameEn: "Cloud Solutions", descriptionAr: "بنية سحابية موثوقة مع أمن، مراقبة وتوسع محسوب.", descriptionEn: "Reliable cloud foundations with security, observability, and measured scale.", icon: "Cloud", features: ["تهيئة سحابية", "DevOps", "مراقبة"], technologies: ["AWS", "Docker", "CI/CD"], sortOrder: 6 },
  ]);
  await db.insert(caseStudies).values([
    { slug: "nawa-market", titleAr: "نواة — من فكرة إلى سوق رقمي", titleEn: "Nawa — From Idea to Digital Marketplace", client: "Nawa", category: "E-commerce", descriptionAr: "منصة تجارة رقمية تمكّن المشاريع المحلية من إطلاق حضورها بثقة.", descriptionEn: "A digital commerce platform helping local businesses launch with confidence.", challengeAr: "تجربة شراء مشتتة وعمليات يدوية تحد من النمو.", challengeEn: "A fragmented buying journey and manual operations limited growth.", solutionAr: "منصة موحدة للمنتجات، الطلبات والتحليلات.", solutionEn: "A unified platform for products, orders, and analytics.", technologies: ["React", "Node.js", "MySQL"], results: ["+42% تحويل", "-60% أعمال يدوية", "إطلاق خلال 10 أسابيع"], images: ["/manus-storage/athr-case-nawa.jpg"] },
    { slug: "sahab-ops", titleAr: "سحاب — عمليات أذكى لفريق أسرع", titleEn: "Sahab — Smarter Operations for a Faster Team", client: "Sahab", category: "Automation", descriptionAr: "نظام عمليات داخلي ربط البيانات والمهام والتنبيهات في مساحة واحدة.", descriptionEn: "An internal operations system connecting data, tasks, and alerts in one workspace.", challengeAr: "تأخر القرارات بسبب أدوات منفصلة وبيانات غير موحدة.", challengeEn: "Slow decisions caused by disconnected tools and fragmented data.", solutionAr: "لوحة تشغيل وأتمتة يومية مع إشعارات سياقية.", solutionEn: "An operational dashboard and daily automation with contextual alerts.", technologies: ["TypeScript", "Automation", "Dashboards"], results: ["-35% وقت إعداد", "+2.4x وضوح", "قرار أسرع"], images: ["/manus-storage/athr-case-sahab.jpg"] },
  ]);
  await db.insert(testimonials).values([
    { clientName: "سارة العتيبي", company: "نواة", position: "المؤسس والرئيس التنفيذي", rating: 5, messageAr: "فريق أثر فهم ما نحتاجه قبل أن نعرف كيف نشرحه. النتيجة منتج نفخر به.", messageEn: "ATHR understood what we needed before we knew how to articulate it. The result is a product we are proud of." },
    { clientName: "خالد الحربي", company: "سحاب", position: "مدير المنتجات", rating: 5, messageAr: "وضوح، سرعة، واهتمام حقيقي بالتفاصيل. شريك تقني نفكر معه على المدى الطويل.", messageEn: "Clarity, speed, and genuine attention to detail. A technical partner we can build with for the long term." },
  ]);
  await db.insert(faqs).values([
    { questionAr: "كيف تبدأون أي مشروع؟", questionEn: "How do you start a project?", answerAr: "نبدأ بجلسة اكتشاف قصيرة نفهم فيها أهدافك، جمهورك، القيود ومقياس النجاح قبل اقتراح المسار المناسب.", answerEn: "We begin with a short discovery session to understand your goals, audience, constraints, and success metric before recommending a path.", sortOrder: 1 },
    { questionAr: "هل تقدمون الدعم بعد الإطلاق؟", questionEn: "Do you offer post-launch support?", answerAr: "نعم. نوفر خطط دعم وصيانة ومراقبة حسب احتياج المنتج وفريقك.", answerEn: "Yes. We offer support, maintenance, and monitoring plans tailored to your product and team.", sortOrder: 2 },
    { questionAr: "هل يمكنني متابعة تقدم مشروعي؟", questionEn: "Can I track project progress?", answerAr: "بالتأكيد. يحصل كل عميل على بوابة خاصة لمتابعة المهام، المراحل، الملفات والفواتير.", answerEn: "Absolutely. Every client gets a private portal for tasks, milestones, files, and invoices.", sortOrder: 3 },
    { questionAr: "ما مدة تنفيذ المشروع؟", questionEn: "How long does a project take?", answerAr: "تختلف حسب النطاق، لكن معظم المشاريع الأولى تتراوح بين 4 و12 أسبوعاً.", answerEn: "It varies by scope, but most first releases take 4–12 weeks.", sortOrder: 4 },
  ]);
  await db.insert(pricingPlans).values([
    { nameAr: "الانطلاقة", nameEn: "Launch", price: "0", period: "جلسة اكتشاف", features: ["جلسة اكتشاف", "خريطة أولية", "تقدير نطاق"], highlighted: false, ctaAr: "ابدأ النقاش", ctaEn: "Start a conversation", sortOrder: 1 },
    { nameAr: "النمو", nameEn: "Growth", price: "0", period: "حسب المشروع", features: ["استراتيجية وتجربة", "تطوير متكامل", "بوابة متابعة", "دعم الإطلاق"], highlighted: true, ctaAr: "اطلب عرضاً", ctaEn: "Request a proposal", sortOrder: 2 },
    { nameAr: "الشراكة", nameEn: "Partnership", price: "0", period: "حسب الاحتياج", features: ["فريق مخصص", "تحسين مستمر", "أتمتة وذكاء", "أولوية الدعم"], highlighted: false, ctaAr: "تحدث مع الفريق", ctaEn: "Talk to the team", sortOrder: 3 },
  ]);
  await db.insert(blogPosts).values([
    { slug: "digital-product-discovery", titleAr: "لماذا تبدأ المنتجات الرقمية بالاكتشاف؟", titleEn: "Why Digital Products Begin with Discovery", excerptAr: "قبل أول سطر كود، هناك أسئلة تصنع الفرق بين فكرة جميلة ومنتج مؤثر.", excerptEn: "Before the first line of code, there are questions that separate a beautiful idea from an impactful product.", contentAr: "الاكتشاف ليس مرحلة شكلية. إنه مساحة لفهم المشكلة، المستخدم، وسياق القرار.", contentEn: "Discovery is not a formality. It is the space where we understand the problem, the user, and the context for decisions.", author: "فريق أثر", category: "المنتجات", tags: ["استراتيجية", "UX"], seoTitle: "اكتشاف المنتجات الرقمية | أثر" },
    { slug: "automation-that-scales", titleAr: "الأتمتة التي تنمو مع فريقك", titleEn: "Automation That Scales with Your Team", excerptAr: "الأتمتة الجيدة لا تضيف تعقيداً؛ بل تزيل الاحتكاك من يوم الفريق.", excerptEn: "Good automation does not add complexity; it removes friction from the team's day.", contentAr: "ابدأ من العملية الأكثر تكراراً، ثم صمم مساراً يمكن قياسه وتحسينه.", contentEn: "Start with the most repetitive process, then design a flow that can be measured and improved.", author: "فريق أثر", category: "الأتمتة", tags: ["أتمتة", "عمليات"], seoTitle: "الأتمتة القابلة للتوسع | أثر" },
  ]);
  await db.insert(siteSettings).values([
    { key: "statProjects", value: "24" },
    { key: "statClients", value: "18" },
    { key: "statExperience", value: "7" },
    { key: "statServices", value: "9" },
    { key: "contactEmail", value: "hello@athr.digital" },
    { key: "contactPhone", value: "+966 50 000 0000" },
  ]);
}
