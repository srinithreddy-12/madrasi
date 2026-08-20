// Small formatting helpers. Numbers render in DM Mono via the `.tabular` class.

/** Indian-grouped rupee string, e.g. ₹1,240. */
export const inr = (n: number): string =>
  `₹${Math.round(n).toLocaleString("en-IN")}`;

/** Overall level = floor(total XP / 100) + 1 (BRIEF.md gamification). */
export const levelFromXp = (totalXp: number): number =>
  Math.floor(Math.max(0, totalXp) / 100) + 1;

/** Local YYYY-MM-DD for date columns. */
export const isoDate = (d: Date = new Date()): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
