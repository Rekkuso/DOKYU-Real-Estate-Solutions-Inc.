-- ============================================================
-- Migration: Listing images support
-- Replaces the gradient column with an images JSONB array,
-- adds updated_at for edit tracking, and creates the
-- listing-images storage bucket.
-- Run this in the Supabase SQL Editor (or via supabase db push)
-- ============================================================

-- 1. Add images column (JSONB array of public URLs)
ALTER TABLE public.listing
  ADD COLUMN IF NOT EXISTS images JSONB NOT NULL DEFAULT '[]';

-- 2. Add updated_at column for tracking edits without touching the publish date
ALTER TABLE public.listing
  ADD COLUMN IF NOT EXISTS updated_at TEXT;

-- 3. Drop the gradient column (no longer needed)
ALTER TABLE public.listing
  DROP COLUMN IF EXISTS gradient;

-- 4. Create listing-images storage bucket (public read)
INSERT INTO storage.buckets (id, name, public)
  VALUES ('listing-images', 'listing-images', true)
  ON CONFLICT (id) DO NOTHING;

-- 5. Storage policies for listing-images bucket

-- Authenticated users (admins) can upload listing images
DROP POLICY IF EXISTS "Admins can upload listing images" ON storage.objects;
CREATE POLICY "Admins can upload listing images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listing-images'
    AND public.is_admin()
  );

-- Authenticated users (admins) can update listing images
DROP POLICY IF EXISTS "Admins can update listing images" ON storage.objects;
CREATE POLICY "Admins can update listing images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'listing-images'
    AND public.is_admin()
  );

-- Public read access for listing images
DROP POLICY IF EXISTS "Public read access on listing images" ON storage.objects;
CREATE POLICY "Public read access on listing images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-images');

-- Admins can delete listing images
DROP POLICY IF EXISTS "Admins can delete listing images" ON storage.objects;
CREATE POLICY "Admins can delete listing images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'listing-images'
    AND public.is_admin()
  );
