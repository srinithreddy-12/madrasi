"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useSupabaseAuth } from "@/lib/supabase/auth-provider";
import { loadProgress, type Progress } from "@/lib/progress";
import { MODULES } from "@/lib/modules";
import { inr } from "@/lib/format";
import type { Bundle, FoodPlace } from "@/lib/types";
import { getAvatar } from "@/lib/avatars";
import { isOnboarded } from "@/lib/onboarding";
import { GreetingRow } from "@/components/greeting-row";
import { ModuleTile } from "@/components/module-tile";

type Place = {
  id: string;
  name: string;
  area: string;
  entry: number;
  student_score: number;
  category: string;
};

// Only the Tamil card carries a one-line subtitle; the other three show just
// the module name.
const CARD_SUBTITLES: Record<string, string> = {
  speak: "Translate to Tamil",
};

const mapsLink = (name: string, area: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${name}, ${area}, Chennai`)}`;

export default function HomePage() {
  const router = useRouter();
  const { session } = useSupabaseAuth();
  const userId = session?.user.id ?? null;

  const [progress, setProgress] = useState<Progress | null>(null);
  const [cheap, setCheap] = useState<FoodPlace[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [pick, setPick] = useState<Place | null>(null);

  useEffect(() => {
    (async () => {
      const [food, places, bundlesRes] = await Promise.all([
        supabase.from("food_places").select("*").order("avg_price", { ascending: true }).limit(3),
        supabase.from("places").select("id, name, area, entry, student_score, category"),
        supabase.from("bundles").select("*").order("popular", { ascending: false }).limit(4),
      ]);
      setCheap((food.data ?? []) as FoodPlace[]);
      setBundles((bundlesRes.data ?? []) as Bundle[]);
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

  useEffect(() => {
    if (userId && !isOnboarded(userId)) router.replace("/onboarding");
  }, [userId, router]);

  const name = progress?.profile?.display_name ?? "there";

  return (
    <div className="screen gap-2">
      <GreetingRow
        name={name}
        avatar={userId ? getAvatar(userId) : undefined}
        right={
          <Link href="/profile" className="t-chip flex h-9 items-center gap-1 rounded-full bg-speak px-4 text-white">
            You <ArrowRight size={14} />
          </Link>
        }
      />

      {/* Module cards — Eat lives inside Services now, no standalone /eat page */}
      <div className="mt-1 grid grid-cols-2 gap-2">
        {MODULES.filter((m) => m.key !== "eat").map((m) => (
          <ModuleTile key={m.key} module={m} subtitle={CARD_SUBTITLES[m.key]} />
        ))}
      </div>

      {/* Food options under ₹100 near you */}
      <section className="flex flex-col gap-2">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h2 className="t-title text-ink">Food options under ₹100 near you</h2>
            <Link href="/live?tab=eat&cap=100" className="t-label shrink-0 text-eat">
              See all
            </Link>
          </div>
        </div>
        <div className="-mx-3.5 flex gap-2 overflow-x-auto px-3.5 pb-1">
          {cheap.map((f) => (
            <Link
              key={f.id}
              href="/live?tab=eat&cap=100"
              className="pressable flex min-w-[160px] shrink-0 flex-col gap-2 rounded-card border border-line bg-surface p-4 shadow-card"
            >
              <p className="t-subtitle truncate text-ink">{f.name}</p>
              <p className="t-label text-muted">{f.area}</p>
              <span className="t-stat self-start rounded-full bg-eat px-3 py-1 text-ink" style={{ fontSize: "16px" }}>
                {inr(f.avg_price)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Bundles */}
      {bundles.length > 0 && (
        <section className="flex flex-col gap-2">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="t-title text-ink">Supply bundles that you can buy from here</h2>
              <Link href="/bundles" className="t-label shrink-0 text-live">
                See all
              </Link>
            </div>
          </div>
          <div className="-mx-3.5 flex gap-2 overflow-x-auto px-3.5 pb-1">
            {bundles.map((b) => (
              <Link
                key={b.id}
                href="/bundles"
                className="relative flex min-w-[170px] shrink-0 flex-col gap-2 rounded-card border border-line bg-surface p-4 shadow-card"
              >
                {b.popular && (
                  <span className="t-micro absolute right-3 top-3 rounded-full bg-live px-2 py-0.5 text-white">
                    POPULAR
                  </span>
                )}
                <p className="t-subtitle truncate pr-12 text-ink">{b.name}</p>
                <p className="t-label truncate text-muted">{b.tagline}</p>
                <div className="flex items-end gap-2">
                  <span className="t-stat self-start rounded-full bg-live px-3 py-1 text-white" style={{ fontSize: "16px" }}>
                    {inr(b.price)}
                  </span>
                  <span className="t-micro text-muted line-through">{inr(b.mrp)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Worth going this week */}
      {pick && (
        <section className="flex flex-col gap-2">
          <div>
            <h2 className="t-title text-ink">Worth going this week</h2>
          </div>
          <div className="overflow-hidden rounded-block bg-explore-tint">
            <div className="relative h-36 w-full">
              <Image
                src={`/explore/${pick.id}.jpg`}
                alt={pick.name}
                fill
                sizes="440px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-2 p-card">
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
                <MapPin size={18} /> Open in Maps
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
