-- Enable Admins to see all profiles (Critical for Members Page)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Enable Admins to see all club memeberships
DROP POLICY IF EXISTS "Admins can view all club members" ON public.club_members;
CREATE POLICY "Admins can view all club members" ON public.club_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Enable Admins to delete profiles (Fire members)
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Enable Admins to delete club memberships (Remove from club)
DROP POLICY IF EXISTS "Admins can delete club members" ON public.club_members;
CREATE POLICY "Admins can delete club members" ON public.club_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Fix for self-viewing (Users should always see their own profile)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Ensure profiles is publicly readable if necessary for avatars/names in public pages
-- (Optional: remove comment if you want strict public logic)
-- CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
--   FOR SELECT USING (true);
