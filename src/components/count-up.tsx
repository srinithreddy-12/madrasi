"use client";

import { useEffect, useRef, useState } from "react";

// The signature motion (STYLE-v2 §6): every `stat` numeral counts 0→value over
// 700ms ease-out, once on mount. prefers-reduced-motion renders the final value.

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

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

type CountUpProps = {
  value: number;
  durationMs?: number;
  format?: (n: number) => string;
  className?: string;
};

export function CountUp({
  value,
  durationMs = 700,
  format = (n) => String(Math.round(n)),
  className,
}: CountUpProps) {
  const reduced = usePrefersReducedMotion();
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setDisplay(value * easeOut(t));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else setDisplay(value);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, durationMs, reduced]);

  return <span className={className}>{format(display)}</span>;
}
