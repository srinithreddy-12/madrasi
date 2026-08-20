"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Phone } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useSupabaseAuth } from "@/lib/supabase/auth-provider";
import type { FoodPlace, PriceConfidence } from "@/lib/types";
import { MODULE_BY_KEY } from "@/lib/modules";
import { inr } from "@/lib/format";
import { ContentCard } from "@/components/content-card";
import { FilterChips, type Chip } from "@/components/filter-chips";

const EAT = MODULE_BY_KEY.eat;
const TABS: Chip[] = [
  { key: "food", label: "Food" },
  { key: "mess", label: "Mess & Tiffin" },
  { key: "late", label: "Late Night" },
];

export default function EatPage() {
  return (
    <Suspense fallback={<div className="px-4 py-6 t-body text-muted">Loading…</div>}>
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

  const [tab, setTab] = useState("food");
  const [veg, setVeg] = useState(false);
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

  const filtered = useMemo(
    () =>
      places.filter((p) => {
        if (tab === "mess" && !["mess", "tiffin", "caterer"].includes(p.kind)) return false;
        if (tab === "late" && !p.late_night) return false;
        if (veg && p.cuisine === "nonveg") return false;
        if (delivery && !p.delivery) return false;
        if (walkable && p.distance_km > 2) return false;
        if (cap != null && p.avg_price > cap) return false;
        return true;
      }),
    [places, tab, veg, delivery, walkable, cap],
  );

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

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <div>
        <h1 className="t-hero text-ink">Eat</h1>
        <p className="t-label text-muted">21G · {ready ? `${filtered.length} places` : "…"}</p>
      </div>

      <FilterChips chips={TABS} value={tab} onChange={setTab} module={EAT} />

      {/* Toggle filters */}
      <div className="flex flex-wrap gap-2">
        <ToggleChip label="Veg" on={veg} onToggle={() => setVeg((v) => !v)} />
        <ToggleChip label="Delivery" on={delivery} onToggle={() => setDelivery((v) => !v)} />
        <ToggleChip label="Walkable ≤2km" on={walkable} onToggle={() => setWalkable((v) => !v)} />
        {cap != null && (
          <button
            onClick={() => setCap(null)}
            className="t-chip h-[34px] rounded-full bg-eat px-3.5 text-ink"
          >
            ≤ {inr(cap)} ✕
          </button>
        )}
      </div>

      {ready && filtered.length === 0 ? (
        <p className="t-body text-muted">Nothing matches those filters.</p>
      ) : (
        filtered.map((p) => {
          const conf = confidence[p.id];
          const fresh = conf?.is_fresh ?? false;
          return (
            <ContentCard
              key={p.id}
              module="eat"
              title={p.name}
              meta={`${p.area} · ${p.timings}`}
              price={p.avg_price}
              info={[
                { label: "Rating", value: `${p.rating}★ · ${p.reviews}` },
                { label: "Distance", value: `${p.distance_km} km` },
                { label: "Student", value: `${p.student_score}/100` },
                { label: "Diet", value: p.cuisine === "both" ? "Veg + Non" : p.cuisine === "veg" ? "Veg" : "Non-veg" },
              ]}
              actionLabel={saved.has(p.id) ? "Saved ✓" : "Save"}
              onAction={() => toggleSave(p.id)}
            >
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className={`t-micro ${fresh ? "text-speak" : "text-muted"}`}>
                  {conf && fresh
                    ? conf.days_old <= 0
                      ? "Price confirmed today"
                      : `Confirmed ${conf.days_old}d ago`
                    : "Needs checking"}
                </span>
                {p.phone && (
                  <a href={`tel:${p.phone}`} className="t-chip flex items-center gap-1 rounded-full border border-line px-3 py-1 text-ink">
                    <Phone size={13} /> Call
                  </a>
                )}
              </div>
              {p.must_try.length > 0 && (
                <p className="t-label mt-2 text-muted">Must try: {p.must_try.slice(0, 2).join(", ")}</p>
              )}
            </ContentCard>
          );
        })
      )}
    </div>
  );
}

function ToggleChip({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      className={`t-chip h-[34px] whitespace-nowrap rounded-full border px-3.5 ${
        on ? "border-transparent bg-eat text-ink" : "border-line bg-surface text-ink"
      }`}
    >
      {label}
    </button>
  );
}
