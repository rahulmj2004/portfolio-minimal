"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { answerLang, localAnswer, type Lang } from "@/lib/answers";
import { langPref } from "@/lib/lang";
import { canListen, canSpeak, listen, speak, stopSpeaking, unlockSpeech, voicePref } from "@/lib/voice";

const noop = () => () => {};

type Msg = { role: "user" | "assistant"; content: string };

// Interface text in both languages
const T = {
  en: {
    suggestions: ["What is RxGuard?", "What has he won?", "Which AI tools does he use?", "Is he open to internships?"],
    intro: "Ask anything about my projects, skills or awards.",
    placeholder: "Ask about Rahul…",
    placeholderMic: "Ask, or tap the mic…",
    listening: "Listening… speak now",
    listen: "Listen",
    stop: "Stop",
    noHear: "Didn't catch that. Tap the mic and try again.",
    micBlocked: "Allow the mic in your browser settings, or type instead.",
    tooMany: "You've asked a lot of questions! Take a short break, or email Rahul directly.",
  },
  ml: {
    suggestions: ["RxGuard എന്താണ്?", "എന്തെല്ലാം അവാർഡുകൾ നേടി?", "ഏതൊക്കെ AI ടൂളുകൾ ഉപയോഗിക്കുന്നു?", "ഇന്റേൺഷിപ്പിന് ലഭ്യമാണോ?"],
    intro: "എന്റെ പ്രോജക്ടുകൾ, സ്കില്ലുകൾ, അവാർഡുകൾ എന്നിവയെക്കുറിച്ച് എന്തും ചോദിക്കൂ.",
    placeholder: "ചോദ്യം ചോദിക്കൂ…",
    placeholderMic: "ചോദ്യം ചോദിക്കൂ…",
    listening: "കേൾക്കുന്നു… സംസാരിക്കൂ",
    listen: "കേൾക്കാം",
    stop: "നിർത്തൂ",
    noHear: "വ്യക്തമായില്ല. മൈക്ക് ടാപ്പ് ചെയ്ത് വീണ്ടും ശ്രമിക്കൂ.",
    micBlocked: "ബ്രൗസർ സെറ്റിംഗ്സിൽ മൈക്ക് അനുവദിക്കൂ, അല്ലെങ്കിൽ ടൈപ്പ് ചെയ്യൂ.",
    tooMany: "ഒരുപാട് ചോദ്യങ്ങൾ ചോദിച്ചു! അൽപ്പം കഴിഞ്ഞ് ശ്രമിക്കൂ, അല്ലെങ്കിൽ രാഹുലിന് ഇമെയിൽ ചെയ്യൂ.",
  },
} as const;

const isMl = (text: string) => /[\u0D00-\u0D7F]/.test(text);

/** Turns bare URLs in an answer into links. */
function Linkify({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g);
  return (
    <>
      {parts.map((p, i) =>
        /^https?:\/\//.test(p) ? (
          <a key={i} href={p} target="_blank" rel="noreferrer" className="underline decoration-line underline-offset-2 hover:decoration-ink">
            {p.replace(/^https?:\/\/(www\.)?/, "")}
          </a>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

export function AskRahul({ compact = false }: { compact?: boolean }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<ReturnType<typeof listen>>(null);
  // true once we know there's no AI key on the server → answer locally for free
  const localRef = useRef(false);
  // checked after hydration so server and browser render the same first frame
  const micOk = useSyncExternalStore(noop, canListen, () => false);
  const ttsOk = useSyncExternalStore(noop, canSpeak, () => false);
  // answers are read aloud automatically unless the visitor mutes it
  const voiceOn = useSyncExternalStore(voicePref.subscribe, voicePref.get, () => true);
  const autoSpeak = ttsOk && voiceOn;
  // English or Malayalam, shared with every chat on the page
  const lang = useSyncExternalStore(langPref.subscribe, langPref.get, (): Lang => "en");
  const t = T[lang];

  // stop talking if the chat is closed / unmounted
  useEffect(() => () => stopSpeaking(), []);

  function readAloud(text: string, idx: number) {
    unlockSpeech();
    setSpeakingIdx(idx);
    speak(text, () => setSpeakingIdx((i) => (i === idx ? null : i)), isMl(text) ? "ml" : "en");
  }

  function toggleMic() {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    stopSpeaking();
    unlockSpeech(); // iOS: allow the spoken answer later
    setNotice("");
    setListening(true);
    recRef.current = listen(
      (words) => setInput(words),
      (heard) => {
        setListening(false);
        recRef.current = null;
        if (heard) ask(heard, true);
        else setNotice(t.noHear);
      },
      (msg) => setNotice(lang === "ml" ? t.micBlocked : `${msg} ${t.micBlocked}`),
      lang,
    );
  }

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function ask(question: string, spoken = false) {
    const q = question.trim();
    if (!q || busy) return;
    if (autoSpeak) {
      stopSpeaking();
      unlockSpeech(); // runs inside the tap, so iPhones allow the spoken answer that follows
    }
    // Malayalam if the question is in Malayalam, otherwise the chosen language
    const replyLang = answerLang(q, lang);
    const history: Msg[] = [...messages, { role: "user", content: q.slice(0, 600) }];
    const answerIdx = history.length;
    setMessages([...history, { role: "assistant", content: "" }]);
    setNotice("");
    setInput("");
    setBusy(true);

    const write = (content: string) =>
      setMessages((m) => [...m.slice(0, -1), { role: "assistant", content }]);

    // Free answer from the portfolio content, typed out word by word like the AI would.
    const answerLocally = async () => {
      const previous = messages.filter((m) => m.role === "user").map((m) => m.content);
      const full = localAnswer(q, previous, replyLang);
      await new Promise((r) => setTimeout(r, 450)); // brief "thinking" dots
      // start talking as the words appear
      if ((spoken || autoSpeak) && ttsOk) readAloud(full, answerIdx);
      const parts = full.split(/(\s+)/);
      let shown = "";
      for (let i = 0; i < parts.length; i += 2) {
        shown += parts[i] + (parts[i + 1] ?? "");
        write(shown);
        await new Promise((r) => setTimeout(r, 18));
      }
    };

    try {
      if (localRef.current) {
        await answerLocally();
        return;
      }
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-11), lang: replyLang }),
      });
      if (res.status === 429) {
        write(T[replyLang].tooMany);
        return;
      }
      if (!res.ok || !res.body) {
        // no AI key (503) or server trouble → answer for free from the portfolio content
        if (res.status === 503) localRef.current = true;
        await answerLocally();
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        write(text);
      }
      // read the answer aloud (always when asked by voice)
      if ((spoken || autoSpeak) && ttsOk) readAloud(text, answerIdx);
    } catch {
      await answerLocally();
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    ask(input);
  }

  return (
    <div
      className={`w-full overflow-hidden bg-white text-left ${
        compact ? "" : "mx-auto max-w-[720px] rounded-[28px] border border-[#ecece9]"
      }`}
    >
      <div className="flex items-center justify-end gap-2 border-b border-[#ecece9] px-4 py-2">
        <span className="text-xs text-mute">{lang === "ml" ? "ഭാഷ" : "Language"}</span>
        <div role="radiogroup" aria-label="Chat language" className="flex rounded-full bg-chip p-0.5">
          {(["en", "ml"] as const).map((l) => (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={lang === l}
              onClick={() => langPref.set(l)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                lang === l ? "bg-white text-ink shadow-sm" : "text-mute hover:text-ink"
              }`}
            >
              {l === "en" ? "English" : "മലയാളം"}
            </button>
          ))}
        </div>
      </div>
      <div
        ref={listRef}
        aria-live="polite"
        className={`flex ${compact ? "h-[min(380px,55vh)]" : "max-h-[420px] min-h-[220px]"} flex-col gap-3 overflow-y-auto p-5 md:p-7`}
      >
        {messages.length === 0 ? (
          <div className="my-auto flex flex-col items-center gap-4 text-center">
            <p className="text-[15px] text-soft">{t.intro}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {t.suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="btn rounded-full border border-line bg-card-2 px-3.5 py-1.5 text-[13px] font-medium text-soft hover:border-ink hover:text-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`chat-msg max-w-[88%] whitespace-pre-wrap rounded-[20px] px-4 py-2.5 text-[15px] leading-[1.55] ${
                m.role === "user" ? "self-end bg-ink text-white" : "self-start bg-chip text-ink"
              }`}
            >
              {m.content ? (
                m.role === "assistant" ? (
                  <>
                    <Linkify text={m.content} />
                    {ttsOk && !(busy && i === messages.length - 1) && (
                      <button
                        type="button"
                        onClick={() => (speakingIdx === i ? (stopSpeaking(), setSpeakingIdx(null)) : readAloud(m.content, i))}
                        className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-mute hover:text-ink"
                      >
                        {speakingIdx === i ? (
                          <>
                            <span className="eq" aria-hidden>
                              <i />
                              <i />
                              <i />
                            </span>
                            {T[isMl(m.content) ? "ml" : "en"].stop}
                          </>
                        ) : (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                              <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
                            </svg>
                            {T[isMl(m.content) ? "ml" : "en"].listen}
                          </>
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  m.content
                )
              ) : (
                <span className="typing" aria-label="Thinking">
                  <i />
                  <i />
                  <i />
                </span>
              )}
            </div>
          ))
        )}
      </div>
      {notice && <p className="px-5 pb-1 text-xs text-mute">{notice}</p>}
      <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-[#ecece9] p-2.5 md:p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={600}
          placeholder={listening ? t.listening : micOk ? t.placeholderMic : t.placeholder}
          aria-label="Ask a question about Rahul"
          className="min-w-0 flex-1 rounded-full bg-transparent px-4 py-2.5 text-[16px] outline-none placeholder:text-faint"
        />
        {ttsOk && (
          <button
            type="button"
            onClick={() => voicePref.set(!voiceOn)}
            aria-label={voiceOn ? "Mute spoken answers" : "Read answers aloud"}
            aria-pressed={voiceOn}
            title={voiceOn ? "Voice on: answers are read aloud" : "Voice off"}
            className={`btn grid size-11 shrink-0 place-items-center rounded-full ${voiceOn ? "text-ink" : "text-faint"} hover:bg-chip`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H3v6h3l5 4V5Z" />
              {voiceOn ? <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /> : <path d="m16 9 6 6M22 9l-6 6" />}
            </svg>
          </button>
        )}
        {micOk && (
          <button
            type="button"
            onClick={toggleMic}
            disabled={busy}
            aria-label={listening ? "Stop listening" : "Ask with your voice"}
            aria-pressed={listening}
            className={`mic btn grid size-11 shrink-0 place-items-center rounded-full border disabled:opacity-30 ${
              listening ? "is-on border-transparent bg-[#ef4444] text-white" : "border-line bg-white text-ink hover:border-ink"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
            </svg>
          </button>
        )}
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="btn grid size-11 shrink-0 place-items-center rounded-full bg-ink text-white hover:bg-black disabled:opacity-30"
          aria-label="Send"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </form>
    </div>
  );
}
