# STYLE-v1.1 — Crank It

A patch on `BRIEF.md`. The pass metaphor stays exactly as it is. What changes is
**intensity**. The v1 shell read as a receipt — polite, sparse, quiet. It should read
as a bus destination board: loud, dense, high-contrast, impossible to ignore.

Rule of thumb for every decision below: **if it looks calm, it's wrong.**

Apply this to `globals.css` and the five existing shell components. Do not rebuild them
from scratch — patch what exists.

---

## 1. TYPE — everything gets bigger

The old scale (32/24/19/15/13/11) is replaced. Nothing on a screen should be the same
size as the thing next to it.

```
hero     64px / 0.88  wght 800  wdth 62.5 (condensed)  uppercase  tracking -0.03em
display  40px / 0.92  wght 800  wdth 62.5              uppercase  tracking -0.02em
title    24px / 1.05  wght 700  wdth 75                uppercase  tracking -0.01em
body     16px / 1.5   wght 400  wdth 100
label    13px         wght 500  DM Mono  uppercase  tracking 0.10em
micro    11px         wght 500  DM Mono  uppercase  tracking 0.08em
```

**Numerals are the loudest thing on any card.** A fare renders at `32px` DM Mono
weight 500, right-aligned, not at body size. `₹90` should be roughly the same optical
weight as the place name beside it. Money is what this app is about — make it look
like it.

The condensed width axis (`wdth 62.5`) on hero and display is doing the signage work.
If Anek Latin's variable axes aren't applying, fix that before anything else — without
the condensed width this whole direction collapses into generic bold sans.

---

## 2. DENSITY — kill the dead space

The v1 shell had a 420px card floating in a sea of beige with 24px gaps everywhere.
That's what made it read as empty.

- **Full bleed on mobile.** Zero horizontal page padding. Ticket stubs run edge to edge
  with 16px internal padding. The page has no gutters; the cards *are* the layout.
- **8px between stubs**, not 16 or 24. They should feel like a stack of tickets in a
  book, touching.
- **Desktop:** the 420px column gets a hard 2px ink border and a flat 8px offset shadow
  in ink — no blur, no softness. It sits on the manila backdrop like an object, not a
  floating card.
- Vertical rhythm between *sections* is 0. Sections are separated by colour bands, not
  by whitespace.

---

## 3. COLOUR — bands, not accents

This is the biggest change. **Amber is no longer rationed.** The v1 rule of "at most two
amber elements per screen" is revoked — it's what made everything grey.

Screens are built as **alternating full-bleed horizontal bands**:

```
┌──────────────────────────────┐
│ INK BAND    — status strip   │  amber mono, 32px tall
├──────────────────────────────┤
│ INK BAND    — dest. board    │  amber dot-matrix, full bleed, 5 rows
├──────────────────────────────┤
│ MANILA BAND — today's punch  │  huge ink type, green CTA
├──────────────────────────────┤
│ INK BAND    — route strip    │  green badges on ink, horizontal scroll
├──────────────────────────────┤
│ MANILA BAND — ticket stubs   │  paper cards, edge to edge
└──────────────────────────────┘
```

Never more than two manila bands in a row without an ink band breaking them up. The
alternation is the energy.

- Amber on ink: unrestricted, use it everywhere.
- Amber on manila: still banned, it fails contrast. If you want amber in a light zone,
  put an ink block behind it.
- **`--faded` changes from `#8A7E68` to `#6B6050`.** The old value was 3.4:1 on paper
  and failed WCAG AA. This is non-negotiable.

---

## 4. NEW COMPONENT — the status strip

A permanent ink bar at the very top of every screen, 32px tall, DM Mono 13px in amber,
letter-spaced. Contents, separated by ` · `:

```
LEVEL 04 · ₹1,240 SAVED · 4 DAY STREAK · VELACHERY
```

This is the single highest-value addition in this patch. It puts progression on screen
at all times, it's pure gamification signal, and it costs one component. Sticky, always
visible, never scrolls away.

---

## 5. COMPONENT PATCHES

**Destination board** — full bleed, no side margins, no rounded corners on the outer
edge. 5 rows minimum, each row 44px tall. Amber text at 19px DM Mono with `0.12em`
letter-spacing. Add a subtle horizontal scanline texture (2px repeating linear-gradient
at 6% opacity) over the ink panel. It should look like it's emitting light.

**Ticket stub** — minimum 88px tall. Name in `title` (24px, condensed, uppercase, 700).
Fare in 32px DM Mono, right-aligned, vertically centred. The route badge becomes a
**full-height coloured tab bleeding off the left edge**, 32px wide, with the route code
rotated 90°. Perforation notches on the right edge only. Secondary info in `label`.

**Route badge** — 32px tall minimum, DM Mono 13px, 600 weight, 4px radius. Active state
is amber-on-ink; inactive is green-on-manila. Currently far too small.

**Bottom nav** — ink background, 64px tall, no border radius. Active tab gets a **3px
amber top border** and an amber label; inactive labels in `--faded` lightened for ink.
Route code above the word, both in DM Mono. 44×44 minimum touch target regardless of
visible label size.

**Section headers** — not small grey text. A full-width ink bar, 32px tall, amber mono
`label`, sticky under the status strip while its section is in view.

---

## 6. WHAT DOESN'T CHANGE

- The palette values (except `--faded`). Manila is still the background of light bands.
- The metaphor, the route numbers, the perforations, the stamps.
- The motion spec in `BRIEF.md` — signature moment, punch, budget, reduced-motion.
  Do not add animation to compensate for the layout. The layout should carry it.
- The ban list. Especially: no glassmorphism, no gradient blobs, no neon-on-black.
  This is loud *print*, not loud *screen*.
- Accessibility: every pair still verified at AA. Bigger type makes this easier, not
  optional.

---

## 7. VERIFY

Load `/shell-preview` and check, in order:

1. Is the biggest text on screen at least 40px? (If no, the scale didn't apply.)
2. Is the headline visibly **condensed**, not just bold? (If no, the `wdth` axis failed.)
3. Are there at least three full-bleed colour bands? (If no, the band structure didn't land.)
4. Is the status strip pinned at the top with amber mono text?
5. Do the ticket stubs touch the screen edges on mobile width?
6. Squint at it. Does it read as *loud*? If it still reads calm, the patch didn't take.
