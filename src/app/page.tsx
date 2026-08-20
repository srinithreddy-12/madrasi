"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useSupabaseAuth } from "@/lib/supabase/auth-provider";
import { loadProgress, type Progress } from "@/lib/progress";
import { MODULES } from "@/lib/modules";
import { inr, levelFromXp } from "@/lib/format";
import type { FoodPlace } from "@/lib/types";
import { GreetingRow } from "@/components/greeting-row";
import { StatTrio } from "@/components/stat-trio";
import { ModuleBlock } from "@/components/module-block";

type Place = {
  id: string;
  name: string;
  area: string;
  entry: number;
  student_score: number;
  category: string;
};

const BLURBS: Record<string, string> = {
  eat: "Mess, tiffin & late-night eats",
  speak: "Survive Chennai in Tamil",
  move: "Autos, buses & metro — fair fares",
  live: "Laundry, services & bundles",
  explore: "Places, plans & weekend trips",
};

function quizPlayedToday(): boolean {
  if (typeof window === "undefined") return false;
  const d = new Date();
  return !!localStorage.getItem(`madrasi_quiz_${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
}

const mapsLink = (name: string, area: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${name}, ${area}, Chennai`)}`;

export default function HomePage() {
  const { session } = useSupabaseAuth();
  const userId = session?.user.id ?? null;

  const [progress, setProgress] = useState<Progress | null>(null);
  const [cheap, setCheap] = useState<FoodPlace[]>([]);
  const [pick, setPick] = useState<Place | null>(null);
  const [quizDone, setQuizDone] = useState(true);

  useEffect(() => {
    setQuizDone(quizPlayedToday());
    (async () => {
      const [food, places] = await Promise.all([
        supabase.from("food_places").select("*").order("avg_price", { ascending: true }).limit(3),
        supabase.from("places").select("id, name, area, entry, student_score, category"),
      ]);
      setCheap((food.data ?? []) as FoodPlace[]);
      const rows = (places.data ?? []) as Place[];
      // Tonight's pick: free entry first, then highest student score.
      const best = [...rows].sort(
        (a, b) => (a.entry === 0 ? 0 : 1) - (b.entry === 0 ? 0 : 1) || b.student_score - a.student_score,
      )[0];
      setPick(best ?? null);
    })();
  }, []);

  useEffect(() => {
    if (userId) void loadProgress(userId).then(setProgress);
  }, [userId]);

  const name = progress?.profile?.display_name ?? "there";
  const level = levelFromXp(progress?.totalXp ?? 0);

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <GreetingRow
        name={name}
        right={
          <Link href="/profile" className="t-chip flex h-9 items-center gap-1 rounded-full bg-speak px-4 text-white">
            Profile <ArrowRight size={14} />
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

      {/* Today's quiz shortcut (if unplayed) */}
      {!quizDone && (
        <Link href="/speak" className="rounded-block bg-live p-5 text-white [transition:transform_120ms_ease-out] active:scale-[0.99]">
          <p className="t-micro opacity-70">Today&apos;s quiz</p>
          <p className="t-title mt-1">3 quick questions · +30 XP</p>
          <p className="t-label mt-2 opacity-90">Tap to play →</p>
        </Link>
      )}

      {/* Five module blocks */}
      {MODULES.map((m) => (
        <ModuleBlock key={m.key} module={m} blurb={BLURBS[m.key]} progress={`${progress?.axes[m.key] ?? 0}%`} />
      ))}

      {/* Under ₹100 near you */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="t-title text-ink">Under ₹100 near you</h2>
          <Link href="/eat?cap=100" className="t-label text-eat">
            See all
          </Link>
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {cheap.map((f) => (
            <Link
              key={f.id}
              href="/eat?cap=100"
              className="flex min-w-[160px] shrink-0 flex-col gap-2 rounded-card border border-line bg-surface p-4 shadow-card"
            >
              <p className="t-subtitle truncate text-ink">{f.name}</p>
              <p className="t-label text-muted">{f.area}</p>
              <span className="t-stat self-start rounded-full bg-eat px-3 py-1 text-ink" style={{ fontSize: "18px" }}>
                {inr(f.avg_price)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Tonight's pick */}
      {pick && (
        <section className="flex flex-col gap-2">
          <h2 className="t-title text-ink">Tonight&apos;s pick</h2>
          <div className="flex flex-col gap-3 rounded-block bg-explore-tint p-5">
            <div>
              <p className="t-subtitle text-ink">{pick.name}</p>
              <p className="t-label text-muted">
                {pick.category} · {pick.area} · {pick.entry === 0 ? "Free entry" : inr(pick.entry)}
              </p>
            </div>
            <a
              href={mapsLink(pick.name, pick.area)}
              target="_blank"
              rel="noopener noreferrer"
              className="t-subtitle flex items-center justify-center gap-2 rounded-full bg-explore py-3 text-white"
            >
              <MapPin size={18} /> Directions
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
