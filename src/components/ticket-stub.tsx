import type { ReactNode } from "react";
import { MODULE_BY_KEY, type ModuleKey } from "@/lib/modules";

type TicketStubProps = {
  module: ModuleKey;
  title: string;
  /** Fare/price — renders large (32px) in tabular mono. A number gets a ₹. */
  fare?: string | number;
  /** Secondary info line, in the mono label voice. */
  meta?: string;
  /** Amber left tab instead of green — the selected/active look. */
  active?: boolean;
  children?: ReactNode;
  /** Colour of the perforation notches — the surface behind the card. */
  notchColor?: string;
  className?: string;
};

/**
 * The MADRASI ticket stub (STYLE-v1.1 §5): min 88px tall, full bleed.
 * The route badge is now a full-height coloured tab bleeding off the LEFT edge
 * (32px, route code rotated 90°). The name is set in the condensed 24px title;
 * the fare is 32px mono, right-aligned and vertically centred. Perforation
 * notches are on the RIGHT edge only.
 */
export function TicketStub({
  module,
  title,
  fare,
  meta,
  active = false,
  children,
  notchColor = "var(--manila)",
  className = "",
}: TicketStubProps) {
  const m = MODULE_BY_KEY[module];
  const fareText = typeof fare === "number" ? `₹${fare}` : fare;

  return (
    <div
      style={{ ["--stub-bg" as string]: notchColor }}
      className={`relative flex min-h-[88px] w-full overflow-hidden bg-paper text-ink ${className}`}
    >
      {/* Left tab — full-height coloured stub, route code rotated 90°. */}
      <div
        className={`flex w-8 shrink-0 items-center justify-center ${
          active ? "bg-amber" : "bg-mtc"
        }`}
      >
        <span
          aria-hidden="true"
          className={`label -rotate-90 whitespace-nowrap text-label font-semibold leading-none ${
            active ? "text-ink" : "text-manila"
          }`}
        >
          {m.routeCode}
        </span>
      </div>

      {/* Body */}
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <h3 className="signage truncate text-title text-ink">{title}</h3>
          {meta && <p className="label text-micro text-faded">{meta}</p>}
          {children}
        </div>
        {fareText != null && (
          <span className="tabular shrink-0 text-right text-fare font-medium text-ink">
            {fareText}
          </span>
        )}
      </div>

      {/* Perforation notches — right edge only. overflow-hidden clips the outer
          half so each reads as a semicircle bitten out of the edge. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 h-3 w-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-[var(--stub-bg)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 translate-x-1/2 translate-y-1/2 rounded-full bg-[var(--stub-bg)]"
      />
    </div>
  );
}
