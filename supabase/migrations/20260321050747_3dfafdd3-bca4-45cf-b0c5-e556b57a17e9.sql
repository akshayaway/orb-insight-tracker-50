
-- Add share_id and is_public_journal to user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS share_id text UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  ADD COLUMN IF NOT EXISTS is_public_journal boolean NOT NULL DEFAULT false;

-- Index for fast lookups by share_id
CREATE INDEX IF NOT EXISTS idx_user_profiles_share_id ON public.user_profiles(share_id);

-- Backfill existing rows that might have NULL share_id
UPDATE public.user_profiles SET share_id = encode(gen_random_bytes(12), 'hex') WHERE share_id IS NULL;

-- Make share_id NOT NULL after backfill
ALTER TABLE public.user_profiles ALTER COLUMN share_id SET NOT NULL;

-- Allow anyone to read a user_profile row by share_id when journal is public (for the public viewer)
CREATE POLICY "Anyone can read public journal profiles by share_id"
  ON public.user_profiles
  FOR SELECT
  USING (is_public_journal = true AND share_id IS NOT NULL);

-- Allow anyone to read accounts for public journal users
CREATE POLICY "Anyone can view accounts of public journal users"
  ON public.accounts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = accounts.user_id
        AND user_profiles.is_public_journal = true
    )
  );

-- Allow anyone to read trades for public journal users
CREATE POLICY "Anyone can view trades of public journal users"
  ON public.trades
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = trades.user_id
        AND user_profiles.is_public_journal = true
    )
  );
