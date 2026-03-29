

# Fix Discord OAuth Redirect Mismatch

## Problem
The edge function's callback redirect back to the app fails because it relies on `origin`/`referer` headers, which are absent on redirects from Discord. This causes users to land on a broken URL after authorizing.

## Root Cause
In `supabase/functions/discord-auth/index.ts`:
- Line 162-163: `req.headers.get("origin") || req.headers.get("referer")` — Discord's redirect has no such headers, so `baseUrl` is empty, and users get redirected to `/?discord_verified=true` (relative to the Supabase function URL, not the app).
- Line 291-295: `redirectWithError` also redirects to `/?discord_error=...` without a proper app base URL.

## Fix (2 changes, 1 file)

### 1. Encode the app origin in the OAuth state parameter
In the `action === "login"` branch, the client-side request includes the app's origin. Store it in the state so the callback knows where to redirect.

**Edge function — login step:**
- Accept an `origin` query param from the client request (or derive from `referer` header which IS present on the initial API call from the app)
- Include it in the base64 state: `{ userId, ts, appOrigin }`

**Edge function — callback step:**
- Extract `appOrigin` from decoded state
- Use it for all redirects (success, not_member, errors)

**`redirectWithError` helper:**
- Accept `appOrigin` parameter instead of using bare `/`

### 2. Pass origin from the client
In `src/contexts/DiscordContext.tsx`, append `&origin=${encodeURIComponent(window.location.origin)}` to the edge function call URL so the edge function can capture it.

## Files to Change

1. **`supabase/functions/discord-auth/index.ts`** — Fix state encoding to include `appOrigin`; use it in all redirect responses
2. **`src/contexts/DiscordContext.tsx`** — Pass `origin` query param in the verification request

## What This Does NOT Change
- The Discord Developer Portal redirect URI stays as `https://notyhakhjrmzhnnjbiqp.supabase.co/functions/v1/discord-auth` (this is correct — Discord redirects back to the edge function, which then redirects to the app)
- Guild membership verification logic stays the same
- All other components (banner, modal, context) unchanged

