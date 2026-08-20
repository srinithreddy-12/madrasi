"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useSupabaseAuth } from "@/lib/supabase/auth-provider";
import { CHENNAI_NEGOTIATION, fairFare, isNightHour, touristFare } from "@/lib/fare";
import { inr } from "@/lib/format";
import { ConductorPunch } from "@/components/conductor-punch";
import { SectionBar } from "@/components/section-bar";

const MOVE_XP = 15;

export default function FareShieldPage() {
  const { session } = useSupabaseAuth();
  const userId = session?.user.id ?? null;

  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [km, setKm] = useState(5);
  const [night, setNight] = useState(isNightHour(new Date().getHours()));
  const [punch, setPunch] = useState(0);
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
    const [savRes, xpRes] = await Promise.all([
      supabase.from("savings_ledger").insert({
        user_id: userId,
        entity_type: "move",
        entity_id: null,
        amount_saved: saved,
        baseline_source: "metered cab",
        note: `Fare Shield · ${pickup || "pickup"} → ${drop || "drop"}`,
      }),
      supabase.from("xp_events").insert({
        user_id: userId,
        axis: "move",
        amount: MOVE_XP,
        source: "fare-shield",
      }),
    ]);
    if (!savRes.error && !xpRes.error) setPunch((n) => n + 1);
    setBusy(false);
  }

  return (
    <div className="flex flex-col">
      {/* Ink header band */}
      <div className="flex items-center justify-between bg-ink px-4 pb-3 pt-3">
        <div>
          <p className="label text-micro text-amber">23C · MOVE</p>
          <h1 className="signage-xl text-display text-manila">FARE SHIELD</h1>
        </div>
        <Link href="/" className="label text-label text-amber">← HOME</Link>
      </div>

      {/* Trip inputs (manila) */}
      <SectionBar>Your Trip</SectionBar>
      <div className="flex flex-col gap-3 bg-manila px-4 py-4">
        <label className="flex flex-col gap-1">
          <span className="label text-micro text-faded">Pickup</span>
          <input
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            placeholder="Velachery"
            className="border-2 border-ink/20 bg-paper px-3 py-3 text-body text-ink placeholder:text-faded/70 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="label text-micro text-faded">Drop</span>
          <input
            value={drop}
            onChange={(e) => setDrop(e.target.value)}
            placeholder="T. Nagar"
            className="border-2 border-ink/20 bg-paper px-3 py-3 text-body text-ink placeholder:text-faded/70 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="label text-micro text-faded">Distance · {km} km</span>
          <input type="range" min={1} max={25} value={km} onChange={(e) => setKm(Number(e.target.value))} className="accent-mtc" />
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={night} onChange={(e) => setNight(e.target.checked)} className="accent-mtc" />
          <span className="text-body text-ink">After 11pm (1.5× night fare)</span>
        </label>
      </div>

      {/* The verdict — money is the loudest thing on screen */}
      <SectionBar>The Verdict</SectionBar>
      <div className="flex flex-col items-center gap-1 bg-paper px-4 py-6">
        <p className="label text-micro text-faded">FAIR FARE</p>
        <p className="signage-xl text-hero text-mtc">{inr(fair)}</p>
        <p className="tabular text-title text-stamp line-through">they&apos;ll quote {inr(tourist)}</p>
      </div>

      {/* Say it in Tamil (green band) */}
      <button
        type="button"
        onClick={sayItInTamil}
        className="flex flex-col items-center gap-2 bg-mtc px-4 py-5 text-manila active:scale-[0.99] [transition-duration:120ms]"
      >
        <span className="signage text-title">🔊 Say it in Tamil</span>
        <span lang="ta" className="text-display leading-tight" style={{ fontFamily: "var(--font-tamil)" }}>
          {CHENNAI_NEGOTIATION.ta}
        </span>
        <span className="tabular text-body text-manila/80">{CHENNAI_NEGOTIATION.roman}</span>
      </button>

      {/* After the ride (manila) */}
      <SectionBar>After the Ride</SectionBar>
      <div className="bg-manila px-4 py-4">
        {outcome === "win" ? (
          <p className="text-body text-ink">
            Nice. <span className="tabular text-mtc">{inr(saved)}</span> logged to your wallet and{" "}
            <span className="tabular text-mtc">+{MOVE_XP} MOVE</span> punched.
          </p>
        ) : outcome === "nowin" ? (
          <p className="text-body text-ink">No worries — next auto. Nothing logged.</p>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => didItWork(true)}
              disabled={busy}
              className="signage flex-1 bg-mtc px-4 py-3 text-title text-manila disabled:opacity-60"
            >
              It worked
            </button>
            <button
              onClick={() => didItWork(false)}
              className="signage flex-1 border-2 border-ink/25 px-4 py-3 text-title text-ink"
            >
              Didn&apos;t work
            </button>
          </div>
        )}
      </div>

      <ConductorPunch trigger={punch} label={`+${MOVE_XP} MOVE`} />
    </div>
  );
}
