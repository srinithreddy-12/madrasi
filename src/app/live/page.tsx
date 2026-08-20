"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MODULE_BY_KEY } from "@/lib/modules";
import { FilterChips, type Chip } from "@/components/filter-chips";
import { EatTab } from "@/components/eat-tab";
import { LaundryTab } from "@/components/laundry-tab";
import { HousingTab } from "@/components/housing-tab";
import { MedicalTab } from "@/components/medical-tab";
import { NavHeader } from "@/components/nav-header";

const LIVE = MODULE_BY_KEY.live;
const TABS: Chip[] = [
  { key: "eat", label: "Eat" },
  { key: "laundry", label: "Laundry" },
  { key: "housing", label: "PG & Hostels" },
  { key: "medical", label: "Medical" },
];

// /live (29C, clay) is the combined hub — reference-app parity: Eat + Laundry
// share one screen there too. Housing + Medical are our own additions.
// Bundles moved to Home (its own /bundles page) to keep this screen focused.
export default function LivePage() {
  return (
    <Suspense fallback={<div className="px-4 py-6 t-body text-muted">Loading…</div>}>
      <ServicesHub />
    </Suspense>
  );
}

function ServicesHub() {
  const params = useSearchParams();
  const [tab, setTab] = useState(params.get("tab") ?? "eat");

  return (
    <div className="screen gap-2">
      <NavHeader
        title="Services"
        routeCode="29C"
        accentClass={LIVE.bgClass}
        accentText={LIVE.onColorClass}
        subtitle="Food, laundry, housing & medical"
      />

      <FilterChips chips={TABS} value={tab} onChange={setTab} module={LIVE} />

      {tab === "eat" ? (
        <EatTab />
      ) : tab === "laundry" ? (
        <LaundryTab />
      ) : tab === "housing" ? (
        <HousingTab />
      ) : (
        <MedicalTab />
      )}
    </div>
  );
}
