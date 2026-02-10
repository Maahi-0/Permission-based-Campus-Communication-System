-- FINAL VISIBILITY FIX: Ensuring all data is visible to registered students
-- This script fixes RLS for Profiles, Events, and Club Memberships.

-- 1. Profiles: Allow all authenticated users to browse the directory
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "general_read_policy" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual read" ON public.profiles;

CREATE POLICY "Allow all members to view profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

-- 2. Events: Ensure approved events are visible to all students
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Approved events are viewable by everyone" ON public.events;
DROP POLICY IF EXISTS "Published events are viewable by everyone" ON public.events;

CREATE POLICY "View verified events" ON public.events
  FOR SELECT TO authenticated
  USING (status = 'published' AND is_admin_approved = TRUE);

-- 3. Club Memberships: Allow students to see who belongs to which club
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view club members" ON public.club_members;
DROP POLICY IF EXISTS "Admins can view all club members" ON public.club_members;

CREATE POLICY "View club affiliations" ON public.club_members
  FOR SELECT TO authenticated
  USING (true);

-- 4. Clubs: Ensure students can see all verified clubs
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public clubs are viewable by everyone" ON public.clubs;

CREATE POLICY "View verified clubs" ON public.clubs
  FOR SELECT TO authenticated
  USING (is_approved = TRUE);

-- 5. Debug Helper: Ensure there are no leftover broken policies
COMMIT;
