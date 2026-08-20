import { MODULE_BY_KEY, type ModuleKey } from "@/lib/modules";

type RouteBadgeProps = {
  module: ModuleKey;
  /** Amber-on-ink active state; default is green-on-manila (STYLE-v1.1 §5). */
  active?: boolean;
  /**
   * When the surrounding component already names the module in text, set this
   * so the badge is purely decorative (aria-hidden with the value in text).
   */
  decorative?: boolean;
  className?: string;
};

/**
 * The MTC route badge — 32px tall, DM Mono 13px / 600, 4px radius.
 * Active: amber on ink. Inactive: green on manila.
 */
export function RouteBadge({
  module,
  active = false,
  decorative = false,
  className = "",
}: RouteBadgeProps) {
  const m = MODULE_BY_KEY[module];
  const tone = active ? "bg-amber text-ink" : "bg-mtc text-manila";

  const a11y = decorative
    ? ({ "aria-hidden": true } as const)
    : ({ role: "img", "aria-label": `MTC route ${m.routeCode}, ${m.label}` } as const);

  return (
    <span
      {...a11y}
      className={`label inline-flex h-8 min-h-8 items-center justify-center rounded-[4px] px-2 text-label font-semibold leading-none ${tone} ${className}`}
    >
      {m.routeCode}
    </span>
  );
}
