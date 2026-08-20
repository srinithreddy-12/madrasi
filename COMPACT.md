# COMPACT.md — scale everything down

A density patch on STYLE-v2.md. **Nothing is removed.** Every screen, card, feature
and colour stays exactly as it is — only the numbers change. Palette is untouched.

Goal: medium-sized, calm, minimal. Right now everything is shouting at full volume;
this brings it to a normal speaking level.

Apply globally by editing the tokens, not by hand-editing each component. If a value
is hardcoded in a component instead of coming from a token, move it to a token while
you're there.

---

## Type scale

```
              was     now
stat          48px -> 30px
hero          32px -> 23px
title         22px -> 17px
subtitle      17px -> 15px
body          15px -> 14px
label         13px -> 12px
chip          13px -> 12px
micro         11px -> 10px
```

Line heights stay as they are. Weights stay as they are. The 30px `stat` is still the
largest thing on any screen — the hierarchy is preserved, just compressed.

---

## Radii

```
radius-block  28px -> 18px
radius-card   20px -> 14px
radius-inner  14px -> 10px
radius-chip   999px (unchanged)
```

---

## Spacing

```
page padding (l/r)      16px -> 14px
gap between cards       12px -> 8px
padding inside a card   20px -> 14px
padding inside a block  20px -> 14px
gap between sections    24px -> 16px
```

---

## Component heights

```
module block         ~120px -> 64px   (becomes a compact ROW, see below)
content card         ~140px -> ~96px
progress ring          64px -> 44px   (stroke 6px -> 4px)
bottom nav             64px -> 56px   (icon 20px -> 18px, label 10px)
filter chip            34px -> 30px
badge chip             32px -> 26px
floating assistant btn 56px -> 48px   (sits 64px above nav)
avatar                 48px -> 36px
```

### Module block → compact row
The five module blocks become horizontal rows instead of tall blocks:
`[ 32px colour circle with icon ] [ name in title · one-line subtitle in micro ] [ % in label, right ]`
64px tall, full width, `radius-card`. Module colour stays as the circle and a 6%
tint on the row background — the row itself is no longer a solid colour block.

This is the single biggest density win. Five tall colour blocks eat a whole screen;
five 64px rows fit above the fold with room to spare.

### Stat trio
Card height ~72px. Numbers at the new `stat` (30px), labels at `micro`. Dividers stay.

### Bundle card
Price at `stat` (30px), not 48. Items list stays complete — do not truncate it.
Card padding 14px.

### Content cards (food, laundry, place, route)
Name `subtitle`, meta `label`, price pill height 26px with the number at 16px.
The 2×2 info grid becomes a single wrapped row of small tinted chips at `micro` —
same information, roughly half the vertical space.

---

## Shadows

Soften with the smaller radii, or they look heavy:
```
0 2px 8px rgba(26,26,24,0.06)  ->  0 1px 4px rgba(26,26,24,0.05)
```

---

## Home specifically

With everything smaller, the whole screen should now fit in roughly one and a half
scrolls instead of four. Order stays exactly as it is:

```
greeting row (36px avatar)
time-aware hero line
stat trio (72px)
quick action chips (30px)
phrase of the day (compact — Tamil at title size, play button 36px)
five module rows (64px each = 320px total)
"Under ₹100 near you" rail (cards ~96px)
tonight's pick
```

---

## DO NOT

- Do not remove any card, feature, screen or piece of information.
- Do not truncate lists (bundle items, must-try items, route stops stay complete).
- Do not change any colour value.
- Do not change the motion spec — count-up, ring draw, press, stagger all stay.
- Do not drop below 44×44px touch targets anywhere, even where the visual element
  is now smaller. Tap area may overflow the visual bounds.
- Do not go below 10px for any text.

---

## VERIFY

1. Home fits in about 1.5 scrolls on a 360×800 screen (was ~4)
2. All five module rows are visible without scrolling past the stat trio
3. Nothing is truncated with an ellipsis that wasn't before
4. Every tappable thing still has a 44px target — test with a thumb, not a cursor
5. The largest number on screen is 30px and still clearly the focal point
