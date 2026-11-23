"use client";

/**
 * Hero background: a perspective "tunnel" made of two grid planes (ceiling + floor).
 * Lanes fan out from a narrow far edge and bend into straight verticals near the viewer.
 * Glowing pulses run down random lanes, and every ~20s a soft wave sweeps the whole grid.
 * Pure SVG + CSS animation; pauses when off-screen, when the tab is hidden, or with reduced motion.
 */
import { useEffect, useId, useRef, useState } from "react";

const VW = 1248; // viewBox width
const VH = 440; // viewBox height
const MID = VW / 2;
const EDGE = 24; // side padding of the near (vertical) lanes
const LANES = 15;
const FAR_SCALE = 0.42; // how narrow the far edge is compared with the near edge

type Plane = { grid: string; lanes: string[] };

/** Build one plane. `bend` = fraction of the height where lanes turn vertical. */
function buildPlane(bend: number): Plane {
  const by = VH * bend;
  const r = Math.min(22, (VH - by) / 6); // corner radius of the bend
  const lanes: string[] = [];
  for (let i = 0; i < LANES; i++) {
    const near = EDGE + ((VW - 2 * EDGE) * i) / (LANES - 1);
    const far = MID + (near - MID) * FAR_SCALE;
    // point on the slanted segment just before the bend
    const sx = near + (r / by) * (far - near);
    lanes.push(`M ${far} 0 L ${sx} ${by - r} Q ${near} ${by} ${near} ${by + r} V ${VH}`);
  }
  // depth rows across the slanted part (closer together far away)
  const slanted = [0, 0.12, 0.29, 0.52, 0.81].map((t) => {
    const half = (MID - EDGE) * (FAR_SCALE + (1 - FAR_SCALE) * t);
    return `M ${MID - half} ${t * by} H ${MID + half}`;
  });
  // rows across the vertical part
  const straight = [0.25, 0.57, 0.92].map((t) => `M ${EDGE} ${by + (VH - by) * t} H ${VW - EDGE}`);
  return { grid: [...lanes, ...slanted, ...straight].join(" "), lanes };
}

const CEILING = buildPlane(0.85);
const FLOOR = buildPlane(0.7);

type Pulse = { id: number; lane: number };

/** Spawn a pulse on a random free lane every `every` ms, at most 3 at a time. */
function usePulses(running: boolean, every: number) {
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const live = useRef<Pulse[]>([]);
  const nextId = useRef(0);
  const lastLane = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const spawn = () => {
      if (live.current.length >= 3) return;
      const free = Array.from({ length: LANES }, (_, i) => i).filter(
        (i) => i !== lastLane.current && !live.current.some((p) => p.lane === i),
      );
      const lane = free[Math.floor(Math.random() * free.length)];
      lastLane.current = lane;
      live.current = [...live.current, { id: nextId.current++, lane }];
      setPulses(live.current);
    };
    if (live.current.length === 0) spawn();
    const t = window.setInterval(spawn, every);
    return () => window.clearInterval(t);
  }, [running, every]);

  const done = (id: number) => {
    live.current = live.current.filter((p) => p.id !== id);
    setPulses(live.current);
  };
  return { pulses, done };
}

function GridPlane({ id, kind, pulses, onDone }: { id: string; kind: "ceiling" | "floor"; pulses: Pulse[]; onDone: (id: number) => void }) {
  const { grid, lanes } = kind === "ceiling" ? CEILING : FLOOR;
  return (
    <div className={`hgt-plane hgt-${kind}`}>
      <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" focusable="false">
        <defs>
          <filter id={`${id}-glow`} filterUnits="userSpaceOnUse" x="-12" y="-12" width={VW + 24} height={VH + 24} colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="halo" />
            <feMerge>
              <feMergeNode in="halo" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* bright head, soft tail */}
          <linearGradient id={`${id}-light`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.65" stopColor="currentColor" stopOpacity="0.35" />
            <stop offset="0.9" stopColor="currentColor" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
          <mask id={`${id}-grid`} maskUnits="userSpaceOnUse" x="0" y="0" width={VW} height={VH}>
            <path d={grid} fill="none" stroke="white" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
          </mask>
          {pulses.map((p) => (
            <mask key={p.id} id={`${id}-lane-${p.id}`} maskUnits="userSpaceOnUse" x="0" y="0" width={VW} height={VH}>
              <path d={lanes[p.lane]} fill="none" stroke="white" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
            </mask>
          ))}
        </defs>
        <g transform={kind === "ceiling" ? `translate(0 ${VH}) scale(1 -1)` : undefined}>
          <path className="hgt-lines" d={grid} fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <g filter={`url(#${id}-glow)`}>
            {pulses.map((p) => (
              <g key={p.id} mask={`url(#${id}-lane-${p.id})`}>
                <rect className="hgt-pulse" x="0" y="-140" width={VW} height="140" fill={`url(#${id}-light)`} onAnimationEnd={() => onDone(p.id)} />
              </g>
            ))}
            <g mask={`url(#${id}-grid)`}>
              <rect className="hgt-wave" x="0" y="-220" width={VW} height="220" fill={`url(#${id}-light)`} />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}

export function HeroGrid() {
  const id = `hgt-${useId().replace(/:/g, "")}`;
  const ref = useRef<HTMLDivElement>(null);
  const [running, setRunning] = useState(false);
  const ceiling = usePulses(running, 1500);
  const floor = usePulses(running, 1000);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const update = () => setRunning(visible && !document.hidden && !reduce.matches);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    reduce.addEventListener("change", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
      reduce.removeEventListener("change", update);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className="hgt" data-running={running}>
      <GridPlane id={`${id}-ceiling`} kind="ceiling" pulses={ceiling.pulses} onDone={ceiling.done} />
      <GridPlane id={`${id}-floor`} kind="floor" pulses={floor.pulses} onDone={floor.done} />
      <div className="hgt-fade" />
    </div>
  );
}
