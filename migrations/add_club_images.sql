-- Add image columns to clubs table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.clubs 
ADD COLUMN IF NOT EXISTS cover_image text,
ADD COLUMN IF NOT EXISTS logo_url text;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
