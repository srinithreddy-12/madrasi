// A short, stable "member ID" derived from the Supabase auth user id (a
// UUID). No extra DB column needed — it inherits the UUID's own uniqueness
// guarantee, it's just reformatted to look like a membership number instead
// of a raw UUID.
export function circleId(userId: string): string {
  const hex = userId.replace(/-/g, "").slice(-8).toUpperCase();
  return `${hex.slice(0, 4)}-${hex.slice(4)}`;
}
