# SPRINT-ADD.md — three more features

Additions to DEMO-SPRINT.md. STYLE-v2.md still governs visuals.

**Revised scope — cuts to pay for these:**
- BLOCK C: build the **cost calculator only**. Skip the From/To route cards.
- EXPLORE: leave the existing photo grid, restyle chips only. No detail page work.
- Everything in "EXPLICITLY NOT TONIGHT" stays cut.

**New order after BLOCK B:** G (bundles) → F (medical) → H (chat) → cost calculator
→ D (home/profile) → E (deploy). Bundles first because it's the pitch's money slide.

---

## Where these live

No new bottom-nav items. `/live` (29C, clay) becomes a **hub with three chips**:

```
LIVE  ·  Laundry   Medical   Bundles
```

Laundry is already built. Medical and Bundles are two more chip tabs on the same
screen, reusing the same card component. No new colour, no new nav.

---

## BLOCK G — Product bundles (~25 min) — the revenue model

### Schema + seed — run this in the SQL editor

```sql
create table bundles (
  id             text primary key,
  name           text not null,
  tagline        text not null,
  category       text not null,
  price          numeric not null,
  mrp            numeric not null,
  commission_pct numeric not null,
  items          text[] not null,
  seller         text not null,
  ships_in       text not null,
  popular        boolean not null default false
);
alter table bundles enable row level security;
create policy "read bundles" on bundles for select using (true);

insert into bundles (id,name,tagline,category,price,mrp,commission_pct,items,seller,ships_in,popular) values
('b-dayone','Hostel Day One','Everything you need the night you move in','moving',1499,2200,15,
 ARRAY['Single bedsheet + pillow cover','Fibre pillow','Light blanket','Bucket + mug','Steel hangers x12','Door mat','Padlock with 3 keys']::text[],
 'Sowcarpet Home Supplies','2-3 days',true),
('b-mess','Mess Survival Kit','Your own plate beats the hostel steel','food',649,980,18,
 ARRAY['Steel plate + tumbler','Spoon and fork set','2-tier tiffin box','1L water bottle','Small dabba for leftovers']::text[],
 'Parrys Steel Mart','2-3 days',true),
('b-desk','Study Desk Setup','A corner that actually works at 2 AM','study',899,1350,15,
 ARRAY['LED table lamp','4-socket extension board','Desk organiser','A4 notebooks x3','Sticky notes + highlighters','Pen stand']::text[],
 'Ritchie Street Traders','3-4 days',false),
('b-laundry','Laundry Basics','Stop borrowing detergent','living',549,820,18,
 ARRAY['Mesh laundry bag','Detergent 1kg','Clip hanger','Steel hangers x12','Stain remover spray']::text[],
 'Sowcarpet Home Supplies','2-3 days',false),
('b-monsoon','Chennai Monsoon Kit','October to December, non-negotiable','seasonal',699,1000,16,
 ARRAY['Compact umbrella','Raincoat','Waterproof bag cover','Quick-dry towel','Mosquito repellent']::text[],
 'Moore Market Supplies','2-3 days',true),
('b-exam','Exam Week Kit','For the seventy-two hours that decide everything','study',399,600,20,
 ARRAY['Instant coffee sachets x20','Energy bars x6','Foam earplugs','Eye mask','Highlighter set']::text[],
 'Parrys Steel Mart','2 days',false);
```

### UI
- Bundle card, `radius-block`, clay-tinted background:
  - Name in `title`, tagline in `body --muted`
  - **Price in `stat` (48px)** with MRP struck through beside it in `label`, and a
    `SAVE ₹701` chip in clay
  - Items as a bulleted list, `body`
  - `Seller · ships in 2-3 days` in `micro`
  - Full-width clay button: **RESERVE THIS BUNDLE**
  - `POPULAR` chip top-right where popular = true
- **Reserve flow (no payments — do NOT build checkout):** tap → confirmation sheet
  showing bundle, price, and "We'll WhatsApp you to confirm delivery" → a
  `wa.me/?text=` deep link pre-filled with the bundle name and price. Awards +10 XP.
- Below the list, one small `micro` line: `Fulfilled by verified wholesale partners.
  MADRASI earns 15-20% commission.` This is the line the judges need to see.

---

## BLOCK F — Medical (~20 min)

### Schema + seed

```sql
create table medical_places (
  id text primary key, name text not null, kind text not null,
  area text not null, open_24h boolean not null default false,
  emergency boolean not null default false, distance_km numeric,
  note text
);
alter table medical_places enable row level security;
create policy "read medical" on medical_places for select using (true);

insert into medical_places (id,name,kind,area,open_24h,emergency,distance_km,note) values
('m-apollo-greams','Apollo Hospitals, Greams Road','hospital','Thousand Lights',true,true,6.2,'Large multi-speciality, full emergency department'),
('m-kauvery','Kauvery Hospital, Alwarpet','hospital','Alwarpet',true,true,4.8,'24x7 emergency, central location'),
('m-fortis-malar','Fortis Malar Hospital','hospital','Adyar',true,true,3.1,'Closest full emergency to Adyar and Besant Nagar'),
('m-miot','MIOT International','hospital','Manapakkam',true,true,9.4,'Multi-speciality, west Chennai'),
('m-rgggh','Rajiv Gandhi Government General Hospital','hospital','Park Town',true,true,8.0,'Government hospital — free treatment, carry ID'),
('m-srmc','Sri Ramachandra Medical Centre','hospital','Porur',true,true,11.2,'Teaching hospital, large emergency wing'),
('m-apollo-ph-vel','Apollo Pharmacy, Velachery','pharmacy','Velachery',true,false,0.7,'24 hour chain pharmacy'),
('m-medplus-guindy','MedPlus, Guindy','pharmacy','Guindy',false,false,1.4,'Generic medicines, usually cheaper'),
('m-apollo-ph-tnagar','Apollo Pharmacy, T. Nagar','pharmacy','T. Nagar',true,false,3.6,'24 hour chain pharmacy'),
('m-clinic-vel','Local clinic, Velachery Main Road','clinic','Velachery',false,false,0.9,'Walk-in consultation, typically ₹200-400');
```

### UI — and read this part carefully

**Do not display or invent phone numbers for any hospital or clinic.** The seed
has none on purpose. A wrong number in a medical emergency is a real harm, and
fabricated contact data is indefensible if a judge checks it.

- Pinned emergency card at the very top of the Medical tab, clay block, before the
  list. These are the real national/state numbers and the ONLY tel: links allowed here:
  - **108** — Ambulance (free, all India)
  - **104** — Tamil Nadu health helpline
  - **100** — Police
  - **1098** — Childline
- Filter chips: All · 24×7 · Hospitals · Pharmacies · Clinics
- Card: name, kind chip, area + distance, `24×7` chip in clay where true, note line.
  Single action: **DIRECTIONS** → same Google Maps deep link pattern as food.
- `micro` disclaimer under the emergency card: `Not medical advice. In an emergency,
  call 108.`

---

## BLOCK H — Floating assistant (~30 min)

A circular floating button, 56px, `--speak` forest, bottom-right, sitting **72px above
the bottom nav** so it never overlaps. Message-circle icon from lucide.

Tap → bottom sheet, 75vh, `radius-block` top corners.

### Preset prompt chips (shown before any conversation)
Two rows, horizontal scroll:
```
Dinner under ₹100 near me   ·   How do I say "stop here" in Tamil?
Cheapest way to Chennai Central   ·   Nearest 24×7 pharmacy
Fair auto fare to T. Nagar   ·   Mess under ₹3000 a month
What do I need for day one at a hostel?
```

### Behaviour
- POST to `/api/assistant` — a server route that calls the Anthropic API with the
  same key as translate. System prompt: *"You are MADRASI, a guide for outstation
  students new to Chennai. Answer in 2-3 short sentences. Be specific about prices
  in rupees and areas in Chennai. If the student needs food, laundry, medical,
  transport or Tamil help, say which section of the app to open."*
- Pass the seeded content as compact context: names + areas + prices of food places,
  laundries and bundles. Keep it under ~1500 tokens — don't send whole rows.
- Answers render as a `--speak`-tinted bubble. Below each answer, if it mentions a
  module, show a chip that deep-links there (`Open EAT →`).
- Free-text input at the bottom, plus the same mic button from SPEAK.
- Conversation held in React state only. No persistence tonight.
- On API failure: show the preset chips and a line saying to use the tabs below.
  Never a raw error.
- +5 XP for the first assistant question of the day.

---

## VERIFY

- Bundles: price shows at 48px, RESERVE opens WhatsApp with text pre-filled
- Medical: 108 is tappable and opens the dialer; no hospital shows a phone number
- Assistant: button floats clear of the nav; a preset chip returns an answer in
  under 4 seconds; failure shows chips, not an error
