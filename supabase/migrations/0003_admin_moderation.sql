-- =====================================================================
-- Admin moderation
-- Run in Supabase SQL Editor.
--
-- Steps to enable admin access:
--   1. In the Supabase Dashboard go to Auth → Users → "Add user".
--      Create the admin account with email + password (NOT magic link).
--   2. Disable open signups: Auth → Providers → Email → "Enable Sign-ups" OFF.
--   3. Run this migration.
--   4. Insert the admin's UUID into public.admins:
--        insert into public.admins(user_id) values ('<paste-user-id-here>');
--      (You can copy the user id from Auth → Users.)
-- =====================================================================

-- 1. Whitelist of admin user ids. One row per admin.
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

drop policy if exists "admins_self_read" on public.admins;
-- Each admin can read their own row to verify status. No write policies for
-- anon/authenticated — admin rows are managed via SQL only.
create policy "admins_self_read" on public.admins
  for select
  using (user_id = auth.uid());

-- 2. is_admin() — used by RLS policies elsewhere. SECURITY DEFINER so it
--    can read public.admins regardless of caller's RLS view.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- 3. Tighten review visibility / writability.
--    Public users only see approved reviews. Admins see everything and can
--    update status_id.
drop policy if exists "reviews_read_all"     on public.reviews;
drop policy if exists "reviews_read_public"  on public.reviews;
drop policy if exists "reviews_read_admin"   on public.reviews;
drop policy if exists "reviews_update_admin" on public.reviews;

-- Anon + authenticated: only approved reviews are visible.
create policy "reviews_read_public" on public.reviews
  for select
  using (status_id = 'approved' or public.is_admin());

-- Admins can update any review (used to flip status_id).
create policy "reviews_update_admin" on public.reviews
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- 4. Helpful index for the admin queue (most-recent pending first).
create index if not exists reviews_status_created_idx
  on public.reviews (status_id, created_at desc);
