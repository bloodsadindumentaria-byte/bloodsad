-- Roman Wrest Distro — Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ────────────────────────────────────────────
-- GENRES
-- ────────────────────────────────────────────
create table if not exists genres (
  id   uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

-- ────────────────────────────────────────────
-- ARTISTS
-- ────────────────────────────────────────────
create table if not exists artists (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  bio_es       text default '',
  bio_en       text default '',
  origin       text default '',
  genres       text[] default '{}',
  social_links jsonb default '{}',
  image_url    text,
  gallery      jsonb default '[]'
);

-- ────────────────────────────────────────────
-- ALBUMS
-- ────────────────────────────────────────────
create table if not exists albums (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  title          text not null,
  artist_id      uuid references artists(id) on delete set null,
  year           integer,
  label          text default '',
  label_country  text default '',
  format         text default '',
  description_es text default '',
  description_en text default '',
  tracklist      jsonb default '[]',
  condition      text check (condition in ('mint','near_mint','very_good_plus','very_good','good','fair','poor')) default 'very_good',
  price          numeric(10,2) not null default 0,
  currency       text check (currency in ('ARS','USD','EUR')) default 'ARS',
  sold           boolean not null default false,
  images         jsonb default '[]',
  genre_id       uuid references genres(id) on delete set null,
  product_type   text not null default 'music' check (product_type in ('music','anime_dvd')),
  attributes     jsonb default '{}',
  created_at     timestamptz default now()
);

-- ────────────────────────────────────────────
-- ORDERS
-- ────────────────────────────────────────────
create table if not exists orders (
  id           uuid primary key default gen_random_uuid(),
  album_id     uuid references albums(id) on delete set null,
  buyer_email  text not null,
  buyer_name   text not null,
  payment_id   text,
  status       text check (status in ('pending','paid','shipped','cancelled')) default 'pending',
  created_at   timestamptz default now()
);

-- ────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ────────────────────────────────────────────

-- Public read access
alter table genres  enable row level security;
alter table artists enable row level security;
alter table albums  enable row level security;
alter table orders  enable row level security;

create policy "Public read genres"  on genres  for select using (true);
create policy "Public read artists" on artists for select using (true);
create policy "Public read albums"  on albums  for select using (true);

-- Authenticated users can manage everything (admin)
create policy "Auth manage genres"  on genres  for all using (auth.role() = 'authenticated');
create policy "Auth manage artists" on artists for all using (auth.role() = 'authenticated');
create policy "Auth manage albums"  on albums  for all using (auth.role() = 'authenticated');
create policy "Auth manage orders"  on orders  for all using (auth.role() = 'authenticated');

-- ────────────────────────────────────────────
-- SEED DATA (opcional, para testing)
-- ────────────────────────────────────────────

insert into genres (name, slug) values
  ('Black Metal', 'black-metal'),
  ('Death Metal', 'death-metal'),
  ('Doom Metal', 'doom-metal'),
  ('Thrash Metal', 'thrash-metal'),
  ('Heavy Metal', 'heavy-metal')
on conflict (slug) do nothing;
