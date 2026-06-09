-- ============================================================
-- BAZA FILMOW - kompletny skrypt SQL dla Supabase
-- Wklej calosc w: Supabase -> SQL Editor -> Run
-- Bezpieczny do wielokrotnego uruchomienia (idempotentny)
-- ============================================================

-- 1. Tabela movies
create table if not exists public.movies (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  url text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. Stara pojedyncza kolumna version (zostaje tylko dla migracji wstecznej)
alter table public.movies
  add column if not exists version text not null default 'CAM';

-- 3. Migracja starej wartosci ENG_NAPISY -> PL_NAPISY
update public.movies
  set version = 'PL_NAPISY'
  where version = 'ENG_NAPISY';

-- 4. Nowe pola: podtytul/inne nazwy oraz kilka wersji naraz
alter table public.movies
  add column if not exists subtitle text;

alter table public.movies
  add column if not exists versions text[];

update public.movies
  set versions = array[version]
  where version is not null
    and (versions is null or cardinality(versions) = 0);

update public.movies
  set versions = array_replace(versions, 'ENG_NAPISY', 'PL_NAPISY')
  where versions @> array['ENG_NAPISY']::text[];

update public.movies
  set versions = array['CAM']::text[]
  where versions is null or cardinality(versions) = 0;

alter table public.movies
  alter column versions set default array['CAM']::text[],
  alter column versions set not null;

-- 5. Kolumny autora (kto dodal film)
alter table public.movies
  add column if not exists added_by_id text,
  add column if not exists added_by_email text,
  add column if not exists added_by_name text;

-- 6. Ograniczenie dozwolonych wersji
alter table public.movies drop constraint if exists movies_version_check;
alter table public.movies drop constraint if exists movies_versions_check;
alter table public.movies
  add constraint movies_versions_check
  check (
    cardinality(versions) > 0
    and versions <@ array['CAM', 'ENG', 'PL_NAPISY', 'POLSKI']::text[]
  );

-- 7. Automatyczna aktualizacja updated_at przy edycji
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

-- 8. Row Level Security (RLS)
alter table public.movies enable row level security;

-- Odczyt publiczny (bot Discord + strona)
drop policy if exists "Movies are viewable by everyone" on public.movies;
create policy "Movies are viewable by everyone"
  on public.movies for select
  using (true);

-- Zapis tylko dla zalogowanych uzytkownikow
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

-- 9. Widok publiczny (bez url) dla strony /lista
create or replace view public.movies_public_list as
select
  id,
  title,
  subtitle,
  versions,
  created_at,
  updated_at,
  added_by_name,
  added_by_email
from public.movies;

grant select on public.movies_public_list to anon, authenticated;
