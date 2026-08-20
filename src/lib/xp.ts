import { supabase } from "./supabase/client";
import type { Axis } from "./types";

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
