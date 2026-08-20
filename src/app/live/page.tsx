"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useSupabaseAuth } from "@/lib/supabase/auth-provider";
import type { Laundry } from "@/lib/types";
import { MODULE_BY_KEY } from "@/lib/modules";
import { inr } from "@/lib/format";
import { awardFirstSaveXp } from "@/lib/xp";
import { ContentCard } from "@/components/content-card";
import { DetailSheet } from "@/components/detail-sheet";

const LIVE = MODULE_BY_KEY.live;

export default function LivePage() {
  const { session } = useSupabaseAuth();
  const userId = session?.user.id ?? null;

  const [laundries, setLaundries] = useState<Laundry[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);
  const [detail, setDetail] = useState<Laundry | null>(null);

  useEffect(() => {
    supabase
      .from("laundries")
      .select("*")
      .order("student_score", { ascending: false })
      .then(({ data }) => {
        setLaundries((data ?? []) as Laundry[]);
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("saves")
      .select("entity_id")
      .eq("user_id", userId)
      .eq("entity_type", "laundry")
      .then(({ data }) => setSaved(new Set((data ?? []).map((r) => r.entity_id))));
  }, [userId]);

  async function toggleSave(id: string) {
    if (!userId) return;
    const next = new Set(saved);
    if (next.has(id)) {
      next.delete(id);
      setSaved(next);
      await supabase.from("saves").delete().eq("user_id", userId).eq("entity_type", "laundry").eq("entity_id", id);
    } else {
      next.add(id);
      setSaved(next);
      await supabase.from("saves").insert({ user_id: userId, entity_type: "laundry", entity_id: id });
      await awardFirstSaveXp(userId, "live");
    }
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <div>
        <h1 className="t-hero text-ink">Live</h1>
        <p className="t-label text-muted">29C · {ready ? `${laundries.length} laundries` : "…"}</p>
      </div>

      {ready && laundries.length === 0 ? (
        <p className="t-body text-muted">No laundries yet.</p>
      ) : (
        laundries.map((l) => (
          <ContentCard
            key={l.id}
            module="live"
            title={l.name}
            meta={`${l.area} · ${l.timings}`}
            price={`${inr(l.per_kg)}/kg`}
            onClick={() => setDetail(l)}
            info={[
              { label: "Ironing", value: `${inr(l.iron_per_piece)}/pc` },
              { label: "Dry clean", value: `from ${inr(l.dry_clean_from)}` },
              { label: "Pickup", value: l.pickup ? "Available" : "No" },
              { label: "Student offer", value: l.student_discount ?? "—" },
            ]}
          >
            {saved.has(l.id) && <p className="t-micro mt-3 text-live">Saved</p>}
          </ContentCard>
        ))
      )}

      <DetailSheet
        open={!!detail}
        onClose={() => setDetail(null)}
        module={LIVE}
        name={detail?.name ?? ""}
        area={detail?.area ?? ""}
        phone={detail?.phone}
        saved={detail ? saved.has(detail.id) : false}
        onToggleSave={() => detail && toggleSave(detail.id)}
      >
        {detail && (
          <>
            <p className="t-stat text-live">{inr(detail.per_kg)}/kg</p>
            {detail.student_discount && (
              <p className="t-label text-live">{detail.student_discount}</p>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-inner bg-live-tint px-3 py-2">
                <p className="t-micro text-muted">Ironing</p>
                <p className="t-label text-ink">{inr(detail.iron_per_piece)}/pc</p>
              </div>
              <div className="rounded-inner bg-live-tint px-3 py-2">
                <p className="t-micro text-muted">Dry clean</p>
                <p className="t-label text-ink">from {inr(detail.dry_clean_from)}</p>
              </div>
              <div className="rounded-inner bg-live-tint px-3 py-2">
                <p className="t-micro text-muted">Pickup</p>
                <p className="t-label text-ink">{detail.pickup ? "Available" : "No"}</p>
              </div>
              <div className="rounded-inner bg-live-tint px-3 py-2">
                <p className="t-micro text-muted">Timings</p>
                <p className="t-label text-ink">{detail.timings}</p>
              </div>
            </div>
            <p className="t-label mt-3 text-muted">Rating {detail.rating}★ · {detail.reviews} reviews</p>
          </>
        )}
      </DetailSheet>
    </div>
  );
}
