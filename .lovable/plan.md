

# Fix Discord Verification System

## Root Cause Analysis

Two distinct issues found from the edge function logs and database:

### Issue 1: Duplicate `discord_id` unique constraint violation
The edge function log shows:
```
duplicate key value violates unique constraint "user_profiles_discord_id_key"
Key (discord_id)=(910214940164522024) already exists.
```
The `discord_id` column has a **UNIQUE constraint**. The same Discord account (`910214940164522024`) is already linked to user `1a99c9de-...` (likely your other email `immortalwar033@gmail.com`). When your current account (`immortalwar333@gmail.com`) tries to verify, the upsert uses `onConflict: "user_id"` but the conflict is actually on `discord_id` — causing the insert to fail and returning `db_error`.

### Issue 2: Accounts table INSERT blocked
The `accounts` INSERT RLS policy requires `is_discord_verified(auth.uid())`. Since verification failed, account creation also fails, causing the flood of "Failed to create account" toasts.

## Fix Plan

### 1. Database migration: Drop the UNIQUE constraint on `discord_id`
Allow the same Discord account to be linked to multiple app accounts (or alternatively, before linking, clear the old link).

```sql
ALTER TABLE public.user_profiles 
DROP CONSTRAINT user_profiles_discord_id_key;
```

### 2. Edge function: Handle discord_id reassignment
Before upserting, clear the `discord_id` from any other profile that currently holds it — effectively "moving" the Discord link to the new user account.

In `supabase/functions/discord-auth/index.ts`, before each upsert (lines 142-154 and 170-181), add:
```typescript
// Clear discord_id from any other user who has it
await supabase
  .from("user_profiles")
  .update({ discord_id: null, discord_verified: false, discord_verified_at: null })
  .eq("discord_id", discordUser.id)
  .neq("user_id", userId);
```

### 3. Redeploy the edge function
Deploy the updated `discord-auth` function so changes take effect.

## Files to Change
1. **New migration SQL** — drop `user_profiles_discord_id_key` unique constraint
2. **`supabase/functions/discord-auth/index.ts`** — add discord_id cleanup before upsert
3. **Deploy** edge function

## What This Fixes
- Discord verification will succeed even if the Discord account was previously linked to another app user
- The user will be redirected with `?discord_verified=true` instead of `?discord_error=db_error`
- Account creation will unblock since `is_discord_verified()` will return true

