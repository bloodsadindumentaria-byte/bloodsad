-- 004 — Reels de Instagram vinculados a álbumes/animes y artistas
-- Correr a mano en el SQL Editor de Supabase. Es idempotente.

create table if not exists reels (
  id            uuid primary key default gen_random_uuid(),
  instagram_url text not null,
  album_id      uuid references albums(id) on delete set null,
  artist_id     uuid references artists(id) on delete set null,
  views         integer,
  likes         integer,
  sort_order    integer not null default 0,
  created_at    timestamptz default now()
);

alter table reels enable row level security;

drop policy if exists "Public read reels" on reels;
create policy "Public read reels" on reels for select using (true);

drop policy if exists "Auth manage reels" on reels;
create policy "Auth manage reels" on reels for all using (auth.role() = 'authenticated');
