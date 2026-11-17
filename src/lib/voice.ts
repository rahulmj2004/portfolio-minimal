// Browser-only voice helpers for the AI chat: speech-to-text (mic) and text-to-speech.
// Uses the free Web Speech API built into Chrome, Safari and Edge; nothing is sent to a paid service.
// The current state is broadcast as an "ai-voice" window event so the floating orb can react.

export type VoiceState = "idle" | "listening" | "speaking";

export function announce(state: VoiceState) {
  window.dispatchEvent(new CustomEvent<VoiceState>("ai-voice", { detail: state }));
}

/* ---------- Speech recognition (the mic) ---------- */

type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
};
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | undefined {
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export function canListen() {
  return typeof window !== "undefined" && !!recognitionCtor();
}

/** Starts listening. Calls onText with live words, then onDone with the final sentence (or "" if nothing heard). */
export function listen(
  onText: (t: string) => void,
  onDone: (t: string) => void,
  onError: (msg: string) => void,
  lang: "en" | "ml" = "en",
) {
  const Ctor = recognitionCtor();
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.lang = lang === "ml" ? "ml-IN" : "en-IN";
  rec.interimResults = true;
  rec.continuous = false;
  let text = "";
  rec.onresult = (e) => {
    text = Array.from(e.results)
      .map((r) => r[0].transcript)
      .join("");
    onText(text);
  };
  rec.onerror = (e) => {
    if (e.error === "not-allowed" || e.error === "service-not-allowed") onError("Microphone access was blocked.");
  };
  rec.onend = () => {
    announce("idle");
    onDone(text.trim());
  };
  rec.start();
  announce("listening");
  return rec;
}

/* ---------- Speech synthesis (the AI talking) ---------- */

export function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/* ----- Auto-voice on/off (shared by every chat on the page, remembered per visitor) ----- */

let voiceOn = true;
const listeners = new Set<() => void>();
try {
  if (typeof window !== "undefined" && localStorage.getItem("ai-voice-on") === "0") voiceOn = false;
} catch {}

export const voicePref = {
  get: () => voiceOn,
  set(on: boolean) {
    voiceOn = on;
    try {
      localStorage.setItem("ai-voice-on", on ? "1" : "0");
    } catch {}
    if (!on) stopSpeaking();
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

/* ----- Choosing the best-sounding voice on this device ----- */

// Joke/novelty voices on Apple devices that should never be picked
const NOVELTY =
  /\b(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox|Fred|Junior|Ralph|Kathy|Grandma|Grandpa|Eddy|Flo|Reed|Rocko|Sandy|Shelley|Deranged|Hysterical|Pipe Organ)\b/i;
// Voices that sound natural on each platform (Edge, Chrome, Safari / iPhone / Mac)
const GOOD_NAMES = /\b(Andrew|Guy|Brian|Christopher|Eric|Ryan|Prabhat|Neerja|Aria|Jenny|Ava|Emma|Daniel|Rishi|Samantha|Karen|Moira|Aaron|Evan|Nathan|Tom|Alex|Allison|Zoe|Susan|Serena|Arthur|Martha)\b/;

function voiceScore(v: SpeechSynthesisVoice) {
  if (!v.lang.toLowerCase().startsWith("en") || NOVELTY.test(v.name)) return -1;
  let s = 0;
  if (/Natural|Neural/i.test(v.name)) s += 100; // Microsoft Edge online voices: the most human
  if (/Premium/i.test(v.name)) s += 90; // Apple premium voices
  if (/Enhanced/i.test(v.name)) s += 80; // Apple enhanced voices
  if (/^Google/.test(v.name)) s += 60; // Chrome's Google voices
  if (GOOD_NAMES.test(v.name)) s += 30;
  if (/en[-_](IN|GB|US)/i.test(v.lang)) s += 10;
  if (/en[-_]IN/i.test(v.lang)) s += 5; // a touch of home
  if (v.default) s += 2;
  return s;
}

let bestVoice: SpeechSynthesisVoice | undefined;
function pickVoice(lang: "en" | "ml" = "en") {
  if (lang === "ml") return window.speechSynthesis.getVoices().find((v) => /^ml/i.test(v.lang)); // few devices have one
  if (bestVoice) return bestVoice;
  const voices = window.speechSynthesis.getVoices();
  bestVoice = [...voices].sort((a, b) => voiceScore(b) - voiceScore(a)).find((v) => voiceScore(v) >= 0);
  return bestVoice;
}
// voices load asynchronously in Chrome/Edge; re-pick when the list arrives
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.addEventListener?.("voiceschanged", () => {
    bestVoice = undefined;
  });
}

/* ----- ElevenLabs voice ("Aby") played through one shared <audio> element ----- */

let audio: HTMLAudioElement | null = null;
let ctx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let elevenDown = false; // set after a failure so we stop trying for this visit

// 50ms of silence as a WAV, used to "unlock" audio on iPhones during a tap
function silentWav() {
  const n = 2205;
  const buf = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buf);
  const str = (o: number, t: string) => [...t].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  str(0, "RIFF");
  v.setUint32(4, 36 + n * 2, true);
  str(8, "WAVEfmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, 44100, true);
  v.setUint32(28, 88200, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  str(36, "data");
  v.setUint32(40, n * 2, true);
  return URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
}

function getAudio() {
  if (!audio) {
    audio = new Audio();
    audio.preload = "auto";
  }
  return audio;
}

/** Hooks the audio up to an analyser so the orb can pulse with the real voice. Only when the
 *  AudioContext is running, otherwise routing through it would mute the audio. */
function connectMeter() {
  if (analyser || !ctx || ctx.state !== "running" || !audio) return;
  try {
    const src = ctx.createMediaElementSource(audio);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    src.connect(analyser);
    analyser.connect(ctx.destination);
  } catch {
    analyser = null;
  }
}

function meter(id: number) {
  if (!analyser) return;
  const data = new Uint8Array(analyser.fftSize);
  const tick = () => {
    if (id !== session || !audio || audio.paused) {
      window.dispatchEvent(new CustomEvent("ai-level", { detail: 0 }));
      return;
    }
    analyser!.getByteTimeDomainData(data);
    let sum = 0;
    for (const x of data) sum += ((x - 128) / 128) ** 2;
    const level = Math.min(1, Math.sqrt(sum / data.length) * 4);
    window.dispatchEvent(new CustomEvent("ai-level", { detail: level }));
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/** Call inside a tap/click: iPhones only allow sound that starts from a user gesture. */
export function unlockSpeech() {
  if (typeof window === "undefined") return;
  try {
    const a = getAudio();
    a.src = silentWav();
    a.play().catch(() => {});
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AC && !ctx) ctx = new AC();
    ctx?.resume().then(connectMeter).catch(() => {});
  } catch {}
  if (canSpeak()) {
    const u = new SpeechSynthesisUtterance("");
    u.volume = 0;
    window.speechSynthesis.speak(u);
  }
}

export function stopSpeaking() {
  session++;
  if (audio) audio.pause();
  if (canSpeak()) window.speechSynthesis.cancel();
  if (typeof window !== "undefined") announce("idle");
}

/** Turns chat text into something that sounds natural when read aloud. */
function forSpeech(text: string, lang: "en" | "ml" = "en") {
  return text
    .replace(/https?:\/\/\S+/g, lang === "ml" ? "ചാറ്റിലെ ലിങ്ക്" : "the link in the chat")
    .replace(/\S+@\S+\.\w+/g, (m) => m.replace("@", " at ").replace(/\./g, " dot "))
    .replace(/^\s*[-•]\s*/gm, "")
    .replace(/[*_#`“”"]/g, "")
    .replace(/ — /g, ", ")
    .replace(/\bB\.Tech\b/g, "B Tech")
    .replace(/\bAI\/ML\b/g, "AI and ML")
    .replace(/\n+/g, ". ")
    .replace(/\.\s*\./g, ".")
    .trim();
}

let session = 0;

/** Reads an answer aloud with the best voice available. Long answers are spoken sentence by
 *  sentence, because some browsers cut off a single long utterance after ~15 seconds. */
export function speak(text: string, onEnd?: () => void, lang: "en" | "ml" = "en") {
  const clean = forSpeech(text, lang);
  if (!clean) return;
  stopSpeaking();
  const id = session;
  if (!elevenDown && clean.length <= 900) speakEleven(clean, id, onEnd, lang);
  else speakBrowser(clean, id, onEnd, lang);
}

/** ElevenLabs first; on any failure fall back to the browser's own voice. */
function speakEleven(clean: string, id: number, onEnd?: () => void, lang: "en" | "ml" = "en") {
  const a = getAudio();
  let started = false;
  const fallback = () => {
    if (id !== session || started) return;
    elevenDown = true;
    speakBrowser(clean, id, onEnd, lang);
  };
  a.onplaying = () => {
    if (id !== session) return;
    started = true;
    announce("speaking");
    meter(id);
  };
  a.onended = () => {
    if (id !== session) return;
    announce("idle");
    onEnd?.();
  };
  a.onerror = fallback;
  a.src = `/api/tts?l=${lang}&t=${encodeURIComponent(clean)}`;
  ctx?.resume().catch(() => {});
  connectMeter();
  a.play().catch(fallback);
}

function speakBrowser(clean: string, id: number, onEnd?: () => void, lang: "en" | "ml" = "en") {
  if (!canSpeak()) return;
  // without a Malayalam voice on the device, an English voice would garble it, so stay quiet
  if (lang === "ml" && !pickVoice("ml")) {
    announce("idle");
    return;
  }
  // split only at sentence ends ("Next.js" stays whole)
  const parts = clean.split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean);
  const voice = pickVoice(lang);
  const natural = voice && /Natural|Neural|Premium|Enhanced/i.test(voice.name);

  parts.forEach((part, i) => {
    const u = new SpeechSynthesisUtterance(part);
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    }
    u.rate = natural ? 1 : 1.04;
    u.pitch = 1;
    if (i === 0) u.onstart = () => id === session && announce("speaking");
    // a little "beat" on every word so the orb looks like it is talking
    u.onboundary = () => window.dispatchEvent(new Event("ai-word"));
    if (i === parts.length - 1) {
      u.onend = u.onerror = () => {
        if (id !== session) return;
        announce("idle");
        onEnd?.();
      };
    }
    window.speechSynthesis.speak(u);
  });
}
