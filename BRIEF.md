# MADRASI — Build Brief

Build a mobile-first PWA called **MADRASI** — a student survival companion for Chennai.
Read this whole file before writing any code. Follow the BUILD ORDER at the bottom.

---

## STACK

- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- Supabase — Postgres, Row Level Security, anonymous auth, Realtime on the leaderboard
- `motion/react` (Framer Motion) for all animation
- Deployed on Vercel. All keys in env vars, never committed.
- Mobile-first. Assume a 360px-wide mid-range Android as the primary device.
  Desktop is a centred 420px column on a textured backdrop — this is a phone app, not a website.

---

## ORGANIZING METAPHOR — THE MADRASI PASS

The entire app is a **physical Chennai bus pass and ticket book**. Derive the layout,
the shape language, and the progression system from this. Do not treat it as decoration;
it must drive structure.

- The five modules are **MTC route numbers**, shown as route badges everywhere:
  - **21G — EAT** (food, mess, tiffin)
  - **5C — SPEAK** (Tamil)
  - **23C — MOVE** (transport)
  - **29C — LIVE** (laundry, services)
  - **1B — EXPLORE** (places, plans)
- Every listing — a mess, a laundry, a place, a phrase — renders as a **ticket stub**:
  a paper card with a perforated tear line down one side (dotted semicircle notches
  cut into both edges), the fare set in monospace numerals top-right, and a route badge.
- Progression is **punched into the pass**, not counted in a corner. Completing something
  stamps the pass with a rubber-stamp mark.
- The Home screen headline is an **LED destination board** — the amber dot-matrix strip
  above a bus windscreen.
- Profile is literally **the pass, front and back**. Front: your card. Back: the stamp grid.

Constraint: the metaphor must never cost legibility. Perforations are ~3px notches, not
a scalloped mess. The pass must read as a single clean column on a 360px screen.

---

## PALETTE

Default theme is **light on warm paper**. This is deliberate and non-negotiable.

```
--ink      #16130E   near-black, warm. All primary text, destination board body.
--manila   #EFE4CE   ticket paper. THE APP BACKGROUND.
--paper    #F7F0E2   raised card surface, sits on manila.
--mtc      #0F4D3A   MTC bottle green. Primary buttons, nav, route badges.
--amber    #FFA51F   LED board, XP fills, streak. Never for body text on manila.
--stamp    #C4342A   rubber-stamp red. ONLY for punch marks, "verified", destructive.
--faded    #8A7E68   secondary text on manila.
```

Usage rule: `--amber` and `--stamp` are accents with a strict budget — at most two amber
elements and one stamp element visible per screen. Green is the workhorse.

**Dark mode ("Night Bus"):** background flips to `--ink`, text to `--manila`, green
lightens to `#2E8B6B` for contrast, amber stays and becomes dominant (it's the LED).
Ship light mode first; dark mode only if BUILD ORDER phase 5 is reached.

Verify WCAG AA on every text/background pair before shipping.

---

## TYPOGRAPHY

Two families only. Load via `next/font/google`.

- **Anek Latin** + **Anek Tamil** — same superfamily, so English and Tamil script sit on
  one baseline with matched weight and width. Anek Tamil is used for ALL Tamil text
  throughout the SPEAK module. This pairing is the reason the bilingual UI won't look bolted together.
  - Headings / route names: Anek Latin, weight 700, width 75 (condensed), uppercase, tight tracking (-0.01em). Signage voice.
  - Body: Anek Latin, weight 400, width 100, 15px/1.5.
- **DM Mono** — every number in the app: fares, distances, route numbers, XP, timestamps,
  savings totals. Tabular, uppercase. This is what makes the ticket metaphor land.

Scale: 32 / 24 / 19 / 15 / 13 / 11. Nothing between. Nothing below 11px.

---

## SCREENS

Bottom navigation: **five word-labelled tabs**, each showing its route badge above the
word. Labels are words, never icons alone.

### 1. Home — `/`
The destination board plus today's run.

- **LED destination board** at the top: amber dot-matrix text on an ink panel, framed
  like a bus windscreen board. It cycles through what the student can do *right now*,
  driven by time of day and their saved area — `DINNER UNDER ₹100 · VELACHERY`,
  `MESS OPEN NOW · 3 NEARBY`, `LAST BUS 23C · 11:15 PM`. Tapping a line runs that search.
- **Search stub** directly under the board — a torn-ticket input, placeholder
  `₹100 biryani · laundry near me · bus to T Nagar`. Parses a rupee figure out of free
  text and caps results by price (port the existing parsing logic, keep it).
- **Today's Punch** — one card showing the single active quest step with a big
  `PUNCH IT` button. Not a list. One thing.
- **Route strip** — the five routes as a horizontally scrolling row of destination
  boards, each showing its route number, name, and how many stamps the user has on it.
  This replaces the old 3-column pastel icon grid entirely.
- **Live counters** — `SAVED THIS MONTH ₹1,240` in DM Mono, and the streak as a
  punch-count, not a flame emoji.

### 2. EAT — `/eat` (route 21G)
Tabs: Food · Mess & Tiffin · Late Night. Ticket-stub list with filters for area, price
cap, veg/non-veg, delivery, walking distance. Each stub: name, area, `₹` avg in mono,
student score as a punch-hole meter (filled circles out of five, not a progress bar),
must-try items, call button, save button.

Detail sheet slides up from the bottom edge and shows the stub tearing along its
perforation to reveal the back: timings, monthly plan price, tags, phone, and the
**price verification** widget (below).

### 3. SPEAK — `/speak` (route 5C)
Everything from the current build, kept: English→Tamil translation, pronunciation guide,
phrase categories by situation, lessons with XP, multi-line scenarios with three voices
(male/female/elder), TTS playback, saved phrases.

Presented as **the conductor's phrasebook** — a stitched pocket book. Each phrase card:
English small on top, Tamil large in Anek Tamil, Latin pronunciation below in DM Mono,
speaker button on the right.

**Plus the new Fare Shield** (see GAMIFICATION).

### 4. MOVE — `/move` (route 23C)
Compare auto vs bus vs metro vs share-auto for a given origin/destination: cost, time,
and a "student verdict" line. Render as a **route timeline** — a vertical line down the
left edge with stops as nodes.

### 5. LIVE — `/live` (route 29C)
Laundry and student services. Ticket stubs with per-kg rate, ironing rate, pickup
availability, student discount, timings, phone.

### 6. EXPLORE — `/explore` and `/explore/[placeId]`
Places to visit: entry fee, best time, crowd level, duration, budget, transport, nearby
food, student score. Detail page keeps the existing photography.

Also holds **Plan** (`/explore/plan`): pick budget (₹200/500/1000/2000), free time
(2 hours / half day / full day), who's coming, and mood → generates a costed itinerary.
Render the generated plan as **a strip of connected ticket stubs**, one per stop, with a
running total in mono at the bottom and a per-head split.

### 7. Pass — `/pass` (profile)
The centrepiece. A pass card that **flips**.

- **Front:** name, college, area selector, level, and the **five stamp slots** — one per
  route, each filling from 0–100. Rendered as five circular rubber-stamp impressions that
  ink in as they fill. NOT a radar chart, NOT a bar chart. Stamps.
- **Back:** the punch grid — every badge earned, as a grid of punched and unpunched holes.
  Locked badges show as empty holes with the name below, so the user can see what's missing.
- Below the pass: Savings Wallet ledger, saved places, saved phrasebook, and the
  community feed (posts with author, college, tag, body, likes, comments — keep the
  existing composer).

---

## GAMIFICATION SYSTEM

This is what the product is actually being judged on. Build it as a real system, not a
counter.

### Five-axis progression
XP is not a single number. Every action writes an `xp_event` tagged with one of five
axes: `eat`, `speak`, `move`, `live`, `explore`. Each axis has its own 0–100 fill and its
own stamp on the pass. Overall level = floor(total XP / 100) + 1.

This means a user who only eats has one inked stamp and four blank ones — the gap is the
motivation, and it's visible in one glance.

### Fare Shield (SPEAK + MOVE)
The signature demo feature. User enters pickup and drop. The app returns:
1. The **fair fare** — computed from distance (base ₹25 + ₹12/km, 1.5× after 11pm),
   shown large in DM Mono.
2. The **tourist price** they'll probably be quoted, struck through in stamp red.
3. A large green button: **SAY IT IN TAMIL**. Tapping it speaks the negotiation line
   aloud via TTS — `Meter-la vaanga anna. Evlo aagum?` — with the Tamil script and the
   Latin pronunciation on screen while it plays.
4. After the ride: "Did it work?" → yes/no. A yes logs the difference into the Savings
   Wallet and awards `move` XP.

Make this reachable in two taps from Home. It is the fifteen seconds that sells the app.

### Savings Wallet
Every time a user acts on a recommendation, log an entry: what they did, what the
default-app equivalent would have cost (delivery app markup, metered cab, retail
laundry), and the delta. Surface the running monthly total on Home and a full ledger on
the Pass. Render each entry as a small fare receipt.

### Quests
Ordered chains, not a checklist. Ship two:
- **"Week One"** — 6 steps: order a chai in Tamil, take a share auto, find a mess under
  ₹3,000/month, eat something under ₹50, save three places, reach Marina before sunrise.
- **"Broke Week"** — survive seven days under a set daily spend, verified by wallet entries.

One step is active at a time. Completing a step triggers the punch animation.

### Crowd price verification
On every food, laundry, and place stub, show `PRICE CONFIRMED 3 DAYS AGO` in mono, with
confidence visibly decaying — after 7 days it greys out and reads `NEEDS CHECKING`. One
tap: `Still ₹40?` → `YES` / `NO, it's ₹___`. A report awards XP on the matching axis and
resets the timer. This is the app's only real data moat; make it prominent, not buried.

### College leaderboard
Weekly XP summed per college, top 10, updating live via Supabase Realtime. Rendered as a
bus destination board with colleges as destinations. Team competition retains far better
than individual scores.

### Streak — fix the bug in the old build
The previous version initialised streak to 1 and never decremented it. Store
`last_active_date` and compute the streak properly on load. Grant one **streak freeze**
per week, earned by submitting a price verification.

### Shareable pass
A button that renders the pass to a 1080×1920 canvas — level, five stamps, badge count,
savings total, college — for an Instagram story. This is the growth loop; say so.

---

## DATA — SUPABASE SCHEMA

Content tables are world-readable; user tables are owner-scoped via RLS.

```sql
-- content (public read, no writes from client)
colleges(id, name, area)
food_places(id, name, kind, area, cuisine, avg_price, monthly_price, rating,
            reviews, distance_km, timings, late_night, delivery, student_score,
            tags[], must_try[], phone, blurb)
laundries(id, name, area, per_kg, iron_per_piece, dry_clean_from, rating, reviews,
          distance_km, pickup, student_discount, timings, student_score, phone)
places(id, name, category, area, rating, reviews, entry, best_time, duration,
       crowd, student_score, budget, transport, nearby_food[], description, tags[])
phrases(id, en, ta, pron, casual, situation)
lessons(id, title, xp, phrase_ids[])
scenarios(id, title, lines jsonb)   -- {ta, en, voice}
quests(id, title, description, steps jsonb, axis)

-- user-scoped (RLS: auth.uid() = user_id)
profiles(id, display_name, college_id, area, home_state, veg_pref,
         streak, last_active_date, freezes_available, created_at)
xp_events(id, user_id, axis, amount, source, created_at)
saves(id, user_id, entity_type, entity_id, created_at)
savings_ledger(id, user_id, entity_id, amount_saved, baseline_source, created_at)
quest_progress(id, user_id, quest_id, step_index, completed_at)
price_reports(id, user_id, entity_type, entity_id, reported_price, created_at)
posts(id, user_id, tag, body, created_at)
post_likes(user_id, post_id)

-- views
weekly_college_leaderboard  -- sum(xp_events.amount) by college, last 7 days
axis_totals                 -- sum by user_id, axis  → drives the five stamps
place_price_confidence      -- latest price_report per entity + age in days
```

Seed the content tables from a SQL file generated out of the existing
`src/data/madrasi.ts` — do not retype the data by hand.

Auth: **Supabase anonymous sign-in on first load**, upgradeable to email later. Zero
signup friction; a judge must be able to use it without typing an email.

---

## MOTION

Named mechanisms with numbers. All via `motion/react` unless stated.

**Signature moment — the destination board flip.** The Home LED headline animates like a
dot-matrix board: each character cycles through 3 random glyphs before settling, 260ms
per character with a 30ms stagger left-to-right. Runs on mount and whenever the line
changes. It animates already-painted content — the final string is in the DOM
immediately, never gated behind a delay.

**The Conductor's Punch (required component).** On any completion — quest step, lesson,
verification — a rubber stamp lands on the pass: `scale 1.6 → 1`, `rotate -14deg → -6deg`,
`opacity 0 → 1`, `blur(6px) → blur(0)`, over 380ms on
`cubic-bezier(0.2, 0.9, 0.25, 1.1)`. The stamp SVG has rough, ink-bled edges — never a
clean vector circle. Fire a 40ms haptic via `navigator.vibrate` where supported.

**Supporting scroll effect — route line draw.** On MOVE and on quest chains, an SVG line
runs down the left edge with stops as nodes; its `stroke-dashoffset` is driven by scroll
progress via `useScroll` + `useTransform`. `md:` and above only.

**Micro-interactions:**
- Ticket stub press: `translateY(1px) scale(0.995)`, 120ms ease-out.
- Stub tear-open: the two halves separate on `translateX ±6px` with the perforation
  notches meeting — transform only, no clip-path animation.
- List entrance: `opacity 0 → 1`, `translateY 12px → 0`, 320ms ease-out, 60ms stagger,
  IntersectionObserver, fires once.
- Stamp fill: the axis meters ink in over 600ms ease-out when the Pass mounts.

**Ambient:** one static grain/noise overlay at 4% opacity, fixed, over the whole app.
Not animated. This is what stops the manila reading as flat beige.

**Guardrails — hard requirements:**
1. `prefers-reduced-motion` disables the board flip, the line draw, and the punch,
   replacing each with a plain 150ms opacity fade. Nothing loops.
2. Animate `transform`, `opacity`, and `filter` only. Never width, height, top, left,
   or margin.
3. Below `md`, drop the route line draw. Keep entrance fades and the punch.
4. Budget: one signature moment + one scroll effect + micro-interactions. That is all.
5. Nothing above the fold is delayed by animation. The destination board text is readable
   on first paint.
6. No scroll-jacking. This runs on mid-range Android where scroll-hijacking shows as lag.

---

## DO NOT BUILD

- No centred mascot hero with a headline and a pill-shaped search bar under it.
  (That is the previous version of this app. Kill it.)
- No 3-column grid of pastel rounded-square icon tiles as the quick-action menu.
- No default shadcn look — white card, `rounded-lg`, `shadow-sm`, `bg-muted` chips,
  thin border with an arrow bottom-right.
- No dark background with a single saturated neon accent. No glassmorphic cards floating
  over blurred gradient blobs.
- No plain horizontal XP progress bar with "Level 3" beside it. Progression is stamps
  and punched holes.
- No bottom nav of five icon-only tabs. Every tab carries a word.
- No emoji used as a functional UI icon. Emoji may appear inside user-written content only.

---

## INVENT ONE THING

Beyond the Conductor's Punch specified above, design **one additional** interaction or
layout pattern that does not appear in standard component libraries and that comes out of
the bus-pass metaphor. Name it. State in one sentence why it fits a student who is broke,
new to the city, and using a mid-range phone. It must work on touch, must not be required
to understand any screen, and must respect the motion budget above. If you cannot justify
it in one sentence, discard it and pick another rather than defaulting to a standard grid.

Where a conventional solution and an unconventional one are equally usable, choose the
unconventional one.

---

## ACCESSIBILITY & PERFORMANCE

- WCAG AA contrast on every text/background pair, verified — including amber on ink and
  stamp red on manila.
- Tamil text carries `lang="ta"`. English carries `lang="en"`. Screen readers need this
  to switch voice.
- Minimum 44×44px touch targets. Nothing smaller, including the perforation notches.
- All form fields have persistent visible labels. Never placeholder-only.
- The perforation notches, stamps, and route badges are decorative:
  `aria-hidden="true"` with the real value in text.
- Content order must make linear sense to a screen reader regardless of the spatial layout.
- Ship as an installable PWA with a manifest and offline caching for the phrasebook and
  saved places — hostel wifi is unreliable and this is a real constraint, not a checkbox.
- Lazy-load all place imagery. Target LCP under 2.5s on a throttled 4G connection.

---

## BUILD ORDER

Build in this order and stop for review after each phase.

1. **Scaffold** — Next.js + Tailwind v4 with the palette and fonts as design tokens,
   Supabase client, anonymous auth, schema migration, seed script from the old data file.
2. **Shell** — bottom nav, ticket-stub component, route badge, destination board
   component, grain overlay. Get the visual language right before any screens.
3. **The demo path** — Home → EAT list → Fare Shield → Pass with stamps and the punch
   animation. These four screens are what gets presented. Make them finished.
4. **The rest** — SPEAK full module, MOVE, LIVE, EXPLORE, Plan, community feed.
5. **Systems** — Savings Wallet, price verification, quests, leaderboard, share card.
6. **Polish** — dark mode, PWA manifest, reduced-motion audit, contrast audit.

**Seed a demo account** with roughly 340 XP spread unevenly across the five axes, a
4-day streak, six badges, and ₹1,240 in the savings ledger. An empty pass on a projector
demonstrates nothing.
