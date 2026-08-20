"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useSupabaseAuth } from "@/lib/supabase/auth-provider";
import type { FoodPlace } from "@/lib/types";
import { MODULE_BY_KEY } from "@/lib/modules";
import { inr } from "@/lib/format";
import { awardFirstSaveXp } from "@/lib/xp";
import { MENUS } from "@/lib/menus";
import { ContentCard } from "@/components/content-card";
import { FilterChips, type Chip } from "@/components/filter-chips";
import { DetailSheet } from "@/components/detail-sheet";

const cuisineLabel = (c: FoodPlace["cuisine"]) =>
  c === "veg" ? "Vegetarian" : c === "nonveg" ? "Non-vegetarian" : "Veg & non-veg";

const EAT = MODULE_BY_KEY.eat;
const TABS: Chip[] = [
  { key: "food", label: "Food" },
  { key: "mess", label: "Mess & Tiffin" },
  { key: "late", label: "Late Night" },
];

const isMess = (p: FoodPlace) => ["mess", "tiffin", "caterer"].includes(p.kind);
const priceLabel = (p: FoodPlace) =>
  isMess(p) && p.monthly_price ? `${inr(p.monthly_price)}/mo` : `${inr(p.avg_price)}`;

// Formerly the standalone /eat page — now the default tab inside Services,
// same as the reference app's Food+Laundry combined /services screen.
export function EatTab() {
  const params = useSearchParams();
  const { session } = useSupabaseAuth();
  const userId = session?.user.id ?? null;

  const [places, setPlaces] = useState<FoodPlace[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  const [tab, setTab] = useState("food");
  const sort = "cheapest";
  const capParam = params.get("cap");
  const [cap, setCap] = useState<number | null>(capParam ? Number(capParam) : null);
  const [detail, setDetail] = useState<FoodPlace | null>(null);

  useEffect(() => {
    supabase
      .from("food_places")
      .select("*")
      .then(({ data }) => {
        setPlaces((data ?? []) as FoodPlace[]);
        setReady(true);
      });
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

  const list = useMemo(() => {
    const filtered = places.filter((p) => {
      if (tab === "mess" && !isMess(p)) return false;
      if (tab === "late" && !p.late_night) return false;
      if (cap != null && p.avg_price > cap) return false;
      return true;
    });
    const sorted = [...filtered];
    if (sort === "cheapest") sorted.sort((a, b) => a.avg_price - b.avg_price);
    else if (sort === "closest") sorted.sort((a, b) => a.distance_km - b.distance_km);
    else sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  }, [places, tab, sort, cap]);

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
      await awardFirstSaveXp(userId, "eat");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <FilterChips chips={TABS} value={tab} onChange={setTab} module={EAT} />
      {cap != null && (
        <button onClick={() => setCap(null)} className="t-chip h-[34px] self-start rounded-full bg-eat px-3.5 text-ink">
          ≤ {inr(cap)} ✕
        </button>
      )}

      {ready && list.length === 0 ? (
        <p className="t-body text-muted">Nothing matches those filters.</p>
      ) : (
        list.map((p) => (
          <ContentCard
            key={p.id}
            module="eat"
            title={p.name}
            meta={`${p.area} · ${p.timings}`}
            price={priceLabel(p)}
            onClick={() => setDetail(p)}
          >
            <div className="mt-3 flex items-center gap-3">
              <VegDot cuisine={p.cuisine} />
              <span className="t-micro text-muted">Score {p.student_score}</span>
              {saved.has(p.id) && <span className="t-micro text-eat">Saved</span>}
            </div>
          </ContentCard>
        ))
      )}

      <DetailSheet
        open={!!detail}
        onClose={() => setDetail(null)}
        module={EAT}
        name={detail?.name ?? ""}
        area={detail?.area ?? ""}
        phone={detail?.phone}
        saved={detail ? saved.has(detail.id) : false}
        onToggleSave={() => detail && toggleSave(detail.id)}
      >
        {detail && (
          <>
            <p className="t-stat text-eat">{priceLabel(detail)}</p>
            {isMess(detail) && detail.monthly_price && (
              <p className="t-label text-muted">≈ {inr(Math.round(detail.monthly_price / 90))}/meal</p>
            )}

            {detail.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {detail.tags.map((t) => (
                  <span key={t} className="t-micro rounded-full border border-line px-2.5 py-1 text-muted">
                    {t}
                  </span>
                ))}
              </div>
            )}
            {detail.must_try.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {detail.must_try.map((t) => (
                  <span key={t} className="t-chip rounded-full bg-eat-tint px-3 py-1 text-ink">
                    {t}
                  </span>
                ))}
              </div>
            )}
            {detail.blurb && <p className="t-body mt-3 text-ink">{detail.blurb}</p>}

            {MENUS[detail.id]?.length > 0 && (
              <div className="mt-4">
                <p className="t-label mb-2 text-muted">Menu</p>
                <div className="divide-y divide-line rounded-inner border border-line">
                  {MENUS[detail.id].map((item) => (
                    <div key={item.name} className="flex items-center justify-between px-3 py-2.5">
                      <span className="t-body text-ink">{item.name}</span>
                      <span className="t-label text-eat">{inr(item.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-inner bg-eat-tint px-3 py-2">
                <p className="t-micro text-muted">Timings</p>
                <p className="t-label text-ink">{detail.timings}</p>
              </div>
              <div className="rounded-inner bg-eat-tint px-3 py-2">
                <p className="t-micro text-muted">Rating</p>
                <p className="t-label text-ink">{detail.rating}★ · {detail.reviews}</p>
              </div>
              <div className="rounded-inner bg-eat-tint px-3 py-2">
                <p className="t-micro text-muted">Distance</p>
                <p className="t-label text-ink">{detail.distance_km} km</p>
              </div>
              <div className="rounded-inner bg-eat-tint px-3 py-2">
                <p className="t-micro text-muted">Cuisine</p>
                <p className="t-label text-ink">{cuisineLabel(detail.cuisine)}</p>
              </div>
              <div className="rounded-inner bg-eat-tint px-3 py-2">
                <p className="t-micro text-muted">Delivery</p>
                <p className="t-label text-ink">{detail.delivery ? "Available" : "Not available"}</p>
              </div>
              <div className="rounded-inner bg-eat-tint px-3 py-2">
                <p className="t-micro text-muted">Late night</p>
                <p className="t-label text-ink">{detail.late_night ? "Yes" : "No"}</p>
              </div>
            </div>
          </>
        )}
      </DetailSheet>
    </div>
  );
}

function VegDot({ cuisine }: { cuisine: FoodPlace["cuisine"] }) {
  const color = cuisine === "veg" ? "var(--speak)" : cuisine === "nonveg" ? "var(--live)" : "var(--eat)";
  return (
    <span className="t-micro flex items-center gap-1.5 text-muted">
      <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {cuisineLabel(cuisine)}
    </span>
  );
}
