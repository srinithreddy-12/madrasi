# MADRASI v2 — Multi-City Build Brief

This supersedes `BRIEF.md` (v1, Chennai-only). Everything in v1 still stands —
metaphor, palette, typography, motion, gamification, ban list. **Read v1 first.**
This file only defines what changes to support four cities.

Core principle: **exactly one variable changes per city.** Everything else is locked.
If you find yourself writing city-specific layout code, you have made a mistake.

---

## VERSIONING

Both versions ship from one codebase, switched by env var.

```
NEXT_PUBLIC_CITY_MODE=single   # v1 — Chennai only, no city switcher, no pass wallet
NEXT_PUBLIC_CITY_MODE=multi    # v2 — four cities, switcher, pass wallet, transfer flow
```

Tag `v1.0.0` on the Chennai-only build before starting v2 work. `single` mode must
keep working after v2 lands — it is the fallback if the switcher breaks on stage.

---

## THE FOUR CITIES

| Slug | Name | Edition name | Language | Transit authority | Pass colour |
|---|---|---|---|---|---|
| `chennai` | Chennai | **MADRASI** | Tamil | MTC + Chennai Metro | `#0F4D3A` bottle green |
| `bengaluru` | Bengaluru | **NAMMAKAAR** | Kannada | BMTC + Namma Metro | `#14417A` Vajra blue |
| `delhi` | Delhi | **DILLIWALA** | Hindi | DTC + Delhi Metro | `#7E241B` DTC red |
| `gurgaon` | Gurgaon | **MILLENNIAL** | Hindi | Gurugaman + Rapid Metro | `#2C4A5E` Aravalli steel |

Edition names are display strings on the pass card only — the app product name and
all chrome stay neutral. Do not use "MADRASI" as a global app title in `multi` mode.

**Delhi and Gurgaon share a language pack** (`hi`). Phrase content is keyed by
`language_code`, not by city. This is the whole reason the schema separates them —
adding Noida or Faridabad later costs one row, not a content pack.

---

## WHAT CHANGES PER CITY

Only these. Nothing else.

1. **Pass colour** — the `--mtc` token is rebound per city. `--manila`, `--ink`,
   `--amber`, `--paper`, `--faded` are constants across all four. The paper is the brand.
2. **Route badges** — the five modules take that city's real bus route numbers and
   that city's local word. See `cities.ts`.
3. **Areas** — the area picker is city-scoped.
4. **Language** — SPEAK loads the phrase pack for `city.language_code`. Font switches
   from Anek Tamil to Anek Kannada to Anek Devanagari, same superfamily, same baseline.
5. **Fare formula** — base fare, per-km rate, night multiplier and night-start hour
   differ per city. Fare Shield reads these from config, never hardcodes.
6. **Content rows** — food, laundry, places filtered by `city_id`.
7. **Transit note** — one city-specific line surfaced in MOVE (e.g. Delhi: DTC buses
   are free for women; Gurgaon: shared autos are the only affordable mode).

**Delhi-only exception:** DTC red `#7E241B` collides with `--stamp` `#C4342A`. In Delhi,
`--stamp` rebinds to `--ink` so punch marks stay distinguishable from the pass colour.
This is the single permitted city-specific override. Handle it in the token layer.

---

## NEW: THE PASS WALLET

The strongest thing multi-city buys you. Build it.

- A user holds **one pass per city**, each with its own level, five stamps, and badges.
  XP does not pool across cities — moving to Bengaluru means a blank Bengaluru pass.
- `/pass` gains a horizontal wallet strip at the top: your passes as overlapping cards,
  the active one raised. Locked cities show as a greyed blank pass reading `NOT ISSUED`.
- **Cross-city badges** are the only thing that spans passes. Ship three:
  - `BILINGUAL` — reach 50 on SPEAK in two different languages
  - `TRANSFER` — hold an active pass in two cities
  - `NORTH & SOUTH` — hold passes in one southern and one northern city
- Switching city is a **transfer**, not a settings toggle. Full-screen: the current pass
  slides left out of frame, the new pass slides in from the right with the punch
  animation firing on arrival. 420ms, `cubic-bezier(0.2, 0.9, 0.25, 1.1)`, transform
  and opacity only, reduced to a 150ms fade under `prefers-reduced-motion`.
- City switcher lives in the Home destination board header — tap the city name, get a
  bottom sheet of four destination boards. Not a dropdown.

Leaderboards are **per city**. A Chennai student competes with Chennai colleges.

---

## SCHEMA DELTA

```sql
cities(id, slug, name, edition_name, state, language_code, language_name,
       transit_authority, metro_name, pass_color, stamp_override,
       fare_base, fare_base_km, fare_per_km, night_multiplier, night_start_hour,
       transit_note, tier, active)

areas(id, city_id, name, lat, lng, is_student_hub)

city_routes(id, city_id, module, route_code, local_word)
  -- module in ('eat','speak','move','live','explore')

language_packs(code, name, script, font_family)
  -- phrases.language_code REFERENCES language_packs(code) — NOT city_id

user_city_passes(id, user_id, city_id, issued_at, last_active_at,
                 UNIQUE(user_id, city_id))
```

Add `city_id` (FK, NOT NULL) to: `food_places`, `laundries`, `places`, `quests`,
`posts`, `xp_events`, `savings_ledger`, `price_reports`.

Change `phrases`, `lessons`, `scenarios` to key on `language_code` instead of city.

Change `profiles.area` → `profiles.current_city_id` + `profiles.area_id`.

Change `weekly_college_leaderboard` and `axis_totals` views to group by
`(city_id, ...)`. Axis totals drive the five stamps **on the active city's pass only**.

RLS unchanged: content world-readable, user rows owner-scoped.

Index `(city_id, area_id)` on every content table — every query in the app is
city-scoped, so this is the hot path.

---

## SEEDING DEPTH — DELIBERATELY UNEVEN

Do not seed all four cities equally. Depth is the demo; breadth is the architecture proof.

- **Chennai — full.** All existing v1 content. This is what gets demoed.
- **Bengaluru — substantial.** 8 food, 3 laundry, 4 places, 12 Kannada phrases,
  2 lessons, 1 scenario, 1 quest. Deep enough that a live switch on stage looks real.
- **Delhi — moderate.** 8 food, 2 laundry, 4 places, 12 Hindi phrases, 1 quest.
- **Gurgaon — thin, and that's correct.** 5 food, 2 laundry, 3 places. Shares the Hindi
  pack with Delhi. Its `tier` is `2` and the UI shows `EARLY ROUTE — HELP US MAP IT`
  on thin cities, with a prominent contribute button. Sparse data becomes a
  contribution prompt instead of an empty state.

Seed content lives in `src/data/city-seed.ts`. **Every price and timing in the new-city
seed is an estimate and is flagged `verified: false`.** They render with the
`NEEDS CHECKING` confidence state from day one. This is honest, and it doubles as a
live demo of the price-verification feature.

---

## FARE SHIELD, MULTI-CITY

Reads `fare_base`, `fare_base_km`, `fare_per_km`, `night_multiplier`,
`night_start_hour` from the active city, and the negotiation line from the active
language pack. No other change.

The negotiation line per language (in `cities.ts`):
- Tamil — `Meter-la vaanga anna. Evlo aagum?`
- Kannada — `Meter haaki anna. Estu aagutte?`
- Hindi — `Bhaiya meter se chalo. Kitna lagega?`

---

## RESPONSIVE, MOTION, BANS, ACCESSIBILITY

Unchanged from v1. Two additions:

- **Ban:** no country/city dropdown with flag emoji or a chevron select. The switcher is
  destination boards.
- **Accessibility:** `lang` attribute switches with the active language pack —
  `ta`, `kn`, `hi`. Screen readers need this to pick the right voice, and it is the
  entire reason for using the Anek superfamily.
- The transfer animation counts against the v1 motion budget. It replaces nothing —
  it is permitted as the one addition because it only fires on an explicit user action,
  never on scroll or load.

---

## BUILD ORDER — v2

Stop for review after each phase.

1. **Migration + config.** Apply `0002_multi_city.sql`, load `cities.ts`, backfill every
   existing Chennai row with `city_id`. Verify `single` mode still works untouched.
2. **City context.** A `useCity()` provider that resolves the active city from
   `profiles.current_city_id`, rebinds the `--mtc` (and Delhi's `--stamp`) token, and
   loads the route badges and language pack. Every screen reads from this. Nothing
   below this layer knows a city exists.
3. **Prove it with one screen.** Make EAT city-aware end to end. If EAT works for all
   four cities with zero city-specific code, the abstraction is right. If it doesn't,
   fix it here before touching anything else.
4. **Remaining screens** — SPEAK (language pack + font switch), MOVE (fare config +
   transit note), LIVE, EXPLORE, Home destination board.
5. **Pass wallet + transfer flow + cross-city badges.**
6. **Seed the three new cities** from `city-seed.ts`.
7. **Per-city leaderboards.**

**Demo safety:** seed the demo account with a full Chennai pass (level 4, uneven stamps,
₹1,240 saved) and a freshly issued, nearly blank Bengaluru pass. The stage moment is
switching between them — a full pass next to an empty one is what makes the progression
system legible to a judge in two seconds.
