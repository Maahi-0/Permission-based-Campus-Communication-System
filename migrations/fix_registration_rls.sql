-- COMPREHENSIVE FIX FOR PROFILES RLS
-- This ensures registration (upsert) and viewing works for all users.

-- 1. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Clear existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- 3. Create Polished Policies

-- INSERT: Necessary for new registrations
-- Note: If you have a trigger, the row might already exist, so INSERT might not be called by frontend, but upsert needs it.
CREATE POLICY "Allow individual insert" ON public.profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- SELECT: Users see themselves, Admins see everyone, Students see verified members
CREATE POLICY "Allow individual read" ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id 
    OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR
    auth.role() = 'authenticated' -- Allow all logged in users to browse directory
  );

-- UPDATE: CRITICAL for upsert and profile editing
CREATE POLICY "Allow individual update" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- DELETE: Admin only
CREATE POLICY "Allow admin delete" ON public.profiles
  FOR DELETE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- 4. Verify Trigger exists (just in case it was deleted)
-- This ensures that even if frontend failes, auth metadata creates a profile.
-- We already have this in update_profile_fields.sql, but we ensure it's linked to the trigger.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;
