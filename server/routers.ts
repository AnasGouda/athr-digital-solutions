import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  addTicketMessage,
  createContactMessage,
  createProjectRequest,
  createSupportTicket,
  getAdminCustomers,
  getAdminOverview,
  getAdminProjects,
  getAdminRequests,
  getCustomerPortal,
  getPublicBlog,
  getPublicCaseStudy,
  getPublicContent,
  getPublicProduct,
  getPublicService,
  updateProjectRequestStatus,
} from "./db";

const requestSchema = z.object({
  name: z.string().min(2).max(160),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  company: z.string().max(160).optional(),
  service: z.string().min(2).max(160),
  projectType: z.string().min(2).max(120),
  budget: z.string().max(80).optional(),
  deadline: z.string().max(80).optional(),
  description: z.string().min(20).max(6000),
  attachments: z.array(z.string().url()).max(5).default([]),
});

const contactSchema = z.object({
  name: z.string().min(2).max(160),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  company: z.string().max(160).optional(),
  subject: z.string().min(2).max(220),
  message: z.string().min(10).max(6000),
});

const ticketSchema = z.object({
  subject: z.string().min(3).max(220),
  category: z.string().min(2).max(100),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  message: z.string().min(10).max(5000),
});

const adminOnly = protectedProcedure.use(({ ctx, next }) => {
  const isAdmin = ctx.user.role === "admin" || ["SUPER_ADMIN", "ADMIN", "MANAGER", "EDITOR", "FINANCE", "SUPPORT"].includes(ctx.user.accessRole);
  if (!isAdmin) throw new TRPCError({ code: "FORBIDDEN", message: "ليس لديك صلاحية للوصول إلى هذه المساحة." });
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  content: router({
    all: publicProcedure.query(() => getPublicContent()),
    service: publicProcedure.input(z.object({ slug: z.string().min(1) })).query(({ input }) => getPublicService(input.slug)),
    caseStudy: publicProcedure.input(z.object({ slug: z.string().min(1) })).query(({ input }) => getPublicCaseStudy(input.slug)),
    blog: publicProcedure.input(z.object({ slug: z.string().min(1) })).query(({ input }) => getPublicBlog(input.slug)),
    product: publicProcedure.input(z.object({ slug: z.string().min(1) })).query(({ input }) => getPublicProduct(input.slug)),
  }),
  contact: router({
    submit: publicProcedure.input(contactSchema).mutation(async ({ input }) => {
      const result = await createContactMessage(input);
      return { success: true, ...result };
    }),
  }),
  projectRequests: router({
    create: publicProcedure.input(requestSchema).mutation(async ({ ctx, input }) => {
      const result = await createProjectRequest({ ...input, userId: ctx.user?.id ?? null });
      return { success: true, ...result };
    }),
  }),
  portal: router({
    overview: protectedProcedure.query(({ ctx }) => getCustomerPortal(ctx.user.id)),
    createTicket: protectedProcedure.input(ticketSchema).mutation(async ({ ctx, input }) => {
      const result = await createSupportTicket({ ...input, customerId: ctx.user.id });
      return { success: true, ...result };
    }),
    replyToTicket: protectedProcedure.input(z.object({ ticketId: z.number().int().positive(), message: z.string().min(2).max(5000) })).mutation(async ({ ctx, input }) => {
      const portal = await getCustomerPortal(ctx.user.id);
      const ticket = portal.tickets.find(item => item.id === input.ticketId);
      if (!ticket) throw new TRPCError({ code: "NOT_FOUND", message: "التذكرة غير موجودة." });
      const result = await addTicketMessage({ ticketId: input.ticketId, authorId: ctx.user.id, message: input.message });
      return { success: true, ...result };
    }),
  }),
  admin: router({
    overview: adminOnly.query(() => getAdminOverview()),
    requests: adminOnly.query(() => getAdminRequests()),
    customers: adminOnly.query(() => getAdminCustomers()),
    projects: adminOnly.query(() => getAdminProjects()),
    content: adminOnly.query(() => getPublicContent()),
    updateRequestStatus: adminOnly.input(z.object({ id: z.number().int().positive(), status: z.enum(["NEW", "REVIEWING", "IN_PROGRESS", "COMPLETED", "ARCHIVED"]) })).mutation(({ input }) => updateProjectRequestStatus(input.id, input.status)),
  }),
});

export type AppRouter = typeof appRouter;
