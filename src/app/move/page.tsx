"use client";

import { useMemo, useState } from "react";
import { fairFare } from "@/lib/fare";
import { inr } from "@/lib/format";

// MOVE cost calculator (DEMO-SPRINT Block C, calculator only). Pure client math —
// live fare per mode for a distance, big numerals, cheapest highlighted.
// Chennai street estimates, not published tariffs.
const MODES: { key: string; label: string; note: string; fare: (km: number) => number }[] = [
  { key: "cycle", label: "Cycle", note: "your own", fare: () => 0 },
  { key: "bus", label: "MTC bus", note: "ordinary", fare: (km) => Math.min(30, Math.round(5 + km)) },
  { key: "train", label: "Suburban train", note: "season = cheaper", fare: (km) => Math.max(5, Math.round(5 + km * 0.6)) },
  { key: "share", label: "Share auto", note: "fixed route", fare: (km) => Math.round(10 + km * 3) },
  { key: "metro", label: "Metro", note: "smart card", fare: (km) => Math.min(60, Math.round(10 + km * 2)) },
  { key: "auto", label: "Auto (meter)", note: "if metered", fare: (km) => fairFare(km, 14) },
  { key: "cab", label: "Cab", note: "Ola/Uber", fare: (km) => Math.round(60 + km * 14) },
];

export default function MovePage() {
  const [km, setKm] = useState(5);

  const rows = useMemo(
    () =>
      MODES.map((m) => ({ ...m, cost: m.fare(km) })).sort((a, b) => a.cost - b.cost),
    [km],
  );
  // Cheapest paid mode (cycle is free, so highlight the cheapest thing you'd pay for).
  const cheapestPaidKey = rows.find((r) => r.cost > 0)?.key;

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <div>
        <h1 className="t-hero text-ink">Move</h1>
        <p className="t-label text-muted">23C · Cost calculator</p>
      </div>

      {/* Distance slider */}
      <div className="rounded-card border border-line bg-surface p-5 shadow-card">
        <div className="flex items-baseline justify-between">
          <span className="t-micro text-muted">Distance</span>
          <span className="t-stat text-move" style={{ fontSize: "32px" }}>{km} km</span>
        </div>
        <input
          type="range"
          min={1}
          max={25}
          value={km}
          onChange={(e) => setKm(Number(e.target.value))}
          className="mt-3 w-full accent-move"
          aria-label="Distance in kilometres"
        />
      </div>

      {/* Fares per mode, cheapest first */}
      <div className="flex flex-col gap-2">
        {rows.map((r) => (
          <div
            key={r.key}
            className="flex items-center justify-between rounded-card border border-line bg-surface p-4 shadow-card"
          >
            <div>
              <p className="t-subtitle text-ink">{r.label}</p>
              <p className="t-micro text-muted">{r.note}</p>
              {r.key === cheapestPaidKey && (
                <span className="t-chip mt-1 inline-block rounded-full bg-move px-2.5 py-0.5 text-white">
                  CHEAPEST
                </span>
              )}
            </div>
            <span className="t-stat text-move">{r.cost === 0 ? "Free" : inr(r.cost)}</span>
          </div>
        ))}
      </div>

      <p className="t-micro px-1 text-muted">Street estimates, not official tariffs. Autos vary — use Fare Shield to check.</p>
    </div>
  );
}
