"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MODULE_BY_KEY } from "@/lib/modules";
import { FilterChips, type Chip } from "@/components/filter-chips";
import { EatTab } from "@/components/eat-tab";
import { LaundryTab } from "@/components/laundry-tab";
import { BundlesTab } from "@/components/bundles-tab";
import { HousingTab } from "@/components/housing-tab";

const LIVE = MODULE_BY_KEY.live;
const TABS: Chip[] = [
  { key: "eat", label: "Eat" },
  { key: "laundry", label: "Laundry" },
  { key: "housing", label: "PG & Hostels" },
  { key: "bundles", label: "Bundles" },
];

// /live (29C, clay) is the combined hub — reference-app parity: Eat + Laundry
// share one screen there too. Housing + Bundles are our own additions.
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
    <div className="flex flex-col gap-3 px-4 py-4">
      <div>
        <h1 className="t-hero text-ink">Services</h1>
        <p className="t-label text-muted">29C · Food, laundry, housing &amp; bundles</p>
      </div>

      <FilterChips chips={TABS} value={tab} onChange={setTab} module={LIVE} />

      {tab === "eat" ? (
        <EatTab />
      ) : tab === "laundry" ? (
        <LaundryTab />
      ) : tab === "housing" ? (
        <HousingTab />
      ) : (
        <BundlesTab />
      )}
    </div>
  );
}
