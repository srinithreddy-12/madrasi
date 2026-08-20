"use client";

import { Bookmark, Volume2 } from "lucide-react";
import type { Phrase } from "@/lib/types";
import { speak } from "@/lib/voice";

export function PhraseCard({
  phrase,
  saved,
  onToggleSave,
}: {
  phrase: Phrase;
  saved: boolean;
  onToggleSave: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-card border border-line bg-surface p-card shadow-card">
      <div className="min-w-0">
        <p className="t-label text-muted">{phrase.en}</p>
        <p lang="ta" className="t-title mt-1 text-ink" style={{ fontFamily: "var(--font-tamil)" }}>
          {phrase.local_text}
        </p>
        <p className="t-label text-muted">{phrase.pron}</p>
      </div>
      <div className="flex shrink-0 flex-col gap-2">
        <button
          type="button"
          onClick={() => speak(phrase.local_text, { roman: phrase.pron })}
          aria-label={`Speak: ${phrase.en}`}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-speak text-white"
        >
          <Volume2 size={18} />
        </button>
        <button
          type="button"
          onClick={onToggleSave}
          aria-pressed={saved}
          aria-label={saved ? "Saved" : "Save phrase"}
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            saved ? "bg-speak text-white" : "border border-line text-muted"
          }`}
        >
          <Bookmark size={18} />
        </button>
      </div>
    </div>
  );
}
