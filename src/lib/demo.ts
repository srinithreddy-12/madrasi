import { supabase } from "./supabase/client";
import { isoDate } from "./format";
import type { Axis } from "./types";

// Gated demo seed. Runs ONLY when NEXT_PUBLIC_DEMO_SEED === "true" (local dev),
// never in production — a real user's first session must start empty.
//
// The axis fills are deliberately uneven so the five-axis system reads in two
// seconds on a projector: one nearly-full stamp next to four near-blank ones.

export const demoSeedEnabled = process.env.NEXT_PUBLIC_DEMO_SEED === "true";

const DEMO_AXES: Record<Axis, number> = {
  eat: 78,
  speak: 24,
  move: 61,
  live: 12,
  explore: 9,
};

// Sums to ₹1,240 across the three baseline sources.
const DEMO_SAVINGS = [
  { entity_type: "move", entity_id: null, amount_saved: 210, baseline_source: "metered cab", note: "Fare Shield · to T. Nagar" },
  { entity_type: "move", entity_id: null, amount_saved: 150, baseline_source: "metered cab", note: "Fare Shield · to Guindy" },
  { entity_type: "food", entity_id: "amma-mess", amount_saved: 320, baseline_source: "delivery app", note: "Ate at the mess" },
  { entity_type: "food", entity_id: "jannal-kadai", amount_saved: 260, baseline_source: "delivery app", note: "Skipped the delivery markup" },
  { entity_type: "laundry", entity_id: "sparkle", amount_saved: 300, baseline_source: "retail laundry", note: "Monthly bundle rate" },
];

/** Wipe the current user's progression so the demo can be re-run from zero. */
export async function resetDemoData(userId: string): Promise<void> {
  await Promise.all([
    supabase.from("xp_events").delete().eq("user_id", userId),
    supabase.from("savings_ledger").delete().eq("user_id", userId),
    supabase.from("saves").delete().eq("user_id", userId),
    supabase.from("quest_progress").delete().eq("user_id", userId),
    supabase.from("price_reports").delete().eq("user_id", userId),
  ]);
  await supabase
    .from("profiles")
    .update({ streak: 0, last_active_date: null })
    .eq("id", userId);
}

/**
 * Populate the current anonymous account with a legible demo pass, once.
 * Idempotent: bails if the user already has any XP. Returns true if it seeded.
 */
export async function seedDemoIfNeeded(userId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from("xp_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    console.error("[demo] could not check xp_events:", error.message);
    return false;
  }
  if ((count ?? 0) > 0) return false;

  const xpRows = (Object.entries(DEMO_AXES) as [Axis, number][]).map(
    ([axis, amount]) => ({ user_id: userId, axis, amount, source: "demo" }),
  );

  const { data: college } = await supabase
    .from("colleges")
    .select("id")
    .eq("name", "Anna University")
    .maybeSingle();

  const [xpRes, savRes, profRes] = await Promise.all([
    supabase.from("xp_events").insert(xpRows),
    supabase
      .from("savings_ledger")
      .insert(DEMO_SAVINGS.map((s) => ({ ...s, user_id: userId }))),
    supabase
      .from("profiles")
      .update({
        display_name: "Meena",
        streak: 4,
        last_active_date: isoDate(),
        area: "Velachery",
        veg_pref: "both",
        college_id: college?.id ?? null,
      })
      .eq("id", userId),
  ]);

  const err = xpRes.error || savRes.error || profRes.error;
  if (err) {
    console.error("[demo] seed failed:", err.message);
    return false;
  }
  return true;
}
