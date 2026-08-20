"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useSupabaseAuth } from "@/lib/supabase/auth-provider";
import { loadProgress, type Progress } from "@/lib/progress";
import { inr, levelFromXp } from "@/lib/format";
import { MODULES, MODULE_BY_KEY, type ModuleKey } from "@/lib/modules";
import { deriveBadges } from "@/lib/badges";
import { circleId } from "@/lib/circle-id";
import { AVATAR_EMOJIS, getAvatar, setAvatar as saveAvatar } from "@/lib/avatars";
import { getBudget, getTamilLevel, getInterests } from "@/lib/onboarding";
import type { CollegeLeaderboardRow } from "@/lib/types";
import { resetDemoData } from "@/lib/demo";
import { soundEnabled } from "@/lib/voice";
import { StatTrio } from "@/components/stat-trio";
import { ProgressRing } from "@/components/progress-ring";
import { NavHeader } from "@/components/nav-header";

const AREAS = ["Velachery", "Adyar", "T. Nagar", "Guindy", "Besant Nagar", "Anna Nagar", "Mylapore", "Tambaram"];
const VEG_PREFS: { key: "veg" | "nonveg" | "both"; label: string }[] = [
  { key: "veg", label: "Veg" },
  { key: "nonveg", label: "Non-veg" },
  { key: "both", label: "Both" },
];
const LEVEL_TITLES = ["Fresher", "Settler", "Local", "Regular", "Veteran", "Legend"];
const levelTitle = (level: number) => LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)] ?? LEVEL_TITLES[0];

// Which module colour each derived badge (src/lib/badges.ts) reads on.
const BADGE_MODULE: Record<string, ModuleKey> = {
  issued: "move",
  mess: "eat",
  tamil: "speak",
  meter: "move",
  k1: "live",
  run3: "live",
  foodmap: "eat",
  fluent: "speak",
  settled: "live",
  wander: "explore",
};

type College = { id: string; name: string };
type SavedTab = "place" | "food" | "phrase";
const SAVED_TABS: { key: SavedTab; label: string }[] = [
  { key: "place", label: "Places" },
  { key: "food", label: "Food" },
  { key: "phrase", label: "Phrases" },
];

type FoodRow = { id: string; name: string; area: string; avg_price: number };
type PlaceRow = { id: string; name: string; area: string; category: string };
type PhraseRow = { id: string; en: string; local_text: string };

export default function ProfilePage() {
  const { session } = useSupabaseAuth();
  const userId = session?.user.id ?? null;

  const [progress, setProgress] = useState<Progress | null>(null);
  const [colleges, setColleges] = useState<College[]>([]);
  const [name, setName] = useState("");
  const [homeState, setHomeState] = useState("");
  const [savedRows, setSavedRows] = useState<{ food: FoodRow[]; place: PlaceRow[]; phrase: PhraseRow[] }>({
    food: [],
    place: [],
    phrase: [],
  });
  const [tab, setTab] = useState<SavedTab>("place");
  const [sound, setSound] = useState(true);
  const [leaderboard, setLeaderboard] = useState<CollegeLeaderboardRow[]>([]);
  const [avatar, setAvatarState] = useState("🎓");
  const [pickingAvatar, setPickingAvatar] = useState(false);
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [accountStatus, setAccountStatus] = useState<"idle" | "saving" | "sent" | "error">("idle");
  const [accountError, setAccountError] = useState("");
  const [budget, setBudgetDisplay] = useState<string | null>(null);
  const [tamilLevel, setTamilLevelDisplay] = useState<string | null>(null);
  const [interests, setInterestsDisplay] = useState<string[]>([]);

  useEffect(() => setSound(soundEnabled()), []);
  useEffect(() => {
    if (!userId) return;
    setAvatarState(getAvatar(userId));
    setBudgetDisplay(getBudget(userId));
    setTamilLevelDisplay(getTamilLevel(userId));
    setInterestsDisplay(getInterests(userId));
  }, [userId]);

  function pickAvatar(emoji: string) {
    if (!userId) return;
    saveAvatar(userId, emoji);
    setAvatarState(emoji);
    setPickingAvatar(false);
  }

  async function saveAccount() {
    if (!accountEmail || accountPassword.length < 6) {
      setAccountStatus("error");
      setAccountError("Enter an email and a password of at least 6 characters.");
      return;
    }
    setAccountStatus("saving");
    const { error } = await supabase.auth.updateUser({ email: accountEmail, password: accountPassword });
    if (error) {
      setAccountStatus("error");
      setAccountError(error.message);
      return;
    }
    setAccountStatus("sent");
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  useEffect(() => {
    supabase
      .from("weekly_college_leaderboard")
      .select("*")
      .order("weekly_xp", { ascending: false })
      .limit(5)
      .then(({ data }) => setLeaderboard((data ?? []) as CollegeLeaderboardRow[]));
  }, []);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const prog = await loadProgress(userId);
      setProgress(prog);
      setName(prog.profile?.display_name ?? "");
      setHomeState(prog.profile?.home_state ?? "");

      const [collegesRes, savesRes] = await Promise.all([
        supabase.from("colleges").select("id, name").order("name"),
        supabase.from("saves").select("entity_type, entity_id").eq("user_id", userId),
      ]);
      setColleges((collegesRes.data ?? []) as College[]);

      const saves = (savesRes.data ?? []) as { entity_type: string; entity_id: string }[];
      const ids = (t: string) => saves.filter((s) => s.entity_type === t).map((s) => s.entity_id);
      const [food, place, phrase] = await Promise.all([
        rowsOrEmpty<FoodRow>("food_places", "id,name,area,avg_price", ids("food")),
        rowsOrEmpty<PlaceRow>("places", "id,name,area,category", ids("place")),
        rowsOrEmpty<PhraseRow>("phrases", "id,en,local_text", ids("phrase")),
      ]);
      setSavedRows({ food, place, phrase });
    })();
  }, [userId]);

  async function updateProfile(patch: Record<string, unknown>) {
    if (!userId) return;
    await supabase.from("profiles").update(patch).eq("id", userId);
    setProgress((p) => (p && p.profile ? { ...p, profile: { ...p.profile, ...patch } } : p));
  }

  function toggleSound() {
    const next = !sound;
    setSound(next);
    if (typeof window !== "undefined") localStorage.setItem("madrasi_sound", next ? "on" : "off");
  }

  async function reset() {
    if (!userId || typeof window === "undefined") return;
    if (!window.confirm("Reset all demo progress? This clears XP, savings and saves.")) return;
    await resetDemoData(userId);
    window.location.reload();
  }

  if (!progress) return <div className="px-4 py-6 t-body text-muted">Loading profile…</div>;

  const { axes, totalXp, savingsTotal, profile } = progress;
  const level = levelFromXp(totalXp);
  const streak = profile?.streak ?? 0;
  const badges = deriveBadges({ axes, savings: savingsTotal, streak });
  const savedCount = savedRows.food.length + savedRows.place.length + savedRows.phrase.length;
  const isAnon = session?.user.is_anonymous ?? true;
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : null;

  return (
    <div className="screen gap-4">
      <NavHeader
        title="You"
        subtitle="Your progress, your saves, your settings"
        back={{ href: "/", label: "Home" }}
      />

      {/* Editable identity */}
      <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-card shadow-card">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPickingAvatar((v) => !v)}
            aria-label="Change avatar"
            className="pressable flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-speak text-3xl shadow-card"
          >
            {avatar}
          </button>
          <div className="min-w-0">
            <p className="t-micro text-muted">CIRCLE ID · {userId ? circleId(userId) : "—"}</p>
            <p className="t-label text-muted">
              Level {level} · {levelTitle(level)}
              {memberSince && ` · Since ${memberSince}`}
            </p>
          </div>
        </div>
        {pickingAvatar && (
          <div className="flex flex-wrap gap-2 rounded-inner bg-bg p-3">
            {AVATAR_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => pickAvatar(e)}
                aria-pressed={e === avatar}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-xl ${
                  e === avatar ? "bg-speak-tint ring-2 ring-speak" : "bg-surface"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        )}
        <label className="flex flex-col gap-1">
          <span className="t-micro text-muted">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => name !== (profile?.display_name ?? "") && updateProfile({ display_name: name })}
            placeholder="Your name"
            className="t-subtitle rounded-inner border border-line bg-bg px-3 py-2 text-ink focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="t-micro text-muted">College</span>
          <select
            value={profile?.college_id ?? ""}
            onChange={(e) => updateProfile({ college_id: e.target.value || null })}
            className="t-body rounded-inner border border-line bg-bg px-3 py-2 text-ink"
          >
            <option value="">Select college</option>
            {colleges.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="t-micro text-muted">Home state</span>
          <input
            value={homeState}
            onChange={(e) => setHomeState(e.target.value)}
            onBlur={() => homeState !== (profile?.home_state ?? "") && updateProfile({ home_state: homeState || null })}
            placeholder="e.g. Kerala, Karnataka"
            className="t-body rounded-inner border border-line bg-bg px-3 py-2 text-ink focus:outline-none"
          />
        </label>
        <div className="flex flex-col gap-1">
          <span className="t-micro text-muted">Area</span>
          <div className="flex flex-wrap gap-2">
            {AREAS.map((a) => (
              <button
                key={a}
                onClick={() => updateProfile({ area: a })}
                aria-pressed={profile?.area === a}
                className={`t-chip h-[30px] rounded-full border px-3.5 ${
                  profile?.area === a ? "border-transparent bg-speak text-white" : "border-line text-ink"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="t-micro text-muted">Food preference</span>
          <div className="flex flex-wrap gap-2">
            {VEG_PREFS.map((v) => (
              <button
                key={v.key}
                onClick={() => updateProfile({ veg_pref: v.key })}
                aria-pressed={profile?.veg_pref === v.key}
                className={`t-chip h-[30px] rounded-full border px-3.5 ${
                  profile?.veg_pref === v.key ? "border-transparent bg-eat text-ink" : "border-line text-ink"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Onboarding-quiz answers with no profiles column yet — local only */}
      {(budget || tamilLevel || interests.length > 0) && (
        <div className="flex flex-col gap-2 rounded-card border border-line bg-surface p-card shadow-card">
          <div className="flex items-center justify-between">
            <p className="t-label text-muted">Your vibe</p>
            <Link href="/onboarding" className="t-micro text-speak">Retake quiz</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {budget && <span className="t-chip rounded-full bg-move-tint px-3 py-1 text-move">{budget}</span>}
            {tamilLevel && <span className="t-chip rounded-full bg-speak-tint px-3 py-1 text-speak">{tamilLevel}</span>}
            {interests.map((i) => (
              <span key={i} className="t-chip rounded-full bg-explore-tint px-3 py-1 text-explore">{i}</span>
            ))}
          </div>
        </div>
      )}

      {/* Stats + rings */}
      <StatTrio
        items={[
          { value: level, label: "Level" },
          { value: totalXp, label: "XP" },
          { value: streak, label: "Day streak" },
          { value: profile?.freezes_available ?? 0, label: "Streak freezes" },
        ]}
      />
      <div className="rounded-card border border-line bg-surface p-card shadow-card">
        <p className="t-micro text-muted">Your five routes</p>
        <div className="mt-4 flex justify-between">
          {MODULES.map((m, i) => (
            <ProgressRing key={m.key} value={axes[m.key]} color={m.cssVar} caption={m.label} delayMs={i * 80} />
          ))}
        </div>
      </div>

      {/* Savings */}
      <div className="rounded-card border border-line bg-surface p-card shadow-card">
        <p className="t-micro text-muted">Saved so far</p>
        <p className="t-stat text-live">{inr(savingsTotal)}</p>
      </div>

      {/* Saved items */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="t-title text-ink">Saved</h2>
          <span className="t-micro text-muted">{savedCount} total</span>
        </div>
        <div className="flex gap-2">
          {SAVED_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              aria-pressed={tab === t.key}
              className={`t-chip h-[30px] rounded-full border px-3.5 ${
                tab === t.key ? "border-transparent bg-speak text-white" : "border-line text-ink"
              }`}
            >
              {t.label} ({savedRows[t.key].length})
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {tab === "place" &&
            (savedRows.place.length === 0 ? (
              <p className="t-body text-muted">Nothing saved here yet.</p>
            ) : (
              savedRows.place.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-card border border-line bg-surface p-4 shadow-card">
                  <div>
                    <p className="t-subtitle text-ink">{p.name}</p>
                    <p className="t-label text-muted">{p.area}</p>
                  </div>
                  <span className="t-chip rounded-full bg-explore-tint px-2.5 py-1 text-explore">{p.category}</span>
                </div>
              ))
            ))}
          {tab === "food" &&
            (savedRows.food.length === 0 ? (
              <p className="t-body text-muted">Nothing saved here yet.</p>
            ) : (
              savedRows.food.map((f) => (
                <div key={f.id} className="flex items-center justify-between rounded-card border border-line bg-surface p-4 shadow-card">
                  <div>
                    <p className="t-subtitle text-ink">{f.name}</p>
                    <p className="t-label text-muted">{f.area}</p>
                  </div>
                  <span className="t-stat text-eat" style={{ fontSize: "16px" }}>{inr(f.avg_price)}</span>
                </div>
              ))
            ))}
          {tab === "phrase" &&
            (savedRows.phrase.length === 0 ? (
              <p className="t-body text-muted">Nothing saved here yet.</p>
            ) : (
              savedRows.phrase.map((ph) => (
                <div key={ph.id} className="rounded-card border border-line bg-surface p-4 shadow-card">
                  <p className="t-subtitle text-ink">{ph.en}</p>
                  <p className="t-label text-speak">{ph.local_text}</p>
                </div>
              ))
            ))}
        </div>
      </section>

      {/* Weekly college leaderboard */}
      {leaderboard.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="t-title text-ink">Weekly college leaderboard</h2>
          <div className="flex flex-col gap-2">
            {leaderboard.map((row, i) => {
              const mine = row.college_id === profile?.college_id;
              return (
                <div
                  key={row.college_id}
                  className={`flex items-center justify-between rounded-card border p-4 shadow-card ${
                    mine ? "border-move bg-move-tint" : "border-line bg-surface"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="t-stat text-muted" style={{ fontSize: "20px" }}>#{i + 1}</span>
                    <div>
                      <p className="t-subtitle text-ink">{row.college_name}</p>
                      <p className="t-micro text-muted">{row.active_students} active this week</p>
                    </div>
                  </div>
                  <span className="t-stat text-move">{row.weekly_xp} XP</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Badges */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="t-title text-ink">Badges</h2>
          <span className="t-micro text-muted">{badges.filter((b) => b.isEarned).length}/{badges.length} earned</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {badges.map((b) => {
            const m = MODULE_BY_KEY[BADGE_MODULE[b.id]];
            return (
              <div
                key={b.id}
                className={`flex flex-col gap-1 rounded-card border p-3 ${
                  b.isEarned ? `border-transparent ${m.bgClass}` : "border-line bg-surface"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {b.isEarned ? (
                    <Check size={13} strokeWidth={2.5} className={m.onColorClass} />
                  ) : (
                    <Lock size={12} strokeWidth={2.5} className="text-muted" />
                  )}
                  <span className={`t-chip ${b.isEarned ? m.onColorClass : "text-ink"}`}>{b.label}</span>
                </div>
                {!b.isEarned && <p className="t-micro text-muted">{b.hint}</p>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Account */}
      <section className="flex flex-col gap-2">
        <h2 className="t-title text-ink">Account</h2>
        {isAnon ? (
          <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-card shadow-card">
            <p className="t-body text-ink">
              You&apos;re playing as a guest. Save your progress to an email + password so it survives a reinstall
              or a new device — your XP, badges and saves stay exactly as they are.
            </p>
            {accountStatus === "sent" ? (
              <p className="t-label text-live">Check {accountEmail} for a confirmation link, then you&apos;re set.</p>
            ) : (
              <>
                <label className="flex flex-col gap-1">
                  <span className="t-micro text-muted">Email</span>
                  <input
                    type="email"
                    value={accountEmail}
                    onChange={(e) => setAccountEmail(e.target.value)}
                    placeholder="you@college.edu"
                    className="t-body rounded-inner border border-line bg-bg px-3 py-2 text-ink focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="t-micro text-muted">Password</span>
                  <input
                    type="password"
                    value={accountPassword}
                    onChange={(e) => setAccountPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="t-body rounded-inner border border-line bg-bg px-3 py-2 text-ink focus:outline-none"
                  />
                </label>
                {accountStatus === "error" && <p className="t-label text-live">{accountError}</p>}
                <button
                  onClick={saveAccount}
                  disabled={accountStatus === "saving"}
                  className="t-subtitle rounded-full bg-speak py-3 text-white disabled:opacity-60"
                >
                  {accountStatus === "saving" ? "Saving…" : "Save my account"}
                </button>
              </>
            )}
            <Link href="/login" className="t-micro text-center text-muted">
              Already have a Circle account? Sign in
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-card border border-line bg-surface p-4 shadow-card">
            <div>
              <p className="t-micro text-muted">Signed in as</p>
              <p className="t-subtitle text-ink">{session?.user.email}</p>
            </div>
            <button onClick={signOut} className="t-label text-live">Sign out</button>
          </div>
        )}
      </section>

      {/* Settings */}
      <section className="flex flex-col gap-2">
        <h2 className="t-title text-ink">Settings</h2>
        <div className="flex items-center justify-between rounded-card border border-line bg-surface p-4 shadow-card">
          <span className="t-body text-ink">Sound</span>
          <button
            onClick={toggleSound}
            aria-pressed={sound}
            className={`t-chip rounded-full px-4 py-2 ${sound ? "bg-speak text-white" : "border border-line text-muted"}`}
          >
            {sound ? "On" : "Off"}
          </button>
        </div>
        <button
          onClick={reset}
          className="t-subtitle rounded-card border border-line bg-surface p-4 text-live shadow-card"
        >
          Reset demo data
        </button>
      </section>
    </div>
  );
}

async function rowsOrEmpty<T>(table: string, cols: string, ids: string[]): Promise<T[]> {
  if (ids.length === 0) return [];
  const { data } = await supabase.from(table).select(cols).in("id", ids);
  return (data ?? []) as T[];
}
