// Proof that the XP spine persists to Supabase and survives a "hard refresh".
// Uses a real anonymous session (RLS-compliant). Run with the NEXT_PUBLIC_
// Supabase vars in the environment. Throwaway test user — safe to leave.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const sb = createClient(url, key, { auth: { persistSession: false } });

const iso = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const totalXp = async (uid) => {
  const { data } = await sb.from("xp_events").select("amount").eq("user_id", uid);
  return (data ?? []).reduce((s, r) => s + (r.amount ?? 0), 0);
};
const getProfile = async (uid) => {
  const { data } = await sb.from("profiles").select("last_active_date, streak").eq("id", uid).maybeSingle();
  return data;
};

// Mirror of src/lib/xp.ts dailyLogin.
async function dailyLogin(uid) {
  const p = await getProfile(uid);
  const today = iso();
  const last = p?.last_active_date ?? null;
  let streak = p?.streak ?? 0;
  if (last === today) return { awarded: false, streak };
  const y = iso(new Date(Date.now() - 86_400_000));
  streak = last === y ? streak + 1 : 1;
  await sb.from("profiles").update({ last_active_date: today, streak }).eq("id", uid);
  await sb.from("xp_events").insert({ user_id: uid, axis: "speak", amount: 10, source: "daily-login" });
  return { awarded: true, streak };
}

const { data: auth, error } = await sb.auth.signInAnonymously();
if (error) {
  console.error("anonymous sign-in failed:", error.message);
  process.exit(1);
}
const uid = auth.user.id;

let p0 = null;
for (let i = 0; i < 12 && !p0; i++) {
  p0 = await getProfile(uid);
  if (!p0) await new Promise((r) => setTimeout(r, 300));
}
console.log(`fresh user ${uid.slice(0, 8)} — initial xp=${await totalXp(uid)} streak=${p0?.streak ?? "?"}`);

const r1 = await dailyLogin(uid);
const t1 = await totalXp(uid);
const pr1 = await getProfile(uid);
console.log(`1) daily login      → awarded=${r1.awarded} totalXP=${t1} streak=${pr1.streak} last_active=${pr1.last_active_date}`);

const r2 = await dailyLogin(uid);
const t2 = await totalXp(uid);
console.log(`2) same-day refresh → awarded=${r2.awarded} totalXP=${t2} (must be unchanged = refresh-safe)`);

// Re-read from a brand-new client to simulate a real page reload / cold read.
const sb2 = createClient(url, key, { auth: { persistSession: false } });
await sb2.auth.setSession({ access_token: auth.session.access_token, refresh_token: auth.session.refresh_token });
const { data: reread } = await sb2.from("xp_events").select("amount").eq("user_id", uid);
const t2b = (reread ?? []).reduce((s, r) => s + (r.amount ?? 0), 0);
console.log(`   cold re-read (new client) → totalXP=${t2b} (proves it's server-side, not local state)`);

await sb.from("profiles").update({ last_active_date: iso(new Date(Date.now() - 86_400_000)) }).eq("id", uid);
const r3 = await dailyLogin(uid);
const t3 = await totalXp(uid);
const pr3 = await getProfile(uid);
console.log(`3) next day rollover→ awarded=${r3.awarded} totalXP=${t3} streak=${pr3.streak}`);

const pass =
  r1.awarded === true && t1 === 10 && pr1.streak === 1 &&
  r2.awarded === false && t2 === 10 && t2b === 10 &&
  r3.awarded === true && t3 === 20 && pr3.streak === 2;

console.log(pass ? "\nPASS — XP persists to Supabase, survives refresh, streak advances." : "\nFAIL");
process.exit(pass ? 0 : 1);
