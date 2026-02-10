-- UNLOCK MEMBER DIRECTORY FOR STUDENTS
-- This script allows any logged-in user (Student, Lead, Admin) to VIEW profiles and club memberships.

-- 1. Allow everyone to see profiles (Names, Avatars, etc.)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles" ON public.profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');


-- 2. Allow everyone to see club memberships (so they can see who is in which club)
DROP POLICY IF EXISTS "Admins can view all club members" ON public.club_members;
DROP POLICY IF EXISTS "Authenticated users can view club members" ON public.club_members;

CREATE POLICY "Authenticated users can view club members" ON public.club_members
  FOR SELECT
  USING (auth.role() = 'authenticated');
