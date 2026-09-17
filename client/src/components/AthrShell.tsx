import { Link, useLocation } from "wouter";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowUpLeft, Globe2, Menu, X, LogIn, Sparkles, Linkedin, Mail } from "lucide-react";
import { startLogin } from "@/const";
import { useLanguage } from "@/contexts/LanguageContext";
import { AthrChatbot } from "@/components/AthrChatbot";
import { AthrIntro } from "@/components/AthrIntro";

const nav = [
  ["/", "الرئيسية", "Home"],
  ["/about", "عن أثر", "About"],
  ["/services", "الخدمات", "Services"],
  ["/solutions", "الحلول", "Solutions"],
  ["/products", "المنتجات", "Products"],
  ["/case-studies", "قصص النجاح", "Case Studies"],
  ["/blog", "المعرفة", "Blog"],
  ["/contact", "تواصل", "Contact"],
] as const;

export function AthrLogo({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className="flex items-center gap-3 group" aria-label="ATHR home">
    <span className="relative grid h-10 w-10 place-items-center rounded-2xl border border-[#d8b36a]/40 bg-[#d8b36a]/10 text-[#edce8a] shadow-[0_0_30px_rgba(216,179,106,.15)] transition group-hover:rotate-6">
      <span className="absolute inset-2 rounded-xl border border-[#d8b36a]/60" />
      <span className="font-display text-lg font-bold">أ</span>
    </span>
    {!compact && <span className="leading-none"><strong className="block font-display text-lg tracking-[.14em] text-[#f7f2e9]">ATHR</strong><small className="mt-1 block text-[9px] tracking-[.14em] text-[#ad9e8c]">DIGITAL SOLUTIONS</small></span>}
  </Link>;
}

export function PublicShell({ children }: { children: ReactNode }) {
  const { isArabic, toggleLanguage } = useLanguage();
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { const handler = () => setScrolled(window.scrollY > 20); window.addEventListener("scroll", handler); return () => window.removeEventListener("scroll", handler); }, []);
  useEffect(() => setMenuOpen(false), [location]);
  return <div className="min-h-screen overflow-x-clip bg-[#0a0907] text-[#f7f2e9]"><AthrIntro />
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-white/8 bg-[#0d0c0a]/84 shadow-2xl shadow-black/20 backdrop-blur-xl" : "bg-transparent"}`}>
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <AthrLogo />
        <nav className="hidden items-center gap-5 xl:flex">
          {nav.map(([href, ar, en]) => <Link key={href} href={href} className={`relative px-1 py-2 text-[13px] font-medium text-[#b9aea0] transition hover:text-[#f7f2e9] ${location === href ? "text-[#edce8a]" : ""}`}>{isArabic ? ar : en}{location === href && <span className="absolute -bottom-1 start-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#d8b36a]" />}</Link>)}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <button type="button" onClick={toggleLanguage} className="btn-ghost !border-transparent !bg-transparent !px-3 !py-2 text-xs" aria-label="Switch language"><Globe2 size={15} className="text-[#d8b36a]" /> {isArabic ? "EN" : "عربي"}</button>
          <button type="button" onClick={() => startLogin()} className="btn-ghost !px-4 !py-2.5 text-xs"><LogIn size={15} /> {isArabic ? "دخول" : "Login"}</button>
          <Link href="/start-project" className="btn-primary !px-5 !py-2.5 text-xs">{isArabic ? "ابدأ مشروعك" : "Start a project"}<ArrowUpLeft size={15} /></Link>
        </div>
        <button type="button" className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5 xl:hidden" onClick={() => setMenuOpen(open => !open)} aria-label={menuOpen ? "Close menu" : "Open menu"}>{menuOpen ? <X /> : <Menu />}</button>
      </div>
      {menuOpen && <div className="border-t border-white/8 bg-[#0d0c0a]/96 px-5 py-5 backdrop-blur-xl xl:hidden">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-1">
          {nav.map(([href, ar, en]) => <Link key={href} href={href} className={`rounded-xl px-4 py-3 text-sm transition hover:bg-white/5 ${location === href ? "bg-[#d8b36a]/10 text-[#edce8a]" : "text-[#cfc5b8]"}`}>{isArabic ? ar : en}</Link>)}
          <div className="mt-3 flex gap-2 border-t border-white/8 pt-4"><button type="button" onClick={toggleLanguage} className="btn-ghost flex-1 text-sm"><Globe2 size={15} /> {isArabic ? "English" : "العربية"}</button><Link href="/start-project" className="btn-primary flex-1 text-sm">{isArabic ? "ابدأ مشروعك" : "Start a project"}</Link></div>
        </div>
      </div>}
    </header>
    <main>{children}</main>
    <Footer />
    <AthrChatbot />
  </div>;
}

export function Footer() {
  const { isArabic } = useLanguage();
  return <footer className="border-t border-white/8 bg-[#0c0b09]">
    <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.25fr_.7fr_.7fr_1fr] lg:px-12">
      <div><AthrLogo /><p className="mt-6 max-w-sm text-sm leading-8 text-[#9f9487]">{isArabic ? "نصمم ونبني منتجات رقمية تجعل الطموح قابلاً للنمو — من الفكرة إلى الأثر." : "We design and build digital products that make ambition scalable — from idea to impact."}</p><div className="mt-7 flex items-center gap-3"><a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="ATHR on LinkedIn" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-[#aaa092] transition hover:border-[#d8b36a]/50 hover:text-[#edce8a]"><Linkedin size={15} /></a><a href="mailto:hello@athr.digital" aria-label="Email ATHR" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-[#aaa092] transition hover:border-[#d8b36a]/50 hover:text-[#edce8a]"><Mail size={15} /></a></div></div>
      <div><h3 className="mb-5 text-sm font-semibold text-[#f7f2e9]">{isArabic ? "استكشف" : "Explore"}</h3><div className="flex flex-col gap-3 text-sm text-[#9f9487]">{nav.slice(1, 6).map(([href, ar, en]) => <Link key={href} href={href} className="transition hover:text-[#edce8a]">{isArabic ? ar : en}</Link>)}</div></div>
      <div><h3 className="mb-5 text-sm font-semibold text-[#f7f2e9]">{isArabic ? "تواصل" : "Connect"}</h3><div className="flex flex-col gap-3 text-sm text-[#9f9487]"><a href="mailto:hello@athr.digital" className="transition hover:text-[#edce8a]">hello@athr.digital</a><a href="tel:+966500000000" className="transition hover:text-[#edce8a]">+966 50 000 0000</a><span>{isArabic ? "الرياض · المملكة العربية السعودية" : "Riyadh · Saudi Arabia"}</span></div></div>
      <div><h3 className="mb-5 text-sm font-semibold text-[#f7f2e9]">{isArabic ? "مساحتك" : "Your space"}</h3><p className="mb-4 text-sm leading-7 text-[#9f9487]">{isArabic ? "تابع مشروعك، ملفاتك وفواتيرك من بوابة العميل." : "Track your project, files, and invoices from your client portal."}</p><button type="button" onClick={() => startLogin()} className="btn-ghost !px-4 !py-2.5 text-xs"><Sparkles size={14} />{isArabic ? "دخول البوابة" : "Client login"}</button></div>
    </div>
    <div className="mx-auto flex max-w-[1440px] flex-col gap-3 border-t border-white/8 px-5 py-6 text-xs text-[#786e62] sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12"><span>© {new Date().getFullYear()} ATHR Digital Solutions</span><div className="flex gap-5"><Link href="/privacy" className="hover:text-[#d8b36a]">{isArabic ? "الخصوصية" : "Privacy"}</Link><Link href="/terms" className="hover:text-[#d8b36a]">{isArabic ? "الشروط" : "Terms"}</Link></div></div>
  </footer>;
}

export function SectionHeading({ eyebrow, title, body, align = "start" }: { eyebrow: string; title: string; body?: string; align?: "start" | "center" }) {
  return <div className={`${align === "center" ? "mx-auto text-center" : ""} max-w-2xl`}><div className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[.2em] text-[#d8b36a]"><span className="h-px w-8 bg-[#d8b36a]/60" />{eyebrow}</div><h2 className="font-display text-3xl font-semibold leading-tight tracking-[-.03em] text-[#f7f2e9] sm:text-5xl">{title}</h2>{body && <p className="mt-5 text-base leading-8 text-[#a99d90]">{body}</p>}</div>;
}

export function PageIntro({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return <section className="bg-grid relative overflow-hidden border-b border-white/6 pb-20 pt-40"><div className="pointer-events-none absolute -end-24 top-20 h-72 w-72 rounded-full bg-[#d8b36a]/10 blur-[100px]" /><div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12"><SectionHeading eyebrow={eyebrow} title={title} body={body} /></div></section>;
}
