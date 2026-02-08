

# Discord Verification System Implementation Plan

## Overview

This plan implements a secure Discord server membership verification system for PropFirm Knowledge Journal. Users must join and verify their Discord membership before accessing full journal features (add/edit/delete trades).

---

## Architecture Diagram

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           User Flow                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────┐     ┌─────────────┐     ┌──────────────┐                 │
│   │  User    │────>│  Click      │────>│  Discord     │                 │
│   │  Login   │     │  "Verify"   │     │  OAuth Page  │                 │
│   └──────────┘     └─────────────┘     └──────────────┘                 │
│                                               │                          │
│                                               v                          │
│   ┌──────────────────────────────────────────────────────────┐          │
│   │                Edge Function: discord-auth                │          │
│   │  1. Exchange code for token                               │          │
│   │  2. Get Discord user ID                                   │          │
│   │  3. Check guild membership via Bot API                    │          │
│   │  4. Update user_profiles with discord_verified            │          │
│   └──────────────────────────────────────────────────────────┘          │
│                                               │                          │
│                                               v                          │
│   ┌──────────────┐     ┌──────────────────────────────────┐             │
│   │  Verified    │<────│  Redirect back to app             │             │
│   │  Full Access │     │  with verification status         │             │
│   └──────────────┘     └──────────────────────────────────┘             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Database Schema Updates

### 1.1 Modify `user_profiles` Table

Add Discord verification fields:

| Column | Type | Description |
|--------|------|-------------|
| discord_id | TEXT | User's Discord ID (unique) |
| discord_username | TEXT | Discord username for display |
| discord_verified | BOOLEAN | Verification status (default: false) |
| discord_verified_at | TIMESTAMPTZ | When verification occurred |

### 1.2 Update RLS Policies

Modify existing RLS policies on `trades` and `accounts` tables to require Discord verification for write operations:

- **INSERT/UPDATE/DELETE**: Only allow if user's `discord_verified = true`
- **SELECT**: Unchanged (users can still view their data)

Create a security definer function to check Discord verification status without causing RLS recursion.

---

## Phase 2: Edge Function - Discord Authentication

### 2.1 Create `discord-auth` Edge Function

**Location**: `supabase/functions/discord-auth/index.ts`

**Endpoints**:
- `GET /discord-auth?action=login` - Redirect to Discord OAuth
- `GET /discord-auth?code=xxx` - Handle OAuth callback
- `GET /discord-auth?action=check` - Re-verify membership status

**Flow**:
1. User clicks "Verify with Discord"
2. Redirect to Discord OAuth with scopes: `identify`, `guilds.members.read`
3. Discord redirects back with authorization code
4. Edge function exchanges code for access token
5. Fetch user's Discord ID using access token
6. Use Bot token to call `GET /guilds/{guild_id}/members/{user_id}`
7. If member exists (200 response): set `discord_verified = true`
8. If not member (404 response): return error prompting to join server
9. Redirect back to app with success/failure status

### 2.2 Required Secrets

| Secret Name | Description |
|-------------|-------------|
| DISCORD_CLIENT_ID | OAuth application client ID |
| DISCORD_CLIENT_SECRET | OAuth application secret |
| DISCORD_BOT_TOKEN | Bot token with Server Members Intent |
| DISCORD_GUILD_ID | Your Discord server ID |

---

## Phase 3: Frontend Components

### 3.1 Discord Verification Context

**File**: `src/contexts/DiscordContext.tsx`

Manages:
- `discordVerified`: boolean state
- `discordUsername`: display name
- `isVerifying`: loading state
- `checkVerification()`: fetch verification status
- `startVerification()`: initiate OAuth flow

### 3.2 Discord Verification Banner

**File**: `src/components/DiscordVerificationBanner.tsx`

States:
1. **Locked** (not verified):
   - "Join Discord to Unlock Full Access"
   - "Join Discord" button (link to invite)
   - "Verify with Discord" button

2. **Verifying**:
   - Loading spinner
   - "Checking your Discord status..."

3. **Verified**:
   - Badge: "Discord Verified ✓"
   - No further prompts

### 3.3 Update Existing Components

**Modify action interception in**:
- `NewTradeModal.tsx` - Check Discord verification before allowing trade entry
- `EditTradeModal.tsx` - Check verification before allowing edits
- `TradingTable.tsx` - Check verification for delete actions
- `Settings.tsx` - Check verification for account management

**Update flow**:
```text
Guest User → Show AuthModal (login/signup)
Logged In + Not Discord Verified → Show Discord Verification prompt
Logged In + Discord Verified → Allow full access
```

### 3.4 UI Updates

**MobileHeader.tsx** & **AppSidebar.tsx**:
- Show Discord verification badge when verified
- Show "Verify Discord" link when not verified

**MobileMenu.tsx**:
- Add "Discord Verification" menu item
- Show verification status

---

## Phase 4: Security Implementation

### 4.1 RLS Policy Updates

```sql
-- Security definer function to check Discord verification
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

-- Update trades INSERT policy
DROP POLICY IF EXISTS "Users can create their own trades" ON trades;
CREATE POLICY "Users can create their own trades" ON trades
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND public.is_discord_verified(auth.uid())
  );

-- Similar updates for UPDATE and DELETE policies
```

### 4.2 Edge Function Security

- Verify JWT tokens for authenticated requests
- Validate Discord OAuth state parameter to prevent CSRF
- Rate limit verification attempts
- Log all verification attempts for audit

---

## Phase 5: User Experience

### 5.1 Verification Flow UX

1. **After Login**:
   - Check `discord_verified` status
   - If not verified, show non-blocking banner

2. **On Restricted Action**:
   - Show modal: "Discord Verification Required"
   - Benefits list: "Track stats", "Access history", etc.
   - Two buttons: "Join Discord Server", "I've Joined - Verify"

3. **OAuth Flow**:
   - Opens in new window (desktop) or in-app browser (mobile)
   - Auto-closes and refreshes status on completion

4. **Success State**:
   - Toast: "Discord Verified! Full access unlocked."
   - Badge appears in header
   - All features immediately available

### 5.2 Error Handling

| Error | User Message |
|-------|--------------|
| Not in server | "Please join our Discord server first, then try again." |
| OAuth denied | "Discord authorization was cancelled." |
| Network error | "Connection issue. Please try again." |
| Rate limited | "Too many attempts. Please wait a moment." |

---

## Technical Details

### Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/discord-auth/index.ts` | OAuth handling and membership verification |
| `src/contexts/DiscordContext.tsx` | Discord verification state management |
| `src/components/DiscordVerificationBanner.tsx` | Verification UI banner |
| `src/components/DiscordVerificationModal.tsx` | Modal for verification prompts |
| `src/hooks/useDiscordVerification.ts` | Hook for verification logic |

### Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add DiscordProvider |
| `src/contexts/GuestContext.tsx` | Integrate Discord verification check |
| `src/components/NewTradeModal.tsx` | Add Discord verification gate |
| `src/components/EditTradeModal.tsx` | Add Discord verification gate |
| `src/components/TradingTable.tsx` | Add Discord verification gate for delete |
| `src/components/MobileHeader.tsx` | Show Discord badge |
| `src/components/AppSidebar.tsx` | Add Discord verification status |
| `src/components/MobileMenu.tsx` | Add Discord verification menu item |
| `src/pages/Settings.tsx` | Add Discord verification gate |

### Database Migrations

1. Add columns to `user_profiles` table
2. Create `is_discord_verified` function
3. Update RLS policies on `trades` and `accounts`

---

## Implementation Order

1. **Request Discord API secrets** - Required before any implementation
2. **Database migration** - Add Discord fields to user_profiles
3. **Edge function** - Create discord-auth function
4. **Frontend context** - Create DiscordContext
5. **UI components** - Banner, modal, badges
6. **Gate modifications** - Update existing components
7. **RLS policy updates** - Enforce at database level
8. **Testing** - End-to-end verification flow

---

## Required User Action Before Implementation

You need to set up a Discord Developer Application:

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to **OAuth2** section:
   - Add redirect URL: `https://notyhakhjrmzhnnjbiqp.supabase.co/functions/v1/discord-auth`
   - Copy **Client ID** and **Client Secret**
4. Go to **Bot** section:
   - Create a bot
   - Enable **Server Members Intent** under Privileged Gateway Intents
   - Copy **Bot Token**
5. Get your Discord Server (Guild) ID:
   - Enable Developer Mode in Discord settings
   - Right-click your server → Copy ID

Once you have these credentials, I'll securely store them as Supabase secrets and proceed with implementation.

