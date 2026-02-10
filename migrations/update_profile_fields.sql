-- Add education details to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS education_level TEXT CHECK (education_level IN ('Bachelors', 'Masters')),
ADD COLUMN IF NOT EXISTS degree TEXT,
ADD COLUMN IF NOT EXISTS academic_year TEXT;

-- Update the handle_new_user function to include these fields from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    email, 
    role, 
    avatar_url, 
    institute_name, 
    education_level, 
    degree, 
    academic_year
  )
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'institute_name',
    new.raw_user_meta_data->>'education_level',
    new.raw_user_meta_data->>'degree',
    new.raw_user_meta_data->>'academic_year'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
