import { supabase } from "./supabase/client";
import { isoDate } from "./format";
import type { Axis } from "./types";

/**
 * Daily login (DEMO-SPRINT Block D). On the first load of the day: award +10 XP,
 * advance the streak (consecutive day → +1, missed day → reset to 1) and stamp
 * last_active_date. Idempotent per day via last_active_date, so a hard refresh
 * the same day does nothing. Persists entirely to Supabase — survives refresh.
 */
export async function dailyLogin(
  userId: string,
): Promise<{ awarded: boolean; streak: number }> {
  const { data: prof } = await supabase
    .from("profiles")
    .select("last_active_date, streak")
    .eq("id", userId)
    .maybeSingle();

  const today = isoDate();
  const last = prof?.last_active_date ?? null;
  let streak = prof?.streak ?? 0;

  if (last === today) return { awarded: false, streak }; // already counted today

  const yesterday = isoDate(new Date(Date.now() - 86_400_000));
  streak = last === yesterday ? streak + 1 : 1;

  await supabase.from("profiles").update({ last_active_date: today, streak }).eq("id", userId);
  await supabase
    .from("xp_events")
    .insert({ user_id: userId, axis: "speak", amount: 10, source: "daily-login" });

  return { awarded: true, streak };
}

// Award +5 XP on the FIRST save of the day for a given axis (DEMO-SPRINT Block A).
// Idempotent per (axis, day): a marker xp_event with source `first-save:<axis>`.
// Returns true if XP was awarded this call.
export async function awardFirstSaveXp(userId: string, axis: Axis): Promise<boolean> {
  const source = `first-save:${axis}`;
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from("xp_events")
    .select("id")
    .eq("user_id", userId)
    .eq("source", source)
    .gte("created_at", start.toISOString())
    .limit(1);

  if (data && data.length > 0) return false;

  const { error } = await supabase
    .from("xp_events")
    .insert({ user_id: userId, axis, amount: 5, source });

  return !error;
}

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

/** +5 speak XP per successful translation, capped at 30/day. */
export async function awardTranslationXp(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("xp_events")
    .select("amount")
    .eq("user_id", userId)
    .eq("source", "translate")
    .gte("created_at", startOfToday());

  const today = (data ?? []).reduce((s, r) => s + (r.amount ?? 0), 0);
  if (today >= 30) return false;

  const { error } = await supabase
    .from("xp_events")
    .insert({ user_id: userId, axis: "speak", amount: 5, source: "translate" });
  return !error;
}

/** Award a lesson's XP once (idempotent per lesson via source marker). */
export async function awardLessonXp(userId: string, lessonId: string, xp: number): Promise<boolean> {
  const source = `lesson:${lessonId}`;
  const { data } = await supabase
    .from("xp_events")
    .select("id")
    .eq("user_id", userId)
    .eq("source", source)
    .limit(1);
  if (data && data.length > 0) return false;

  const { error } = await supabase
    .from("xp_events")
    .insert({ user_id: userId, axis: "speak", amount: xp, source });
  return !error;
}

/** +10 speak XP per correct quiz answer. */
export async function awardQuizXp(userId: string, correct: number): Promise<void> {
  if (correct <= 0) return;
  await supabase
    .from("xp_events")
    .insert({ user_id: userId, axis: "speak", amount: correct * 10, source: "quiz" });
}

/** Generic XP award — inserts one xp_event. Returns true on success. */
export async function awardXp(
  userId: string,
  axis: Axis,
  amount: number,
  source: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("xp_events")
    .insert({ user_id: userId, axis, amount, source });
  return !error;
}

/** Award XP only if this exact `source` marker hasn't been recorded before. */
export async function awardXpOnce(
  userId: string,
  axis: Axis,
  amount: number,
  source: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("xp_events")
    .select("id")
    .eq("user_id", userId)
    .eq("source", source)
    .limit(1);
  if (data && data.length > 0) return false;
  return awardXp(userId, axis, amount, source);
}

/** The lesson ids the user has already completed (from xp_event markers). */
export async function completedLessonIds(userId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from("xp_events")
    .select("source")
    .eq("user_id", userId)
    .like("source", "lesson:%");
  return new Set((data ?? []).map((r) => (r.source as string).slice("lesson:".length)));
}
