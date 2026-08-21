"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useSupabaseAuth } from "@/lib/supabase/auth-provider";
import { AVATAR_EMOJIS, getAvatar, setAvatar as saveAvatar } from "@/lib/avatars";
import {
  BUDGET_RANGES,
  TAMIL_LEVELS,
  INTERESTS,
  markOnboarded,
  getBudget,
  setBudget,
  getTamilLevel,
  setTamilLevel,
  getInterests,
  setInterests,
} from "@/lib/onboarding";

const AREAS = ["Velachery", "Adyar", "T. Nagar", "Guindy", "Besant Nagar", "Anna Nagar", "Mylapore", "Tambaram"];
const VEG_PREFS: { key: "veg" | "nonveg" | "both"; label: string }[] = [
  { key: "veg", label: "Veg" },
  { key: "nonveg", label: "Non-veg" },
  { key: "both", label: "Both" },
];

type College = { id: string; name: string };
const STEP_TITLES = ["You", "Where you're at", "Food", "Budget", "Tamil", "Vibe check"];

// Gen-Z-quiz-style first-run flow: one question per screen. College/area/
// veg_pref have real `profiles` columns and save immediately; budget, Tamil
// comfort and interests don't have columns yet so they're local (same
// pattern as the avatar picker). Reachable any time at /onboarding to redo.
export default function OnboardingPage() {
  const router = useRouter();
  const { session, loading } = useSupabaseAuth();
  const userId = session?.user.id ?? null;

  const [step, setStep] = useState(0);
  const [colleges, setColleges] = useState<College[]>([]);
  const [name, setName] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [area, setArea] = useState("");
  const [vegPref, setVegPref] = useState<"veg" | "nonveg" | "both" | "">("");
  const [budget, setBudgetState] = useState("");
  const [tamilLevel, setTamilLevelState] = useState("");
  const [avatar, setAvatarState] = useState("🎓");
  const [interests, setInterestsState] = useState<string[]>([]);
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [accountStatus, setAccountStatus] = useState<"idle" | "saving" | "sent" | "error">("idle");
  const [accountError, setAccountError] = useState("");

  useEffect(() => {
    supabase.from("colleges").select("id, name").order("name").then(({ data }) => setColleges((data ?? []) as College[]));
  }, []);

  useEffect(() => {
    if (!userId) return;
    setAvatarState(getAvatar(userId));
    setBudgetState(getBudget(userId) ?? "");
    setTamilLevelState(getTamilLevel(userId) ?? "");
    setInterestsState(getInterests(userId));
    supabase
      .from("profiles")
      .select("display_name, college_id, area, veg_pref")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setName(data.display_name ?? "");
        setCollegeId(data.college_id ?? "");
        setArea(data.area ?? "");
        setVegPref(data.veg_pref ?? "");
      });
  }, [userId]);

  async function updateProfile(patch: Record<string, unknown>) {
    if (!userId) return;
    await supabase.from("profiles").update(patch).eq("id", userId);
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

  function finish() {
    if (userId) markOnboarded(userId);
    router.push("/");
  }

  function skipAll() {
    if (userId) markOnboarded(userId);
    router.push("/");
  }

  const last = STEP_TITLES.length - 1;
  const next = () => setStep((s) => Math.min(last, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  if (loading || !userId) {
    return <div className="px-4 py-6 t-body text-muted">Setting things up…</div>;
  }

  return (
    <div className="screen gap-4">
      <div className="flex items-center justify-between pt-[calc(env(safe-area-inset-top)+8px)]">
        <p className="t-micro text-muted">Step {step + 1} of {STEP_TITLES.length} · {STEP_TITLES[step]}</p>
        <button onClick={skipAll} className="t-micro text-muted">Skip</button>
      </div>
      <div className="flex gap-1.5">
        {STEP_TITLES.map((_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-speak" : "bg-line"}`} />
        ))}
      </div>

      {step === 0 && (
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="t-largetitle text-ink">Vanakkam! 👋</h1>
            <p className="t-body mt-1 text-muted">Let&apos;s set Circle up for you — takes about a minute.</p>
          </div>
          <label className="flex flex-col gap-1">
            <span className="t-micro text-muted">What should we call you?</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => updateProfile({ display_name: name || null })}
              placeholder="Your name"
              className="t-subtitle rounded-inner border border-line bg-surface px-3 py-2 text-ink focus:outline-none"
            />
          </label>

          <div className="rounded-card border border-line bg-surface p-card shadow-card">
            <p className="t-label text-ink">Want to save your account? (optional)</p>
            <p className="t-micro mt-1 text-muted">
              You&apos;re already playing as a guest — this just means a reinstall or new device won&apos;t lose
              your progress. You can also do this later from Profile.
            </p>
            {accountStatus === "sent" ? (
              <p className="t-label mt-3 text-live">Check {accountEmail} for a confirmation link.</p>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                <input
                  type="email"
                  value={accountEmail}
                  onChange={(e) => setAccountEmail(e.target.value)}
                  placeholder="Email"
                  className="t-body rounded-inner border border-line bg-bg px-3 py-2 text-ink focus:outline-none"
                />
                <input
                  type="password"
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  placeholder="Password"
                  className="t-body rounded-inner border border-line bg-bg px-3 py-2 text-ink focus:outline-none"
                />
                {accountStatus === "error" && <p className="t-micro text-live">{accountError}</p>}
                <button
                  onClick={saveAccount}
                  disabled={accountStatus === "saving"}
                  className="t-label rounded-full border border-line py-2 text-ink disabled:opacity-60"
                >
                  {accountStatus === "saving" ? "Saving…" : "Save account"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <h1 className="t-largetitle text-ink">Where you&apos;re at</h1>
          <label className="flex flex-col gap-1">
            <span className="t-micro text-muted">College</span>
            <select
              value={collegeId}
              onChange={(e) => {
                setCollegeId(e.target.value);
                updateProfile({ college_id: e.target.value || null });
              }}
              className="t-body rounded-inner border border-line bg-surface px-3 py-2 text-ink"
            >
              <option value="">Select college</option>
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <div className="flex flex-col gap-1">
            <span className="t-micro text-muted">Area / hostel</span>
            <div className="flex flex-wrap gap-2">
              {AREAS.map((a) => (
                <button
                  key={a}
                  onClick={() => {
                    setArea(a);
                    updateProfile({ area: a });
                  }}
                  aria-pressed={area === a}
                  className={`t-chip h-[34px] rounded-full border px-3.5 ${
                    area === a ? "border-transparent bg-speak text-white" : "border-line text-ink"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <h1 className="t-largetitle text-ink">Food preference</h1>
          <p className="t-body text-muted">So mess and food picks match what you actually eat.</p>
          <div className="flex flex-wrap gap-2">
            {VEG_PREFS.map((v) => (
              <button
                key={v.key}
                onClick={() => {
                  setVegPref(v.key);
                  updateProfile({ veg_pref: v.key });
                }}
                aria-pressed={vegPref === v.key}
                className={`t-chip h-11 rounded-full border px-5 ${
                  vegPref === v.key ? "border-transparent bg-eat text-ink" : "border-line text-ink"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4">
          <h1 className="t-largetitle text-ink">Monthly budget</h1>
          <p className="t-body text-muted">Roughly, after rent — helps us suggest things that fit.</p>
          <div className="flex flex-col gap-2">
            {BUDGET_RANGES.map((b) => (
              <button
                key={b}
                onClick={() => {
                  setBudgetState(b);
                  if (userId) setBudget(userId, b);
                }}
                aria-pressed={budget === b}
                className={`t-subtitle rounded-card border p-4 text-left ${
                  budget === b ? "border-transparent bg-move text-white" : "border-line bg-surface text-ink"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-4">
          <h1 className="t-largetitle text-ink">Tamil comfort level</h1>
          <p className="t-body text-muted">We&apos;ll pace Speak lessons to match.</p>
          <div className="flex flex-col gap-2">
            {TAMIL_LEVELS.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTamilLevelState(t);
                  if (userId) setTamilLevel(userId, t);
                }}
                aria-pressed={tamilLevel === t}
                className={`t-subtitle rounded-card border p-4 text-left ${
                  tamilLevel === t ? "border-transparent bg-speak text-white" : "border-line bg-surface text-ink"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="flex flex-col gap-4">
          <h1 className="t-largetitle text-ink">Vibe check</h1>
          <div className="flex flex-col items-center gap-2 rounded-card border border-line bg-surface p-card shadow-card">
            <button
              type="button"
              onClick={() => {
                const idx = AVATAR_EMOJIS.indexOf(avatar);
                const nextEmoji = AVATAR_EMOJIS[(idx + 1) % AVATAR_EMOJIS.length];
                setAvatarState(nextEmoji);
                if (userId) saveAvatar(userId, nextEmoji);
              }}
              className="pressable flex h-20 w-20 items-center justify-center rounded-full bg-speak text-4xl shadow-card"
            >
              {avatar}
            </button>
            <p className="t-micro text-muted">Tap to cycle your avatar</p>
          </div>
          <div className="flex flex-col gap-1">
            <span className="t-micro text-muted">What are you into? (pick up to 3)</span>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => {
                const picked = interests.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => {
                      const next = picked
                        ? interests.filter((x) => x !== i)
                        : interests.length < 3
                        ? [...interests, i]
                        : interests;
                      setInterestsState(next);
                      if (userId) setInterests(userId, next);
                    }}
                    aria-pressed={picked}
                    className={`t-chip h-[34px] rounded-full border px-3.5 ${
                      picked ? "border-transparent bg-explore text-white" : "border-line text-ink"
                    }`}
                  >
                    {i}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="mt-2 flex gap-2">
        {step > 0 && (
          <button onClick={back} className="t-subtitle flex-1 rounded-full border border-line py-3 text-ink">
            Back
          </button>
        )}
        <button
          onClick={step === last ? finish : next}
          className="t-subtitle flex-1 rounded-full bg-speak py-3 text-white"
        >
          {step === last ? "Let's go →" : "Next"}
        </button>
      </div>
    </div>
  );
}
