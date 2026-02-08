
-- Add Discord verification fields to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS discord_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS discord_username TEXT,
ADD COLUMN IF NOT EXISTS discord_verified BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS discord_verified_at TIMESTAMPTZ;

-- Create security definer function to check Discord verification
CREATE OR REPLACE FUNCTION public.is_discord_verified(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT discord_verified FROM public.user_profiles WHERE user_id = user_uuid),
    false
  );
$$;
