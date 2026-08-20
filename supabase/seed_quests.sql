-- supabase/seed_quests.sql — MADRASI v1 quest content (derived from BRIEF.md).
-- Kept separate from seed.sql so it can be applied on its own and re-run safely.
-- quests is a content table (no client writes), so this must run server-side.

begin;

insert into quests (id, title, description, axis, steps) values
  ('week-one', 'Week One',
   'Your first seven days in Chennai, one punch at a time.', null,
   '[
     {"label":"Order a chai in Tamil","axis":"speak","xp":15,"verify":"self"},
     {"label":"Take a share auto","axis":"move","xp":15,"verify":"self"},
     {"label":"Find a mess under ₹3,000/month","axis":"eat","xp":20,"verify":"self"},
     {"label":"Eat something under ₹50","axis":"eat","xp":10,"verify":"self"},
     {"label":"Save three places","axis":"explore","xp":15,"verify":"count:3"},
     {"label":"Reach Marina before sunrise","axis":"explore","xp":25,"verify":"self"}
   ]'::jsonb),

  ('broke-week', 'Broke Week',
   'Survive seven days under a set daily spend, verified by your wallet.', 'live',
   '[
     {"label":"Set your daily budget","axis":"live","xp":10,"verify":"self"},
     {"label":"Day 1 under budget","axis":"live","xp":10,"verify":"wallet"},
     {"label":"Day 2 under budget","axis":"live","xp":10,"verify":"wallet"},
     {"label":"Day 3 under budget","axis":"live","xp":10,"verify":"wallet"},
     {"label":"Day 4 under budget","axis":"live","xp":15,"verify":"wallet"},
     {"label":"Day 5 under budget","axis":"live","xp":15,"verify":"wallet"},
     {"label":"Day 6 under budget","axis":"live","xp":15,"verify":"wallet"},
     {"label":"Day 7 — you survived Broke Week","axis":"live","xp":25,"verify":"wallet"}
   ]'::jsonb)
on conflict (id) do update
  set title = excluded.title,
      description = excluded.description,
      axis = excluded.axis,
      steps = excluded.steps;

commit;
