"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

// The Conductor's Punch (required component). On any completion a rubber stamp
// lands on the screen: scale 1.6→1, rotate -14→-6deg, opacity 0→1,
// blur(6px)→blur(0) over 380ms on cubic-bezier(0.2,0.9,0.25,1.1), plus a 40ms
// haptic. Rough, ink-bled edges — never a clean vector circle.
// prefers-reduced-motion → a plain 150ms opacity fade.

const EASE: [number, number, number, number] = [0.2, 0.9, 0.25, 1.1];

type ConductorPunchProps = {
  /** Increment this to fire the punch once. */
  trigger: number;
  /** Short stamp caption, e.g. "PUNCHED" or "+15 MOVE". */
  label?: string;
};

export function ConductorPunch({ trigger, label = "PUNCHED" }: ConductorPunchProps) {
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (trigger <= 0) return;
    setVisible(true);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(40);
    }
    const t = setTimeout(() => setVisible(false), 900);
    return () => clearTimeout(t);
  }, [trigger]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={trigger}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.15 : 0.2 }}
        >
          <motion.div
            initial={
              reduced
                ? { opacity: 0 }
                : { scale: 1.6, rotate: -14, opacity: 0, filter: "blur(6px)" }
            }
            animate={
              reduced
                ? { opacity: 1 }
                : { scale: 1, rotate: -6, opacity: 1, filter: "blur(0px)" }
            }
            transition={{ duration: reduced ? 0.15 : 0.38, ease: EASE }}
          >
            <StampMark label={label} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// A rough, ink-bled stamp — irregular ring, not a clean circle.
function StampMark({ label }: { label: string }) {
  return (
    <svg width="180" height="180" viewBox="0 0 180 180" role="img" aria-label={label}>
      <defs>
        <filter id="punch-rough">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3" />
        </filter>
      </defs>
      <g filter="url(#punch-rough)" fill="none" stroke="var(--stamp)" strokeWidth="4">
        <circle cx="90" cy="90" r="66" strokeOpacity="0.95" />
        <circle cx="90" cy="90" r="58" strokeOpacity="0.55" strokeWidth="2" />
      </g>
      <text
        x="90"
        y="90"
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--stamp)"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "22px",
          fontWeight: 500,
          letterSpacing: "0.05em",
        }}
        filter="url(#punch-rough)"
      >
        {label}
      </text>
    </svg>
  );
}
