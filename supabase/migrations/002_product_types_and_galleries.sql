-- 002 — Tipos de producto (anime DVD) + galería de artistas
-- Correr a mano en el SQL Editor de Supabase. Es idempotente: se puede
-- correr más de una vez sin romper nada.

-- ────────────────────────────────────────────
-- ALBUMS: tipo de producto + atributos flexibles
-- ────────────────────────────────────────────
alter table albums add column if not exists product_type text not null default 'music';
alter table albums add column if not exists attributes jsonb default '{}';

-- Columnas que el código ya usa (label_country, format) pero que no estaban
-- en el schema.sql original — se documentan acá por si el proyecto live no
-- las tiene todavía.
alter table albums add column if not exists label_country text default '';
alter table albums add column if not exists format text default '';

alter table albums drop constraint if exists albums_product_type_check;
alter table albums add constraint albums_product_type_check
  check (product_type in ('music', 'anime_dvd'));

-- ────────────────────────────────────────────
-- ARTISTS: galería de fotos adicionales
-- ────────────────────────────────────────────
alter table artists add column if not exists gallery jsonb default '[]';
