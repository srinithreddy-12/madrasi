import type { Axis } from "./types";

// Badges are derived, not stored — computed from the user's axis fills, savings
// and streak. The demo state (eat 78 / speak 24 / move 61 / live 12 / explore 9,
// ₹1,240 saved, 4-day streak) earns exactly the first six.

export type BadgeState = {
  axes: Record<Axis, number>;
  savings: number;
  streak: number;
};

export type BadgeDef = {
  id: string;
  label: string;
  hint: string;
  earned: (s: BadgeState) => boolean;
};

export const BADGES: BadgeDef[] = [
  { id: "issued", label: "PASS ISSUED", hint: "Start your pass", earned: () => true },
  { id: "mess", label: "MESS REGULAR", hint: "Reach 50 on 21G EAT", earned: (s) => s.axes.eat >= 50 },
  { id: "tamil", label: "STREET TAMIL", hint: "Reach 20 on 5C SPEAK", earned: (s) => s.axes.speak >= 20 },
  { id: "meter", label: "METER MASTER", hint: "Reach 50 on 23C MOVE", earned: (s) => s.axes.move >= 50 },
  { id: "k1", label: "₹1K SAVED", hint: "Save ₹1,000", earned: (s) => s.savings >= 1000 },
  { id: "run3", label: "3-DAY RUN", hint: "Hold a 3-day streak", earned: (s) => s.streak >= 3 },
  { id: "foodmap", label: "FOOD MAP", hint: "Reach 100 on 21G EAT", earned: (s) => s.axes.eat >= 100 },
  { id: "fluent", label: "FLUENT", hint: "Reach 50 on 5C SPEAK", earned: (s) => s.axes.speak >= 50 },
  { id: "settled", label: "SETTLED IN", hint: "Reach 25 on 29C LIVE", earned: (s) => s.axes.live >= 25 },
  { id: "wander", label: "WANDERER", hint: "Reach 50 on 1B EXPLORE", earned: (s) => s.axes.explore >= 50 },
];

export type DerivedBadge = BadgeDef & { isEarned: boolean };

export function deriveBadges(state: BadgeState): DerivedBadge[] {
  return BADGES.map((b) => ({ ...b, isEarned: b.earned(state) }));
}
