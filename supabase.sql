-- Run this once in Supabase Dashboard > SQL Editor.
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 32),
  logo text not null default '',
  score integer not null default 0 check (score >= 0),
  created_at timestamptz not null default now()
);

alter table public.teams enable row level security;

create policy "public can view teams" on public.teams
for select using (true);

create policy "signed-in admins manage teams" on public.teams
for all to authenticated using (true) with check (true);

alter publication supabase_realtime add table public.teams;
