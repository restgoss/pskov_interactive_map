-- Districts of Pskov oblast (slug as primary key)
create table if not exists public.districts (
  id           text primary key,
  name         text not null,
  description  text,
  coat_url     text,
  created_at   timestamptz not null default now()
);

-- Attractions
create table if not exists public.attractions (
  id           uuid primary key default gen_random_uuid(),
  district_id  text not null references public.districts(id) on delete cascade,
  title        text not null,
  description  text,
  image_url    text,
  lng          double precision,
  lat          double precision,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

create index if not exists attractions_district_id_idx on public.attractions(district_id);

-- Reviews (no auth — anonymous with name + email)
create table if not exists public.reviews (
  id             uuid primary key default gen_random_uuid(),
  attraction_id  uuid not null references public.attractions(id) on delete cascade,
  user_name      text not null check (length(user_name) between 1 and 80),
  user_email     text not null check (user_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  rating         integer not null check (rating between 1 and 5),
  text           text not null check (length(text) between 1 and 4000),
  created_at     timestamptz not null default now()
);

create index if not exists reviews_attraction_id_idx on public.reviews(attraction_id, created_at desc);

-- Row Level Security
alter table public.districts   enable row level security;
alter table public.attractions enable row level security;
alter table public.reviews     enable row level security;

-- Public read for districts/attractions
drop policy if exists "districts_read_all"   on public.districts;
drop policy if exists "attractions_read_all" on public.attractions;
drop policy if exists "reviews_read_all"     on public.reviews;
drop policy if exists "reviews_insert_anon"  on public.reviews;

create policy "districts_read_all"   on public.districts   for select using (true);
create policy "attractions_read_all" on public.attractions for select using (true);
create policy "reviews_read_all"     on public.reviews     for select using (true);

-- Anyone (anon role) can insert reviews
create policy "reviews_insert_anon" on public.reviews
  for insert
  with check (true);
