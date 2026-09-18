import { describe, expect, it } from "vitest";
import { Resend } from "resend";
import nodemailer from "nodemailer";

describe("email provider credentials", () => {
  it.skipIf(!process.env.RESEND_API_KEY)("validates the Resend API key with a domains request", async () => {
    const response = await new Resend(process.env.RESEND_API_KEY!).domains.list();
    expect(response.error).toBeNull();
  }, 20_000);

  it.skipIf(!(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASSWORD))("validates custom SMTP credentials without sending mail", async () => {
    const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT), secure: process.env.SMTP_SECURE === "true", auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } });
    await expect(transport.verify()).resolves.toBe(true);
  }, 20_000);
});
