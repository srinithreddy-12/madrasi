# STYLE-v2 — Soft Blocks

**This replaces `STYLE-v1.1.md` entirely.** Delete that file. The transit-pass /
manila / ticket-stub direction is discontinued. Keep the route numbers as content
(21G, 5C, 23C, 29C, 1B) — they are good detail — but drop the perforations, the
destination board, the ink bands, and the rubber-stamp language.

Everything else in `BRIEF.md` still stands: the modules, the data, the gamification
system, the accessibility rules, the motion budget.

The new direction: **warm off-white page, big soft-cornered colour blocks, one colour
per module, huge numerals, rings instead of bars.** Light and clean. Never dark,
never neon.

---

## 1. PALETTE

### Surfaces — constant everywhere

```
--bg        #F6F3EE   warm off-white. THE PAGE. Never pure white, never grey.
--surface   #FFFFFF   card background
--ink       #1A1A18   all primary text
--muted     #6E6A63   secondary text (4.9:1 on --bg, passes AA)
--line      #E8E3DB   hairline borders, 1px
```

### Module colours — one per module, and this is the whole system

Each module owns a colour. A user should recognise which module they're in from a
glance at the colour alone, before reading anything.

```
--eat       #E0A32E   ochre        (21G)
--speak     #1F6F4A   forest       (5C)
--move      #2E6BB8   deep blue    (23C)
--live      #C9503A   clay         (29C)
--explore   #7B5EA7   plum         (1B)
```

**Text-on-colour rule, non-negotiable:**
- On `--eat` (ochre): use `--ink`. White on ochre is 2.1:1 and fails badly.
- On forest, blue, clay, plum: use white. All four clear 5:1.

**Tints** for soft backgrounds — same hue at 12% over `--bg`. Used for lesson cards,
inactive chips, info panels. Text on tints is always `--ink`.

That's it. Five module colours plus five neutrals. No sixth accent, no gradients.

---

## 2. TYPOGRAPHY

Three families, each with a job. Load via `next/font/google`.

- **Gabarito** — display, headings, buttons. Friendly geometric with actual character,
  not another neutral grotesque. Weights 600/700/800.
- **Space Grotesk** — body, labels, and **every numeral in the app**. Its digits have
  personality, which matters because numbers are the hero element in this direction.
  Weights 400/500/700.
- **Anek Tamil** — all Tamil script in SPEAK. Unchanged from v1.

```
stat     48px / 1.0   Space Grotesk 700    ← big numbers. The loudest thing on screen.
hero     32px / 1.1   Gabarito 700
title    22px / 1.25  Gabarito 700
subtitle 17px / 1.35  Gabarito 600
body     15px / 1.55  Space Grotesk 400
label    13px / 1.3   Space Grotesk 500
chip     13px / 1.0   Space Grotesk 500
micro    11px / 1.2   Space Grotesk 500  uppercase  tracking 0.06em
```

**The `stat` size is the point of this whole spec.** `₹2,800`, `78%`, `Level 4`,
`₹1,240 saved` — these render at 48px, not 17px. Look at how the references handle
`44 / 12 / 34` and `16 kcal`. The number dominates; its label is tiny beneath it.

---

## 3. SHAPE & SPACING

```
radius-block   28px   colour blocks, module cards, hero cards
radius-card    20px   white content cards
radius-chip    999px  pills, chips, badges, buttons
radius-inner   14px   panels nested inside cards
```

- Page padding: **16px** left and right. Cards do not touch the edge.
- Gap between cards: **12px**. Tight.
- Padding inside a card: **20px**. Generous. The contrast between tight-outside and
  generous-inside is what makes the references feel considered.
- Shadow: `0 2px 8px rgba(26,26,24,0.06)` on white cards. Colour blocks get **no
  shadow** — the colour is enough.
- Borders: 1px `--line` on white cards only.

---

## 4. CORE COMPONENTS

### Greeting row (top of Home)
Avatar circle left · `Hey, Arjun!` in `subtitle` (name bolder) · pill button right in
`--speak`. Height 48px. No gradient banner behind it.

### Stat trio
One white card, three columns split by 1px `--line` dividers. Each column: number in
`stat`, label in `micro` `--muted` beneath. Use for `LEVEL 4 / 340 XP / 4 DAY STREAK`
on Home and Pass. This is the single highest-impact component here — build it first.

### Module block
A `radius-block` card filled with the module's colour. Icon top-left in a 40px circle
at 20% white (or 20% ink on ochre). Route code in `micro` top-right. Module name in
`title`. One line of `body` at 80% opacity. Progress count bottom-right in `label`.
Five of these stacked is the Home module list.

### Content card (food, laundry, place, route)
White, `radius-card`. Name in `subtitle`, meta line in `label` `--muted`, **price pill
top-right** — `radius-chip`, module-colour background, `stat` scaled to 20px inside.
A 2×2 info grid in `radius-inner` tinted panels below. Full-width `--speak` button
at the bottom.

Your current laundry cards are nearly this already — swap the pink price badge for the
module colour and enlarge the numeral.

### Filter chips
Horizontal scroll row. Active: module colour fill, white text. Inactive: white fill,
`--line` border, `--ink` text. 34px tall, 14px horizontal padding.

### Progress ring
**Replaces every progress bar in the app.** 64px diameter, 6px stroke, track in
`--line`, fill in module colour, rounded cap, percentage in `label` centred. Five of
these in module colours *is* the five-axis system on the Pass.

### Rank pill (leaderboard)
Full-width row, `radius-chip`, tinted background. Rank badge circle left, name, then a
percentage chip and avatar right. Top three get a solid module-colour fill; the rest
stay tinted. Straight from the third reference.

### Badge chip
`radius-chip`, 32px tall. Unlocked: module-colour fill. Locked: `--line` fill,
`--muted` text, lock icon. Grid of these on the Pass.

### Bottom nav
White, 64px, `--line` top border, `radius-block` on the top two corners only.
Five items, icon above word label. Active item: icon in a 36px module-colour circle,
white glyph, label in `--ink`. Inactive: `--muted`. 44×44 minimum touch target.

---

## 5. SCREEN PATCHES

**Home** — greeting row · stat trio · Today's Punch as a `--live` module block with a
white pill CTA · filter chip row · the five module blocks · savings card with `₹1,240`
in `stat`.

**Services / EAT** — kill the green gradient header, replace with a plain `hero`
heading on `--bg`. Tabs become filter chips. Cards get ochre price pills.

**SPEAK** — the level bar becomes a progress ring. Lessons become a 2-column grid of
`--speak`-tinted cards, each with an icon, title, and `+30 XP` in `label`. Situation
cards stay white with a tinted audio chip.

**MOVE** — route options as white cards with the fare in `stat` on the right.
`CHEAPEST` / `FASTEST` become module-colour chips. Cost calculator slider track in
`--move`.

**EXPLORE** — the 2-column photo grid is already right. Just swap the category pill to
`--explore` and enlarge the price to `label` weight 700.

**Pass** — stat trio · five progress rings in module colours, labelled · savings card ·
rank pills · badge grid.

---

## 6. MOTION

Deliberately restrained. The colour and scale are doing the work.

- **Number count-up.** Every `stat` numeral counts from 0 to its value over 700ms,
  ease-out, once on mount. This is the signature moment.
- **Ring draw.** `stroke-dashoffset` animates 0→value over 600ms ease-out on mount,
  staggered 80ms across the five rings.
- **Card press.** `scale(0.98)`, 120ms ease-out. Transform only.
- **List entrance.** `opacity 0→1`, `translateY 10px→0`, 300ms, 50ms stagger,
  IntersectionObserver, fires once.
- Nothing loops. No parallax. No scroll-jacking.
- `prefers-reduced-motion` replaces all four with a 150ms fade; numbers render final.

---

## 7. DO NOT BUILD

- **No gradient headers.** The current green-gradient banner on Services, Explore,
  Move and Speak is the single biggest thing making the app look dated. Flat blocks
  or plain headings only.
- **No emoji as functional icons.** Use `lucide-react` throughout. Emoji appear only
  inside user-written community posts.
- **No dark backgrounds, no neon, no glassmorphism, no gradient blobs.**
- **No progress bars.** Rings only.
- **No sixth colour.** If something needs to stand out and you've used all five,
  the layout is wrong, not the palette.
- No pure white page background. `--bg` is warm off-white for a reason.
- No drop shadows on colour blocks.

---

## 8. VERIFY

1. Is the page background warm off-white, not white and not grey?
2. Is the largest number on screen at least 48px?
3. Can you tell which module you're in from colour alone, with the text blurred?
4. Are there zero gradient headers left?
5. Are there zero progress bars left — all rings?
6. Is every emoji gone from the UI chrome?
