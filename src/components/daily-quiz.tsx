"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import type { Phrase } from "@/lib/types";
import { speak } from "@/lib/voice";
import { useSupabaseAuth } from "@/lib/supabase/auth-provider";
import { awardQuizXp } from "@/lib/xp";

type Question = { en: string; answer: string; options: string[] };

function shuffle<T>(a: T[]): T[] {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildQuiz(phrases: Phrase[]): Question[] {
  return shuffle(phrases)
    .slice(0, 3)
    .map((p) => {
      const distractors = shuffle(phrases.filter((x) => x.id !== p.id))
        .slice(0, 3)
        .map((d) => d.local_text);
      return { en: p.en, answer: p.local_text, options: shuffle([p.local_text, ...distractors]) };
    });
}

function todayKey(): string {
  const d = new Date();
  return `madrasi_quiz_${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function DailyQuiz({ phrases }: { phrases: Phrase[] }) {
  const { session } = useSupabaseAuth();
  const userId = session?.user.id ?? null;

  const [quiz] = useState<Question[]>(() => buildQuiz(phrases));
  const [played, setPlayed] = useState(false);
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(todayKey())) setPlayed(true);
  }, []);

  if (quiz.length === 0) return null;

  const correct = results.filter(Boolean).length;

  function choose(opt: string) {
    if (chosen) return;
    setChosen(opt);
    setResults((r) => [...r, opt === quiz[idx].answer]);
    speak(quiz[idx].answer); // speak the correct answer on reveal
  }

  function next() {
    if (idx < quiz.length - 1) {
      setIdx(idx + 1);
      setChosen(null);
    } else {
      setDone(true);
      if (typeof window !== "undefined") localStorage.setItem(todayKey(), "1");
      const score = [...results].filter(Boolean).length;
      if (userId) void awardQuizXp(userId, score);
      setPlayed(true);
    }
  }

  if (played && !done) {
    return (
      <div className="rounded-card border border-line bg-surface p-5 shadow-card">
        <p className="t-micro text-muted">Today&apos;s quiz</p>
        <p className="t-subtitle mt-1 text-ink">Done for today — come back tomorrow.</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-card bg-speak-tint p-5">
        <p className="t-micro text-muted">Today&apos;s quiz</p>
        <p className="t-stat mt-1 text-speak">{correct}/{quiz.length}</p>
        <p className="t-label text-ink">+{correct * 10} XP on Speak</p>
      </div>
    );
  }

  const q = quiz[idx];
  return (
    <div className="rounded-card border border-line bg-surface p-5 shadow-card">
      <p className="t-micro text-muted">Today&apos;s quiz · {idx + 1}/{quiz.length}</p>
      <p className="t-subtitle mt-1 text-ink">How do you say “{q.en}”?</p>

      <div className="mt-4 flex flex-col gap-2">
        {q.options.map((opt) => {
          const isAnswer = opt === q.answer;
          const isChosen = opt === chosen;
          const reveal = chosen != null;
          return (
            <button
              key={opt}
              type="button"
              disabled={reveal}
              onClick={() => choose(opt)}
              className={`flex items-center justify-between gap-2 rounded-inner border p-3 text-left ${
                reveal && isAnswer
                  ? "border-speak bg-speak-tint"
                  : reveal && isChosen
                    ? "border-live bg-live/10"
                    : "border-line bg-bg"
              }`}
            >
              <span lang="ta" className="t-subtitle text-ink" style={{ fontFamily: "var(--font-tamil)" }}>
                {opt}
              </span>
              {reveal && isAnswer && <Check size={18} className="shrink-0 text-speak" />}
              {reveal && isChosen && !isAnswer && <X size={18} className="shrink-0 text-live" />}
            </button>
          );
        })}
      </div>

      {chosen && (
        <button
          onClick={next}
          className="t-subtitle mt-4 w-full rounded-full bg-speak py-3 text-white"
        >
          {idx < quiz.length - 1 ? "Next" : "Finish"}
        </button>
      )}
    </div>
  );
}
