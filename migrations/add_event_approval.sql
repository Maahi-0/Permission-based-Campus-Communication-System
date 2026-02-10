-- Add is_admin_approved column to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS is_admin_approved BOOLEAN DEFAULT FALSE;

-- Update existing events to be approved (so they don't disappear)
UPDATE public.events SET is_admin_approved = TRUE;

-- Add RLS policy for admins to approve/manage all events
CREATE POLICY "Admins can manage all events" ON public.events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Update student event visibility to only see admin-approved events
DROP POLICY IF EXISTS "Published events are viewable by everyone" ON public.events;
CREATE POLICY "Approved events are viewable by everyone" ON public.events
  FOR SELECT USING (
    status = 'published' AND 
    is_admin_approved = TRUE
  );
