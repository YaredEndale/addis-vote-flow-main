-- Enable RLS on events table (if not already enabled, good practice)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Allow public read access to events
CREATE POLICY "Public events are viewable by everyone"
ON public.events
FOR SELECT
USING (true);

-- Allow authenticated users (admins) to insert/update/delete events
-- Adjust this based on your actual admin role requirements
-- For now, allowing all authenticated users to edit events (assuming only admins access the dashboard)
-- Ideally, checking for a specific role or email is safer.

CREATE POLICY "Authenticated users can manage events"
ON public.events
FOR ALL
USING (auth.role() = 'authenticated');
