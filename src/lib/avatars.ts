// Emoji avatars — no Supabase Storage bucket to hang real image uploads off
// of yet, so this follows the same client-side-only pattern already used for
// `madrasi_sound` / `madrasi_quiz_*`: stored in localStorage, keyed per user
// so a shared browser doesn't leak one account's pick into another's.
// The deterministic default (hashed from the user id) means a user who
// hasn't picked one yet — or who switches devices — still sees a consistent
// avatar rather than a random or blank one.

export const AVATAR_EMOJIS = [
  "🎓", "🦁", "🐯", "🐼", "🐨", "🦊", "🐸", "🐙",
  "🌟", "🔥", "🚀", "🎯", "🎨", "🎧", "☕", "🌊",
];

export function defaultAvatar(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) % AVATAR_EMOJIS.length;
  }
  return AVATAR_EMOJIS[Math.abs(hash) % AVATAR_EMOJIS.length];
}

const key = (userId: string) => `circle_avatar_${userId}`;

export function getAvatar(userId: string): string {
  if (typeof window === "undefined") return defaultAvatar(userId);
  return localStorage.getItem(key(userId)) ?? defaultAvatar(userId);
}

export function setAvatar(userId: string, emoji: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key(userId), emoji);
}
