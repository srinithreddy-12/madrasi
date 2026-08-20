"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Lightbulb, Play, Square, Volume2 } from "lucide-react";
import type { Scenario, ScenarioLine } from "@/lib/types";
import { speak, speakSequence } from "@/lib/voice";

// Voice casting (VOICE.md): the two speakers must be audibly different — YOU is
// a higher, younger voice; the other person is lower and slower.
const lineVoice = (l: ScenarioLine) =>
  l.who === "you" ? { pitch: 1.1, rate: 0.92 } : { pitch: 0.85, rate: 0.9 };

export function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState(-1);
  const handle = useRef<{ stop: () => void } | null>(null);

  useEffect(() => () => handle.current?.stop(), []);

  function playAll() {
    handle.current?.stop();
    setPlaying(true);
    handle.current = speakSequence(
      scenario.lines.map((l) => ({ text: l.ta, roman: l.pron, ...lineVoice(l) })),
      {
        onIndex: setActive,
        onDone: () => {
          setPlaying(false);
          setActive(-1);
        },
      },
    );
  }

  function stop() {
    handle.current?.stop();
    setPlaying(false);
    setActive(-1);
  }

  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 p-5 text-left"
      >
        <div>
          <p className="t-subtitle text-ink">{scenario.title}</p>
          {scenario.place && <p className="t-label text-muted">{scenario.place}</p>}
        </div>
        <ChevronDown
          size={20}
          className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="flex flex-col gap-3 px-5 pb-5">
          <div className="flex gap-2">
            {playing ? (
              <button
                onClick={stop}
                className="t-chip flex items-center gap-1.5 rounded-full bg-live px-4 py-2 text-white"
              >
                <Square size={14} /> Stop
              </button>
            ) : (
              <button
                onClick={playAll}
                className="t-chip flex items-center gap-1.5 rounded-full bg-speak px-4 py-2 text-white"
              >
                <Play size={14} /> Play conversation
              </button>
            )}
          </div>

          <ul className="flex flex-col gap-2">
            {scenario.lines.map((l, i) => (
              <li
                key={i}
                className={`flex items-start justify-between gap-3 rounded-inner p-3 ${
                  i === active ? "bg-speak-tint" : "bg-bg"
                }`}
              >
                <div className="min-w-0">
                  <p className="t-micro text-muted">{l.role}</p>
                  <p lang="ta" className="t-subtitle text-ink" style={{ fontFamily: "var(--font-tamil)" }}>
                    {l.ta}
                  </p>
                  <p className="t-label text-muted">{l.pron}</p>
                  <p className="t-label text-ink">{l.en}</p>
                </div>
                <button
                  type="button"
                  onClick={() => speak(l.ta, { roman: l.pron, ...lineVoice(l) })}
                  aria-label={`Speak: ${l.en}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-speak text-white"
                >
                  <Volume2 size={16} />
                </button>
              </li>
            ))}
          </ul>

          {scenario.tip && (
            <p className="t-label flex items-start gap-2 rounded-inner bg-speak-tint p-3 text-ink">
              <Lightbulb size={16} className="mt-0.5 shrink-0 text-speak" />
              {scenario.tip}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
