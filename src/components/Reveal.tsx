"use client";

import { useEffect } from "react";

/**
 * Adds `.is-in` to every [data-reveal] element as it scrolls into view.
 * Content stays visible without JS and for prefers-reduced-motion (see globals.css).
 */
export function Reveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    root.classList.add("reveal-ready");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
      root.classList.remove("reveal-ready");
    };
  }, []);

  return null;
}
