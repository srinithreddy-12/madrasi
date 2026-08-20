"use client";

import { useEffect, useState } from "react";

// Replaces every progress bar in the app (STYLE-v2 §4). 64px, 6px stroke, track
// in --line, fill in the module colour, rounded cap, percentage centred.
// Ring draw: stroke-dashoffset animates 0→value over 600ms ease-out on mount,
// staggered via delayMs. Reduced motion is handled by the global CSS guard.

type ProgressRingProps = {
  value: number; // 0..100
  /** Module colour as a CSS value, e.g. "var(--eat)". */
  color: string;
  size?: number;
  stroke?: number;
  delayMs?: number;
  /** Caption rendered under the ring (e.g. the module name). */
  caption?: string;
};

export function ProgressRing({
  value,
  color,
  size = 44,
  stroke = 4,
  delayMs = 0,
  caption,
}: ProgressRingProps) {
  const pct = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const dashoffset = mounted ? circumference * (1 - pct / 100) : circumference;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${caption ?? "Progress"}: ${pct}%`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: `stroke-dashoffset 600ms ease-out`, transitionDelay: `${delayMs}ms` }}
          />
        </svg>
        <span className="t-label absolute inset-0 flex items-center justify-center text-ink">
          {pct}%
        </span>
      </div>
      {caption && <span className="t-micro text-muted">{caption}</span>}
    </div>
  );
}
