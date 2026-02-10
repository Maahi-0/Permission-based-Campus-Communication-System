-- Add missing INSERT policy for profiles
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Fix storage policy for avatars (path was mismatching page.jsx)
-- The page.jsx uses avatars/{fileName} but the policy expects {uid}/{fileName}
-- We update the policy to allow uploads to the avatars/ folder if the filename starts with the user ID
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profiles' AND 
    (
      -- Standard uid folder check
      auth.uid()::text = (storage.foldername(name))[1]
      OR
      -- Or check if filename starts with uid (to match page.jsx logic)
      name LIKE 'avatars/' || auth.uid()::text || '%'
    )
  );

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profiles' AND 
    (
      auth.uid()::text = (storage.foldername(name))[1]
      OR
      name LIKE 'avatars/' || auth.uid()::text || '%'
    )
  );
