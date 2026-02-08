
-- Update trades INSERT policy to require Discord verification
DROP POLICY IF EXISTS "Users can create their own trades" ON trades;
CREATE POLICY "Users can create their own trades" ON trades
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.is_discord_verified(auth.uid()));

-- Update trades UPDATE policy to require Discord verification
DROP POLICY IF EXISTS "Users can update their own trades" ON trades;
CREATE POLICY "Users can update their own trades" ON trades
  FOR UPDATE
  USING (auth.uid() = user_id AND public.is_discord_verified(auth.uid()));

-- Update trades DELETE policy to require Discord verification
DROP POLICY IF EXISTS "Users can delete their own trades" ON trades;
CREATE POLICY "Users can delete their own trades" ON trades
  FOR DELETE
  USING (auth.uid() = user_id AND public.is_discord_verified(auth.uid()));

-- Update accounts INSERT policy to require Discord verification
DROP POLICY IF EXISTS "Users can create their own accounts" ON accounts;
CREATE POLICY "Users can create their own accounts" ON accounts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.is_discord_verified(auth.uid()));

-- Update accounts UPDATE policy to require Discord verification
DROP POLICY IF EXISTS "Users can update their own accounts" ON accounts;
CREATE POLICY "Users can update their own accounts" ON accounts
  FOR UPDATE
  USING (auth.uid() = user_id AND public.is_discord_verified(auth.uid()));

-- Update accounts DELETE policy to require Discord verification
DROP POLICY IF EXISTS "Users can delete their own accounts" ON accounts;
CREATE POLICY "Users can delete their own accounts" ON accounts
  FOR DELETE
  USING (auth.uid() = user_id AND public.is_discord_verified(auth.uid()));
