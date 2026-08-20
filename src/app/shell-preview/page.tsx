// TEMPORARY — v1.1 shell preview / component gallery.
// NOT an app screen. Demonstrates the "Crank It" direction: bigger type,
// full-bleed alternating ink/manila bands, unrationed amber-on-ink, the status
// strip (from the layout) and sticky ink section bars. Delete in a later phase.

import { DestinationBoard } from "@/components/destination-board";
import { RouteBadge } from "@/components/route-badge";
import { TicketStub } from "@/components/ticket-stub";
import { SectionBar } from "@/components/section-bar";
import { PunchMeter } from "@/components/punch-meter";
import { MODULES } from "@/lib/modules";

const ROUTE_FILLS: Record<string, number> = {
  eat: 78,
  speak: 24,
  move: 61,
  live: 12,
  explore: 9,
};

export default function ShellPreviewPage() {
  return (
    <div className="flex flex-col">
      {/* Hero band (ink) */}
      <div className="bg-ink px-4 pb-5 pt-4">
        <p className="label text-micro text-amber">TEMPORARY · SHELL PREVIEW</p>
        <h1 className="signage-xl text-hero text-manila">Madrasi</h1>
        <p className="label text-label text-amber">CHENNAI STUDENT PASS</p>
      </div>

      {/* Destination board (ink, full bleed, 5 rows) */}
      <SectionBar>Destination</SectionBar>
      <DestinationBoard
        marquee="MADRASI"
        lines={[
          "DINNER UNDER ₹100 · VELACHERY",
          "MESS OPEN NOW · 3 NEARBY",
          "LAST BUS 23C · 11:15 PM",
          "SHARE AUTO TO GUINDY · ₹20",
          "MARINA SUNRISE · 5:42 AM",
        ]}
      />

      {/* Today's Punch (manila) */}
      <SectionBar>Today&apos;s Punch</SectionBar>
      <div className="flex flex-col gap-3 bg-manila px-4 py-5">
        <p className="label text-micro text-faded">WEEK ONE · STEP 1 / 6</p>
        <p className="signage text-display text-ink">Order a chai in Tamil</p>
        <button className="signage self-start bg-stamp px-5 py-3 text-title text-manila">
          Punch it
        </button>
      </div>

      {/* Route strip (ink, horizontal scroll) */}
      <SectionBar>Your Routes</SectionBar>
      <div className="flex gap-2 overflow-x-auto bg-ink px-4 py-4">
        {MODULES.map((m) => {
          const fill = ROUTE_FILLS[m.key] ?? 0;
          return (
            <div key={m.key} className="flex min-w-[108px] shrink-0 flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="tabular text-label text-amber">{m.routeCode}</span>
                <span className="tabular text-micro text-manila/50">{fill}</span>
              </div>
              <span className="signage text-title text-manila">{m.label}</span>
              <span aria-hidden="true" className="h-1.5 bg-manila/15">
                <span className="block h-1.5 bg-amber" style={{ width: `${fill}%` }} />
              </span>
            </div>
          );
        })}
      </div>

      {/* Ticket stubs (manila, edge to edge, 8px gaps) */}
      <SectionBar>Eat · 21G</SectionBar>
      <div className="flex flex-col gap-2 bg-manila py-2">
        <TicketStub module="eat" active title="Murugan Idli Shop" fare={90} meta="T. Nagar · 7AM–11PM">
          <div className="mt-1">
            <PunchMeter score={88} />
          </div>
        </TicketStub>
        <TicketStub module="live" title="Sparkle Wash" fare="₹60/kg" meta="Velachery · pickup" />
        <TicketStub module="explore" title="Marina Beach" fare="Free" meta="Best before sunrise" />
      </div>

      {/* Route badges (manila) */}
      <SectionBar>Route Badges</SectionBar>
      <div className="flex flex-wrap gap-2 bg-manila px-4 py-4">
        {MODULES.map((m) => (
          <RouteBadge key={m.key} module={m.key} />
        ))}
        <RouteBadge module="eat" active />
      </div>
    </div>
  );
}
