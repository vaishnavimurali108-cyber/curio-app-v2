-- Run this AFTER you've signed up one curator account through the app itself
-- (e.g. curator@curio.test). Then replace CURATOR_ID below with that user's id,
-- which you can find in Supabase > Authentication > Users, or by running:
--   select id, email from auth.users;

-- Example replace: '00000000-0000-0000-0000-000000000000' -> your curator's uuid

insert into public.experiences
  (curator_id, title, description, category, format, location, event_date, event_time, price, capacity, is_exclusive, image_url)
values
  ('00000000-0000-0000-0000-000000000000',
   'After Hours at the City Museum',
   'A quiet, docent-led walk through the natural history wing after closing time — no crowds, just the fossils and you.',
   'History', 'Museum Tour', 'City Museum, Main Hall', current_date + interval '5 days', '7:00 PM',
   499, 20, false, null),

  ('00000000-0000-0000-0000-000000000000',
   'The Physics of Bread: A Lecdem',
   'A baker and a food scientist demonstrate why dough rises the way it does — with actual loaves coming out of the oven mid-talk.',
   'Science', 'Lecdem', 'Community Kitchen Lab', current_date + interval '9 days', '5:30 PM',
   349, 25, false, null),

  ('00000000-0000-0000-0000-000000000000',
   'Old City Walking Tour: Doors & Facades',
   'Two hours of wandering the old quarter, looking only at doorways — what they tell you about who lived behind them.',
   'Architecture', 'Walking Tour', 'Old City Gate', current_date + interval '3 days', '4:00 PM',
   199, 15, false, null),

  ('00000000-0000-0000-0000-000000000000',
   'Roundtable: The Ethics of Restoration',
   'An exclusive, small-table conversation with a conservator and an art historian on who gets to decide what "original" means.',
   'Art', 'Roundtable', 'The Reading Room', current_date + interval '12 days', '6:30 PM',
   1299, 10, true, null),

  ('00000000-0000-0000-0000-000000000000',
   'Letterpress Workshop: Set Your Own Type',
   'Hands on a real Vandercook press, setting and printing a short piece of type to take home.',
   'Craft', 'Workshop', 'Print Studio', current_date + interval '7 days', '11:00 AM',
   799, 12, false, null);
