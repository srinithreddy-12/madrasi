"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { supabase } from "@/lib/supabase/client";
import { useSupabaseAuth } from "@/lib/supabase/auth-provider";
import { loadProgress, type Progress } from "@/lib/progress";
import { deriveBadges, type DerivedBadge } from "@/lib/badges";
import { inr, levelFromXp } from "@/lib/format";
import { MODULES } from "@/lib/modules";
import { StampMeter } from "@/components/stamp-meter";
import { SectionBar } from "@/components/section-bar";

type LedgerRow = {
  id: string;
  amount_saved: number;
  baseline_source: string;
  note: string | null;
  created_at: string;
};

export default function PassPage() {
  const { session, loading } = useSupabaseAuth();
  const userId = session?.user.id ?? null;

  const [progress, setProgress] = useState<Progress | null>(null);
  const [college, setCollege] = useState<string | null>(null);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const prog = await loadProgress(userId);
      setProgress(prog);
      if (prog.profile?.college_id) {
        const { data } = await supabase
          .from("colleges")
          .select("name")
          .eq("id", prog.profile.college_id)
          .maybeSingle();
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
    return <div className="bg-ink px-4 py-3 label text-label text-amber">LOADING YOUR PASS…</div>;
  }

  const { axes, totalXp, savingsTotal, profile } = progress;
  const level = levelFromXp(totalXp);
  const badges = deriveBadges({ axes, savings: savingsTotal, streak: profile?.streak ?? 0 });
  const earned = badges.filter((b) => b.isEarned).length;

  return (
    <div className="flex flex-col">
      {/* Ink header band */}
      <div className="flex items-center justify-between bg-ink px-4 pb-3 pt-3">
        <h1 className="signage-xl text-display text-manila">THE PASS</h1>
        <Link href="/" className="label text-label text-amber">← HOME</Link>
      </div>

      {/* The flipping pass card (manila band) */}
      <div className="bg-manila px-4 py-4">
        <div style={{ perspective: 1200 }}>
          <motion.div
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ transformStyle: "preserve-3d", position: "relative" }}
          >
            {/* FRONT */}
            <div style={{ backfaceVisibility: "hidden" }}>
              <div className="border-2 border-ink bg-paper p-4 shadow-[6px_6px_0_0_var(--ink)]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="label text-micro text-faded">MADRASI · CHENNAI</p>
                    <p className="signage text-title text-ink">{profile?.display_name ?? "Student"}</p>
                    <p className="label text-micro text-faded">
                      {(college ?? "No college").toUpperCase()} · {(profile?.area ?? "—").toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="label text-micro text-faded">LEVEL</p>
                    <p className="signage-xl text-hero leading-none text-mtc">{level}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-5 gap-1">
                  {MODULES.map((m) => (
                    <StampMeter key={m.key} axis={m.key} value={axes[m.key]} size={60} />
                  ))}
                </div>
              </div>
            </div>

            {/* BACK */}
            <div
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                position: "absolute",
                inset: 0,
              }}
            >
              <div className="h-full border-2 border-ink bg-ink p-4 shadow-[6px_6px_0_0_var(--ink)]">
                <p className="label text-micro text-amber">BADGES · {earned}/{badges.length}</p>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {badges.map((b) => (
                    <BadgeHole key={b.id} badge={b} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <button
          onClick={() => setFlipped((f) => !f)}
          className="label mx-auto mt-3 block border-2 border-ink/25 px-4 py-1.5 text-micro text-faded"
        >
          {flipped ? "SHOW STAMPS ⟲" : "SHOW BADGES ⟲"}
        </button>
      </div>

      {/* Savings Wallet */}
      <SectionBar>Savings Wallet · {inr(savingsTotal)}</SectionBar>
      <ul className="flex flex-col gap-2 bg-manila py-2">
        {ledger.length === 0 ? (
          <li className="px-4 text-body text-faded">No savings logged yet.</li>
        ) : (
          ledger.map((row) => (
            <li key={row.id} className="flex items-center justify-between border-l-4 border-mtc bg-paper px-4 py-3">
              <div>
                <p className="text-body text-ink">{row.note ?? "Saved"}</p>
                <p className="label text-micro text-faded">VS {row.baseline_source}</p>
              </div>
              <span className="tabular text-fare text-mtc">+{inr(row.amount_saved)}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function BadgeHole({ badge }: { badge: DerivedBadge }) {
  return (
    <div className="flex flex-col items-center gap-1" title={badge.hint}>
      <span
        aria-hidden="true"
        className={`flex h-11 w-11 items-center justify-center rounded-full border-2 ${
          badge.isEarned ? "border-amber bg-amber/20 text-amber" : "border-manila/20 text-manila/20"
        }`}
      >
        {badge.isEarned ? "●" : "○"}
      </span>
      <span className={`label text-center text-[0.5rem] leading-tight ${badge.isEarned ? "text-manila/80" : "text-manila/35"}`}>
        {badge.label}
      </span>
    </div>
  );
}
