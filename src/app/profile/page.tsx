"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useSupabaseAuth } from "@/lib/supabase/auth-provider";
import { loadProgress, type Progress } from "@/lib/progress";
import { inr, levelFromXp } from "@/lib/format";
import { MODULES, MODULE_BY_KEY, type ModuleKey } from "@/lib/modules";
import type { CollegeLeaderboardRow } from "@/lib/types";
import { resetDemoData } from "@/lib/demo";
import { soundEnabled } from "@/lib/voice";
import { StatTrio } from "@/components/stat-trio";
import { ProgressRing } from "@/components/progress-ring";
import { BadgeChip } from "@/components/badge-chip";
import { NavHeader } from "@/components/nav-header";

const AREAS = ["Velachery", "Adyar", "T. Nagar", "Guindy", "Besant Nagar", "Anna Nagar", "Mylapore", "Tambaram"];
type College = { id: string; name: string };
type SavedTab = "place" | "food" | "phrase";
const SAVED_TABS: { key: SavedTab; label: string }[] = [
  { key: "place", label: "Places" },
  { key: "food", label: "Food" },
  { key: "phrase", label: "Phrases" },
];

export default function ProfilePage() {
  const { session } = useSupabaseAuth();
  const userId = session?.user.id ?? null;

  const [progress, setProgress] = useState<Progress | null>(null);
  const [colleges, setColleges] = useState<College[]>([]);
  const [name, setName] = useState("");
  const [savedNames, setSavedNames] = useState<Record<SavedTab, string[]>>({ place: [], food: [], phrase: [] });
  const [savesCount, setSavesCount] = useState(0);
  const [hasQuiz, setHasQuiz] = useState(false);
  const [tab, setTab] = useState<SavedTab>("place");
  const [sound, setSound] = useState(true);
  const [leaderboard, setLeaderboard] = useState<CollegeLeaderboardRow[]>([]);

  useEffect(() => setSound(soundEnabled()), []);

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

      const [collegesRes, savesRes, xpRes] = await Promise.all([
        supabase.from("colleges").select("id, name").order("name"),
        supabase.from("saves").select("entity_type, entity_id").eq("user_id", userId),
        supabase.from("xp_events").select("source").eq("user_id", userId),
      ]);
      setColleges((collegesRes.data ?? []) as College[]);
      setHasQuiz(new Set((xpRes.data ?? []).map((r) => r.source)).has("quiz"));

      const saves = (savesRes.data ?? []) as { entity_type: string; entity_id: string }[];
      setSavesCount(saves.length);
      const ids = (t: string) => saves.filter((s) => s.entity_type === t).map((s) => s.entity_id);
      const [food, places, phrases] = await Promise.all([
        idsOrEmpty("food_places", "name", ids("food")),
        idsOrEmpty("places", "name", ids("place")),
        idsOrEmpty("phrases", "en", ids("phrase")),
      ]);
      setSavedNames({ food, place: places, phrase: phrases });
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

  const badges: { label: string; ok: boolean; module: ModuleKey }[] = [
    { label: "First words", ok: axes.speak > 0, module: "speak" },
    { label: "First save", ok: savesCount > 0, module: "eat" },
    { label: "Quiz taken", ok: hasQuiz, module: "speak" },
    { label: "3-day streak", ok: streak >= 3, module: "live" },
    { label: "Level 2", ok: level >= 2, module: "move" },
    { label: "Explorer", ok: axes.explore > 0, module: "explore" },
  ];

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <NavHeader title="Profile" back={{ href: "/", label: "Home" }} />

      {/* Editable identity */}
      <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-5 shadow-card">
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
        <div className="flex flex-col gap-1">
          <span className="t-micro text-muted">Area</span>
          <div className="flex flex-wrap gap-2">
            {AREAS.map((a) => (
              <button
                key={a}
                onClick={() => updateProfile({ area: a })}
                aria-pressed={profile?.area === a}
                className={`t-chip h-[34px] rounded-full border px-3.5 ${
                  profile?.area === a ? "border-transparent bg-speak text-white" : "border-line text-ink"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats + rings */}
      <StatTrio
        items={[
          { value: level, label: "Level" },
          { value: totalXp, label: "XP" },
          { value: streak, label: "Day streak" },
        ]}
      />
      <div className="rounded-card border border-line bg-surface p-5 shadow-card">
        <p className="t-micro text-muted">Your five routes</p>
        <div className="mt-4 flex justify-between">
          {MODULES.map((m, i) => (
            <ProgressRing key={m.key} value={axes[m.key]} color={m.cssVar} caption={m.label} delayMs={i * 80} />
          ))}
        </div>
      </div>

      {/* Savings */}
      <div className="rounded-card border border-line bg-surface p-5 shadow-card">
        <p className="t-micro text-muted">Saved so far</p>
        <p className="t-stat text-live">{inr(savingsTotal)}</p>
      </div>

      {/* Saved items */}
      <section className="flex flex-col gap-2">
        <h2 className="t-title text-ink">Saved</h2>
        <div className="flex gap-2">
          {SAVED_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              aria-pressed={tab === t.key}
              className={`t-chip h-[34px] rounded-full border px-3.5 ${
                tab === t.key ? "border-transparent bg-speak text-white" : "border-line text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {savedNames[tab].length === 0 ? (
            <p className="t-body text-muted">Nothing saved here yet.</p>
          ) : (
            savedNames[tab].map((n, i) => (
              <div key={`${n}-${i}`} className="rounded-card border border-line bg-surface p-4 shadow-card">
                <p className="t-subtitle text-ink">{n}</p>
              </div>
            ))
          )}
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
        <h2 className="t-title text-ink">Badges</h2>
        <div className="flex flex-wrap gap-2">
          {badges.map((b) => {
            const m = MODULE_BY_KEY[b.module];
            return (
              <BadgeChip key={b.label} label={b.label} unlocked={b.ok} fillClass={m.bgClass} onColorClass={m.onColorClass} />
            );
          })}
        </div>
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

async function idsOrEmpty(table: string, nameCol: string, ids: string[]): Promise<string[]> {
  if (ids.length === 0) return [];
  const { data } = await supabase.from(table).select(`id, ${nameCol}`).in("id", ids);
  return ((data ?? []) as unknown as Record<string, string>[]).map((r) => r[nameCol]);
}
