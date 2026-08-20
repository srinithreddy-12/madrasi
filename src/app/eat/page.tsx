"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { supabase } from "@/lib/supabase/client";
import { useSupabaseAuth } from "@/lib/supabase/auth-provider";
import type { FoodPlace, PriceConfidence } from "@/lib/types";
import { inr } from "@/lib/format";
import { TicketStub } from "@/components/ticket-stub";
import { PunchMeter } from "@/components/punch-meter";
import { PriceConfidenceBadge } from "@/components/price-confidence";
import { SectionBar } from "@/components/section-bar";

type Tab = "food" | "mess" | "late";
const TABS: { key: Tab; label: string }[] = [
  { key: "food", label: "Food" },
  { key: "mess", label: "Mess & Tiffin" },
  { key: "late", label: "Late Night" },
];

export default function EatPage() {
  return (
    <Suspense fallback={<div className="bg-ink px-4 py-3 label text-label text-amber">LOADING…</div>}>
      <EatList />
    </Suspense>
  );
}

function EatList() {
  const params = useSearchParams();
  const { session } = useSupabaseAuth();
  const userId = session?.user.id ?? null;

  const [places, setPlaces] = useState<FoodPlace[]>([]);
  const [confidence, setConfidence] = useState<Record<string, PriceConfidence>>({});
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  const [tab, setTab] = useState<Tab>("food");
  const [area, setArea] = useState("all");
  const [veg, setVeg] = useState<"all" | "veg" | "nonveg">("all");
  const [delivery, setDelivery] = useState(false);
  const [walkable, setWalkable] = useState(false);
  const capParam = params.get("cap");
  const [cap, setCap] = useState<number | null>(capParam ? Number(capParam) : null);

  useEffect(() => {
    (async () => {
      const [placesRes, confRes] = await Promise.all([
        supabase.from("food_places").select("*").order("student_score", { ascending: false }),
        supabase.from("place_price_confidence").select("*").eq("entity_type", "food"),
      ]);
      setPlaces((placesRes.data ?? []) as FoodPlace[]);
      const conf: Record<string, PriceConfidence> = {};
      for (const c of (confRes.data ?? []) as PriceConfidence[]) conf[c.entity_id] = c;
      setConfidence(conf);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("saves")
      .select("entity_id")
      .eq("user_id", userId)
      .eq("entity_type", "food")
      .then(({ data }) => setSaved(new Set((data ?? []).map((r) => r.entity_id))));
  }, [userId]);

  const areas = useMemo(() => Array.from(new Set(places.map((p) => p.area))).sort(), [places]);

  const filtered = useMemo(() => {
    return places.filter((p) => {
      if (tab === "mess" && !["mess", "tiffin", "caterer"].includes(p.kind)) return false;
      if (tab === "late" && !p.late_night) return false;
      if (area !== "all" && p.area !== area) return false;
      if (veg === "veg" && p.cuisine === "nonveg") return false;
      if (veg === "nonveg" && p.cuisine === "veg") return false;
      if (delivery && !p.delivery) return false;
      if (walkable && p.distance_km > 2) return false;
      if (cap != null && p.avg_price > cap) return false;
      return true;
    });
  }, [places, tab, area, veg, delivery, walkable, cap]);

  async function toggleSave(id: string) {
    if (!userId) return;
    const next = new Set(saved);
    if (next.has(id)) {
      next.delete(id);
      setSaved(next);
      await supabase.from("saves").delete().eq("user_id", userId).eq("entity_type", "food").eq("entity_id", id);
    } else {
      next.add(id);
      setSaved(next);
      await supabase.from("saves").insert({ user_id: userId, entity_type: "food", entity_id: id });
    }
  }

  const [detail, setDetail] = useState<FoodPlace | null>(null);

  return (
    <div className="flex flex-col">
      {/* Ink header band */}
      <div className="flex items-end justify-between bg-ink px-4 pb-3 pt-3">
        <h1 className="signage-xl text-display text-manila">EAT</h1>
        <span className="tabular text-title text-amber">21G</span>
      </div>

      {/* Controls band (manila) */}
      <div className="flex flex-col gap-3 bg-manila px-4 py-3">
        <div role="tablist" aria-label="Food categories" className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`signage flex-1 px-2 py-2 text-body ${
                tab === t.key ? "bg-mtc text-manila" : "border-2 border-ink/15 text-faded"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <label className="flex flex-1 flex-col gap-1">
            <span className="label text-micro text-faded">Area</span>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="border-2 border-ink/15 bg-paper px-2 py-2 text-body text-ink"
            >
              <option value="all">All areas</option>
              {areas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </label>
          <fieldset className="flex flex-1 flex-col gap-1">
            <legend className="label text-micro text-faded">Diet</legend>
            <div className="flex border-2 border-ink/15">
              {(["all", "veg", "nonveg"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setVeg(v)}
                  aria-pressed={veg === v}
                  className={`label flex-1 py-2 text-micro ${
                    veg === v ? "bg-mtc text-manila" : "text-faded"
                  }`}
                >
                  {v === "all" ? "Any" : v === "veg" ? "Veg" : "Non"}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Toggle label="Delivery" on={delivery} onToggle={() => setDelivery((v) => !v)} />
          <Toggle label="Walkable ≤2km" on={walkable} onToggle={() => setWalkable((v) => !v)} />
          {cap != null && (
            <button
              onClick={() => setCap(null)}
              className="tabular border-2 border-mtc px-3 py-1.5 text-micro text-ink"
            >
              ≤ {inr(cap)} ✕
            </button>
          )}
        </div>
      </div>

      {/* Count section bar */}
      <SectionBar>{ready ? `${filtered.length} places` : "Loading…"}</SectionBar>

      {/* Stubs (manila, edge to edge, 8px gaps) */}
      {ready && filtered.length === 0 ? (
        <div className="bg-manila px-4 py-6">
          <p className="text-body text-faded">Nothing matches those filters.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2 bg-manila py-2">
          {filtered.map((p) => (
            <li key={p.id}>
              <TicketStub module="eat" title={p.name} fare={p.avg_price} meta={`${p.area} · ${p.timings}`}>
                <div className="mt-2 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <PunchMeter score={p.student_score} />
                    <PriceConfidenceBadge confidence={confidence[p.id]} />
                  </div>
                  {p.must_try.length > 0 && (
                    <p className="label text-micro text-faded">MUST TRY · {p.must_try.slice(0, 2).join(", ")}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleSave(p.id)}
                      aria-pressed={saved.has(p.id)}
                      className={`label px-3 py-1.5 text-micro ${
                        saved.has(p.id) ? "bg-mtc text-manila" : "border-2 border-ink/20 text-ink"
                      }`}
                    >
                      {saved.has(p.id) ? "SAVED" : "SAVE"}
                    </button>
                    {p.phone && (
                      <a href={`tel:${p.phone}`} className="label border-2 border-ink/20 px-3 py-1.5 text-micro text-ink">
                        CALL
                      </a>
                    )}
                    <button
                      onClick={() => setDetail(p)}
                      className="label ml-auto border-2 border-ink/20 px-3 py-1.5 text-micro text-ink"
                    >
                      DETAILS
                    </button>
                  </div>
                </div>
              </TicketStub>
            </li>
          ))}
        </ul>
      )}

      <DetailSheet place={detail} confidence={detail ? confidence[detail.id] : undefined} onClose={() => setDetail(null)} />
    </div>
  );
}

function Toggle({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={on}
      className={`label px-3 py-1.5 text-micro ${on ? "bg-mtc text-manila" : "border-2 border-ink/20 text-faded"}`}
    >
      {label}
    </button>
  );
}

function DetailSheet({
  place,
  confidence,
  onClose,
}: {
  place: FoodPlace | null;
  confidence?: PriceConfidence;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {place && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/50" />
          <motion.div
            role="dialog"
            aria-label={`${place.name} details`}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
            className="relative z-10 w-full max-w-[420px] border-t-2 border-ink bg-paper"
          >
            <div className="flex items-end justify-between bg-ink px-5 py-3">
              <h2 className="signage text-title text-manila">{place.name}</h2>
              <button onClick={onClose} className="label text-label text-amber">CLOSE</button>
            </div>
            <div className="px-5 py-4">
              <p className="text-body text-faded">{place.blurb}</p>
              <dl className="mt-4 grid grid-cols-2 gap-3">
                <Field label="Timings" value={place.timings} />
                <Field label="Avg price" value={inr(place.avg_price)} mono />
                {place.monthly_price != null && (
                  <Field label="Monthly plan" value={inr(place.monthly_price)} mono />
                )}
                <Field label="Distance" value={`${place.distance_km} km`} mono />
                {place.phone && <Field label="Phone" value={place.phone} mono />}
                <Field label="Rating" value={`${place.rating} · ${place.reviews}`} mono />
              </dl>
              <div className="mt-4 flex flex-wrap gap-1">
                {place.tags.map((t) => (
                  <span key={t} className="label border-2 border-ink/15 px-2 py-0.5 text-micro text-faded">
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-4">
                <PriceConfidenceBadge confidence={confidence} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="label text-micro text-faded">{label}</dt>
      <dd className={`${mono ? "tabular text-body" : "text-body"} text-ink`}>{value}</dd>
    </div>
  );
}
