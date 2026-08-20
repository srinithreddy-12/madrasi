"use client";

import { useEffect, useId, useState } from "react";
import { MODULE_BY_KEY, type ModuleKey } from "@/lib/modules";

// One of the five pass stamps: a rubber-stamp impression that inks in from 0–100
// as its axis fills (BRIEF.md: NOT a bar, NOT a radar — a stamp). The arc and the
// central ink both ramp in over 600ms ease-out when the Pass mounts.

type StampMeterProps = {
  axis: ModuleKey;
  value: number; // 0..100
  size?: number;
};

export function StampMeter({ axis, value, size = 88 }: StampMeterProps) {
  const m = MODULE_BY_KEY[axis];
  const pct = Math.max(0, Math.min(100, value));
  const stroke = 5;
  const r = size / 2 - stroke - 3;
  const circumference = 2 * Math.PI * r;
  const filterId = useId().replace(/:/g, "");

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const dashoffset = mounted ? circumference * (1 - pct / 100) : circumference;
  const inkOpacity = mounted ? 0.28 + 0.72 * (pct / 100) : 0.12;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${m.label} stamp, ${pct} of 100`}
      >
        <defs>
          <filter id={`rough-${filterId}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="2" />
          </filter>
        </defs>
        <g filter={`url(#rough-${filterId})`}>
          {/* Faint full ring — the un-inked impression. */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--mtc)"
            strokeOpacity={0.16}
            strokeWidth={stroke}
          />
          {/* Inked arc, filling to `pct`. */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--mtc)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dashoffset 600ms ease-out" }}
          />
        </g>
        <text
          x={size / 2}
          y={size / 2 - 3}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--mtc)"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "15px",
            fontWeight: 500,
            opacity: inkOpacity,
            transition: "opacity 600ms ease-out",
          }}
        >
          {m.routeCode}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 13}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--faded)"
          style={{ fontFamily: "var(--font-mono)", fontSize: "8px", letterSpacing: "0.1em" }}
        >
          {m.label}
        </text>
      </svg>
      <span className="tabular text-micro text-faded">{pct}</span>
    </div>
  );
}
