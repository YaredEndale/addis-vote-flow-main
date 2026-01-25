
-- Create settings table for global configuration
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to settings
CREATE POLICY "Allow public read access to settings"
ON public.settings
FOR SELECT
USING (true);

-- Allow admins to update settings (using the same logic as other admin paths if exists, 
-- but since we don't have a robust role system shown yet, we'll allow authenticated for now 
-- or stick to a simple policy if we can't verify admin role)
-- Based on previous conversations, there might not be a formal 'admin' role in JWT yet,
-- so we'll allow authenticated users to update for now, or you might want to restrict this further.
CREATE POLICY "Allow authenticated users to update settings"
ON public.settings
FOR ALL
USING (auth.role() = 'authenticated');

-- Insert default voting status
INSERT INTO public.settings (key, value)
VALUES ('voting_active', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;
