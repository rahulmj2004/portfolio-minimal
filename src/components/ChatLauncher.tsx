"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { VoiceState } from "@/lib/voice";
import { AskRahul } from "@/components/AskRahul";
import { langPref } from "@/lib/lang";

/** Floating glass orb in the corner; tapping it opens the AI chat. */
export function ChatLauncher() {
  const [open, setOpen] = useState(false);
  const ml = useSyncExternalStore(langPref.subscribe, langPref.get, () => "en" as const) === "ml";
  const [voice, setVoice] = useState<VoiceState>("idle");
  const orbRef = useRef<HTMLButtonElement>(null);

  // react to the chat's voice: glow while listening, "talk" while speaking
  useEffect(() => {
    const onVoice = (e: Event) => setVoice((e as CustomEvent<VoiceState>).detail);
    const onWord = () => {
      const el = orbRef.current;
      if (!el) return;
      el.classList.remove("word");
      void el.offsetWidth; // restart the beat animation
      el.classList.add("word");
    };
    // live loudness of the ElevenLabs voice → orb size and glow
    const onLevel = (e: Event) => orbRef.current?.style.setProperty("--lvl", String((e as CustomEvent<number>).detail));
    window.addEventListener("ai-voice", onVoice);
    window.addEventListener("ai-word", onWord);
    window.addEventListener("ai-level", onLevel);
    return () => {
      window.removeEventListener("ai-voice", onVoice);
      window.removeEventListener("ai-word", onWord);
      window.removeEventListener("ai-level", onLevel);
    };
  }, []);
  // greeting bubble pops up a few seconds after load, until the visitor opens or dismisses it
  const [greet, setGreet] = useState(false);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem("ai-greet") === "1";
    } catch {}
    const t = setTimeout(() => (dismissed ? setSeen(true) : setGreet(true)), dismissed ? 0 : 2500);
    return () => clearTimeout(t);
  }, []);

  function hideGreeting() {
    setGreet(false);
    setSeen(true);
    try {
      sessionStorage.setItem("ai-greet", "1");
    } catch {}
  }

  function toggle() {
    hideGreeting();
    setOpen((o) => !o);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="Ask about Rahul"
          className="chat-panel fixed bottom-[112px] right-4 z-50 w-[min(400px,calc(100vw-32px))] md:bottom-[142px] md:right-6"
        >
          <div className="overflow-hidden rounded-[28px] shadow-[0_24px_60px_-20px_rgb(0_0_0/0.35)]">
            <div className="flex items-center justify-between border-b border-[#ecece9] bg-white px-5 py-3.5">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <span className="ai-dot" /> {ml ? "രാഹുലിന്റെ AI" : "Ask about Rahul"}
                {voice !== "idle" && (
                  <span className="text-xs font-medium text-mute">· {voice === "listening" ? (ml ? "കേൾക്കുന്നു…" : "Listening…") : ml ? "സംസാരിക്കുന്നു…" : "Speaking…"}</span>
                )}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="grid size-8 place-items-center rounded-full text-mute hover:bg-chip hover:text-ink"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <AskRahul compact />
          </div>
        </div>
      )}

      {greet && !open && (
        <div className="greet fixed bottom-[112px] right-4 z-50 w-[min(270px,calc(100vw-32px))] md:bottom-[142px] md:right-6">
          <button
            type="button"
            onClick={toggle}
            className="block w-full rounded-[22px] rounded-br-md border border-line bg-white px-4 py-3 text-left shadow-[0_18px_40px_-18px_rgb(0_0_0/0.35)]"
          >
            <span className="block text-[15px] font-semibold">{ml ? "👋 നമസ്കാരം! ഞാൻ രാഹുലിന്റെ AI." : "👋 Hi! I'm Rahul's AI."}</span>
            <span className="mt-0.5 block text-sm text-soft">
              {ml ? "രാഹുലിന്റെ ജോലിയെക്കുറിച്ച് എന്തും ചോദിക്കൂ." : "Ask me anything about his work."}
              <span className="mt-1 block text-xs text-mute">{ml ? "English-ലും ചോദിക്കാം" : "മലയാളത്തിലും ചോദിക്കാം"}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={hideGreeting}
            aria-label="Dismiss"
            className="absolute -left-2 -top-2 grid size-6 place-items-center rounded-full border border-line bg-white text-mute shadow-sm hover:text-ink"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      )}

      <button
        ref={orbRef}
        type="button"
        onClick={toggle}
        data-voice={voice}
        aria-label={open ? "Close AI chat" : "Ask my AI about Rahul"}
        aria-expanded={open}
        className="orb-btn fixed bottom-4 right-4 z-50 size-[84px] md:bottom-6 md:right-6 md:size-[104px]"
      >
        <span aria-hidden className="orb-ring" />
        <span aria-hidden className="orb-ring orb-ring-2" />
        <Image src="/ai-orb.png" alt="" width={320} height={320} priority className="orb-spin relative size-full rounded-full" />
        {!open && !seen && <span aria-hidden className="orb-badge">1</span>}
        {!open && <span className="orb-tip">Ask my AI</span>}
      </button>
    </>
  );
}
