"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useSupabaseAuth } from "@/lib/supabase/auth-provider";
import { loadProgress, type Progress } from "@/lib/progress";
import { MODULES } from "@/lib/modules";
import { inr, levelFromXp } from "@/lib/format";
import type { Quest } from "@/lib/types";
import { GreetingRow } from "@/components/greeting-row";
import { StatTrio } from "@/components/stat-trio";
import { ModuleBlock } from "@/components/module-block";
import { CountUp } from "@/components/count-up";

const BLURBS: Record<string, string> = {
  eat: "Mess, tiffin & late-night eats",
  speak: "Survive Chennai in Tamil",
  move: "Autos, buses & metro — fair fares",
  live: "Laundry & student services",
  explore: "Places, plans & weekend trips",
};

const QUICK_CHIPS = [
  { label: "Under ₹100", href: "/eat?cap=100" },
  { label: "Mess plans", href: "/eat" },
  { label: "Late night", href: "/eat" },
  { label: "Fare Shield", href: "/fare-shield" },
];

export default function HomePage() {
  const { session, loading } = useSupabaseAuth();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [quest, setQuest] = useState<Quest | null>(null);
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);

  const userId = session?.user.id ?? null;

  const refresh = useMemo(
    () =>
      async function refresh(uid: string) {
        const [prog, questRes, progRes] = await Promise.all([
          loadProgress(uid),
          supabase.from("quests").select("*").order("id"),
          supabase.from("quest_progress").select("quest_id, step_index").eq("user_id", uid),
        ]);
        setProgress(prog);
        const quests = (questRes.data ?? []) as Quest[];
        const active = quests.find((q) => q.id === "week-one") ?? quests[0] ?? null;
        setQuest(active);
        setDoneSteps(
          active
            ? (progRes.data ?? []).filter((r) => r.quest_id === active.id).map((r) => r.step_index)
            : [],
        );
      },
    [],
  );

  useEffect(() => {
    if (userId) void refresh(userId);
  }, [userId, refresh]);

  const name = progress?.profile?.display_name ?? "there";
  const level = levelFromXp(progress?.totalXp ?? 0);
  const activeStepIndex = doneSteps.length;
  const activeStep = quest?.steps[activeStepIndex] ?? null;

  async function punchIt() {
    if (!userId || !quest || !activeStep || busy) return;
    setBusy(true);
    const [p, x] = await Promise.all([
      supabase.from("quest_progress").insert({ user_id: userId, quest_id: quest.id, step_index: activeStepIndex }),
      supabase.from("xp_events").insert({ user_id: userId, axis: activeStep.axis, amount: activeStep.xp, source: `quest:${quest.id}` }),
    ]);
    if (!p.error && !x.error) await refresh(userId);
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <GreetingRow
        name={name}
        right={
          <Link href="/pass" className="t-chip flex h-9 items-center gap-1 rounded-full bg-speak px-4 text-white">
            Pass <ArrowRight size={14} />
          </Link>
        }
      />

      <StatTrio
        items={[
          { value: level, label: "Level" },
          { value: progress?.totalXp ?? 0, label: "XP" },
          { value: progress?.profile?.streak ?? 0, label: "Day streak" },
        ]}
      />

      {/* Today's Punch — a --live block with a white pill CTA */}
      <div className="rounded-block bg-live p-5 text-white">
        <p className="t-micro opacity-70">
          Today&apos;s Punch{quest ? ` · ${quest.title}` : ""}
        </p>
        {loading || !progress ? (
          <p className="t-title mt-2">Loading…</p>
        ) : !quest ? (
          <p className="t-body mt-2 opacity-80">Seed quests to enable Today&apos;s Punch.</p>
        ) : activeStep ? (
          <>
            <p className="t-title mt-2">{activeStep.label}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="t-label opacity-80">
                Step {activeStepIndex + 1} / {quest.steps.length} · +{activeStep.xp} XP
              </span>
              <button
                type="button"
                onClick={punchIt}
                disabled={busy}
                className="t-subtitle rounded-full bg-white px-5 py-2.5 text-live [transition:transform_120ms_ease-out] active:scale-[0.98] disabled:opacity-60"
              >
                Punch it
              </button>
            </div>
          </>
        ) : (
          <p className="t-title mt-2">All punched ✓</p>
        )}
      </div>

      {/* Quick chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {QUICK_CHIPS.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="t-chip flex h-[34px] shrink-0 items-center whitespace-nowrap rounded-full border border-line bg-surface px-3.5 text-ink"
          >
            {c.label}
          </Link>
        ))}
      </div>

      {/* Five module blocks */}
      {MODULES.map((m) => (
        <ModuleBlock
          key={m.key}
          module={m}
          blurb={BLURBS[m.key]}
          progress={`${progress?.axes[m.key] ?? 0}%`}
        />
      ))}

      {/* Savings card */}
      <div className="rounded-card border border-line bg-surface p-5 shadow-card">
        <p className="t-micro text-muted">Saved this month</p>
        <CountUp
          value={progress?.savingsTotal ?? 0}
          format={(n) => inr(n)}
          className="t-stat mt-1 block text-live"
        />
      </div>
    </div>
  );
}
