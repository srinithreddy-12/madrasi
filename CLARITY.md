# CLARITY.md — make it obvious

Two jobs: move the game to Profile, and rewrite every label so a stranger
understands it without being told.

Nothing is removed. COMPACT.md sizing still applies. Colours unchanged.

---

## 1. Move the game to Profile

**Off Home:** the stat trio, the five progress rings, badges, savings total, the
streak-at-risk nudge, and any XP counters.

**Onto Profile**, in this order — Profile becomes the whole game in one screen:
```
name · college · area  (editable)
stat trio            LEVEL / XP / STREAK
five progress rings  one per module, labelled
money saved          total, with the ledger below it
badges               earned and locked
saved                Places / Food / Phrases tabs
settings
```

**The one exception on Home:** a single quiet line directly under the greeting —
`Level 4 · 4-day streak` at `label` size in `--muted`, tappable, opening Profile.
No numbers larger than that. No rings. No bars.

XP still gets *awarded* from every screen exactly as it does now — a small toast
(`+5 XP`) on the action, then gone. The scoreboard just lives in one place.

---

## 2. Rewrite every label

The rule: **a label says what the thing is; a subtitle says what it does.** Never
write an instruction. "Tap here to translate" is a tutorial. "Type English, hear
it in Tamil" is a description that teaches by implication. Always the second kind.

Subtitles are one line, `micro`, `--muted`, sentence case, no exclamation marks.

### Bottom nav
```
Home  ·  Food  ·  Tamil  ·  Travel  ·  Services  ·  You
```
`Speak`, `Eat`, `Move`, `Live` and `Profile` are insider words. These aren't.
Route numbers on the nav stay as they are.

### Home sections
```
Food Options under ₹100 near you
  Cheap places students actually eat at, closest first.

Supply Bundles that you can buy from here
  Starter kits shipped to your hostel — cheaper than buying each thing separately.

Say this today
  One useful Tamil line. Press play to hear how it sounds.

Worth going this week
  A place near you that costs little or nothing.
```

### The five module rows on Home
Each keeps its colour circle and gains one line:
```
Food       Messes, tiffin places and cheap eats near you
Tamil      Type English, hear it spoken in Tamil
Travel     Compare what a bus, metro, auto and cab each cost
Services   Laundry by the kilo, and starter kits for your room
Explore    Beaches, temples and outings that fit a student budget
```

### Screen headers
```
Food       Where to eat without spending much
Tamil      Enough Tamil to get through the day
Travel     What each way of getting there costs
Services   Laundry, and things you need for your room
Explore    Places worth going, and what they cost
You        Your progress, your saves, your settings
```

### Buttons — every one says what happens
```
Call                  ->  Call the shop
Directions            ->  Open in Maps
Save                  ->  Save for later
Reserve this bundle   ->  Reserve — we'll message you on WhatsApp
Play full conversation->  Play the whole conversation
Translate             ->  Translate and speak it
Start quiz            ->  Take today's 3-question quiz
Find routes           ->  Compare the options
```

### Smaller things
```
Mess & Tiffin tab     ->  Monthly meal plans
Late night tab        ->  Open after 10 PM
Student score         ->  Student rating — how well it suits a student budget
₹2,800/mo             ->  ₹2,800 a month  (₹93 a meal)
Real situations       ->  Conversations you'll actually have
Phrasebook            ->  Lines by situation
Lessons               ->  Short lessons — a few words each
Cost calculator       ->  Drag to your distance
CHEAPEST / FASTEST    ->  keep as-is; these are already clear
```

### Assistant preset chips — full questions, not fragments
```
Where can I eat for under ₹100?
How do I say "stop here" in Tamil?
What's the cheapest way to Chennai Central?
What should an auto to T. Nagar cost?
Which mess is under ₹3,000 a month?
What do I need for my first day in a hostel?
```

---

## 3. Final Home order

```
greeting  +  Level 4 · 4-day streak  (one quiet line)
time-aware hero line
quick action chips
Say this today            (phrase card, play button)
the five module rows
Food Options under ₹100 near you
Supply Bundles that you can buy from here   (2 cards, "see all" -> Services)
Worth going this week
```

Nothing else. No rings, no trio, no badges.

---

## DO NOT

- Do not write instructions. No "tap", "click", "press here to", "get started",
  "try it now". Describe the thing; the user works out the tap.
- Do not add tooltips, coach marks, onboarding overlays or info icons. If a label
  needs a tooltip, the label is wrong.
- Do not use exclamation marks anywhere.
- Do not remove any feature, card or screen — this is wording and placement only.
- Do not stop awarding XP from every screen. Only the display moves.

---

## VERIFY

1. Show Home to someone who has never seen the app. Can they say what each of the
   five rows does without you speaking? If not, that row's line is wrong.
2. No number on Home is larger than `label` size except prices.
3. Every button says what will happen when it is pressed.
4. Profile shows the trio, five rings, savings, badges and saves — the whole game.
5. Search the repo: zero instances of "Tap to", "Click here", or "Get started".
