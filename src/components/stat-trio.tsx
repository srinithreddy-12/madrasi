import { CountUp } from "./count-up";

// Stat trio: one white card, three columns split by hairline dividers. Each
// column: number in `stat`, label in `micro` --muted beneath. The single
// highest-impact component — LEVEL 4 / 340 XP / 4 DAY STREAK.

export type StatItem = {
  value: number;
  label: string;
  /** Optional prefix/format, e.g. (n) => `₹${Math.round(n)}`. */
  format?: (n: number) => string;
};

export function StatTrio({ items }: { items: StatItem[] }) {
  return (
    <div className="flex overflow-hidden rounded-card border border-line bg-surface shadow-card">
      {items.map((it, i) => (
        <div
          key={it.label}
          className={`flex-1 px-3 py-6 text-center ${
            i > 0 ? "border-l border-line-strong" : ""
          }`}
        >
          <CountUp value={it.value} format={it.format} className="t-stat block text-ink" />
          <p className="t-micro mt-2 text-muted">{it.label}</p>
        </div>
      ))}
    </div>
  );
}
