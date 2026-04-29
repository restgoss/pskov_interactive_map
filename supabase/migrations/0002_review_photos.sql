-- =====================================================================
-- Review photo attachments
-- Run this in Supabase SQL editor (https://supabase.com/dashboard → SQL).
-- Rerunnable: every statement is idempotent.
-- =====================================================================

-- 1. New column on reviews — array of public URLs returned by storage.
alter table public.reviews
  add column if not exists photo_urls text[] not null default '{}';

-- 2. Storage bucket for the photos. Public so getPublicUrl() works without
--    signed URLs. Size + MIME limits live on the bucket itself, not in RLS,
--    because storage.objects.metadata is populated AFTER the INSERT and
--    is therefore unavailable to a WITH CHECK clause.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'review-photos',
  'review-photos',
  true,
  5242880,                                                  -- 5 MB
  array['image/jpeg','image/png','image/webp','image/heic','image/heif']
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 3. RLS policies for the bucket. Drop prior versions first so this
--    migration is rerunnable.
drop policy if exists "review_photos_read_all"     on storage.objects;
drop policy if exists "review_photos_insert_anon"  on storage.objects;

-- Anyone can view (bucket is public anyway, but this is the explicit policy).
create policy "review_photos_read_all" on storage.objects
  for select
  using (bucket_id = 'review-photos');

-- Anonymous uploads allowed. We only require the upload to land in the
-- right bucket inside an attraction-id folder. The bucket-level
-- file_size_limit + allowed_mime_types above enforce the size/type rules.
create policy "review_photos_insert_anon" on storage.objects
  for insert
  with check (
    bucket_id = 'review-photos'
    and (storage.foldername(name))[1] is not null
  );
