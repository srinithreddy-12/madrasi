import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// iOS-style large-title header (HIG: Typography > Conveying hierarchy).
// A big title anchors each screen; an optional route pill carries the module
// colour, a muted subtitle gives context, and a trailing slot holds one action.
// Respects the top safe area so titles clear the status bar / Dynamic Island.
export function NavHeader({
  title,
  routeCode,
  accentClass,
  accentText,
  subtitle,
  trailing,
  back,
}: {
  title: string;
  /** e.g. "21G" — shown as a small tinted pill before the subtitle. */
  routeCode?: string;
  /** bg-<module>-tint for the route pill background. */
  accentClass?: string;
  /** text-<module> for the route pill text. */
  accentText?: string;
  subtitle?: ReactNode;
  /** One trailing action (a link or button). */
  trailing?: ReactNode;
  /** Optional back affordance rendered above the title. */
  back?: { href: string; label: string };
}) {
  return (
    <header className="flex flex-col gap-1 pt-[calc(env(safe-area-inset-top)+8px)]">
      {back && (
        <Link
          href={back.href}
          className="t-label -ml-1 mb-1 flex w-fit items-center gap-0.5 text-muted"
        >
          <ChevronLeft size={18} strokeWidth={2.25} /> {back.label}
        </Link>
      )}
      <div className="flex items-start justify-between gap-3">
        <h1 className="t-largetitle text-ink">{title}</h1>
        {trailing && <div className="shrink-0 pt-1">{trailing}</div>}
      </div>
      {(routeCode || subtitle) && (
        <div className="flex flex-wrap items-center gap-2">
          {routeCode && (
            <span
              className={`t-micro rounded-full px-2 py-0.5 ${accentClass ?? "bg-line"} ${
                accentText ?? "text-muted"
              }`}
            >
              {routeCode}
            </span>
          )}
          {subtitle && <span className="t-label text-muted">{subtitle}</span>}
        </div>
      )}
    </header>
  );
}
