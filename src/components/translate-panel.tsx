"use client";

import { useState } from "react";
import { Mic, Volume2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useSupabaseAuth } from "@/lib/supabase/auth-provider";
import { speak, startDictation, speechRecognitionSupported } from "@/lib/voice";
import { awardTranslationXp } from "@/lib/xp";

type Result = { tamil: string; roman: string; literal?: string; offline?: boolean };

// Cache the last 20 translations in memory — identical input never re-calls.
const cache = new Map<string, Result>();
function remember(key: string, value: Result) {
  cache.set(key, value);
  if (cache.size > 20) cache.delete(cache.keys().next().value as string);
}

async function offlineFallback(q: string): Promise<Result | null> {
  const { data } = await supabase
    .from("phrases")
    .select("local_text, pron")
    .ilike("en", `%${q}%`)
    .limit(1);
  const row = data?.[0];
  return row ? { tamil: row.local_text, roman: row.pron, offline: true } : null;
}

export function TranslatePanel() {
  const { session } = useSupabaseAuth();
  const userId = session?.user.id ?? null;

  const [text, setText] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [listening, setListening] = useState(false);
  const micOk = speechRecognitionSupported();

  async function translate(input = text) {
    const q = input.trim();
    if (!q) return;

    const hit = cache.get(q);
    if (hit) {
      setResult(hit);
      speak(hit.tamil, { roman: hit.roman });
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: q }),
      });
      if (!res.ok) throw new Error("route error");
      const data = (await res.json()) as Result;
      const r: Result = { tamil: data.tamil, roman: data.roman, literal: data.literal };
      remember(q, r);
      setResult(r);
      setStatus("idle");
      speak(r.tamil, { roman: r.roman });
      if (userId) void awardTranslationXp(userId); // +5, capped 30/day
    } catch {
      const fb = await offlineFallback(q);
      if (fb) {
        setResult(fb);
        setStatus("idle");
        speak(fb.tamil, { roman: fb.roman });
      } else {
        setResult(null);
        setStatus("error");
      }
    }
  }

  function mic() {
    setListening(true);
    startDictation({
      onResult: (t) => {
        setText(t);
        void translate(t);
      },
      onEnd: () => setListening(false),
      onError: () => setListening(false),
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-card bg-speak-tint p-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void translate();
        }}
        className="flex gap-2"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type English…"
          aria-label="English to translate"
          className="t-body min-w-0 flex-1 rounded-inner border border-line bg-surface px-3 py-3 text-ink placeholder:text-muted focus:outline-none"
        />
        {micOk && (
          <button
            type="button"
            onClick={mic}
            aria-label="Dictate in English"
            className={`flex h-12 w-12 items-center justify-center rounded-full ${
              listening ? "bg-live text-white" : "bg-surface text-speak"
            }`}
          >
            <Mic size={20} />
          </button>
        )}
        <button
          type="submit"
          disabled={status === "loading"}
          className="t-subtitle rounded-full bg-speak px-5 text-white disabled:opacity-60"
        >
          {status === "loading" ? "…" : "Go"}
        </button>
      </form>

      {status === "error" && (
        <p className="t-body text-live">Couldn&apos;t translate and no offline phrase matched.</p>
      )}

      {result && (
        <div className="flex flex-col gap-2 rounded-inner bg-surface p-4">
          {result.offline && <p className="t-micro text-muted">Offline phrase</p>}
          <div className="flex items-start justify-between gap-3">
            <p lang="ta" className="t-hero text-ink" style={{ fontFamily: "var(--font-tamil)" }}>
              {result.tamil}
            </p>
            <button
              type="button"
              onClick={() => speak(result.tamil, { roman: result.roman })}
              aria-label="Speak the Tamil"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-speak text-white"
            >
              <Volume2 size={20} />
            </button>
          </div>
          <p className="t-body text-muted">{result.roman}</p>
          {result.literal && <p className="t-label text-muted/80">≈ {result.literal}</p>}
        </div>
      )}
    </div>
  );
}
