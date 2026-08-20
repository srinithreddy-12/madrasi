"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useSupabaseAuth } from "@/lib/supabase/auth-provider";
import type { Lesson, Phrase, Scenario } from "@/lib/types";
import { MODULE_BY_KEY } from "@/lib/modules";
import { speakSequence, tamilVoiceAvailable } from "@/lib/voice";
import { awardLessonXp, completedLessonIds } from "@/lib/xp";
import { TranslatePanel } from "@/components/translate-panel";
import { ScenarioCard } from "@/components/scenario-card";
import { PhraseCard } from "@/components/phrase-card";
import { DailyQuiz } from "@/components/daily-quiz";
import { FilterChips, type Chip } from "@/components/filter-chips";

const SPEAK = MODULE_BY_KEY.speak;

export default function SpeakPage() {
  const { session } = useSupabaseAuth();
  const userId = session?.user.id ?? null;

  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [situation, setSituation] = useState<string>("");
  const [ready, setReady] = useState(false);
  const [noTamilVoice, setNoTamilVoice] = useState(false);

  useEffect(() => {
    // Voices can load a beat after mount — check now and shortly after.
    const check = () => setNoTamilVoice(!tamilVoiceAvailable());
    check();
    const t = setTimeout(check, 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    (async () => {
      const [pRes, lRes, sRes] = await Promise.all([
        supabase.from("phrases").select("*"),
        supabase.from("lessons").select("*").order("id"),
        supabase.from("scenarios").select("*").order("id"),
      ]);
      const ph = (pRes.data ?? []) as Phrase[];
      setPhrases(ph);
      setLessons((lRes.data ?? []) as Lesson[]);
      setScenarios((sRes.data ?? []) as Scenario[]);
      if (ph.length) setSituation(ph[0].situation);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("saves")
      .select("entity_id")
      .eq("user_id", userId)
      .eq("entity_type", "phrase")
      .then(({ data }) => setSaved(new Set((data ?? []).map((r) => r.entity_id))));
    void completedLessonIds(userId).then(setCompleted);
  }, [userId]);

  const phrasesById = useMemo(() => new Map(phrases.map((p) => [p.id, p])), [phrases]);
  const situations = useMemo(
    () => Array.from(new Set(phrases.map((p) => p.situation))),
    [phrases],
  );
  const situationChips: Chip[] = situations.map((s) => ({ key: s, label: s }));
  const visiblePhrases = phrases.filter((p) => p.situation === situation);

  async function toggleSave(id: string) {
    if (!userId) return;
    const next = new Set(saved);
    if (next.has(id)) {
      next.delete(id);
      setSaved(next);
      await supabase.from("saves").delete().eq("user_id", userId).eq("entity_type", "phrase").eq("entity_id", id);
    } else {
      next.add(id);
      setSaved(next);
      await supabase.from("saves").insert({ user_id: userId, entity_type: "phrase", entity_id: id });
    }
  }

  async function completeLesson(lesson: Lesson) {
    if (!userId) return;
    const ok = await awardLessonXp(userId, lesson.id, lesson.xp);
    if (ok) setCompleted((prev) => new Set(prev).add(lesson.id));
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <div>
        <h1 className="t-hero text-ink">Speak</h1>
        <p className="t-label text-muted">5C · Chennai Tamil</p>
        {noTamilVoice && (
          <p className="t-micro mt-1 text-muted">
            No Tamil voice on this device — playing approximate pronunciation.
          </p>
        )}
      </div>

      {/* Translate */}
      <TranslatePanel />

      {/* Real Situations */}
      <section className="flex flex-col gap-3">
        <h2 className="t-title text-ink">Real situations</h2>
        {scenarios.map((s) => (
          <ScenarioCard key={s.id} scenario={s} />
        ))}
      </section>

      {/* Phrasebook */}
      <section className="flex flex-col gap-3">
        <h2 className="t-title text-ink">Phrasebook</h2>
        {situationChips.length > 0 && (
          <FilterChips chips={situationChips} value={situation} onChange={setSituation} module={SPEAK} />
        )}
        {visiblePhrases.map((p) => (
          <PhraseCard key={p.id} phrase={p} saved={saved.has(p.id)} onToggleSave={() => toggleSave(p.id)} />
        ))}
      </section>

      {/* Lessons */}
      <section className="flex flex-col gap-3">
        <h2 className="t-title text-ink">Lessons</h2>
        <div className="grid grid-cols-2 gap-2">
          {lessons.map((l) => (
            <LessonCard
              key={l.id}
              lesson={l}
              phrasesById={phrasesById}
              completed={completed.has(l.id)}
              onComplete={completeLesson}
            />
          ))}
        </div>
      </section>

      {/* Daily quiz */}
      {ready && phrases.length >= 4 && (
        <section className="flex flex-col gap-3">
          <h2 className="t-title text-ink">Daily quiz</h2>
          <DailyQuiz phrases={phrases} />
        </section>
      )}
    </div>
  );
}

function LessonCard({
  lesson,
  phrasesById,
  completed,
  onComplete,
}: {
  lesson: Lesson;
  phrasesById: Map<string, Phrase>;
  completed: boolean;
  onComplete: (l: Lesson) => Promise<void>;
}) {
  const [playing, setPlaying] = useState(false);

  function run() {
    if (completed || playing) return;
    const lines = lesson.phrase_ids
      .map((id) => phrasesById.get(id)?.local_text)
      .filter((t): t is string => Boolean(t))
      .map((text) => ({ text }));
    if (lines.length === 0) return;
    setPlaying(true);
    speakSequence(lines, {
      onDone: async () => {
        setPlaying(false);
        await onComplete(lesson);
      },
    });
  }

  return (
    <button
      type="button"
      onClick={run}
      className="flex flex-col gap-1 rounded-card bg-speak-tint p-4 text-left"
    >
      <p className="t-subtitle text-ink">{lesson.title}</p>
      <p className="t-micro text-muted">{lesson.phrase_ids.length} phrases</p>
      <p className="t-label text-speak">+{lesson.xp} XP</p>
      <p className="t-micro mt-1 text-muted">
        {completed ? "Completed" : playing ? "Playing…" : "Tap to learn"}
      </p>
    </button>
  );
}
