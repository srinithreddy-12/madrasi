-- supabase/seed.sql — MADRASI v1 Chennai content.
-- GENERATED from src/data/madrasi.ts. Do not hand-edit; regenerate.
begin;

insert into food_places (id, name, kind, area, cuisine, avg_price, monthly_price, rating, reviews, distance_km, timings, late_night, delivery, student_score, tags, must_try, phone, blurb) values
  ('murugan-idli', 'Murugan Idli Shop', 'restaurant', 'T. Nagar', 'veg', 90, null, 4.6, 2140, 3.4, '7:00 AM – 11:00 PM', false, true, 88, ARRAY['Student-friendly','Pure veg','Filter coffee']::text[], ARRAY['Ghee podi idli','Filter coffee','Rava dosa']::text[], '+914428152727', 'Soft idlis, five chutneys, and the filter coffee that fixes 8 AM lectures.'),
  ('amma-mess', 'Amma Home Mess', 'mess', 'Velachery', 'both', 70, 2800, 4.4, 312, 0.8, '7:30 AM / 12:30 PM / 8:00 PM', false, true, 94, ARRAY['Monthly plan','Home food','Unlimited rice']::text[], ARRAY['Sunday chicken biryani','Vathal kuzhambu']::text[], '+919841122334', 'Unlimited home-style meals, ₹2,800/month with 3 meals — hostel favourite.'),
  ('sri-tiffin', 'Sri Balaji Tiffin Service', 'tiffin', 'Guindy', 'veg', 60, 2200, 4.2, 188, 1.6, '6:45 AM & 7:30 PM', false, true, 90, ARRAY['Doorstep delivery','Veg only','Skip-day allowed']::text[], ARRAY['Curd rice combo','Chapati kurma box']::text[], '+919677001122', 'Hot tiffin box at your hostel gate. Pause days when you go home.'),
  ('jannal-kadai', 'Jannal Kadai', 'street', 'Mylapore', 'veg', 40, null, 4.5, 940, 6.2, '4:00 PM – 8:30 PM', false, false, 92, ARRAY['Under ₹50','Iconic','Evening snack']::text[], ARRAY['Bajji platter','Sukku coffee']::text[], '+914424641422', 'Literally a window shop near Kapaleeshwarar temple. Bajjis for ₹15.'),
  ('buhari', 'Buhari Hotel', 'restaurant', 'Anna Nagar', 'nonveg', 220, null, 4.1, 1560, 9.1, '11:00 AM – 1:30 AM', true, true, 74, ARRAY['Late night','Biryani','Group friendly']::text[], ARRAY['Chicken 65','Mutton biryani']::text[], '+914426261111', 'Home of Chicken 65 and the 1 AM biryani run after submissions.'),
  ('hot-chips', 'Ratna Cafe', 'restaurant', 'Egmore', 'veg', 110, null, 4.3, 1320, 7.4, '6:00 AM – 10:30 PM', false, true, 82, ARRAY['Sambar legend','Breakfast']::text[], ARRAY['Ghee pongal','Sambar idli']::text[], '+914425321711', 'The sambar comes in a jug. Enough said.'),
  ('kalathi', 'Kalathi Rose Milk', 'cafe', 'Mylapore', 'veg', 45, null, 4.4, 760, 6, '9:00 AM – 10:00 PM', false, false, 89, ARRAY['Under ₹50','Chill spot']::text[], ARRAY['Rose milk','Jigarthanda']::text[], '+919840556677', '₹40 rose milk that has survived generations of Chennai students.'),
  ('night-canteen', 'Guindy Night Canteen', 'street', 'Guindy', 'both', 80, null, 4, 410, 1.2, '9:00 PM – 3:00 AM', true, false, 86, ARRAY['Late night','Under ₹100','Near campus']::text[], ARRAY['Kothu parotta','Omelette dosa']::text[], '+919003445566', 'Kothu parotta at 1 AM, three metres from the hostel gate.'),
  ('sangeetha', 'Sangeetha Veg Restaurant', 'restaurant', 'Adyar', 'veg', 150, null, 4.2, 2200, 4.5, '6:30 AM – 11:00 PM', false, true, 79, ARRAY['Under ₹150','AC seating','Study-friendly']::text[], ARRAY['Mini tiffin','Paneer butter masala']::text[], '+914424452525', 'Reliable mini-tiffin and a table nobody rushes you out of.'),
  ('annapurna-caterers', 'Annapurna Student Caterers', 'caterer', 'Tambaram', 'both', 95, 3100, 4, 96, 12.5, 'Bulk orders, 24h notice', false, true, 76, ARRAY['Group orders','Birthday parties']::text[], ARRAY['Party biryani tray','Veg meals bulk']::text[], '+919566778899', 'Hostel birthday parties sorted from ₹95 a head.')
on conflict (id) do nothing;

insert into laundries (id, name, area, per_kg, iron_per_piece, dry_clean_from, rating, reviews, distance_km, pickup, student_discount, timings, student_score, phone) values
  ('sparkle', 'Sparkle Wash Velachery', 'Velachery', 60, 8, 150, 4.4, 208, 0.6, true, '10% with college ID', '8:00 AM – 9:00 PM', 93, '+919840001122'),
  ('quickdry', 'QuickDry Laundromat', 'Guindy', 75, 10, 180, 4.6, 431, 1.9, true, 'Free pickup above 4kg', '7:00 AM – 10:00 PM', 88, '+919840223344'),
  ('hostel-dhobi', 'Anna Dhobi Point', 'Kotturpuram', 45, 6, 120, 4, 87, 2.4, false, '₹40/kg for monthly bundles', '9:00 AM – 8:00 PM', 90, '+919841556677'),
  ('urban-clean', 'UrbanClean Adyar', 'Adyar', 90, 12, 220, 4.7, 655, 4.1, true, '15% on first 3 orders', '8:00 AM – 9:30 PM', 81, '+919003889900')
on conflict (id) do nothing;

insert into places (id, name, category, area, rating, reviews, entry, best_time, duration, crowd, student_score, budget, transport, nearby_food, emoji, description, tags) values
  ('marina-beach', 'Marina Beach', 'Beaches', 'Marina', 4.5, 52000, 0, '5:30 AM sunrise or 5 PM onwards', '2–3 hours', 'High', 95, 150, 'Metro to Thousand Lights + 10 min auto, or MTC 21G', ARRAY['Sundal carts','Ratna Cafe','Bhaji stalls']::text[], '🌊', 'The world''s second-longest urban beach. Sunrise walks, sundal for ₹20, and the best free evening in Chennai.', ARRAY['Free','Sunset','Group','Photography']::text[]),
  ('besant-nagar', 'Elliot''s Beach, Besant Nagar', 'Student hangouts', 'Besant Nagar', 4.6, 21000, 0, '6 PM – 10 PM', '2–4 hours', 'Medium', 97, 250, 'MTC 5C / 23C, or share auto from Adyar', ARRAY['Murugan Idli','Sandy''s','Beach food trucks']::text[], '🏖️', 'Chennai''s student HQ. Cafés, cheap eats, the Ashtalakshmi temple and a calmer beach than Marina.', ARRAY['Cafés','Date spot','Budget','Group']::text[]),
  ('mylapore', 'Mylapore & Kapaleeshwarar Temple', 'Culture', 'Mylapore', 4.7, 30000, 0, '6 AM – 9 AM, 5 PM – 8 PM', '2–3 hours', 'Medium', 90, 200, 'Metro to Thirumayilai (Blue-line link) or MTC 11', ARRAY['Jannal Kadai','Kalathi Rose Milk','Rayar''s Mess']::text[], '🛕', 'Gopuram, flower markets, filter coffee and the oldest food streets in the city — all in four lanes.', ARRAY['Free','History','Photography','Food walk']::text[]),
  ('fort-st-george', 'Fort St. George', 'History', 'Rajaji Salai', 4.3, 9800, 15, '10 AM – 3 PM (closed Fri)', '1.5–2 hours', 'Low', 84, 120, 'Suburban train to Chennai Beach, 8 min walk', ARRAY['Beach station canteens','Parry''s Corner stalls']::text[], '🏰', 'The first English fortress in India, now a museum with ₹15 student-friendly entry.', ARRAY['Cheap','History','Museum']::text[]),
  ('valluvar-kottam', 'Valluvar Kottam', 'History', 'Nungambakkam', 4.4, 7600, 10, '4 PM – 7 PM', '1 hour', 'Low', 88, 80, 'Metro to Nungambakkam + 10 min walk', ARRAY['Hot Chips','Nungambakkam cafés']::text[], '📜', 'A stone chariot monument to Thiruvalluvar with all 1,330 Thirukkural couplets carved in.', ARRAY['Cheap','Photography','Quiet']::text[]),
  ('govt-museum', 'Government Museum, Egmore', 'Culture', 'Egmore', 4.4, 14000, 15, '9:30 AM – 1 PM (closed Fri)', '2–3 hours', 'Medium', 86, 150, 'Suburban train / Metro to Egmore', ARRAY['Ratna Cafe','Egmore tea shops']::text[], '🏛️', 'Bronze gallery, dinosaur bones and a ₹15 student ticket. Rainy-day plan sorted.', ARRAY['Cheap','Rainy day','History']::text[]),
  ('semmozhi-poonga', 'Semmozhi Poonga', 'Parks', 'Teynampet', 4.3, 11000, 25, '6 AM – 9 AM, 4 PM – 7 PM', '1–2 hours', 'Low', 85, 100, 'Metro to Teynampet, 5 min walk', ARRAY['Cafés on Cathedral Road']::text[], '🌿', 'A 20-acre botanical garden in the middle of the city. Best quiet study escape.', ARRAY['Quiet','Date spot','Nature']::text[]),
  ('guindy-park', 'Guindy National Park', 'Parks', 'Guindy', 4.2, 8400, 15, '9 AM – 5 PM (closed Tue)', '2 hours', 'Low', 87, 90, 'Metro to Guindy, 10 min walk', ARRAY['Guindy Night Canteen','Kathipara food stalls']::text[], '🦌', 'Blackbuck, deer and a snake park inside the city limits. Very student-priced.', ARRAY['Cheap','Nature','Group']::text[]),
  ('mahabalipuram', 'Mahabalipuram', 'Weekend trips', 'ECR, 55km', 4.8, 41000, 40, 'Early morning, all day trip', 'Full day', 'Medium', 92, 700, 'ECR bus 599/119 from Broadway or Thiruvanmiyur (~₹60)', ARRAY['Beach shacks','Moonrakers']::text[], '🗿', 'UNESCO shore temples, rock carvings and beach shacks. The classic Chennai weekend trip.', ARRAY['Weekend','History','Group','Photography']::text[]),
  ('kasimedu-sunset', 'Napier Bridge & Sunset Point', 'Photography', 'Marina', 4.5, 6100, 0, '5:45 PM – 6:45 PM', '1 hour', 'Medium', 91, 60, 'Metro to Government Estate + short auto', ARRAY['Marina sundal','Cafés at Anna Salai']::text[], '🌇', 'Painted arches, harbour views and the most-photographed sunset in Chennai.', ARRAY['Free','Sunset','Photography','Date spot']::text[])
on conflict (id) do nothing;

-- Added from the "Best budget-friendly places to explore in Chennai" list.
-- city_id is required (not null, added by 0002_multi_city.sql) — every row
-- points at Chennai via subquery since this app is Chennai-only today.
insert into places (id, name, category, area, rating, reviews, entry, best_time, duration, crowd, student_score, budget, transport, nearby_food, emoji, description, tags, city_id) values
  ('san-thome-basilica', 'San Thome Basilica', 'History', 'Mylapore', 4.6, 15200, 0, '6 AM – 8 PM', '45 min – 1 hour', 'Medium', 88, 50, 'MTC 5C / 23C to Mylapore, or 10 min walk from Kapaleeshwarar Temple', ARRAY['Jannal Kadai','Kalathi Rose Milk']::text[], '⛪', 'One of only three churches in the world built over the tomb of an apostle — a quiet Gothic basilica a street off the Mylapore beach road.', ARRAY['Free','History','Photography','Quiet']::text[], (select id from cities where slug = 'chennai')),
  ('parthasarathy-temple', 'Parthasarathy Temple', 'Culture', 'Triplicane', 4.5, 12400, 0, '6 AM – 9 AM, 5 PM – 8 PM', '1 hour', 'Medium', 85, 60, 'MTC 5C / 23C to Triplicane, or 15 min walk from Marina', ARRAY['Triplicane biryani stalls','Ratna Cafe']::text[], '🛕', 'One of Chennai''s oldest Vaishnavite temples, dating to the Pallava era — five minutes off the Marina.', ARRAY['Free','History','Culture']::text[], (select id from cities where slug = 'chennai')),
  ('chetpet-eco-park', 'Chetpet Eco Park', 'Parks', 'Kilpauk/Chetpet', 4.3, 5100, 20, '6 AM – 9 AM, 4 PM – 7 PM', '1–2 hours', 'Low', 83, 50, 'Metro to Chetpet, 5 min walk', ARRAY['Chetpet tea stalls']::text[], '🌳', 'A reclaimed lake turned walking park with paddle boats and a jogging track — Chennai''s quietest green escape.', ARRAY['Cheap','Nature','Quiet']::text[], (select id from cities where slug = 'chennai')),
  ('rail-museum', 'Chennai Rail Museum', 'History', 'Villivakkam', 4.4, 3200, 20, '10 AM – 5 PM (closed Mon)', '1.5–2 hours', 'Low', 84, 60, 'Suburban train to Villivakkam, 10 min auto', ARRAY['Villivakkam tiffin stalls']::text[], '🚂', 'Vintage steam engines, a toy-train ride and Raj-era coaches inside ICF''s own heritage yard.', ARRAY['Cheap','History','Photography']::text[], (select id from cities where slug = 'chennai')),
  ('ashok-pillar', 'Ashok Pillar', 'Photography', 'Ashok Nagar', 4.1, 1400, 0, 'Evening', '20–30 min', 'Low', 78, 30, 'Metro to Ashok Nagar, 2 min walk', ARRAY['Ashok Nagar street food']::text[], '🗼', 'A landmark traffic-circle pillar that gives the neighbourhood its name — a quick photo stop on the way to Kodambakkam.', ARRAY['Free','Quick visit','Photography']::text[], (select id from cities where slug = 'chennai')),
  ('victoria-hall', 'Victoria Public Hall', 'History', 'Park Town', 4.2, 900, 0, '10 AM – 5 PM (subject to access)', '30–45 min', 'Low', 76, 40, 'Walk from Chennai Central / Park Town station', ARRAY['Central station food stalls']::text[], '🏛️', 'A restored 1890s public hall next to Chennai Central, all reddish Madras stone and colonial arches.', ARRAY['Free','History','Photography']::text[], (select id from cities where slug = 'chennai')),
  ('n4-beach', 'N4 Beach', 'Beaches', 'Tondiarpet', 4, 600, 0, '6 AM – 8 AM, 5 PM – 7 PM', '1–2 hours', 'Low', 80, 40, 'MTC bus to Tondiarpet, 10 min walk', ARRAY['Tondiarpet tea shops']::text[], '🏖️', 'A quiet north Chennai beach past the harbour — none of Marina''s crowds, all of the sea breeze.', ARRAY['Free','Quiet','Sunset']::text[], (select id from cities where slug = 'chennai')),
  ('kottivakkam-beach', 'Kottivakkam Beach', 'Beaches', 'Kottivakkam', 4.3, 2100, 0, '5:30 AM – 7 AM, 5:30 PM – 7 PM', '1–2 hours', 'Low', 86, 60, 'MTC 599 along ECR, or share auto from Thiruvanmiyur', ARRAY['ECR food stalls','Thiruvanmiyur cafés']::text[], '🌊', 'The IT-corridor beach — surfers, joggers and a calmer stretch of sand just past Thiruvanmiyur.', ARRAY['Free','Sunset','Quiet']::text[], (select id from cities where slug = 'chennai'))
on conflict (id) do nothing;

insert into phrases (id, en, local_text, pron, casual, situation) values
  ('p1', 'How much?', 'எவ்வளவு?', 'ev-va-LA-vu?', 'Evlo?', 'Shopping'),
  ('p2', 'Too expensive, reduce a bit', 'ரொம்ப அதிகம், கொஞ்சம் குறைங்க', 'romba adhigam, konjam kurainga', null, 'Shopping'),
  ('p3', 'Will you come by meter?', 'மீட்டர்ல வருவீங்களா?', 'meter-la varuveenga-laa?', null, 'Auto'),
  ('p4', 'Go straight and turn left', 'நேரா போய் இடது பக்கம் திரும்புங்க', 'nera poi idathu pakkam thirumbunga', null, 'Directions'),
  ('p5', 'Thank you', 'நன்றி', 'nan-dri', 'Thanks-nga', 'Greetings'),
  ('p6', 'How are you?', 'எப்படி இருக்கீங்க?', 'eppadi irukkeenga?', null, 'Greetings'),
  ('p7', 'One plate idli please', 'ஒரு பிளேட் இட்லி கொடுங்க', 'oru plate idli kodunga', null, 'Food'),
  ('p8', 'Is it very spicy?', 'ரொம்ப காரமா இருக்கா?', 'romba kaarama irukkaa?', null, 'Food'),
  ('p9', 'Where is the bus stop?', 'பஸ் ஸ்டாப் எங்க இருக்கு?', 'bus stop enga irukku?', null, 'Directions'),
  ('p10', 'I am a student', 'நான் ஒரு மாணவன்', 'naan oru maanavan', null, 'College'),
  ('p11', 'Please help me', 'தயவு செய்து உதவுங்க', 'thayavu seidhu udhavunga', null, 'Emergency'),
  ('p12', 'Call an ambulance', 'ஆம்புலன்ஸ் கூப்பிடுங்க', 'ambulance koopidunga', null, 'Emergency'),
  ('p13', 'Is water available?', 'தண்ணி இருக்கா?', 'thanni irukkaa?', null, 'Hostel'),
  ('p14', 'I don''t have change', 'சில்லறை இல்லை', 'sillarai illai', null, 'Money'),
  ('p15', 'Stop here', 'இங்க நிறுத்துங்க', 'inga niruthunga', null, 'Auto'),
  ('p16', 'What time do you open?', 'எத்தனை மணிக்கு திறப்பீங்க?', 'ethanai manikku thirappeenga?', null, 'Shopping')
on conflict (id) do nothing;

insert into lessons (id, title, emoji, xp, phrase_ids) values
  ('l1', 'Greetings', '🙏', 20, ARRAY['p5','p6']::text[]),
  ('l2', 'Ordering food', '🍛', 30, ARRAY['p7','p8']::text[]),
  ('l3', 'Auto talk', '🛺', 30, ARRAY['p3','p15']::text[]),
  ('l4', 'Shopping & bargaining', '🛍️', 30, ARRAY['p1','p2','p16']::text[]),
  ('l5', 'Directions', '🧭', 25, ARRAY['p4','p9']::text[]),
  ('l6', 'Money & change', '💰', 20, ARRAY['p14']::text[]),
  ('l7', 'Hostel life', '🏠', 20, ARRAY['p13']::text[]),
  ('l8', 'Emergency', '🚨', 35, ARRAY['p11','p12']::text[])
on conflict (id) do nothing;

insert into scenarios (id, title, emoji, place, vibe, ambience, tip, lines) values
  ('s1', 'Auto to college', '🛺', 'Velachery signal, 8:40 AM', 'Horns, hurry, and a driver quoting ₹150', 'Traffic + horns', 'Say the fare you want first — never ask ''how much''.', '[{"who":"you","role":"You","ta":"அண்ணா, கிண்டி வருவீங்களா?","en":"Anna, will you come to Guindy?","pron":"anna, Guindy varuveenga-laa?","voice":"female"},{"who":"them","role":"Driver","ta":"நூத்தி ஐம்பது ஆகும்.","en":"It''ll be 150.","pron":"noothi aimbadhu aagum","voice":"male"},{"who":"you","role":"You","ta":"ரொம்ப அதிகம் அண்ணா, மீட்டர்ல வாங்க.","en":"Too much anna, come by meter.","pron":"romba adhigam anna, meter-la vaanga","voice":"female"},{"who":"them","role":"Driver","ta":"சரி, நூறு குடுங்க.","en":"Okay, give 100.","pron":"sari, nooru kudunga","voice":"male"},{"who":"you","role":"You","ta":"சரி அண்ணா, இங்க நிறுத்துங்க.","en":"Okay anna, stop here.","pron":"sari anna, inga niruthunga","voice":"female"}]'::jsonb),
  ('s2', 'Ordering at a mess', '🍛', 'Saravana mess, Adyar', 'Steel plates clanging, sambar steam', 'Kitchen clatter', '''Konjam'' (a little) saves you from a spice disaster.', '[{"who":"them","role":"Server","ta":"என்ன வேணும் தம்பி?","en":"What do you want, brother?","pron":"enna venum thambi?","voice":"elder"},{"who":"you","role":"You","ta":"ஒரு பிளேட் இட்லி, ஒரு தோசை கொடுங்க.","en":"One plate idli and one dosa please.","pron":"oru plate idli, oru dosai kodunga","voice":"male"},{"who":"you","role":"You","ta":"ரொம்ப காரமா இருக்கா?","en":"Is it very spicy?","pron":"romba kaarama irukkaa?","voice":"male"},{"who":"them","role":"Server","ta":"கொஞ்சம் தான், சட்னி சேர்த்து சாப்பிடுங்க.","en":"Only a little, eat it with chutney.","pron":"konjam thaan, chutney serthu saapidunga","voice":"elder"},{"who":"you","role":"You","ta":"பில் கொடுங்க, நன்றி!","en":"Bill please, thank you!","pron":"bill kodunga, nandri","voice":"male"}]'::jsonb),
  ('s3', 'Laundry pickup', '🧺', 'Hostel gate ironing shop', 'Steam iron hissing, radio playing', 'Iron press hiss', 'Ask ''eppo kidaikum?'' to fix a delivery time.', '[{"who":"you","role":"You","ta":"இந்த துணி வாஷ் பண்ணனும்.","en":"I need these clothes washed.","pron":"indha thuni wash pannanum","voice":"male"},{"who":"them","role":"Shop uncle","ta":"கிலோ அறுபது ரூபாய்.","en":"Sixty rupees per kilo.","pron":"kilo arupathu roobaai","voice":"elder"},{"who":"you","role":"You","ta":"எப்போ கிடைக்கும்?","en":"When will it be ready?","pron":"eppo kidaikkum?","voice":"male"},{"who":"them","role":"Shop uncle","ta":"நாளைக்கு சாயங்காலம்.","en":"Tomorrow evening.","pron":"naalaikku saayangaalam","voice":"elder"},{"who":"you","role":"You","ta":"சரி, சில்லறை இல்லை, ஜிபே பண்ணட்டா?","en":"Okay, no change — can I GPay?","pron":"sari, sillarai illai, GPay pannattaa?","voice":"male"}]'::jsonb),
  ('s4', 'Bargaining in T. Nagar', '🛍️', 'Ranganathan Street', 'Crowd, loudspeakers, 40°C', 'Busy street market', 'Walk away slowly — the price usually follows you.', '[{"who":"you","role":"You","ta":"இது எவ்வளவு?","en":"How much is this?","pron":"idhu evvalavu?","voice":"female"},{"who":"them","role":"Shopkeeper","ta":"நானூறு ரூபாய் மா.","en":"Four hundred rupees.","pron":"naanooru roobaai maa","voice":"male"},{"who":"you","role":"You","ta":"ரொம்ப அதிகம், கொஞ்சம் குறைங்க.","en":"Too expensive, reduce a bit.","pron":"romba adhigam, konjam kurainga","voice":"female"},{"who":"them","role":"Shopkeeper","ta":"முந்நூறு, லாஸ்ட் பிரைஸ்.","en":"Three hundred, last price.","pron":"munnooru, last price","voice":"male"},{"who":"you","role":"You","ta":"இருநூத்தி ஐம்பது ஆனா எடுத்துக்கறேன்.","en":"If it''s 250 I''ll take it.","pron":"irunoothi aimbadhu aana eduthukaren","voice":"female"}]'::jsonb),
  ('s5', 'Lost near the beach', '🧭', 'Marina service road', 'Sea breeze, sundal vendors', 'Waves + crowd', 'Locals point with their whole hand — follow the direction, not the words.', '[{"who":"you","role":"You","ta":"மன்னிக்கணும், பஸ் ஸ்டாப் எங்க இருக்கு?","en":"Excuse me, where is the bus stop?","pron":"mannikkanum, bus stop enga irukku?","voice":"male"},{"who":"them","role":"Aunty","ta":"நேரா போய் இடது பக்கம் திரும்புங்க.","en":"Go straight and turn left.","pron":"nera poi idathu pakkam thirumbunga","voice":"female"},{"who":"you","role":"You","ta":"நடந்து போகலாமா?","en":"Can I walk there?","pron":"nadandhu pogalaamaa?","voice":"male"},{"who":"them","role":"Aunty","ta":"ஆமா, அஞ்சு நிமிஷம் தான்.","en":"Yes, just five minutes.","pron":"aamaa, anju nimisham thaan","voice":"female"},{"who":"you","role":"You","ta":"ரொம்ப நன்றி!","en":"Thank you so much!","pron":"romba nandri","voice":"male"}]'::jsonb),
  ('s6', 'Emergency help', '🚨', 'Anywhere, any time', 'Keep it short and loud', 'Urgent', 'Learn these two lines by heart before anything else.', '[{"who":"you","role":"You","ta":"தயவு செய்து உதவுங்க!","en":"Please help me!","pron":"thayavu seidhu udhavunga","voice":"female"},{"who":"them","role":"Passerby","ta":"என்ன ஆச்சு?","en":"What happened?","pron":"enna aachu?","voice":"male"},{"who":"you","role":"You","ta":"ஆம்புலன்ஸ் கூப்பிடுங்க.","en":"Call an ambulance.","pron":"ambulance koopidunga","voice":"female"},{"who":"them","role":"Passerby","ta":"கவலைப்படாதீங்க, கூப்பிட்டுட்டேன்.","en":"Don''t worry, I''ve called.","pron":"kavalaipadaadheenga, koopittutten","voice":"male"}]'::jsonb)
on conflict (id) do nothing;

insert into route_guides (id, title, emoji, points) values
  ('rg1', 'Chennai Metro 101', '🚇', ARRAY['Two lines: Blue (Airport ↔ Wimco Nagar) and Green (Chennai Central ↔ St. Thomas Mount).','Buy a Singara Chennai smart card — 20% cheaper than tokens.','Fares ₹10–₹60. Trains run 5 AM to 11 PM, every 5–10 minutes.']::text[]),
  ('rg2', 'MTC buses without fear', '🚌', ARRAY['Ordinary (white) is cheapest, deluxe (green) costs a bit more, express (blue) skips stops.','Fares start at ₹5. Tell the conductor your stop, keep change ready.','Useful routes: 21G (Broadway–Thiruvanmiyur), 5C (Besant Nagar), 23C (Adyar).']::text[]),
  ('rg3', 'Suburban trains', '🚆', ARRAY['Beach–Tambaram and Beach–Chengalpattu lines cover most student areas.','₹5–₹20 tickets, fastest way to Tambaram during traffic hours.','Buy a monthly season ticket with your college ID — under ₹200.']::text[])
on conflict (id) do nothing;

insert into colleges (name) values
  ('Anna University'),
  ('MCC'),
  ('SRM'),
  ('IIT Madras')
on conflict (name) do nothing;

insert into posts (author_name, college_name, tag, body, likes_count, comments_count) values
  ('Divya R.', 'Anna University', 'Cheap food', 'Guindy Night Canteen does kothu parotta for ₹70 till 3 AM. Saved my whole submission week.', 128, 14),
  ('Aakash M.', 'MCC', 'Transport hack', 'Get a Chennai Metro student travel card — daily pass at ₹50 for unlimited rides beats autos.', 302, 41),
  ('Fatima S.', 'SRM', 'Hidden gem', 'Semmozhi Poonga at 7 AM is empty, ₹25 entry, and perfect for exam revision.', 96, 8),
  ('Nikhil P.', 'IIT Madras', 'Laundry', 'Anna Dhobi Point does ₹40/kg on monthly bundles. Cheapest near Kotturpuram, no pickup though.', 74, 11);

commit;