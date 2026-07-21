-- 006 — Reels pasan a ser videos propios subidos al storage, no links de Instagram
-- Correr a mano en el SQL Editor de Supabase. Es idempotente.

alter table reels alter column instagram_url drop not null;
alter table reels add column if not exists video_url text;
