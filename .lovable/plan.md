
Goal: eliminate blank/white screens by making auth initialization fault-tolerant, blocking app render until session recovery finishes, and redirecting broken sessions to `/auth`.

1. What I found
- The app already has `persistSession` and `autoRefreshToken`, but `detectSessionInUrl` is missing in `src/integrations/supabase/client.ts`.
- `AuthContext` is too optimistic:
  - it calls `getSession()` but does not validate expiry or malformed sessions
  - it does not clear stale Supabase keys/storage on auth corruption
  - it does not handle recovery events like token refresh failure
- `App.tsx` renders the app immediately once `loading` flips false, so broken auth/local cache can still cascade into crashes.
- There is already a real `ErrorBoundary` component, but `App.tsx` is using a try/catch wrapper component instead of the proper boundary.
- Current console logs show a separate backend issue too: repeated `accounts` RLS insert failures during auto default-account creation. That likely contributes to bad post-login states and should be fixed alongside auth recovery because it can surface as “blank app after signup/login”.

2. Implementation plan
A. Harden Supabase client
- Update the Supabase client auth config to include:
  - `persistSession: true`
  - `autoRefreshToken: true`
  - `detectSessionInUrl: true`
- Keep browser storage persistence, but centralize recovery around invalid tokens.

B. Replace the current auth bootstrap with a recovery-first flow
- Refactor `src/contexts/AuthContext.tsx` to:
  - expose `authReady`/`loading`, `user`, and `session`
  - run a startup `getSession()` check once
  - validate:
    - missing session
    - missing access token
    - expired session (`expires_at`)
    - thrown Supabase/session errors
  - on failure:
    - call `supabase.auth.signOut({ scope: 'local' })` when possible
    - remove Supabase auth keys from localStorage/sessionStorage
    - preserve only safe non-auth app keys if needed
    - redirect to `/auth`
    - reload once safely with a loop guard flag in storage so it does not infinite-reload
- Add a small recovery utility inside the auth layer so all auth failures use one path.

C. Add a global auth event handler
- Extend `onAuthStateChange` handling for:
  - `SIGNED_OUT`
  - `TOKEN_REFRESH_FAILED`
  - `USER_UPDATED` / `INITIAL_SESSION` as normal state sync
  - generic auth error cases from failed session restoration path
- For destructive auth failures:
  - reset in-memory auth state
  - clear broken auth storage
  - navigate to `/auth`
- Important: keep callback non-blocking; no long awaited chains inside `onAuthStateChange`.

D. Block rendering until auth is verified
- Add an auth loading/recovery screen component using the existing visual style/spinner.
- In `App.tsx`, do not mount the main route tree until auth bootstrap completes.
- This prevents child hooks (`useAccounts`, `useTrades`, `useDiscord`) from firing with stale/broken sessions and crashing the app.

E. Use the real React Error Boundary globally
- Replace `AppWithErrorBoundary` try/catch usage with the existing `ErrorBoundary` component in the app root.
- Keep fallback UI with:
  - clear crash message
  - “Reload App” button
  - “Go to Sign In” or “Go Home” recovery action
- This ensures runtime exceptions never become a white screen.

F. Add broken-auth fallback behavior
- Since you chose `/auth`, recovery will always redirect there after cleanup.
- Public/guest-safe pages can still function after fresh load, but auth-recovery itself will go to `/auth`.
- If needed, `ProtectedRoute` can be upgraded to redirect to `/auth` only after auth is ready, avoiding flicker.

G. Prevent downstream hooks from making bad requests during recovery
- Review hooks that depend on `user`:
  - `useAccounts`
  - `useTrades`
  - `DiscordContext`
- Gate fetch/subscription setup until auth is ready and session is valid.
- This avoids race conditions where hooks run during cleanup and create noisy errors.

H. Fix the signup/login side-effect that is currently failing
- Current logs show `createDefaultAccount()` repeatedly hitting RLS errors on `accounts`.
- I will inspect the current RLS/policies and then plan the proper fix so post-signup no longer lands users in a broken semi-authenticated state.
- This is not the same as the stale-token issue, but it is actively harming login/signup stability and should be included in the implementation pass.

I. Domain + redirect validation
- Verify Supabase Auth URL configuration matches the active deployed domain(s):
  - preview/staging URL if used for auth redirects
  - production custom domain
- Specifically confirm Site URL and Redirect URLs include the current deployed app origin and `/auth` flow expectations.
- This part is configuration guidance rather than app code, but I’ll align the code to the correct domain handling.

3. Files likely to change
- `src/integrations/supabase/client.ts`
- `src/contexts/AuthContext.tsx`
- `src/App.tsx`
- `src/components/ErrorBoundary.tsx` or a new auth-recovery fallback component
- `src/components/ProtectedRoute.tsx`
- Possibly:
  - `src/hooks/useAccounts.ts`
  - `src/hooks/useTrades.ts`
  - `src/contexts/DiscordContext.tsx`

4. Technical design
```text
App start
  -> AuthProvider bootstraps
     -> getSession()
        -> valid session => set user/session, authReady=true
        -> invalid/broken session => clear auth storage, local signout, redirect /auth, single safe reload
  -> while bootstrapping => loading/recovery screen
  -> after authReady => render app routes
  -> runtime crash anywhere => ErrorBoundary fallback, never blank screen
```

5. Recovery rules I will implement
- Broken session detected:
  - clear Supabase tokens
  - clear sessionStorage
  - clear localStorage auth entries
  - redirect to `/auth`
  - reload once only
- Logged out user:
  - no crash, clean unauthenticated state
  - `/auth` available normally
- Fresh user:
  - app loads without recovery flow
- Old token/domain change:
  - auto-cleanup and recover to `/auth`

6. Testing plan
- Old token in storage from previous domain/deploy
- Expired session token
- Corrupted Supabase auth key in localStorage
- Fresh anonymous user load
- Logged-out user load
- Successful sign-in after forced recovery
- Signup flow after recovery
- Ensure crash fallback renders instead of white screen

7. Risk notes
- Full `localStorage.clear()` may wipe harmless app preferences like last route or toast timestamps. I’ll prefer targeted auth-key cleanup first, then broader cleanup only if necessary for recovery.
- The `accounts` RLS failure is a separate root issue and should be fixed in the same implementation round to avoid false “auth is broken” symptoms after signup.

8. Expected outcome
- No more blank screen on broken auth/session restore
- Users automatically recover to `/auth`
- App waits for auth validation before rendering
- Runtime crashes show a fallback UI instead of a white page
- Stale browser storage stops poisoning new deployments/domain changes
