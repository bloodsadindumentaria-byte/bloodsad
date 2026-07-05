-- 003 — Discos/animes con múltiples géneros
-- Correr a mano en el SQL Editor de Supabase. Es idempotente: se puede
-- correr más de una vez sin romper nada.

-- ────────────────────────────────────────────
-- Tabla puente album_genres (muchos a muchos)
-- ────────────────────────────────────────────
create table if not exists album_genres (
  album_id uuid not null references albums(id) on delete cascade,
  genre_id uuid not null references genres(id) on delete cascade,
  primary key (album_id, genre_id)
);

alter table album_genres enable row level security;

drop policy if exists "Public read album_genres" on album_genres;
create policy "Public read album_genres" on album_genres for select using (true);

drop policy if exists "Auth manage album_genres" on album_genres;
create policy "Auth manage album_genres" on album_genres for all using (auth.role() = 'authenticated');

-- ────────────────────────────────────────────
-- Backfill: copia el género único que ya tenía cada álbum/anime
-- ────────────────────────────────────────────
insert into album_genres (album_id, genre_id)
select id, genre_id from albums where genre_id is not null
on conflict do nothing;

-- La columna albums.genre_id queda en la tabla como dato histórico,
-- pero la app ya no la lee ni la escribe — el género (o géneros) de
-- cada álbum vive de acá en más en album_genres.
