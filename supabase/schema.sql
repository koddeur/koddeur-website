-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).

create table if not exists public.article_views (
  slug text primary key,
  views integer not null default 0
);

-- Atomic upsert-increment: avoids a read-then-write race between concurrent visitors.
create or replace function public.increment_article_views(article_slug text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_views integer;
begin
  insert into public.article_views (slug, views)
  values (article_slug, 1)
  on conflict (slug) do update set views = article_views.views + 1
  returning views into new_views;
  return new_views;
end;
$$;

-- Row Level Security: the app only ever talks to Supabase with the service role key
-- (server-side only), which bypasses RLS. Enabling it here just means no anonymous
-- client-side key could read/write this table even if one were ever introduced.
alter table public.article_views enable row level security;

-- Contact messages sent from the /home laptop (shown in /admin/messages).
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null check (char_length(email) <= 200),
  message text not null check (char_length(message) between 10 and 2000),
  read boolean not null default false,
  -- SHA-256 of the sender IP + AUTH_SECRET: lets the API rate-limit without storing raw IPs.
  ip_hash text not null
);

create index if not exists contact_messages_ip_recent on public.contact_messages (ip_hash, created_at desc);

-- Same rule as article_views: only the server-side service role key touches this table.
alter table public.contact_messages enable row level security;

-- Subject of a contact message (preset choice or free text when "Autre" is picked).
alter table public.contact_messages add column if not exists subject text not null default '' check (char_length(subject) <= 120);
