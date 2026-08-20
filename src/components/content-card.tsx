import type { ReactNode } from "react";
import { MODULE_BY_KEY, type ModuleKey } from "@/lib/modules";

export type InfoItem = { label: string; value: string };

// STYLE-v2 §4 content card: white, card radius. Name in subtitle, meta in label
// --muted, price pill top-right in the module colour (numeral at 20px), an
// optional 2×2 grid of tinted info panels. Whole card is tappable when onClick
// is given (opens the detail sheet).
export function ContentCard({
  module,
  title,
  meta,
  price,
  info,
  onClick,
  children,
}: {
  module: ModuleKey;
  title: string;
  meta?: string;
  /** Pass a string when the price carries a suffix, e.g. "₹2,800/mo". */
  price?: string | number;
  info?: InfoItem[];
  onClick?: () => void;
  children?: ReactNode;
}) {
  const m = MODULE_BY_KEY[module];
  const priceText = typeof price === "number" ? `₹${price}` : price;

  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="t-subtitle text-ink">{title}</p>
          {meta && <p className="t-label mt-0.5 text-muted">{meta}</p>}
        </div>
        {priceText != null && (
          <span className={`shrink-0 rounded-full px-3 py-1.5 ${m.bgClass} ${m.onColorClass}`}>
            <span className="t-stat" style={{ fontSize: "20px" }}>
              {priceText}
            </span>
          </span>
        )}
      </div>

      {info && info.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {info.map((it) => (
            <div key={it.label} className={`rounded-inner px-3 py-2 ${m.tintClass}`}>
              <p className="t-micro text-muted">{it.label}</p>
              <p className="t-label text-ink">{it.value}</p>
            </div>
          ))}
        </div>
      )}

      {children}
    </>
  );

  const cls = "w-full rounded-card border border-line bg-surface p-5 text-left shadow-card";

  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className={`${cls} [transition:transform_120ms_ease-out] active:scale-[0.98]`}
    >
      {inner}
    </button>
  ) : (
    <div className={cls}>{inner}</div>
  );
}
