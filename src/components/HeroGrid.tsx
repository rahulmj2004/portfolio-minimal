/**
 * Hero background: a faint perspective grid (a tunnel of lines meeting behind the headline)
 * with a few thin lights gliding along it.
 * Pure SVG, no JS.
 */
import type { CSSProperties } from "react";

const W = 1200;
const H = 800;
const VX = W / 2;
const VY = H / 2;

// lines fanning out from the vanishing point to the top and bottom edges
const fanX = Array.from({ length: 21 }, (_, i) => -600 + i * 120);
// horizontal lines get closer together near the middle, like real perspective
const depths = [1, 1.45, 2.1, 3.1, 4.6];
const rows = depths.flatMap((z) => [VY - VY / z, VY + VY / z]);

// a few lines carry a thin light that glides outward: [end x, top or bottom, duration s, delay s]
const beams: [number, "t" | "b", number, number][] = [
  [-120, "t", 7, 0],
  [1560, "b", 7.5, 2.4],
  [960, "t", 6.5, 4.6],
  [240, "b", 8, 6.2],
];

export function HeroGrid() {
  return (
    <div aria-hidden className="hero-grid pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="size-full">
        <defs>
          <radialGradient id="hg-fade" cx="50%" cy="50%" r="62%">
            <stop offset="0.18" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.55" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.5" />
          </radialGradient>
          <filter id="hg-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <mask id="hg-mask">
            <rect width={W} height={H} fill="url(#hg-fade)" />
          </mask>
        </defs>
        <g mask="url(#hg-mask)">
          <g className="hg-lines" fill="none" strokeWidth="1" vectorEffect="non-scaling-stroke">
            {fanX.map((x) => (
              <g key={x}>
                <line x1={VX} y1={VY} x2={x} y2={0} vectorEffect="non-scaling-stroke" />
                <line x1={VX} y1={VY} x2={x} y2={H} vectorEffect="non-scaling-stroke" />
              </g>
            ))}
            {rows.map((y) => (
              <line key={y} x1={0} y1={y} x2={W} y2={y} vectorEffect="non-scaling-stroke" />
            ))}
          </g>
          <g filter="url(#hg-soft)">
            {beams.map(([x, side, dur, delay]) => (
              <line
                key={`${x}${side}`}
                className="hg-beam"
                x1={VX}
                y1={VY}
                x2={x}
                y2={side === "t" ? 0 : H}
                pathLength={1}
                style={{ "--dur": `${dur}s`, "--delay": `${delay}s` } as CSSProperties}
              />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}
