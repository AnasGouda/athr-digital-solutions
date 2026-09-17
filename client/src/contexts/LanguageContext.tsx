import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Lang = "ar" | "en";

type LanguageContextValue = { lang: Lang; isArabic: boolean; toggleLanguage: () => void; setLang: (lang: Lang) => void };
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem("athr-lang") as Lang) || "ar");
  const value = useMemo(() => ({
    lang,
    isArabic: lang === "ar",
    toggleLanguage: () => setLang(current => { const next = current === "ar" ? "en" : "ar"; localStorage.setItem("athr-lang", next); return next; }),
    setLang: (next: Lang) => { localStorage.setItem("athr-lang", next); setLang(next); },
  }), [lang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
