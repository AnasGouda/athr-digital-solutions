import { Resend } from "resend";
import nodemailer from "nodemailer";

export async function sendWelcomeEmail(input: { to: string; name?: string | null }) {
  const subject = "Welcome to ATHR Digital Solutions — أثر للحلول الرقمية";
  const displayName = input.name || "there";
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.8;color:#17120b"><h1 style="color:#9b7538">Welcome to ATHR, ${escapeHtml(displayName)}</h1><p>Your account is ready. You can now follow your projects, files, invoices, and support messages from your ATHR workspace.</p><p>مرحبًا بك في أثر. أصبح حسابك جاهزًا لمتابعة مشاريعك وملفاتك وفواتيرك ورسائلك.</p><p>ATHR Digital Solutions</p></div>`;
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || process.env.RESEND_FROM;
  if (resendKey && from) {
    const resend = new Resend(resendKey);
    const result = await resend.emails.send({ from, to: input.to, subject, html });
    if (result.error) throw new Error(result.error.message);
    return { provider: "resend" as const };
  }
  if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASSWORD && from) {
    const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT), secure: process.env.SMTP_SECURE === "true", auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } });
    await transport.sendMail({ from, to: input.to, subject, html });
    return { provider: "smtp" as const };
  }
  return { provider: "disabled" as const };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] || character);
}
