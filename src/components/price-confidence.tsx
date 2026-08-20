import type { PriceConfidence } from "@/lib/types";

// Crowd price confidence badge. Fresh (<7 days) reads "PRICE CONFIRMED N DAYS
// AGO" in mono; stale or unreported greys out to "NEEDS CHECKING". The full
// one-tap verification flow (Still ₹X? → YES/NO) is a Phase-5 system; this is
// the read-only state that ships with the demo path.

type PriceConfidenceProps = {
  confidence?: PriceConfidence | null;
  className?: string;
};

export function PriceConfidenceBadge({ confidence, className = "" }: PriceConfidenceProps) {
  const fresh = confidence?.is_fresh ?? false;

  const text = !confidence
    ? "NEEDS CHECKING"
    : !fresh
      ? "NEEDS CHECKING"
      : confidence.days_old <= 0
        ? "PRICE CONFIRMED TODAY"
        : `PRICE CONFIRMED ${confidence.days_old} DAY${confidence.days_old === 1 ? "" : "S"} AGO`;

  return (
    <span
      className={`tabular inline-flex items-center gap-1 text-[0.625rem] ${
        fresh ? "text-mtc" : "text-faded/70"
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${fresh ? "bg-mtc" : "bg-faded/50"}`}
      />
      {text}
    </span>
  );
}
