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

-- โลโก้ทีม: PNG/JPG/JPEG ขนาดสูงสุด 2 MB
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('team-logos', 'team-logos', true, 2097152, array['image/png', 'image/jpeg'])
on conflict (id) do update set public = true, file_size_limit = 2097152, allowed_mime_types = array['image/png', 'image/jpeg'];

drop policy if exists "public logo access" on storage.objects;
drop policy if exists "admin upload logos" on storage.objects;
create policy "public logo access" on storage.objects for select using (bucket_id = 'team-logos');
create policy "admin upload logos" on storage.objects for insert to authenticated with check (bucket_id = 'team-logos');
