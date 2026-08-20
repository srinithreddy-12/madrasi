"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { fairFare } from "@/lib/fare";
import { inr } from "@/lib/format";
import { BUS_ROUTES } from "@/lib/bus-routes";

// MOVE (DEMO-SPRINT Block C + reference-app parity): route planner, cost
// calculator, a "new to Chennai" transit guide, and a bus-route reference.
// Route planner distances are haversine-on-known-areas × a road-detour
// factor — a street estimate, same honesty bar as Fare Shield, not a real
// routing API.

const MODES: { key: string; label: string; note: string; fare: (km: number) => number }[] = [
  { key: "cycle", label: "Cycle", note: "your own", fare: () => 0 },
  { key: "bus", label: "MTC bus", note: "ordinary", fare: (km) => Math.min(30, Math.round(5 + km)) },
  { key: "train", label: "Suburban train", note: "season = cheaper", fare: (km) => Math.max(5, Math.round(5 + km * 0.6)) },
  { key: "share", label: "Share auto", note: "fixed route", fare: (km) => Math.round(10 + km * 3) },
  { key: "metro", label: "Metro", note: "smart card", fare: (km) => Math.min(60, Math.round(10 + km * 2)) },
  { key: "auto", label: "Auto (meter)", note: "if metered", fare: (km) => fairFare(km, 14) },
  { key: "cab", label: "Cab", note: "Ola/Uber", fare: (km) => Math.round(60 + km * 14) },
];

// Approximate coordinates for common student areas — enough to rank route
// options by distance, not to claim GPS accuracy.
const AREA_COORDS: Record<string, [number, number]> = {
  "Velachery": [12.9756, 80.2207],
  "Adyar": [13.0012, 80.2565],
  "T. Nagar": [13.0418, 80.2341],
  "Guindy": [13.0067, 80.2206],
  "Besant Nagar": [13.0002, 80.2669],
  "Anna Nagar": [13.0850, 80.2101],
  "Mylapore": [13.0339, 80.2619],
  "Tambaram": [12.9249, 80.1000],
  "Egmore": [13.0732, 80.2609],
  "Chennai Central": [13.0827, 80.2707],
};
const AREAS = Object.keys(AREA_COORDS);

function roadKm(from: string, to: string): number {
  const [lat1, lon1] = AREA_COORDS[from];
  const [lat2, lon2] = AREA_COORDS[to];
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  const straight = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(1, Math.round(straight * 1.35)); // roads aren't straight lines
}

type RouteOption = {
  key: string;
  emoji: string;
  label: string;
  minutes: number;
  walkM: number;
  cost: number;
  steps: string[];
};

function buildRouteOptions(from: string, to: string): RouteOption[] {
  const km = roadKm(from, to);
  return [
    {
      key: "metro",
      emoji: "🚇",
      label: "Metro + walk",
      minutes: Math.round(8 + (km / 35) * 60),
      walkM: 700,
      cost: Math.min(60, Math.round(10 + km * 2)),
      steps: [
        `Walk 6 min to the nearest metro station from ${from}`,
        `Take the metro towards ${to}`,
        `Exit and walk to ${to}`,
      ],
    },
    {
      key: "bus",
      emoji: "🚌",
      label: "MTC bus",
      minutes: Math.round(6 + (km / 15) * 60),
      walkM: 500,
      cost: Math.min(30, Math.round(5 + km)),
      steps: [
        `Board a bus from ${from} bus stop`,
        `Ride toward ${to}, keep small change ready`,
        `Get down near ${to}`,
      ],
    },
    {
      key: "share",
      emoji: "🛺",
      label: "Share auto",
      minutes: Math.round(4 + (km / 18) * 60),
      walkM: 300,
      cost: Math.round(10 + km * 3),
      steps: [
        `Catch a share auto on the ${from} main road`,
        `Fixed-route ride towards ${to}`,
        `Walk the last stretch to ${to}`,
      ],
    },
    {
      key: "cab",
      emoji: "🚕",
      label: "Cab",
      minutes: Math.round(5 + (km / 25) * 60),
      walkM: 0,
      cost: Math.round(60 + km * 14),
      steps: ["Book door-to-door", "Split with friends to make it student-priced"],
    },
  ];
}

const GUIDE_CARDS = [
  {
    emoji: "🚇",
    title: "Chennai Metro 101",
    points: [
      "Two lines: Blue (Airport ↔ Wimco Nagar) and Green (Chennai Central ↔ St. Thomas Mount).",
      "Buy a Singara Chennai smart card — 20% cheaper than tokens.",
      "Fares ₹10–₹60. Trains run 5 AM to 11 PM, every 5–10 minutes.",
    ],
  },
  {
    emoji: "🚌",
    title: "MTC buses without fear",
    points: [
      "Ordinary (white) is cheapest, deluxe (green) costs a bit more, express (blue) skips stops.",
      "Fares start at ₹5. Tell the conductor your stop, keep change ready.",
      "Useful routes: 21G (Broadway–Tambaram), 5C (Besant Nagar), 23C (Adyar–Central).",
    ],
  },
  {
    emoji: "🚆",
    title: "Suburban trains",
    points: [
      "Beach–Tambaram and Beach–Chengalpattu lines cover most student areas.",
      "₹5–₹20 tickets, fastest way to Tambaram during traffic hours.",
      "Buy a monthly season ticket with your college ID — under ₹200.",
    ],
  },
];

export default function MovePage() {
  const [from, setFrom] = useState("Velachery");
  const [to, setTo] = useState("Chennai Central");
  const [planned, setPlanned] = useState<{ from: string; to: string } | null>(null);
  const [openRoute, setOpenRoute] = useState<string | null>(null);
  const [openBus, setOpenBus] = useState<string | null>(null);

  const options = useMemo(
    () => (planned ? buildRouteOptions(planned.from, planned.to) : []),
    [planned],
  );
  const fastestKey = useMemo(
    () => (options.length ? [...options].sort((a, b) => a.minutes - b.minutes)[0].key : null),
    [options],
  );
  const cheapestKey = useMemo(
    () => (options.length ? [...options].sort((a, b) => a.cost - b.cost)[0].key : null),
    [options],
  );

  const [km, setKm] = useState(5);
  const rows = useMemo(
    () => MODES.map((m) => ({ ...m, cost: m.fare(km) })).sort((a, b) => a.cost - b.cost),
    [km],
  );
  const cheapestPaidKey = rows.find((r) => r.cost > 0)?.key;

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <div>
        <h1 className="t-hero text-ink">Move</h1>
        <p className="t-label text-muted">23C · Metro, buses, trains, autos — decoded</p>
      </div>

      {/* Route planner */}
      <div className="flex flex-col gap-2 rounded-card border border-line bg-surface p-5 shadow-card">
        <select
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          aria-label="From"
          className="t-body h-11 rounded-inner border border-line bg-surface px-3 text-ink"
        >
          {AREAS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <select
          value={to}
          onChange={(e) => setTo(e.target.value)}
          aria-label="To"
          className="t-body h-11 rounded-inner border border-line bg-surface px-3 text-ink"
        >
          {AREAS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setPlanned({ from, to })}
          disabled={from === to}
          className="t-subtitle mt-1 flex h-11 items-center justify-center gap-2 rounded-full bg-move text-white disabled:opacity-50"
        >
          Find routes →
        </button>
      </div>

      {planned && (
        <div className="flex flex-col gap-2">
          <p className="t-label text-muted">Route options · {planned.from} → {planned.to}</p>
          {options.map((r) => {
            const open = openRoute === r.key;
            const tag =
              r.key === "cab" ? "MOST CONVENIENT" : r.key === fastestKey ? "FASTEST" : r.key === cheapestKey ? "CHEAPEST" : null;
            return (
              <div key={r.key} className="rounded-card border border-line bg-surface p-4 shadow-card">
                <button
                  type="button"
                  onClick={() => setOpenRoute(open ? null : r.key)}
                  className="flex w-full items-start justify-between gap-3 text-left"
                >
                  <div className="min-w-0">
                    <p className="t-subtitle text-ink">{r.emoji} {r.label}</p>
                    <p className="t-micro mt-0.5 text-muted">
                      {r.minutes} min · {r.walkM} m walk
                    </p>
                    {tag && (
                      <span className="t-chip mt-1 inline-block rounded-full bg-move px-2.5 py-0.5 text-white">
                        {tag}
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="t-stat text-move">{r.cost === 0 ? "Free" : inr(r.cost)}</span>
                    <ChevronDown size={18} className={`text-muted transition-transform ${open ? "rotate-180" : ""}`} />
                  </div>
                </button>
                {open && (
                  <ol className="mt-3 flex list-decimal flex-col gap-1 pl-5">
                    {r.steps.map((s) => (
                      <li key={s} className="t-label text-ink">{s}</li>
                    ))}
                  </ol>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Cost calculator */}
      <div>
        <p className="t-label mb-2 text-muted">🧮 Cost calculator</p>
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

        <div className="mt-2 flex flex-col gap-2">
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
        <p className="t-micro mt-2 px-1 text-muted">Street estimates, not official tariffs. Autos vary — use Fare Shield to check.</p>
      </div>

      {/* New to Chennai? guide */}
      <div>
        <p className="t-label mb-2 text-muted">📖 New to Chennai?</p>
        <div className="flex flex-col gap-2">
          {GUIDE_CARDS.map((g) => (
            <div key={g.title} className="rounded-card border border-line bg-surface p-4 shadow-card">
              <p className="t-subtitle text-ink">{g.emoji} {g.title}</p>
              <ul className="mt-2 flex flex-col gap-1.5">
                {g.points.map((p) => (
                  <li key={p} className="t-label flex gap-2 text-muted">
                    <span aria-hidden="true">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bus route reference */}
      <div>
        <p className="t-label mb-2 text-muted">🚌 Useful Chennai bus routes</p>
        <div className="flex flex-col gap-2">
          {BUS_ROUTES.map((r) => {
            const open = openBus === r.number;
            return (
              <div key={r.number} className="rounded-card border border-line bg-surface p-4 shadow-card">
                <button
                  type="button"
                  onClick={() => setOpenBus(open ? null : r.number)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="t-chip shrink-0 rounded-full bg-move-tint px-2.5 py-1 text-move">
                      {r.number}
                    </span>
                    <span className="t-label truncate text-ink">{r.mainRoute}</span>
                  </div>
                  <ChevronDown size={18} className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
                {open && (
                  <p className="t-micro mt-3 text-muted">{r.majorStops.join(" → ")}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
