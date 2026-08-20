-- supabase/migrations/0002_multi_city.sql
-- MADRASI v2 — multi-city.
-- Backfills every existing row to Chennai so v1 keeps working untouched.

begin;

-- ---------------------------------------------------------------------------
-- Core city tables
-- ---------------------------------------------------------------------------

create table cities (
  id                 uuid primary key default gen_random_uuid(),
  slug               text unique not null,
  name               text not null,
  edition_name       text not null,
  state              text not null,
  language_code      text not null,
  transit_authority  text not null,
  metro_name         text not null,
  pass_color         text not null,
  stamp_override     text,
  fare_base          numeric not null,
  fare_base_km       numeric not null,
  fare_per_km        numeric not null,
  night_multiplier   numeric not null default 1.5,
  night_start_hour   int     not null default 23,
  transit_note       text,
  tier               int     not null default 1,
  active             boolean not null default true,
  created_at         timestamptz not null default now()
);

create table language_packs (
  code        text primary key,          -- 'ta' | 'kn' | 'hi'
  name        text not null,
  script      text not null,
  font_family text not null,
  fare_line   jsonb not null             -- { local, roman, en }
);

alter table cities
  add constraint cities_language_fk
  foreign key (language_code) references language_packs(code);

create table areas (
  id             uuid primary key default gen_random_uuid(),
  city_id        uuid not null references cities(id) on delete cascade,
  name           text not null,
  lat            numeric,
  lng            numeric,
  is_student_hub boolean not null default false,
  unique (city_id, name)
);

create table city_routes (
  id         uuid primary key default gen_random_uuid(),
  city_id    uuid not null references cities(id) on delete cascade,
  module     text not null check (module in ('eat','speak','move','live','explore')),
  route_code text not null,
  local_word text not null,
  unique (city_id, module)
);

-- ---------------------------------------------------------------------------
-- Seed Chennai first so the backfill below has something to point at
-- ---------------------------------------------------------------------------

insert into language_packs (code, name, script, font_family, fare_line) values
  ('ta','Tamil','Tamil','Anek Tamil',
   '{"local":"மீட்டர்ல வாங்க அண்ணா. எவ்ளோ ஆகும்?","roman":"Meter-la vaanga anna. Evlo aagum?","en":"Come on the meter, brother. How much will it be?"}'),
  ('kn','Kannada','Kannada','Anek Kannada',
   '{"local":"ಮೀಟರ್ ಹಾಕಿ ಅಣ್ಣಾ. ಎಷ್ಟು ಆಗುತ್ತೆ?","roman":"Meter haaki anna. Estu aagutte?","en":"Put the meter on, brother. How much will it be?"}'),
  ('hi','Hindi','Devanagari','Anek Devanagari',
   '{"local":"भैया मीटर से चलो। कितना लगेगा?","roman":"Bhaiya meter se chalo. Kitna lagega?","en":"Brother, go by the meter. How much will it cost?"}');

insert into cities (slug, name, edition_name, state, language_code, transit_authority,
                    metro_name, pass_color, stamp_override, fare_base, fare_base_km,
                    fare_per_km, night_multiplier, night_start_hour, transit_note, tier)
values
  ('chennai','Chennai','MADRASI','Tamil Nadu','ta','MTC','Chennai Metro',
   '#0F4D3A', null, 25, 1.8, 12, 1.5, 23,
   'The MTC monthly student pass is the cheapest way to move. Share autos on fixed routes beat metered autos on almost every short trip.', 1),
  ('bengaluru','Bengaluru','NAMMAKAAR','Karnataka','kn','BMTC','Namma Metro',
   '#14417A', null, 30, 2.0, 15, 1.5, 22,
   'The BMTC daily pass pays for itself in three trips. Autos routinely refuse the meter here.', 1),
  ('delhi','Delhi','DILLIWALA','Delhi NCR','hi','DTC','Delhi Metro',
   '#7E241B', '#16130E', 30, 1.5, 11, 1.25, 23,
   'DTC buses are free for women across the city. E-rickshaws handle the last kilometre from any metro station for ₹10–20.', 1),
  ('gurgaon','Gurgaon','MILLENNIAL','Haryana','hi','Gurugaman','Rapid Metro + Yellow Line',
   '#2C4A5E', null, 40, 2.0, 15, 1.5, 22,
   'Gurgaon is not built to walk. Shared autos run fixed routes along Sohna Road and Golf Course Road for ₹10–30.', 2);

-- ---------------------------------------------------------------------------
-- Add city scoping to content tables, backfilled to Chennai
-- ---------------------------------------------------------------------------

do $$
declare
  chennai uuid;
  t text;
begin
  select id into chennai from cities where slug = 'chennai';

  foreach t in array array[
    'food_places','laundries','places','quests','posts',
    'xp_events','savings_ledger','price_reports'
  ] loop
    execute format('alter table %I add column city_id uuid references cities(id)', t);
    execute format('update %I set city_id = %L', t, chennai);
    execute format('alter table %I alter column city_id set not null', t);
    execute format('create index %I on %I (city_id)', t || '_city_idx', t);
  end loop;
end $$;

-- Phrases / lessons / scenarios key on LANGUAGE, not city.
-- Delhi and Gurgaon share the 'hi' pack — this is the point of the split.
alter table phrases   add column language_code text references language_packs(code);
alter table lessons   add column language_code text references language_packs(code);
alter table scenarios add column language_code text references language_packs(code);

update phrases   set language_code = 'ta';
update lessons   set language_code = 'ta';
update scenarios set language_code = 'ta';

alter table phrases   alter column language_code set not null;
alter table lessons   alter column language_code set not null;
alter table scenarios alter column language_code set not null;

create index phrases_lang_idx   on phrases (language_code);
create index lessons_lang_idx   on lessons (language_code);
create index scenarios_lang_idx on scenarios (language_code);

-- ---------------------------------------------------------------------------
-- Profiles: current city + area as FK
-- ---------------------------------------------------------------------------

alter table profiles add column current_city_id uuid references cities(id);
alter table profiles add column area_id uuid references areas(id);

update profiles set current_city_id = (select id from cities where slug = 'chennai');
alter table profiles alter column current_city_id set not null;

-- profiles.area (text) is retained for one release so nothing breaks mid-migration.
-- Drop it in 0003 once the area picker writes area_id everywhere.

-- ---------------------------------------------------------------------------
-- Pass wallet — one pass per user per city
-- ---------------------------------------------------------------------------

create table user_city_passes (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  city_id        uuid not null references cities(id) on delete cascade,
  issued_at      timestamptz not null default now(),
  last_active_at timestamptz not null default now(),
  unique (user_id, city_id)
);

create index user_city_passes_user_idx on user_city_passes (user_id);

-- Issue a Chennai pass to everyone who already exists
insert into user_city_passes (user_id, city_id)
select p.id, (select id from cities where slug = 'chennai')
from profiles p
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Hot path: every query in the app is city-scoped
-- ---------------------------------------------------------------------------

create index food_places_city_area_idx on food_places (city_id, area);
create index laundries_city_area_idx   on laundries   (city_id, area);
create index places_city_area_idx      on places      (city_id, area);
create index xp_events_city_user_idx   on xp_events   (city_id, user_id, axis);

-- ---------------------------------------------------------------------------
-- Views, now city-scoped
-- ---------------------------------------------------------------------------

drop view if exists axis_totals;
create view axis_totals as
select user_id, city_id, axis, least(100, sum(amount))::int as total
from xp_events
group by user_id, city_id, axis;

drop view if exists weekly_college_leaderboard;
create view weekly_college_leaderboard as
select
  x.city_id,
  p.college_id,
  c.name as college_name,
  sum(x.amount)::int as weekly_xp,
  count(distinct x.user_id)::int as active_students
from xp_events x
join profiles p on p.id = x.user_id
join colleges c on c.id = p.college_id
where x.created_at > now() - interval '7 days'
group by x.city_id, p.college_id, c.name;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table cities          enable row level security;
alter table language_packs  enable row level security;
alter table areas           enable row level security;
alter table city_routes     enable row level security;
alter table user_city_passes enable row level security;

create policy "cities readable"     on cities         for select using (true);
create policy "packs readable"      on language_packs for select using (true);
create policy "areas readable"      on areas          for select using (true);
create policy "routes readable"     on city_routes    for select using (true);

create policy "own passes"    on user_city_passes for select using (auth.uid() = user_id);
create policy "issue own pass" on user_city_passes for insert with check (auth.uid() = user_id);
create policy "touch own pass" on user_city_passes for update using (auth.uid() = user_id);

commit;
