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
