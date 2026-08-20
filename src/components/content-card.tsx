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
          className={`inline-flex shrink-0 items-center rounded-full ${m.bgClass} ${m.onColorClass} ${
            image ? "px-2.5 py-1 text-[12px] font-semibold" : "h-[26px] px-2.5"
          }`}
        >
          {image ? priceText : <span className="t-stat" style={{ fontSize: "16px" }}>{priceText}</span>}
        </span>
      )}
    </div>
  );

  const inner = image ? (
    <>
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-inner">
          <Image src={image} alt={title} fill sizes="64px" className="object-cover" />
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
        <div className="mt-3 flex flex-wrap gap-1.5">
          {info.map((it) => (
            <span
              key={it.label}
              className={`t-micro inline-flex items-center gap-1 rounded-full px-2 py-1 ${m.tintClass} text-ink`}
            >
              <span className="text-muted">{it.label}</span> {it.value}
            </span>
          ))}
        </div>
      )}

      {children}
    </>
  );

  const cls = `w-full overflow-hidden rounded-card border border-line bg-surface text-left shadow-card ${
    image ? "p-2.5" : "p-card"
  }`;

  return onClick ? (
    <button type="button" onClick={onClick} className={`${cls} pressable`}>
      {inner}
    </button>
  ) : (
    <div className={cls}>{inner}</div>
  );
}
