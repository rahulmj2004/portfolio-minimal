// Chat language (English / Malayalam), shared by every chat on the page and remembered per visitor.
import type { Lang } from "@/lib/answers";

let lang: Lang = "en";
const listeners = new Set<() => void>();
try {
  if (typeof window !== "undefined" && localStorage.getItem("ai-lang") === "ml") lang = "ml";
} catch {}

export const langPref = {
  get: (): Lang => lang,
  set(next: Lang) {
    lang = next;
    try {
      localStorage.setItem("ai-lang", next);
    } catch {}
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
