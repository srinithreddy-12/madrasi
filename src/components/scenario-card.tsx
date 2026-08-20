"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Lightbulb, Pencil, Play, RotateCcw, Square, Volume2 } from "lucide-react";
import type { Scenario, ScenarioLine } from "@/lib/types";
import { speak, speakSequence } from "@/lib/voice";

// Voice casting (VOICE.md): the two speakers must be audibly different. Sarvam
// gets a distinct speaker per seeded `voice` role (female/male/elder); the pitch
// and rate keep the browser fallback cast too — YOU higher/faster, the other
// person lower/slower.
const lineVoice = (l: ScenarioLine) => ({
  voice: l.voice,
  ...(l.who === "you" ? { pitch: 1.1, rate: 0.92 } : { pitch: 0.85, rate: 0.9 }),
});

// Edit mode swaps every visible field (place, tip, each line's role/ta/pron/en)
// for an input, so a fixed price/distance/name in the seeded dialogue can be
// swapped for the student's own — practice, not a script. Edits are local to
// this card (scenarios is read-only seeded content, no write policy for
// regular users) and reset on reload.
export function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState(-1);
  const [editing, setEditing] = useState(false);
  const [place, setPlace] = useState(scenario.place ?? "");
  const [tip, setTip] = useState(scenario.tip ?? "");
  const [lines, setLines] = useState<ScenarioLine[]>(scenario.lines);
  const handle = useRef<{ stop: () => void } | null>(null);

  useEffect(() => () => handle.current?.stop(), []);

  function updateLine(i: number, patch: Partial<ScenarioLine>) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  function resetToOriginal() {
    setPlace(scenario.place ?? "");
    setTip(scenario.tip ?? "");
    setLines(scenario.lines);
  }

  const edited =
    place !== (scenario.place ?? "") ||
    tip !== (scenario.tip ?? "") ||
    JSON.stringify(lines) !== JSON.stringify(scenario.lines);

  function playAll() {
    handle.current?.stop();
    setPlaying(true);
    handle.current = speakSequence(
      lines.map((l) => ({ text: l.ta, roman: l.pron, ...lineVoice(l) })),
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
        className="flex w-full items-center justify-between gap-3 p-card text-left"
      >
        <div>
          <p className="t-subtitle text-ink">{scenario.title}</p>
          {place && <p className="t-label text-muted">{place}</p>}
        </div>
        <ChevronDown
          size={20}
          className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="flex flex-col gap-3 px-5 pb-5">
          <div className="flex flex-wrap gap-2">
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
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              aria-pressed={editing}
              className={`t-chip flex items-center gap-1.5 rounded-full px-4 py-2 ${
                editing ? "bg-ink text-white" : "border border-line text-ink"
              }`}
            >
              <Pencil size={14} /> {editing ? "Done editing" : "Edit"}
            </button>
            {edited && (
              <button
                type="button"
                onClick={resetToOriginal}
                className="t-chip flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-muted"
              >
                <RotateCcw size={14} /> Reset
              </button>
            )}
          </div>

          {editing && (
            <label className="flex flex-col gap-1">
              <span className="t-micro text-muted">Place</span>
              <input
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder="e.g. Velachery signal, 8:40 AM"
                className="t-label rounded-inner border border-line bg-bg px-3 py-2 text-ink focus:outline-none"
              />
            </label>
          )}

          <ul className="flex flex-col gap-2">
            {lines.map((l, i) => (
              <li
                key={i}
                className={`flex items-start justify-between gap-3 rounded-inner p-3 ${
                  i === active ? "bg-speak-tint" : "bg-bg"
                }`}
              >
                <div className="min-w-0 flex-1">
                  {editing ? (
                    <>
                      <input
                        value={l.role}
                        onChange={(e) => updateLine(i, { role: e.target.value })}
                        placeholder="Speaker"
                        className="t-micro mb-1 w-full rounded-inner border border-line bg-surface px-2 py-1 text-muted focus:outline-none"
                      />
                      <input
                        value={l.ta}
                        onChange={(e) => updateLine(i, { ta: e.target.value })}
                        lang="ta"
                        style={{ fontFamily: "var(--font-tamil)" }}
                        placeholder="Tamil"
                        className="t-subtitle mb-1 w-full rounded-inner border border-line bg-surface px-2 py-1.5 text-ink focus:outline-none"
                      />
                      <input
                        value={l.pron}
                        onChange={(e) => updateLine(i, { pron: e.target.value })}
                        placeholder="Pronunciation"
                        className="t-label mb-1 w-full rounded-inner border border-line bg-surface px-2 py-1 text-muted focus:outline-none"
                      />
                      <input
                        value={l.en}
                        onChange={(e) => updateLine(i, { en: e.target.value })}
                        placeholder="English"
                        className="t-label w-full rounded-inner border border-line bg-surface px-2 py-1 text-ink focus:outline-none"
                      />
                    </>
                  ) : (
                    <>
                      <p className="t-micro text-muted">{l.role}</p>
                      <p lang="ta" className="t-subtitle text-ink" style={{ fontFamily: "var(--font-tamil)" }}>
                        {l.ta}
                      </p>
                      <p className="t-label text-muted">{l.pron}</p>
                      <p className="t-label text-ink">{l.en}</p>
                    </>
                  )}
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

          {editing ? (
            <label className="flex flex-col gap-1">
              <span className="t-micro text-muted">Tip</span>
              <textarea
                value={tip}
                onChange={(e) => setTip(e.target.value)}
                rows={2}
                placeholder="A quick tip for this situation"
                className="t-label rounded-inner border border-line bg-bg px-3 py-2 text-ink focus:outline-none"
              />
            </label>
          ) : (
            tip && (
              <p className="t-label flex items-start gap-2 rounded-inner bg-speak-tint p-3 text-ink">
                <Lightbulb size={16} className="mt-0.5 shrink-0 text-speak" />
                {tip}
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}
