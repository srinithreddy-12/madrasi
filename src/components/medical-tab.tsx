"use client";

import { useMemo, useState } from "react";
import { MODULE_BY_KEY } from "@/lib/modules";
import { PHARMACIES, HOSPITALS, type Pharmacy, type Hospital } from "@/lib/medical";
import { FilterChips, type Chip } from "@/components/filter-chips";
import { ContentCard } from "@/components/content-card";
import { DetailSheet } from "@/components/detail-sheet";

const LIVE = MODULE_BY_KEY.live;
const KIND_TABS: Chip[] = [
  { key: "pharmacy", label: "Pharmacies" },
  { key: "hospital", label: "Hospitals" },
];

export function MedicalTab() {
  const [kind, setKind] = useState("pharmacy");
  const [pharmacyDetail, setPharmacyDetail] = useState<Pharmacy | null>(null);
  const [hospitalDetail, setHospitalDetail] = useState<Hospital | null>(null);

  const pharmacies = useMemo(
    () => [...PHARMACIES].sort((a, b) => b.studentRating - a.studentRating),
    [],
  );

  return (
    <div className="flex flex-col gap-3">
      <FilterChips chips={KIND_TABS} value={kind} onChange={setKind} module={LIVE} />

      {kind === "pharmacy" ? (
        <>
          <p className="t-micro px-1 text-muted">
            For any life-threatening emergency, call <strong>108</strong> (free ambulance) — don&apos;t wait to
            pick a hospital.
          </p>
          {pharmacies.map((p) => (
            <ContentCard
              key={p.id}
              module="live"
              title={p.name}
              meta={`${p.area} · ${p.hours}`}
              price={p.hours === "24 hours" ? "24 hrs" : undefined}
              onClick={() => setPharmacyDetail(p)}
            >
              <div className="mt-3 flex items-center gap-3">
                <span className="t-micro text-muted">{p.rating}★ public</span>
                <span className="t-micro text-live">{p.studentRating}/10 student rating</span>
              </div>
              {p.pick && <p className="t-micro mt-1 text-live">Editor&apos;s pick</p>}
            </ContentCard>
          ))}
        </>
      ) : (
        HOSPITALS.map((h) => (
          <ContentCard
            key={h.id}
            module="live"
            title={h.name}
            meta={`${h.area} · ${h.type}`}
            onClick={() => setHospitalDetail(h)}
          >
            {h.emergency && <p className="t-micro mt-2 text-live">24/7 emergency</p>}
          </ContentCard>
        ))
      )}

      <DetailSheet
        open={!!pharmacyDetail}
        onClose={() => setPharmacyDetail(null)}
        module={LIVE}
        name={pharmacyDetail?.name ?? ""}
        area={pharmacyDetail?.area ?? ""}
      >
        {pharmacyDetail && (
          <>
            <p className="t-stat text-live">{pharmacyDetail.hours}</p>
            {pharmacyDetail.pick && <p className="t-label mt-1 text-live">{pharmacyDetail.pick}</p>}
            {pharmacyDetail.services.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {pharmacyDetail.services.map((s) => (
                  <span key={s} className="t-chip rounded-full bg-live-tint px-3 py-1 text-ink">
                    {s}
                  </span>
                ))}
              </div>
            )}
            <p className="t-label mt-3 text-muted">
              {pharmacyDetail.rating}★ public rating · {pharmacyDetail.studentRating}/10 student rating
            </p>
          </>
        )}
      </DetailSheet>

      <DetailSheet
        open={!!hospitalDetail}
        onClose={() => setHospitalDetail(null)}
        module={LIVE}
        name={hospitalDetail?.name ?? ""}
        area={hospitalDetail?.area ?? ""}
      >
        {hospitalDetail && (
          <>
            <p className="t-stat text-live">{hospitalDetail.type}</p>
            {hospitalDetail.emergency && (
              <span className="t-chip mt-2 inline-block rounded-full bg-live px-3 py-1 text-white">
                24/7 emergency
              </span>
            )}
            <p className="t-body mt-3 text-ink">{hospitalDetail.note}</p>
          </>
        )}
      </DetailSheet>
    </div>
  );
}
