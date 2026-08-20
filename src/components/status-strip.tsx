"use client";

import { useEffect, useState } from "react";
import { useSupabaseAuth } from "@/lib/supabase/auth-provider";
import { loadProgress, type Progress } from "@/lib/progress";
import { inr, levelFromXp } from "@/lib/format";

// The status strip (STYLE-v1.1 §4): a permanent 32px ink bar at the top of every
// screen putting progression on screen at all times. Amber DM Mono, sticky.
// LEVEL 04 · ₹1,240 SAVED · 4 DAY STREAK · VELACHERY
export function StatusStrip() {
  const { session } = useSupabaseAuth();
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    const uid = session?.user.id;
    if (uid) void loadProgress(uid).then(setProgress);
  }, [session]);

  const level = progress ? levelFromXp(progress.totalXp) : null;
  const parts = [
    `LEVEL ${level != null ? String(level).padStart(2, "0") : "—"}`,
    `${progress ? inr(progress.savingsTotal) : "₹0"} SAVED`,
    `${progress?.profile?.streak ?? 0} DAY STREAK`,
    (progress?.profile?.area ?? "Velachery").toUpperCase(),
  ];

  return (
    <div className="sticky top-0 z-40 flex h-8 items-center overflow-x-auto whitespace-nowrap bg-ink px-4">
      <p className="label text-label text-amber">{parts.join(" · ")}</p>
    </div>
  );
}
