"use client";

import { useMemo, useState } from "react";
import { Volume2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useSupabaseAuth } from "@/lib/supabase/auth-provider";
import { CHENNAI_NEGOTIATION, fairFare, isNightHour, touristFare } from "@/lib/fare";
import { inr } from "@/lib/format";
import { CountUp } from "@/components/count-up";
import { NavHeader } from "@/components/nav-header";

const MOVE_XP = 15;

export default function FareShieldPage() {
  const { session } = useSupabaseAuth();
  const userId = session?.user.id ?? null;

  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [km, setKm] = useState(5);
  const [night, setNight] = useState(isNightHour(new Date().getHours()));
  const [outcome, setOutcome] = useState<"none" | "win" | "nowin">("none");
  const [busy, setBusy] = useState(false);

  const hour = night ? 23 : 14;
  const fair = useMemo(() => fairFare(km, hour), [km, hour]);
  const tourist = useMemo(() => touristFare(fair), [fair]);
  const saved = tourist - fair;

  function sayItInTamil() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(CHENNAI_NEGOTIATION.ta);
    u.lang = "ta-IN";
    u.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  async function didItWork(worked: boolean) {
    if (busy) return;
    setOutcome(worked ? "win" : "nowin");
    if (!worked || !userId) return;
    setBusy(true);
    const [s, x] = await Promise.all([
      supabase.from("savings_ledger").insert({
        user_id: userId,
        entity_type: "move",
        entity_id: null,
        amount_saved: saved,
        baseline_source: "metered cab",
        note: `Fare Shield · ${pickup || "pickup"} → ${drop || "drop"}`,
      }),
      supabase.from("xp_events").insert({ user_id: userId, axis: "move", amount: MOVE_XP, source: "fare-shield" }),
    ]);
    if (s.error || x.error) setOutcome("none");
    setBusy(false);
  }

  return (
    <div className="screen gap-2">
      <NavHeader
        title="Fare Shield"
        routeCode="23C"
        accentClass="bg-move"
        accentText="text-white"
        subtitle="Travel"
        back={{ href: "/move", label: "Travel" }}
      />

      {/* Inputs */}
      <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-card shadow-card">
        <label className="flex flex-col gap-1">
          <span className="t-micro text-muted">Pickup</span>
          <input
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            placeholder="Velachery"
            className="t-body rounded-inner border border-line bg-bg px-3 py-2.5 text-ink placeholder:text-muted focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="t-micro text-muted">Drop</span>
          <input
            value={drop}
            onChange={(e) => setDrop(e.target.value)}
            placeholder="T. Nagar"
            className="t-body rounded-inner border border-line bg-bg px-3 py-2.5 text-ink placeholder:text-muted focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="t-micro text-muted">Distance · {km} km</span>
          <input type="range" min={1} max={25} value={km} onChange={(e) => setKm(Number(e.target.value))} className="accent-move" />
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={night} onChange={(e) => setNight(e.target.checked)} className="accent-move" />
          <span className="t-body text-ink">After 11pm (1.5× night fare)</span>
        </label>
      </div>

      {/* The verdict — the number is the hero */}
      <div className="rounded-card border border-line bg-surface p-card shadow-card">
        <p className="t-micro text-muted">Fair fare</p>
        <CountUp value={fair} format={(n) => inr(n)} className="t-stat block text-move" />
        <p className="t-label mt-2 text-muted line-through">they&apos;ll quote {inr(tourist)}</p>
        <p className="t-label text-live">you save {inr(saved)}</p>
      </div>

      {/* Say it in Tamil */}
      <div className="rounded-card bg-speak-tint p-card">
        <p className="t-micro text-muted">Say this to the driver</p>
        <p lang="ta" className="t-title mt-1 text-ink" style={{ fontFamily: "var(--font-tamil)" }}>
          {CHENNAI_NEGOTIATION.ta}
        </p>
        <p className="t-label mt-1 text-muted">{CHENNAI_NEGOTIATION.roman}</p>
        <button
          type="button"
          onClick={sayItInTamil}
          className="t-subtitle mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-speak py-3 text-white [transition:transform_120ms_ease-out] active:scale-[0.98]"
        >
          <Volume2 size={18} /> Say it in Tamil
        </button>
      </div>

      {/* After the ride */}
      {outcome === "win" ? (
        <div className="rounded-card bg-move-tint p-card">
          <p className="t-body text-ink">
            Nice — <span className="text-live">{inr(saved)}</span> logged and{" "}
            <span className="text-move">+{MOVE_XP} XP</span> on Travel.
          </p>
        </div>
      ) : outcome === "nowin" ? (
        <div className="rounded-card border border-line bg-surface p-card shadow-card">
          <p className="t-body text-ink">No worries — next auto. Nothing logged.</p>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={() => didItWork(true)}
            disabled={busy}
            className="t-subtitle flex-1 rounded-full bg-move py-3 text-white [transition:transform_120ms_ease-out] active:scale-[0.98] disabled:opacity-60"
          >
            It worked
          </button>
          <button
            onClick={() => didItWork(false)}
            className="t-subtitle flex-1 rounded-full border border-line bg-surface py-3 text-ink"
          >
            Didn&apos;t work
          </button>
        </div>
      )}
    </div>
  );
}
