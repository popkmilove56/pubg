-- Run this once in Supabase Dashboard > SQL Editor.
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 32),
  logo text not null default '',
  score integer not null default 0 check (score >= 0),
  kills integer not null default 0 check (kills >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Safe for projects that created the teams table before KILLS was added.
alter table public.teams add column if not exists kills integer not null default 0 check (kills >= 0);
alter table public.teams add column if not exists active boolean not null default true;

-- A tournament has one live map at a time. Live and completed maps contribute to standings.
create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 64),
  category text not null default 'Uncategorized' check (char_length(category) between 1 and 32),
  team_ids uuid[] not null default '{}',
  team_slots jsonb not null default '[]'::jsonb,
  total_maps integer not null check (total_maps between 1 and 20),
  current_map integer not null default 1,
  status text not null default 'active' check (status in ('active','complete','archived')),
  created_at timestamptz not null default now()
);

alter table public.tournaments add column if not exists category text not null default 'Uncategorized' check (char_length(category) between 1 and 32);
alter table public.tournaments add column if not exists team_ids uuid[] not null default '{}';
alter table public.tournaments add column if not exists team_slots jsonb not null default '[]'::jsonb;
alter table public.tournaments drop constraint if exists tournaments_status_check;
alter table public.tournaments add constraint tournaments_status_check check (status in ('active','complete','archived'));

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 32),
  created_at timestamptz not null default now()
);

create table if not exists public.maps (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  map_number integer not null check (map_number > 0),
  status text not null default 'live' check (status in ('live','completed')),
  created_at timestamptz not null default now(),
  unique (tournament_id, map_number)
);

create table if not exists public.map_scores (
  id uuid primary key default gen_random_uuid(),
  map_id uuid not null references public.maps(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  kills integer not null default 0 check (kills >= 0),
  placement_points integer not null default 0 check (placement_points >= 0),
  created_at timestamptz not null default now(),
  unique (map_id, team_id)
);

-- Migration for a database created with the earlier draft/saved map workflow.
alter table public.maps drop constraint if exists maps_status_check;
update public.maps set status = case status when 'draft' then 'live' when 'saved' then 'completed' else status end;
-- Keep legacy values valid during migration, so a partially upgraded project
-- can still create the current live map without a constraint error.
alter table public.maps add constraint maps_status_check check (status in ('draft','saved','live','completed'));

alter table public.tournaments enable row level security;
alter table public.categories enable row level security;
alter table public.maps enable row level security;
alter table public.map_scores enable row level security;

drop policy if exists "public can view tournaments" on public.tournaments;
drop policy if exists "admins manage tournaments" on public.tournaments;
create policy "public can view tournaments" on public.tournaments for select using (true);
create policy "admins manage tournaments" on public.tournaments for all to authenticated using (true) with check (true);

drop policy if exists "public can view categories" on public.categories;
drop policy if exists "admins manage categories" on public.categories;
create policy "public can view categories" on public.categories for select using (true);
create policy "admins manage categories" on public.categories for all to authenticated using (true) with check (true);

drop policy if exists "public can view maps" on public.maps;
drop policy if exists "admins manage maps" on public.maps;
create policy "public can view maps" on public.maps for select using (true);
create policy "admins manage maps" on public.maps for all to authenticated using (true) with check (true);

drop policy if exists "public can view map scores" on public.map_scores;
drop policy if exists "admins manage map scores" on public.map_scores;
create policy "public can view map scores" on public.map_scores for select using (true);
create policy "admins manage map scores" on public.map_scores for all to authenticated using (true) with check (true);

alter table public.teams enable row level security;

drop policy if exists "public can view teams" on public.teams;
drop policy if exists "signed-in admins manage teams" on public.teams;
create policy "public can view teams" on public.teams
for select using (true);

create policy "signed-in admins manage teams" on public.teams
for all to authenticated using (true) with check (true);

-- Add every live table once. Safe to run repeatedly.
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'teams') then
    alter publication supabase_realtime add table public.teams;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'categories') then
    alter publication supabase_realtime add table public.categories;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'tournaments') then
    alter publication supabase_realtime add table public.tournaments;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'maps') then
    alter publication supabase_realtime add table public.maps;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'map_scores') then
    alter publication supabase_realtime add table public.map_scores;
  end if;
end $$;

-- โลโก้ทีม: PNG/JPG/JPEG ขนาดสูงสุด 5 MB
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('team-logos', 'team-logos', true, 5242880, array['image/png', 'image/jpeg'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/png', 'image/jpeg'];

drop policy if exists "public logo access" on storage.objects;
drop policy if exists "admin upload logos" on storage.objects;
create policy "public logo access" on storage.objects for select using (bucket_id = 'team-logos');
create policy "admin upload logos" on storage.objects for insert to authenticated with check (bucket_id = 'team-logos');
