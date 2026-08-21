// Onboarding answers with no `profiles` column to live in yet (budget range,
// Tamil comfort, interest tags) — localStorage, same per-user-id pattern as
// avatars.ts, rather than a schema change. College/area/veg_pref DO have
// real columns and are written straight to `profiles` from the quiz.

export const BUDGET_RANGES = ["Under ₹5k", "₹5k–₹10k", "₹10k–₹15k", "₹15k+"];
export const TAMIL_LEVELS = ["Zero Tamil", "A few words", "Can manage", "Fluent"];
export const INTERESTS = [
  "Foodie", "Explorer", "Budget hacker", "Night owl",
  "Bookworm", "Traveler", "Gym rat", "Movie buff",
];

const flagKey = (userId: string) => `circle_onboarded_${userId}`;
const budgetKey = (userId: string) => `circle_budget_${userId}`;
const tamilKey = (userId: string) => `circle_tamil_level_${userId}`;
const interestsKey = (userId: string) => `circle_interests_${userId}`;

export function isOnboarded(userId: string): boolean {
  if (typeof window === "undefined") return true; // never redirect during SSR
  return localStorage.getItem(flagKey(userId)) === "1";
}

export function markOnboarded(userId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(flagKey(userId), "1");
}

export function getBudget(userId: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(budgetKey(userId));
}

export function setBudget(userId: string, value: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(budgetKey(userId), value);
}

export function getTamilLevel(userId: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(tamilKey(userId));
}

export function setTamilLevel(userId: string, value: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(tamilKey(userId), value);
}

export function getInterests(userId: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(interestsKey(userId)) ?? "[]");
  } catch {
    return [];
  }
}

export function setInterests(userId: string, values: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(interestsKey(userId), JSON.stringify(values));
}
