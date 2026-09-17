import { useState } from "react";
import { Bot, ChevronDown, Mail, RefreshCw, Send, Sparkles, User, X } from "lucide-react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function AthrChatbot() {
  const { isArabic } = useLanguage();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const mutation = trpc.ai.chat.useMutation({
    onSuccess: result => setMessages(current => [...current, { role: "assistant", content: result.answer }]),
    onError: () => toast.error(isArabic ? "تعذر الوصول إلى المساعد. حاول مرة أخرى." : "The assistant is temporarily unavailable. Try again."),
  });
  const t = (ar: string, en: string) => isArabic ? ar : en;
  const send = (value = input) => {
    const content = value.trim();
    if (!content || mutation.isPending) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    mutation.mutate({ messages: next });
  };
  const prompts = [
    t("ما الخدمات التي تقدمونها؟", "What services do you offer?"),
    t("كيف أبدأ مشروعاً؟", "How do I start a project?"),
    t("أريد التحدث مع الفريق", "I want to talk to the team"),
  ];
  return <div className="fixed bottom-5 end-5 z-[60] flex flex-col items-end gap-3 sm:bottom-7 sm:end-7">
    {open && <div className="glass-gold flex h-[min(620px,calc(100vh-120px))] w-[min(390px,calc(100vw-32px))] flex-col overflow-hidden rounded-[1.75rem] shadow-2xl shadow-black/50" role="dialog" aria-label={t("مساعد أثر الذكي", "ATHR AI assistant")}>
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#d8b36a]/15 text-[#edce8a]"><Bot size={19} /></span><div><div className="text-sm font-semibold">ATHR Assistant</div><div className="mt-0.5 text-[10px] text-[#a99d90]">{t("مساعد ذكي — ليس بديلاً عن فريقنا", "AI assistant — not a replacement for our team")}</div></div></div>
        <button type="button" onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-[#9d9183] hover:bg-white/8" aria-label="Close chatbot"><X size={17} /></button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? <div className="flex h-full flex-col items-center justify-center text-center"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#d8b36a]/10 text-[#edce8a]"><Sparkles size={24} /></span><h3 className="mt-5 text-lg font-semibold">{t("كيف نساعدك؟", "How can we help?")}</h3><p className="mt-2 max-w-[260px] text-xs leading-6 text-[#a99d90]">{t("اسأل عن خدمات أثر، المنتجات، الأسعار أو مشروعك.", "Ask about ATHR services, products, pricing, or your project.")}</p><div className="mt-6 grid w-full gap-2">{prompts.map(prompt => <button key={prompt} type="button" onClick={() => send(prompt)} className="rounded-xl border border-white/10 px-3 py-2.5 text-start text-xs text-[#c9bfb2] transition hover:border-[#d8b36a]/40 hover:bg-[#d8b36a]/8">{prompt}</button>)}</div></div> : <>
          {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex items-start gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            {message.role === "assistant" && <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#d8b36a]/12 text-[#edce8a]"><Bot size={14} /></span>}
            <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${message.role === "user" ? "bg-[#d8b36a] text-[#17120a]" : "bg-white/7 text-[#ded5c9]"}`}>{message.role === "assistant" ? <Streamdown>{message.content}</Streamdown> : message.content}</div>
            {message.role === "user" && <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/8 text-[#a99d90]"><User size={14} /></span>}
          </div>)}
          {mutation.isPending && <div className="flex items-center gap-2 text-xs text-[#a99d90]"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#d8b36a]/12 text-[#edce8a]"><Bot size={14} /></span><span className="flex gap-1"><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#d8b36a]" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#d8b36a] [animation-delay:120ms]" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#d8b36a] [animation-delay:240ms]" /></span></div>}
          {mutation.isError && <button type="button" onClick={() => { const last = messages[messages.length - 1]; if (last?.role === "user") mutation.mutate({ messages }); }} className="flex items-center gap-2 text-xs text-rose-200 hover:text-white"><RefreshCw size={13} />{t("إعادة المحاولة", "Retry")}</button>}
        </>}
      </div>
      <div className="border-t border-white/10 p-3"><div className="mb-2 flex items-center gap-2 text-[10px] text-[#8f8375]"><Mail size={12} className="text-[#d8b36a]" />{t("للدعم البشري: hello@athr.digital", "Human support: hello@athr.digital")}</div><form className="flex items-end gap-2" onSubmit={event => { event.preventDefault(); send(); }}><textarea value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} rows={1} placeholder={t("اكتب رسالتك…", "Type your message…")} className="min-h-10 flex-1 resize-none !rounded-xl !border-white/10 !bg-black/20 !px-3 !py-2.5 text-sm" /><button type="submit" disabled={!input.trim() || mutation.isPending} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#d8b36a] text-[#17120a] transition hover:bg-[#edce8a] disabled:opacity-40" aria-label="Send message"><Send size={16} /></button></form></div>
    </div>}
    <button type="button" onClick={() => setOpen(value => !value)} className="group grid h-14 w-14 place-items-center rounded-2xl border border-[#d8b36a]/50 bg-[#d8b36a] text-[#17120a] shadow-[0_8px_35px_rgba(216,179,106,.25)] transition hover:scale-105" aria-label={open ? "Close AI assistant" : "Open AI assistant"}>{open ? <ChevronDown size={22} /> : <span className="relative"><Bot size={23} /><span className="absolute -end-2 -top-2 h-2.5 w-2.5 rounded-full border-2 border-[#d8b36a] bg-emerald-400" /></span>}</button>
  </div>;
}
