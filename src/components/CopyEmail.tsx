"use client";

import { useState } from "react";

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className="rounded-full border border-line bg-white px-4 py-2 text-[13px] font-medium text-ink transition hover:border-ink/30"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
