

# Upgrade Shared Journal to Professional Trading Portfolio

## Overview
Transform the public journal page into a full-featured, professional trading portfolio with account filtering, trade screenshot support with modal previews, and a polished responsive layout.

## Changes

### 1. Hook: `src/hooks/usePublicJournal.ts`
- Add `selectedAccountId` state and `setSelectedAccountId` setter
- Accept optional `accountId` from URL search params
- Filter trades by `account_id` when an account is selected
- Return `selectedAccountId` and `setSelectedAccountId` for the UI

### 2. Route: `src/App.tsx`
- No route change needed — account selection will use URL search params (`?account=uuid`) instead of path params, keeping backward compatibility

### 3. Page: `src/pages/PublicJournal.tsx` (major rewrite)
- **Account selector dropdown** at the top — lists all accounts, selecting one filters all data (trades, stats, calendar, equity chart)
- **Trade screenshots in history table**: add an image thumbnail column; clicking opens a fullscreen modal with the screenshot
- **Image preview modal**: Dialog/sheet component showing the full trade screenshot with trade details overlay
- **Calendar upgrade**: Match the private calendar style (8-column grid with weekly summaries)
- **Mobile responsive**: Stack cards vertically, scrollable table, touch-friendly image modal
- **Share link updates**: When user selects an account, update URL search param `?account=<id>` so the link can be shared with a specific account view
- **Read-only enforced**: No edit buttons, no action menus — strictly view-only
- **Footer branding** with PropFirm Knowledge Journal attribution

### 4. Share button: `src/components/ShareJournalButton.tsx`
- When copying the link, include `?account=<activeAccountId>` if an account is selected
- Show which account the link will display

### 5. UI Details
- Trade history rows: thumbnail (40x40 rounded) on left if `image_url` exists, clicking row/thumbnail opens modal
- Modal: full-width screenshot, trade metadata (symbol, date, result, RR, P&L, session, notes) below
- Stats cards: keep existing 8-card grid
- Equity chart: filter by selected account
- Color coding: green for wins, red for losses, muted for breakeven — consistent throughout

## Files to Change
1. `src/hooks/usePublicJournal.ts` — add account filtering + selectedAccountId state
2. `src/pages/PublicJournal.tsx` — full upgrade with screenshots, account selector, calendar, modal
3. `src/components/ShareJournalButton.tsx` — include account param in share URL

## No Database Changes Required
All data (`image_url`, `account_id`, accounts) already exists. RLS policies already allow public reads for public journal users.

