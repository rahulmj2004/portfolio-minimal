"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/** Weighted, buttery page scrolling. Native scrolling is kept for prefers-reduced-motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.1,
      wheelMultiplier: 0.95,
      // "View my work" and other in-page links glide instead of jumping
      anchors: { duration: 1.4, easing: (t: number) => 1 - Math.pow(1 - t, 4) },
    });

    return () => lenis.destroy();
  }, []);

  return null;
}
