-- Curio schema: run this once in Supabase SQL Editor (Project > SQL Editor > New query)

-- 1. Profiles ---------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null default 'learner' check (role in ('learner', 'curator')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up.
-- Reads role/full_name out of the signup metadata we pass from the client.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'learner')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Experiences (the core entity) ------------------------------------------
create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  curator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  category text not null default 'General',
  format text not null default 'Museum Tour'
    check (format in ('Museum Tour','Lecdem','Walking Tour','Roundtable','Workshop')),
  location text not null default '',
  event_date date not null,
  event_time text not null default '',
  price numeric not null default 0,
  capacity int not null default 20,
  spots_taken int not null default 0,
  image_url text,
  is_exclusive boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.experiences enable row level security;

create policy "Experiences are viewable by everyone"
  on public.experiences for select
  using (true);

create policy "Curators can insert their own experiences"
  on public.experiences for insert
  with check (auth.uid() = curator_id);

create policy "Curators can update their own experiences"
  on public.experiences for update
  using (auth.uid() = curator_id);

create policy "Curators can delete their own experiences"
  on public.experiences for delete
  using (auth.uid() = curator_id);

-- 3. Bookings (the core business-flow join table) ---------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.experiences(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'confirmed' check (status in ('confirmed','cancelled')),
  created_at timestamptz not null default now(),
  unique (experience_id, user_id)
);

alter table public.bookings enable row level security;

create policy "Users can view their own bookings"
  on public.bookings for select
  using (auth.uid() = user_id);

create policy "Curators can view bookings for their experiences"
  on public.bookings for select
  using (
    exists (
      select 1 from public.experiences e
      where e.id = experience_id and e.curator_id = auth.uid()
    )
  );

create policy "Users can create their own bookings"
  on public.bookings for insert
  with check (auth.uid() = user_id);

create policy "Users can cancel their own bookings"
  on public.bookings for update
  using (auth.uid() = user_id);

-- Keep spots_taken in sync automatically
create or replace function public.handle_booking_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (tg_op = 'INSERT' and new.status = 'confirmed') then
    update public.experiences set spots_taken = spots_taken + 1 where id = new.experience_id;
  elsif (tg_op = 'UPDATE' and old.status = 'confirmed' and new.status = 'cancelled') then
    update public.experiences set spots_taken = greatest(spots_taken - 1, 0) where id = new.experience_id;
  elsif (tg_op = 'UPDATE' and old.status = 'cancelled' and new.status = 'confirmed') then
    update public.experiences set spots_taken = spots_taken + 1 where id = new.experience_id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_booking_change on public.bookings;
create trigger on_booking_change
  after insert or update on public.bookings
  for each row execute procedure public.handle_booking_change();
