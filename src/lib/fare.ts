// Fare Shield — Chennai auto-rickshaw fare model (v1).
// BRIEF.md: fair fare = base ₹25 + ₹12/km, 1.5× after 11pm.
// v2 will read these numbers (and the negotiation line) per city from cities.ts;
// keep them behind this module so nothing hardcodes them elsewhere.

export const CHENNAI_FARE = {
  base: 25,
  perKm: 12,
  nightMultiplier: 1.5,
  nightStartHour: 23, // 11pm; also treat pre-5am as night
} as const;

export const CHENNAI_NEGOTIATION = {
  ta: "மீட்டர்ல வாங்க அண்ணா. எவ்ளோ ஆகும்?",
  roman: "Meter-la vaanga anna. Evlo aagum?",
  en: "Come by the meter please. How much will it be?",
} as const;

export function isNightHour(hour: number): boolean {
  return hour >= CHENNAI_FARE.nightStartHour || hour < 5;
}

/** The fair metered fare for a distance, rounded to the rupee. */
export function fairFare(km: number, hour: number = new Date().getHours()): number {
  const distance = Math.max(0, km);
  let fare = CHENNAI_FARE.base + distance * CHENNAI_FARE.perKm;
  if (isNightHour(hour)) fare *= CHENNAI_FARE.nightMultiplier;
  return Math.round(fare);
}

/** The inflated price a student is likely to be quoted — for the struck-through line. */
export function touristFare(fair: number): number {
  return Math.round((fair * 1.9) / 10) * 10;
}
