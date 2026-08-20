-- supabase/migrations/0001_init.sql
-- MADRASI v1 — Chennai. Column types derived from the real src/data/madrasi.ts,
-- not guessed. Safe to re-run: drops everything it creates first.
--
-- Note on `phrases.local_text`: the source data calls this field `ta` (Tamil).
-- It is named language-neutrally here so 0002_multi_city.sql can attach a
-- language_code without a rename. Map ta -> local_text when seeding.

begin;

-- ---------------------------------------------------------------------------
-- Clean slate
-- ---------------------------------------------------------------------------

drop view if exists place_price_confidence cascade;
drop view if exists weekly_college_leaderboard cascade;
drop view if exists axis_totals cascade;

drop table if exists post_likes cascade;
drop table if exists posts cascade;
drop table if exists price_reports cascade;
drop table if exists quest_progress cascade;
drop table if exists quests cascade;
drop table if exists savings_ledger cascade;
drop table if exists saves cascade;
drop table if exists xp_events cascade;
drop table if exists profiles cascade;
drop table if exists colleges cascade;
drop table if exists route_guides cascade;
drop table if exists scenarios cascade;
drop table if exists lessons cascade;
drop table if exists phrases cascade;
drop table if exists places cascade;
drop table if exists laundries cascade;
drop table if exists food_places cascade;

drop function if exists handle_new_user() cascade;

-- ===========================================================================
-- CONTENT — world-readable, no client writes. Slug PKs (text) to match source.
-- ===========================================================================

create table food_places (
  id             text primary key,
  name           text    not null,
  kind           text    not null check (kind in ('restaurant','mess','tiffin','cafe','street','caterer')),
  area           text    not null,
  cuisine        text    not null check (cuisine in ('veg','nonveg','both')),
  avg_price      numeric not null,
  monthly_price  numeric,
  rating         numeric not null,
  reviews        int     not null default 0,
  distance_km    numeric not null,
  timings        text    not null,
  late_night     boolean not null default false,
  delivery       boolean not null default false,
  student_score  int     not null check (student_score between 0 and 100),
  tags           text[]  not null default '{}',
  must_try       text[]  not null default '{}',
  phone          text,
  blurb          text
);

create table laundries (
  id               text primary key,
  name             text    not null,
  area             text    not null,
  per_kg           numeric not null,
  iron_per_piece   numeric not null,
  dry_clean_from   numeric not null,
  rating           numeric not null,
  reviews          int     not null default 0,
  distance_km      numeric not null,
  pickup           boolean not null default false,
  student_discount text,
  timings          text    not null,
  student_score    int     not null check (student_score between 0 and 100),
  phone            text
);

create table places (
  id            text primary key,
  name          text    not null,
  category      text    not null,
  area          text    not null,
  rating        numeric not null,
  reviews       int     not null default 0,
  entry         numeric not null default 0,
  best_time     text,
  duration      text,
  crowd         text    not null check (crowd in ('Low','Medium','High')),
  student_score int     not null check (student_score between 0 and 100),
  budget        numeric not null,
  transport     text,
  nearby_food   text[]  not null default '{}',
  emoji         text,
  description   text,
  tags          text[]  not null default '{}'
);

create table phrases (
  id         text primary key,
  en         text not null,
  local_text text not null,          -- source field: `ta`
  pron       text not null,
  casual     text,
  situation  text not null
);

create table lessons (
  id         text primary key,
  title      text   not null,
  emoji      text,
  xp         int    not null,
  phrase_ids text[] not null default '{}'
);

create table scenarios (
  id       text  primary key,
  title    text  not null,
  emoji    text,
  place    text,
  vibe     text,
  ambience text,
  tip      text,
  lines    jsonb not null            -- [{ who, role, ta, en, pron, voice }]
);

create table route_guides (
  id     text   primary key,
  title  text   not null,
  emoji  text,
  points text[] not null default '{}'
);

create table colleges (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique,
  area text
);

-- `situations`, `exploreCategories` and `AREAS` stay in TypeScript.
-- They are short static lists with no user writes; a table would add a
-- round trip and buy nothing. `computeRoutes` and `buildPlan` stay in TS too.

-- ===========================================================================
-- USER DATA — owner-scoped
-- ===========================================================================

create table profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  display_name      text,
  college_id        uuid references colleges(id) on delete set null,
  area              text not null default 'Velachery',
  home_state        text,
  veg_pref          text check (veg_pref in ('veg','nonveg','both')),
  streak            int  not null default 0,
  last_active_date  date,
  freezes_available int  not null default 1,
  created_at        timestamptz not null default now()
);

create table xp_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  axis       text not null check (axis in ('eat','speak','move','live','explore')),
  amount     int  not null check (amount > 0),
  source     text not null,
  created_at timestamptz not null default now()
);

create table saves (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('food','laundry','place','phrase')),
  entity_id   text not null,
  created_at  timestamptz not null default now(),
  unique (user_id, entity_type, entity_id)
);

create table savings_ledger (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  entity_type     text not null,
  entity_id       text,
  amount_saved    numeric not null check (amount_saved > 0),
  baseline_source text not null,      -- 'delivery app' | 'metered cab' | 'retail laundry'
  note            text,
  created_at      timestamptz not null default now()
);

create table quests (
  id          text primary key,
  title       text  not null,
  description text,
  axis        text  check (axis in ('eat','speak','move','live','explore')),
  steps       jsonb not null          -- [{ label, axis, xp, verify }]
);

create table quest_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  quest_id     text not null references quests(id) on delete cascade,
  step_index   int  not null,
  completed_at timestamptz not null default now(),
  unique (user_id, quest_id, step_index)
);

create table price_reports (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  entity_type    text not null check (entity_type in ('food','laundry','place')),
  entity_id      text not null,
  reported_price numeric not null check (reported_price >= 0),
  created_at     timestamptz not null default now()
);

create index price_reports_entity_idx on price_reports (entity_type, entity_id, created_at desc);

create table posts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete set null,  -- null = seeded
  author_name    text not null,
  college_name   text,
  tag            text not null,
  body           text not null,
  likes_count    int  not null default 0,   -- seeded baseline; real likes live in post_likes
  comments_count int  not null default 0,
  created_at     timestamptz not null default now()
);

create table post_likes (
  user_id    uuid not null references auth.users(id) on delete cascade,
  post_id    uuid not null references posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

-- ===========================================================================
-- Auto-create a profile whenever an (anonymous) user is created
-- ===========================================================================

create function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ===========================================================================
-- Views
-- ===========================================================================

create view axis_totals as
select user_id, axis, least(100, sum(amount))::int as total
from xp_events
group by user_id, axis;

create view weekly_college_leaderboard as
select
  p.college_id,
  c.name                          as college_name,
  sum(x.amount)::int              as weekly_xp,
  count(distinct x.user_id)::int  as active_students
from xp_events x
join profiles p on p.id = x.user_id
join colleges c on c.id = p.college_id
where x.created_at > now() - interval '7 days'
group by p.college_id, c.name;

-- Latest reported price per entity + how stale it is.
-- The UI greys out to NEEDS CHECKING past 7 days.
create view place_price_confidence as
select distinct on (entity_type, entity_id)
  entity_type,
  entity_id,
  reported_price,
  created_at                                                as confirmed_at,
  extract(day from now() - created_at)::int                 as days_old,
  (now() - created_at) < interval '7 days'                  as is_fresh
from price_reports
order by entity_type, entity_id, created_at desc;

-- ===========================================================================
-- RLS
-- ===========================================================================

alter table food_places   enable row level security;
alter table laundries     enable row level security;
alter table places        enable row level security;
alter table phrases       enable row level security;
alter table lessons       enable row level security;
alter table scenarios     enable row level security;
alter table route_guides  enable row level security;
alter table colleges      enable row level security;
alter table quests        enable row level security;

create policy "read food_places"  on food_places  for select using (true);
create policy "read laundries"    on laundries    for select using (true);
create policy "read places"       on places       for select using (true);
create policy "read phrases"      on phrases      for select using (true);
create policy "read lessons"      on lessons      for select using (true);
create policy "read scenarios"    on scenarios    for select using (true);
create policy "read route_guides" on route_guides for select using (true);
create policy "read colleges"     on colleges     for select using (true);
create policy "read quests"       on quests       for select using (true);
-- No insert/update/delete policies on content: RLS denies by default.
-- Seeding runs as postgres in the SQL editor and bypasses RLS.

alter table profiles       enable row level security;
alter table xp_events      enable row level security;
alter table saves          enable row level security;
alter table savings_ledger enable row level security;
alter table quest_progress enable row level security;
alter table price_reports  enable row level security;
alter table posts          enable row level security;
alter table post_likes     enable row level security;

create policy "own profile read"   on profiles for select using (auth.uid() = id);
create policy "own profile write"  on profiles for update using (auth.uid() = id);

create policy "own xp read"    on xp_events for select using (auth.uid() = user_id);
create policy "own xp write"   on xp_events for insert with check (auth.uid() = user_id);

create policy "own saves read"   on saves for select using (auth.uid() = user_id);
create policy "own saves write"  on saves for insert with check (auth.uid() = user_id);
create policy "own saves delete" on saves for delete using (auth.uid() = user_id);

create policy "own ledger read"  on savings_ledger for select using (auth.uid() = user_id);
create policy "own ledger write" on savings_ledger for insert with check (auth.uid() = user_id);

create policy "own quests read"  on quest_progress for select using (auth.uid() = user_id);
create policy "own quests write" on quest_progress for insert with check (auth.uid() = user_id);

-- Price reports are read by everyone (that is the whole point of crowd
-- verification) but only written by their author.
create policy "reports readable"  on price_reports for select using (true);
create policy "own report write"  on price_reports for insert with check (auth.uid() = user_id);

create policy "posts readable"    on posts for select using (true);
create policy "own post write"    on posts for insert with check (auth.uid() = user_id);
create policy "own post delete"   on posts for delete using (auth.uid() = user_id);

create policy "likes readable"    on post_likes for select using (true);
create policy "own like write"    on post_likes for insert with check (auth.uid() = user_id);
create policy "own like delete"   on post_likes for delete using (auth.uid() = user_id);

commit;
