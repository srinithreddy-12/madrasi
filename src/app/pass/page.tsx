"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useSupabaseAuth } from "@/lib/supabase/auth-provider";
import { loadProgress, type Progress } from "@/lib/progress";
import { deriveBadges } from "@/lib/badges";
import { inr, levelFromXp } from "@/lib/format";
import { MODULES, MODULE_BY_KEY, type ModuleKey } from "@/lib/modules";
import { StatTrio } from "@/components/stat-trio";
import { ProgressRing } from "@/components/progress-ring";
import { CountUp } from "@/components/count-up";
import { BadgeChip } from "@/components/badge-chip";

type LedgerRow = {
  id: string;
  amount_saved: number;
  baseline_source: string;
  note: string | null;
  created_at: string;
};

// Which module colour each badge wears.
const BADGE_MODULE: Record<string, ModuleKey> = {
  issued: "speak",
  mess: "eat",
  tamil: "speak",
  meter: "move",
  k1: "live",
  run3: "explore",
  foodmap: "eat",
  fluent: "speak",
  settled: "live",
  wander: "explore",
};

export default function PassPage() {
  const { session, loading } = useSupabaseAuth();
  const userId = session?.user.id ?? null;

  const [progress, setProgress] = useState<Progress | null>(null);
  const [college, setCollege] = useState<string | null>(null);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const prog = await loadProgress(userId);
      setProgress(prog);
      if (prog.profile?.college_id) {
        const { data } = await supabase.from("colleges").select("name").eq("id", prog.profile.college_id).maybeSingle();
        setCollege(data?.name ?? null);
      }
      const { data: rows } = await supabase
        .from("savings_ledger")
        .select("id, amount_saved, baseline_source, note, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      setLedger((rows ?? []) as LedgerRow[]);
    })();
  }, [userId]);

  if (loading || !progress) {
    return <div className="px-4 py-6 t-body text-muted">Loading your pass…</div>;
  }

  const { axes, totalXp, savingsTotal, profile } = progress;
  const level = levelFromXp(totalXp);
  const badges = deriveBadges({ axes, savings: savingsTotal, streak: profile?.streak ?? 0 });
  const earned = badges.filter((b) => b.isEarned).length;

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <div>
        <h1 className="t-hero text-ink">{profile?.display_name ?? "Your"} pass</h1>
        <p className="t-label text-muted">
          {(college ?? "No college").toString()} · {profile?.area ?? "—"}
        </p>
      </div>

      <StatTrio
        items={[
          { value: level, label: "Level" },
          { value: totalXp, label: "XP" },
          { value: profile?.streak ?? 0, label: "Day streak" },
        ]}
      />

      {/* Five progress rings — the five-axis system */}
      <div className="rounded-card border border-line bg-surface p-5 shadow-card">
        <p className="t-micro text-muted">Your five routes</p>
        <div className="mt-4 flex justify-between">
          {MODULES.map((m, i) => (
            <ProgressRing key={m.key} value={axes[m.key]} color={m.cssVar} caption={m.label} delayMs={i * 80} />
          ))}
        </div>
      </div>

      {/* Savings wallet */}
      <div className="rounded-card border border-line bg-surface p-5 shadow-card">
        <p className="t-micro text-muted">Savings wallet</p>
        <CountUp value={savingsTotal} format={(n) => inr(n)} className="t-stat block text-live" />
        <ul className="mt-4 flex flex-col gap-2">
          {ledger.length === 0 ? (
            <li className="t-label text-muted">No savings logged yet.</li>
          ) : (
            ledger.map((row) => (
              <li key={row.id} className="flex items-center justify-between rounded-inner bg-live-tint px-3 py-2">
                <div className="min-w-0">
                  <p className="t-label truncate text-ink">{row.note ?? "Saved"}</p>
                  <p className="t-micro text-muted">vs {row.baseline_source}</p>
                </div>
                <span className="t-subtitle shrink-0 text-live">+{inr(row.amount_saved)}</span>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Badges */}
      <div className="rounded-card border border-line bg-surface p-5 shadow-card">
        <p className="t-subtitle text-ink">
          Badges <span className="text-muted">{earned}/{badges.length}</span>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {badges.map((b) => {
            const m = MODULE_BY_KEY[BADGE_MODULE[b.id] ?? "speak"];
            return (
              <BadgeChip
                key={b.id}
                label={b.label}
                unlocked={b.isEarned}
                fillClass={m.bgClass}
                onColorClass={m.onColorClass}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
