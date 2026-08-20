"use client";

import { useMemo, useState } from "react";
import { MODULE_BY_KEY } from "@/lib/modules";
import { HOSTELS, type Hostel } from "@/lib/hostels";
import { FilterChips, type Chip } from "@/components/filter-chips";
import { ContentCard } from "@/components/content-card";
import { DetailSheet } from "@/components/detail-sheet";

const LIVE = MODULE_BY_KEY.live;
const GENDER_TABS: Chip[] = [
  { key: "all", label: "All" },
  { key: "men", label: "Men" },
  { key: "women", label: "Women" },
];

const AMENITY_LABELS: { key: keyof Hostel["amenities"]; label: string }[] = [
  { key: "food", label: "Food" },
  { key: "wifi", label: "Wi-Fi" },
  { key: "laundry", label: "Laundry" },
  { key: "housekeeping", label: "Housekeeping" },
  { key: "security", label: "Security" },
  { key: "water", label: "Water" },
];

export function HousingTab() {
  const [gender, setGender] = useState("all");
  const [detail, setDetail] = useState<Hostel | null>(null);

  const list = useMemo(() => {
    const filtered = gender === "all" ? HOSTELS : HOSTELS.filter((h) => h.gender === gender || h.gender === "any");
    return [...filtered].sort((a, b) => b.studentRating - a.studentRating);
  }, [gender]);

  return (
    <div className="flex flex-col gap-3">
      <FilterChips chips={GENDER_TABS} value={gender} onChange={setGender} module={LIVE} />

      {list.map((h) => (
        <ContentCard
          key={h.id}
          module="live"
          title={h.name}
          meta={h.area}
          price={h.priceVerified ? h.priceLabel : "Contact"}
          onClick={() => setDetail(h)}
        >
          <div className="mt-3 flex items-center gap-3">
            {h.rating != null && <span className="t-micro text-muted">{h.rating}★ public</span>}
            <span className="t-micro text-live">{h.studentRating}/10 student rating</span>
          </div>
        </ContentCard>
      ))}

      <p className="t-micro px-1 text-muted">
        Ranked by student rating from a crowdsourced list. Street estimates for price and amenities — always
        confirm with the hostel before paying anything.
      </p>

      <DetailSheet open={!!detail} onClose={() => setDetail(null)} module={LIVE} name={detail?.name ?? ""} area={detail?.area ?? ""}>
        {detail && (
          <>
            <p className="t-stat text-live">{detail.priceVerified ? detail.priceLabel : "Contact for price"}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {AMENITY_LABELS.map((a) => (
                <div key={a.key} className="rounded-inner bg-live-tint px-3 py-2">
                  <p className="t-micro text-muted">{a.label}</p>
                  <p className="t-label text-ink">{detail.amenities[a.key]}</p>
                </div>
              ))}
            </div>
            {!detail.amenitiesVerified && (
              <p className="t-micro mt-2 text-muted">Amenities not independently confirmed — call to check before you visit.</p>
            )}
            <p className="t-label mt-3 text-muted">
              {detail.rating != null ? `${detail.rating}★ public rating · ` : ""}
              {detail.studentRating}/10 student rating
            </p>
          </>
        )}
      </DetailSheet>
    </div>
  );
}
