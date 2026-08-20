"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useSupabaseAuth } from "@/lib/supabase/auth-provider";
import { loadProgress, type Progress } from "@/lib/progress";
import { MODULES } from "@/lib/modules";
import type { Quest } from "@/lib/types";
import { LedBoard } from "@/components/led-board";
import { ConductorPunch } from "@/components/conductor-punch";
import { SectionBar } from "@/components/section-bar";

function boardLines(area: string): string[] {
  const h = new Date().getHours();
  const meal =
    h < 11 ? "BREAKFAST" : h < 16 ? "LUNCH" : h < 21 ? "DINNER" : "LATE NIGHT";
  return [
    `${meal} UNDER ₹100 · ${area.toUpperCase()}`,
    "MESS OPEN NOW · 3 NEARBY",
    "LAST BUS 23C · 11:15 PM",
    "SHARE AUTO TO GUINDY · ₹20",
  ];
}

export default function HomePage() {
  const { session, loading } = useSupabaseAuth();
  const router = useRouter();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [quest, setQuest] = useState<Quest | null>(null);
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const [punch, setPunch] = useState(0);
  const [punchLabel, setPunchLabel] = useState("PUNCHED");
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
            ? (progRes.data ?? [])
                .filter((r) => r.quest_id === active.id)
                .map((r) => r.step_index)
            : [],
        );
      },
    [],
  );

  useEffect(() => {
    if (userId) void refresh(userId);
  }, [userId, refresh]);

  const area = progress?.profile?.area ?? "Velachery";
  const lines = useMemo(() => boardLines(area), [area]);
  const activeStepIndex = doneSteps.length;
  const activeStep = quest?.steps[activeStepIndex] ?? null;

  function runSearch(query: string) {
    const rupee = query.match(/₹?\s?(\d{2,5})/);
    const params = new URLSearchParams();
    if (rupee) params.set("cap", rupee[1]);
    if (query.trim()) params.set("q", query.trim());
    router.push(`/eat${params.toString() ? `?${params}` : ""}`);
  }

  async function punchIt() {
    if (!userId || !quest || !activeStep || busy) return;
    setBusy(true);
    const [progInsert, xpInsert] = await Promise.all([
      supabase.from("quest_progress").insert({
        user_id: userId,
        quest_id: quest.id,
        step_index: activeStepIndex,
      }),
      supabase.from("xp_events").insert({
        user_id: userId,
        axis: activeStep.axis,
        amount: activeStep.xp,
        source: `quest:${quest.id}`,
      }),
    ]);
    if (!progInsert.error && !xpInsert.error) {
      setPunchLabel(`+${activeStep.xp} ${activeStep.axis.toUpperCase()}`);
      setPunch((n) => n + 1);
      await refresh(userId);
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col">
      {/* Ink band — identity + LED destination board */}
      <div className="bg-ink">
        <div className="flex items-start justify-between px-4 pb-1 pt-3">
          <div>
            <p className="label text-micro text-amber">CHENNAI</p>
            <h1 className="signage-xl text-display text-manila">MADRASI</h1>
          </div>
          <Link
            href="/pass"
            className="label mt-1 border border-amber px-3 py-1 text-label text-amber"
          >
            PASS →
          </Link>
        </div>
        <LedBoard marquee="DESTINATION" lines={lines} onActivate={runSearch} />
      </div>

      {/* Manila band — search */}
      <SectionBar>Search</SectionBar>
      <div className="bg-manila px-4 py-4">
        <SearchStub onSearch={runSearch} />
      </div>

      {/* Green band — Fare Shield, two taps from Home */}
      <Link href="/fare-shield" className="flex items-center justify-between bg-mtc px-4 py-4 active:scale-[0.99] [transition-duration:120ms]">
        <span className="signage text-title text-manila">Fare Shield</span>
        <span className="label text-label text-manila/80">DON&apos;T GET OVERCHARGED →</span>
      </Link>

      {/* Manila band — Today's Punch, one thing */}
      <SectionBar>Today&apos;s Punch</SectionBar>
      <div className="bg-manila px-4 py-4">
        {loading || !progress ? (
          <p className="label text-label text-faded">Loading…</p>
        ) : !quest ? (
          <p className="text-body text-faded">
            No active quest. Seed quests to enable Today&apos;s Punch.
          </p>
        ) : activeStep ? (
          <div className="flex flex-col gap-3">
            <p className="label text-micro text-faded">
              {quest.title} · STEP {activeStepIndex + 1}/{quest.steps.length}
            </p>
            <p className="signage text-display text-ink">{activeStep.label}</p>
            <button
              type="button"
              onClick={punchIt}
              disabled={busy}
              className="signage self-start bg-stamp px-6 py-3 text-title text-manila active:scale-[0.99] disabled:opacity-60 [transition-duration:120ms]"
            >
              Punch it
            </button>
          </div>
        ) : (
          <p className="text-body text-mtc">Quest complete — every step punched. ✓</p>
        )}
      </div>

      {/* Ink band — route strip */}
      <SectionBar>Your Routes</SectionBar>
      <div className="flex gap-2 overflow-x-auto bg-ink px-4 py-4">
        {MODULES.map((m) => {
          const fill = progress?.axes[m.key] ?? 0;
          return (
            <Link
              key={m.key}
              href={m.path}
              className="flex min-w-[108px] shrink-0 flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="tabular text-label text-amber">{m.routeCode}</span>
                <span className="tabular text-micro text-manila/50">{fill}</span>
              </div>
              <span className="signage text-title text-manila">{m.label}</span>
              <span aria-hidden="true" className="h-1.5 bg-manila/15">
                <span className="block h-1.5 bg-amber" style={{ width: `${fill}%` }} />
              </span>
            </Link>
          );
        })}
      </div>

      <ConductorPunch trigger={punch} label={punchLabel} />
    </div>
  );
}

function SearchStub({ onSearch }: { onSearch: (q: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(value);
      }}
      className="flex flex-col gap-1"
    >
      <label htmlFor="home-search" className="label text-micro text-faded">
        Search
      </label>
      <div className="flex overflow-hidden border-2 border-ink bg-paper">
        <input
          id="home-search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="₹100 biryani · laundry near me · bus to T Nagar"
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-body text-ink placeholder:text-faded/70 focus:outline-none"
        />
        <button type="submit" className="signage bg-mtc px-4 text-title text-manila">
          Go
        </button>
      </div>
    </form>
  );
}
