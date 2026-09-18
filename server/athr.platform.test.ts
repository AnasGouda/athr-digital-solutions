import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(user: TrpcContext["user"] = null): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

const customer = {
  id: 42,
  openId: "customer-open-id",
  name: "Customer",
  email: "customer@example.com",
  loginMethod: "manus",
  role: "user" as const,
  accessRole: "CUSTOMER",
  avatarUrl: null,
  phone: null,
  company: null,
  status: "ACTIVE" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};
const admin = { ...customer, id: 1, role: "admin" as const, accessRole: "ADMIN" as const };
const finance = { ...customer, id: 43, accessRole: "FINANCE" as const };

describe("ATHR platform authorization", () => {
  it("rejects customer access to admin metrics on the backend", async () => {
    const caller = appRouter.createCaller(context(customer));
    await expect(caller.admin.overview()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects customer access to admin resource feeds", async () => {
    const caller = appRouter.createCaller(context(customer));
    await expect(caller.admin.resources()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects customer access to financial reports", async () => {
    const caller = appRouter.createCaller(context(customer));
    await expect(caller.admin.financialReport()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects unauthenticated access to the customer portal", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.portal.overview()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("validates project request descriptions before writing", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.projectRequests.create({
      name: "A",
      email: "not-an-email",
      service: "Web",
      projectType: "Website",
      description: "short",
      attachments: [],
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects empty chatbot turns before invoking the model", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.ai.chat({ messages: [{ role: "user", content: "" }] })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("validates receipt file types before storage access", async () => {
    const caller = appRouter.createCaller(context(admin));
    await expect(caller.admin.uploadReceipt({ entity: "expense", id: 1, fileName: "receipt.pdf", mimeType: "application/pdf", data: "too-short" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("blocks finance roles from content mutations", async () => {
    const caller = appRouter.createCaller(context(finance));
    await expect(caller.admin.deleteBlogPost({ id: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("does not expose diagnostics to customers", async () => {
    const caller = appRouter.createCaller(context(customer));
    await expect(caller.admin.diagnostics()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("keeps local demo login disabled unless explicitly enabled", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.auth.demoLogin()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
