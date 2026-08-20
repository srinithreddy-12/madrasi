"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Route } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useSupabaseAuth } from "@/lib/supabase/auth-provider";
import type { Place } from "@/lib/types";
import { MODULE_BY_KEY } from "@/lib/modules";
import { inr } from "@/lib/format";
import { awardFirstSaveXp } from "@/lib/xp";
import { ContentCard } from "@/components/content-card";
import { FilterChips, type Chip } from "@/components/filter-chips";
import { DetailSheet } from "@/components/detail-sheet";
import { NavHeader } from "@/components/nav-header";

const EXPLORE = MODULE_BY_KEY.explore;

// Fixed display order; chips for categories absent from the data are skipped.
const CATEGORY_ORDER = [
  "Beaches",
  "History",
  "Culture",
  "Parks",
  "Photography",
  "Student hangouts",
  "Weekend trips",
];

const priceLabel = (p: Place) => (p.entry > 0 ? inr(p.entry) : "Free");

export default function ExplorePage() {
  const { session } = useSupabaseAuth();
  const userId = session?.user.id ?? null;

  const [places, setPlaces] = useState<Place[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("all");
  const [detail, setDetail] = useState<Place | null>(null);

  useEffect(() => {
    supabase
      .from("places")
      .select("*")
      .order("rating", { ascending: false })
      .then(({ data }) => {
        setPlaces((data ?? []) as Place[]);
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("saves")
      .select("entity_id")
      .eq("user_id", userId)
      .eq("entity_type", "place")
      .then(({ data }) => setSaved(new Set((data ?? []).map((r) => r.entity_id))));
  }, [userId]);

  const tabs: Chip[] = useMemo(() => {
    const present = new Set(places.map((p) => p.category));
    return [
      { key: "all", label: "All" },
      ...CATEGORY_ORDER.filter((c) => present.has(c)).map((c) => ({ key: c, label: c })),
    ];
  }, [places]);

  const list = useMemo(
    () => (tab === "all" ? places : places.filter((p) => p.category === tab)),
    [places, tab],
  );

  async function toggleSave(id: string) {
    if (!userId) return;
    const next = new Set(saved);
    if (next.has(id)) {
      next.delete(id);
      setSaved(next);
      await supabase.from("saves").delete().eq("user_id", userId).eq("entity_type", "place").eq("entity_id", id);
    } else {
      next.add(id);
      setSaved(next);
      await supabase.from("saves").insert({ user_id: userId, entity_type: "place", entity_id: id });
      await awardFirstSaveXp(userId, "explore");
    }
  }

  return (
    <div className="screen gap-2">
      <NavHeader
        title="Explore"
        routeCode="1B"
        accentClass={EXPLORE.bgClass}
        accentText={EXPLORE.onColorClass}
        subtitle={ready ? `${list.length} places` : "…"}
      />

      <FilterChips chips={tabs} value={tab} onChange={setTab} module={EXPLORE} />

      {ready && list.length === 0 ? (
        <p className="t-body text-muted">Nothing matches those filters.</p>
      ) : (
        list.map((p) => (
          <ContentCard
            key={p.id}
            module="explore"
            title={`${p.emoji ? `${p.emoji} ` : ""}${p.name}`}
            meta={p.area}
            price={priceLabel(p)}
            image={`/explore/${p.id}.jpg`}
            badge={p.category}
            onClick={() => setDetail(p)}
          >
            <div className="mt-2 flex items-center gap-3">
              <span className="t-micro text-muted">{p.rating}★ · {p.crowd} crowd</span>
              {saved.has(p.id) && <span className="t-micro text-explore">Saved</span>}
            </div>
          </ContentCard>
        ))
      )}

      <DetailSheet
        open={!!detail}
        onClose={() => setDetail(null)}
        module={EXPLORE}
        name={detail?.name ?? ""}
        area={detail?.area ?? ""}
        image={detail ? `/explore/${detail.id}.jpg` : undefined}
        saved={detail ? saved.has(detail.id) : false}
        onToggleSave={() => detail && toggleSave(detail.id)}
      >
        {detail && (
          <>
            <p className="t-stat text-explore">{priceLabel(detail)}</p>
            <Link
              href={`/move?to=${encodeURIComponent(detail.area)}`}
              className="t-subtitle mt-3 flex items-center justify-center gap-2 rounded-full bg-explore-tint py-3 text-explore"
            >
              <Route size={18} /> How do I get there?
            </Link>
            {detail.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {detail.tags.map((t) => (
                  <span key={t} className="t-chip rounded-full bg-explore-tint px-3 py-1 text-ink">
                    {t}
                  </span>
                ))}
              </div>
            )}
            {detail.description && <p className="t-body mt-3 text-ink">{detail.description}</p>}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {detail.best_time && (
                <div className="rounded-inner bg-explore-tint px-3 py-2">
                  <p className="t-micro text-muted">Best time</p>
                  <p className="t-label text-ink">{detail.best_time}</p>
                </div>
              )}
              {detail.duration && (
                <div className="rounded-inner bg-explore-tint px-3 py-2">
                  <p className="t-micro text-muted">Duration</p>
                  <p className="t-label text-ink">{detail.duration}</p>
                </div>
              )}
              <div className="rounded-inner bg-explore-tint px-3 py-2">
                <p className="t-micro text-muted">Crowd</p>
                <p className="t-label text-ink">{detail.crowd}</p>
              </div>
              <div className="rounded-inner bg-explore-tint px-3 py-2">
                <p className="t-micro text-muted">Day budget</p>
                <p className="t-label text-ink">{inr(detail.budget)}</p>
              </div>
            </div>
            {detail.transport && (
              <div className="mt-2 rounded-inner bg-explore-tint px-3 py-2">
                <p className="t-micro text-muted">Getting there</p>
                <p className="t-label text-ink">{detail.transport}</p>
              </div>
            )}
            {detail.nearby_food.length > 0 && (
              <div className="mt-2 rounded-inner bg-explore-tint px-3 py-2">
                <p className="t-micro text-muted">Nearby food</p>
                <p className="t-label text-ink">{detail.nearby_food.join(", ")}</p>
              </div>
            )}
            <p className="t-label mt-3 text-muted">Rating {detail.rating}★ · {detail.reviews} reviews</p>
          </>
        )}
      </DetailSheet>
    </div>
  );
}
