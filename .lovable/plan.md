

# Clean Journal Share URLs with Username Slugs

## Current State
URLs look like: `propfirmknowledgejournal.in/journal/share/9f3388167f57a714e63e1a48`

## Target
URLs like: `propfirmknowledgejournal.in/journal/share/immortalwar`

## Plan

### 1. Database: Add `journal_slug` column
- Add a `journal_slug` text column (unique, nullable) to `user_profiles`
- Backfill from `discord_username` (lowercased, stripped of special chars)
- Create a trigger that auto-sets `journal_slug` from `discord_username` whenever it's updated (via Discord verification)
- Update the existing RLS "anyone can read public journal" policy to also match by `journal_slug`

### 2. Edge Function: Set slug on Discord verification
- In `discord-auth/index.ts`, when upserting the profile after verification, also set `journal_slug` to a sanitized version of the Discord username

### 3. Hook: Look up by slug instead of share_id
- Update `usePublicJournal.ts` to query `journal_slug` instead of `share_id` when the URL param doesn't look like a hex string (support both for backward compatibility)

### 4. Share button: Show clean URL
- Update `ShareJournalButton.tsx` to fetch and display the `journal_slug`-based URL instead of the `share_id` URL
- Fallback to `share_id` URL if no slug exists

### 5. Route stays the same
- `/journal/share/:shareId` route unchanged — the param just becomes a username slug instead of a hex ID

## Files to Change
1. **New migration** — add `journal_slug` column, backfill, trigger
2. **`supabase/functions/discord-auth/index.ts`** — set `journal_slug` on verification
3. **`src/hooks/usePublicJournal.ts`** — support slug lookup
4. **`src/components/ShareJournalButton.tsx`** — display slug-based URL

