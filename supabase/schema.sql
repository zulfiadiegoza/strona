-- Tabela filmów
create table if not exists public.movies (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  url text not null,
  version text not null default 'CAM' check (version in ('CAM', 'ENG', 'PL_NAPISY', 'POLSKI')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Automatyczna aktualizacja updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_movies_updated_at on public.movies;
create trigger update_movies_updated_at
  before update on public.movies
  for each row
  execute function public.update_updated_at_column();

-- Row Level Security
alter table public.movies enable row level security;

drop policy if exists "Movies are viewable by everyone" on public.movies;
create policy "Movies are viewable by everyone"
  on public.movies for select
  using (true);

drop policy if exists "Authenticated users can insert movies" on public.movies;
create policy "Authenticated users can insert movies"
  on public.movies for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update movies" on public.movies;
create policy "Authenticated users can update movies"
  on public.movies for update
  to authenticated
  using (true);

drop policy if exists "Authenticated users can delete movies" on public.movies;
create policy "Authenticated users can delete movies"
  on public.movies for delete
  to authenticated
  using (true);

create or replace view public.movies_public_list as
select
  id,
  title,
  version,
  created_at,
  updated_at
from public.movies;

grant select on public.movies_public_list to anon, authenticated;
