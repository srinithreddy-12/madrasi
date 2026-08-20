import { supabase } from "./supabase/client";
import { AXES, type Axis, type Profile } from "./types";

// The user's live progression, assembled from the owner-scoped tables + views.
export type Progress = {
  axes: Record<Axis, number>; // 0..100 fill per axis (from axis_totals)
  totalXp: number;
  savingsTotal: number;
  profile: Profile | null;
};

const emptyAxes = (): Record<Axis, number> =>
  Object.fromEntries(AXES.map((a) => [a, 0])) as Record<Axis, number>;

export async function loadProgress(userId: string): Promise<Progress> {
  const [axisRes, xpRes, savRes, profRes] = await Promise.all([
    supabase.from("axis_totals").select("axis, total").eq("user_id", userId),
    supabase.from("xp_events").select("amount").eq("user_id", userId),
    supabase.from("savings_ledger").select("amount_saved").eq("user_id", userId),
    supabase
      .from("profiles")
      .select(
        "id, display_name, college_id, area, home_state, veg_pref, streak, last_active_date, freezes_available, created_at",
      )
      .eq("id", userId)
      .maybeSingle(),
  ]);

  const axes = emptyAxes();
  for (const row of axisRes.data ?? []) {
    axes[row.axis as Axis] = row.total ?? 0;
  }

  const totalXp = (xpRes.data ?? []).reduce((sum, r) => sum + (r.amount ?? 0), 0);
  const savingsTotal = (savRes.data ?? []).reduce(
    (sum, r) => sum + Number(r.amount_saved ?? 0),
    0,
  );

  return { axes, totalXp, savingsTotal, profile: (profRes.data as Profile) ?? null };
}
