import type { ReactNode } from "react";
import Image from "next/image";
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
  image,
  badge,
  info,
  onClick,
  children,
}: {
  module: ModuleKey;
  title: string;
  meta?: string;
  /** Pass a string when the price carries a suffix, e.g. "₹2,800/mo". */
  price?: string | number;
  /** Optional photo, bled to the card's edges above the title. */
  image?: string;
  /** Small pill over the bottom-left corner of the image. */
  badge?: string;
  info?: InfoItem[];
  onClick?: () => void;
  children?: ReactNode;
}) {
  const m = MODULE_BY_KEY[module];
  const priceText = typeof price === "number" ? `₹${price}` : price;

  // Cards with a photo use a compact side-by-side row (thumbnail + text) so
  // the list reads cleanly on a phone; cards without one keep the original
  // stacked layout.
  const titleBlock = (
    <div className="flex items-start justify-between gap-2">
      <p className="t-subtitle truncate text-ink">{title}</p>
      {priceText != null && (
        <span
          className={`shrink-0 rounded-full ${m.bgClass} ${m.onColorClass} ${
            image ? "px-2.5 py-1 text-[13px] font-semibold" : "px-3 py-1.5"
          }`}
        >
          {image ? priceText : <span className="t-stat" style={{ fontSize: "20px" }}>{priceText}</span>}
        </span>
      )}
    </div>
  );

  const inner = image ? (
    <>
      <div className="flex items-center gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
          <Image src={image} alt={title} fill sizes="80px" className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          {titleBlock}
          {meta && <p className="t-label mt-0.5 truncate text-muted">{meta}</p>}
          {badge && (
            <span className={`t-micro mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-ink ${m.tintClass}`}>
              {badge}
            </span>
          )}
        </div>
      </div>
      {children}
    </>
  ) : (
    <>
      {titleBlock}
      {meta && <p className="t-label mt-0.5 text-muted">{meta}</p>}

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

  const cls = `w-full overflow-hidden rounded-card border border-line bg-surface text-left shadow-card ${
    image ? "p-3" : "p-5"
  }`;

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
