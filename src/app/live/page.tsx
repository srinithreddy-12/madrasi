"use client";

import { useState } from "react";
import { MODULE_BY_KEY } from "@/lib/modules";
import { FilterChips, type Chip } from "@/components/filter-chips";
import { LaundryTab } from "@/components/laundry-tab";
import { BundlesTab } from "@/components/bundles-tab";
import { HousingTab } from "@/components/housing-tab";

const LIVE = MODULE_BY_KEY.live;
const TABS: Chip[] = [
  { key: "laundry", label: "Laundry" },
  { key: "housing", label: "PG & Hostels" },
  { key: "bundles", label: "Bundles" },
];

// /live (29C, clay) is a hub. Laundry + Housing + Bundles chips share the screen.
export default function LivePage() {
  const [tab, setTab] = useState("laundry");

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <div>
        <h1 className="t-hero text-ink">Live</h1>
        <p className="t-label text-muted">29C · Laundry, housing &amp; bundles</p>
      </div>

      <FilterChips chips={TABS} value={tab} onChange={setTab} module={LIVE} />

      {tab === "laundry" ? <LaundryTab /> : tab === "housing" ? <HousingTab /> : <BundlesTab />}
    </div>
  );
}
