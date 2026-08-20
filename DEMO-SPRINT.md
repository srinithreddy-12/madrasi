# DEMO-SPRINT.md — ship by 6:00

This is the final scope. It overrides the phase plan in BRIEF.md. STYLE-v2.md governs
all visuals. Anything not listed here does not get built tonight.

Hard rules for the sprint:
- Read all content from Supabase (already seeded). Never from src/data/madrasi.ts.
- Every screen ships to STYLE-v2 as it's built — no "style pass later."
- After each block, stop and hand me verification steps. No block starts until the
  previous one is confirmed working in the browser.

---

## BLOCK A — EAT + LIVE (target: 1 hour)

### /eat — food & messes
- Tabs as filter chips: **Food · Mess & Tiffin · Late Night** (kind filter).
- Sort chips: Cheapest · Closest · Top rated.
- Content cards per STYLE-v2: name, area + timings meta, **ochre price pill**
  (₹ avg or ₹/mo for messes), veg/nonveg dot, student score.
- Tap → detail sheet with:
  - Price large (stat size), must-try items as chips, blurb, timings, rating
  - **CALL** button → `tel:` link with the seeded phone number
  - **DIRECTIONS** button → opens
    `https://www.google.com/maps/dir/?api=1&destination=<encodeURIComponent(name + ", " + area + ", Chennai")>`
    in a new tab. No embedded map. Do not build a map component.
  - SAVE button → writes to `saves` table
- Messes show ₹/month AND ₹/meal (monthly_price / 90, rounded).

### /live — laundry
- Same card system. **Clay price pill: ₹/kg.**
- 2×2 info grid: ironing ₹/piece · dry clean from · pickup · student offer.
- Detail: CALL + DIRECTIONS + SAVE, same as food.

XP: first save of the day +5 (axis eat/live).

---

## BLOCK B — SPEAK (target: 1.5 hours) — the core of the demo

### Translate (top of /speak)
- Text input: "Type English…" → POST `/api/translate` (server route, calls Anthropic
  API with ANTHROPIC_API_KEY from env — model claude-haiku, strict JSON out:
  `{ tamil, roman }`). Show Tamil large (Anek Tamil), roman below, then
  **auto-speak it**.
- **Mic button** → Web Speech API (`webkitSpeechRecognition`, lang 'en-IN'),
  transcript fills the input, then translates + speaks. If the API is unavailable
  (non-Chrome), hide the mic — typing still works. Never crash on missing API.
- **Speaker output** → browser `speechSynthesis`. Pick a `ta-IN` voice if present,
  else best available. Rate 0.92. Every phrase card and scenario line gets a
  speaker button using the same util.
- Cache last 20 translations in memory; identical input never re-calls the API.
- If the API route fails (no key / network): fall back to nearest phrasebook match
  and show "offline phrase" — never a broken state on stage.
- XP: +5 per successful translation, capped at 30/day (axis speak).

### Real Situations
- The 6 seeded scenarios: Auto to college · Ordering at a mess · Laundry pickup ·
  Bargaining in T. Nagar · Lost near the beach · Emergency help.
- Expand → conversation lines (Tamil + roman + English), speaker button per line.
- **Play full conversation**: lines spoken in sequence via speechSynthesis, with
  distinct voice settings per role (YOU: pitch 1.0 · DRIVER/THEM: pitch 0.8,
  rate 0.95). 300ms gap between lines. Stop button.
- The seeded tip line renders as a tinted callout.

### Phrasebook by situation
- Chips: Greetings · Food · Auto · Shopping · Directions · Money · Hostel · Emergency
  (from `phrases.situation`).
- Phrase card: Tamil large, English + roman below, speaker + save buttons.
- Saved phrases write to `saves` (entity_type 'phrase') and show on Profile.

### Lessons
- 2-col grid of forest-tinted cards from `lessons` table: title, n phrases, +XP.
- Complete a lesson (tap through its phrases, each spoken) → xp_event with the
  lesson's XP value, card shows Completed state.

### Daily quiz
- "Today's quiz" card: 3 questions from seeded phrases — show English, pick the
  Tamil from 4 options. +10 XP per correct. One attempt/day (localStorage date key).
  Correct answer is spoken aloud when revealed.

---

## BLOCK C — MOVE + EXPLORE (target: 45 min)

### /move
- From/To inputs → route option cards (port `computeRoutes` from the old
  src/data/madrasi.ts into a lib — this one function may be copied from that file):
  Metro+walk · MTC bus · Share auto+train · Cab, each with fare in stat size,
  minutes, steps. CHEAPEST / FASTEST chips in module colours.
- **Cost calculator**: distance slider (1–25 km) → live fare for MTC bus, suburban
  train, metro, share auto, auto, cab, cycle. Pure client math, big numerals.
- The three seeded route_guides (Metro 101, MTC without fear, Suburban trains)
  render as tinted info cards below.

### /explore
- Photo grid (current one is fine) restyled to STYLE-v2: category chips
  (Beaches · Student hangouts · Culture · History · Budget outings · Hidden gems),
  plum price pill (Free/₹), student score.
- Detail: best time, crowd, budget, transport, nearby food, SAVE + DIRECTIONS.

---

## BLOCK D — HOME + PROFILE + XP SPINE (target: 45 min)

### XP spine (do first in this block)
- One util: `awardXp(axis, amount, source)` → inserts xp_event, updates any
  on-screen counters optimistically.
- Daily login: on first load of the day, +10 XP (axis of last-used module or
  'speak'), streak increments via last_active_date; missed day resets (freeze
  logic can wait).
- Level = floor(total/100)+1.

### / (Home) — a mix of everything
- Greeting row (name from profiles).
- **Stat trio: LEVEL · XP · STREAK** (48px numerals, count-up).
- Today's quiz shortcut card (if unplayed) — clay block.
- The five module blocks (STYLE-v2) with per-axis progress from axis_totals.
- "Under ₹100 near you" rail: 3 cheapest food cards, horizontal scroll.
- One explore card: tonight's pick (highest student_score, Free entry first).

### /profile
- Name (editable, writes to profiles.display_name), college dropdown (from
  colleges), area chip selector.
- Stat trio + five progress rings in module colours.
- Saved tabs: Places · Food · Phrases (from saves, joined to content).
- Badges row: derive 6 simple ones client-side (First words · First save ·
  Quiz taken · 3-day streak · Level 2 · Explorer) — locked/unlocked chips.
- Settings at the bottom: sound on/off (persists), reset demo data.

---

## BLOCK E — DEPLOY + DEMO SAFETY (target: 30 min, do NOT skip)

1. Push to GitHub, import to Vercel, add env vars (SUPABASE URL + ANON KEY,
   ANTHROPIC_API_KEY, NEXT_PUBLIC_DEMO_SEED=false in prod).
2. Test the deployed URL on a phone: tap CALL (dialer opens), DIRECTIONS
   (Maps opens), speaker buttons (audio plays AFTER a tap — autoplay policies
   block un-tapped audio; every sound in the app must be user-initiated).
3. Local demo account keeps NEXT_PUBLIC_DEMO_SEED=true so stats look alive.
4. `git tag demo` when it works. Do not touch main after tagging except fixes.

---

## EXPLICITLY NOT TONIGHT
Leaderboard · share card · price verification · community feed · quests beyond
the Home shortcut · Fare Shield screen (fare logic lives in the cost calculator;
the negotiation line lives in the Bargaining scenario) · multi-city/v2 · dark mode
· PWA offline. If time remains, polish SPEAK instead of adding anything.
