"use client";

import { useEffect, useRef, useState } from "react";

// The LED destination board with the signature dot-matrix flip: each character
// cycles through random glyphs before settling (260ms/char, 30ms stagger,
// left-to-right). Runs on mount and whenever the line changes. The final string
// is in the DOM on first paint (aria-label carries it) — never gated by the
// animation. prefers-reduced-motion drops the scramble for a plain crossfade.
//
// v1.1: full bleed, no rounding, amber on ink with scanlines (emitting light).

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·₹:";
const PER_CHAR = 260;
const STAGGER = 30;

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

type LedBoardProps = {
  lines: string[];
  marquee?: string;
  intervalMs?: number;
  /** Called with the currently-shown line when the board is tapped. */
  onActivate?: (line: string) => void;
  className?: string;
};

export function LedBoard({
  lines,
  marquee,
  intervalMs = 3800,
  onActivate,
  className = "",
}: LedBoardProps) {
  const safeLines = lines.length ? lines : [""];
  const [idx, setIdx] = useState(0);
  const target = safeLines[idx % safeLines.length];
  const reduced = usePrefersReducedMotion();
  const [display, setDisplay] = useState(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (safeLines.length <= 1) return;
    const t = setInterval(
      () => setIdx((i) => (i + 1) % safeLines.length),
      intervalMs,
    );
    return () => clearInterval(t);
  }, [safeLines.length, intervalMs]);

  useEffect(() => {
    if (reduced) {
      setDisplay(target);
      return;
    }
    const startAt = performance.now();
    const done = (target.length - 1) * STAGGER + PER_CHAR;

    const tick = (now: number) => {
      const elapsed = now - startAt;
      let out = "";
      for (let i = 0; i < target.length; i++) {
        const ch = target[i];
        const settleAt = i * STAGGER + PER_CHAR;
        if (ch === " ") out += " ";
        else if (elapsed >= settleAt) out += ch;
        else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setDisplay(out);
      if (elapsed < done) rafRef.current = requestAnimationFrame(tick);
      else setDisplay(target);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, reduced]);

  const Panel = (
    <div className="relative bg-ink">
      {marquee && (
        <div className="label flex items-center justify-between px-4 py-1 text-micro text-manila/50">
          <span>{marquee}</span>
          <span aria-hidden="true">● ● ●</span>
        </div>
      )}
      <p
        aria-hidden="true"
        className="tabular flex min-h-[56px] items-center truncate px-4 text-title tracking-[0.12em] text-amber [text-shadow:0_0_11px_rgba(255,165,31,0.45)]"
      >
        {display}
      </p>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.06) 0 1px, transparent 1px 2px)",
        }}
      />
    </div>
  );

  return (
    <div className={className}>
      {onActivate ? (
        <button
          type="button"
          aria-label={`${target} — run this search`}
          onClick={() => onActivate(target)}
          className="block w-full text-left"
        >
          {Panel}
        </button>
      ) : (
        <div aria-label={target} role="text">
          {Panel}
        </div>
      )}
    </div>
  );
}
