-- Create a feedbacks table linked to profiles
CREATE TABLE IF NOT EXISTS feedbacks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    message TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Linked to profiles.id
    status TEXT DEFAULT 'pending'
);

-- Enable RLS
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to INSERT feedback
CREATE POLICY "Authenticated users can insert feedbacks" ON feedbacks
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow Admins to VIEW all feedbacks
CREATE POLICY "Admins can view all feedbacks" ON feedbacks
  FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
