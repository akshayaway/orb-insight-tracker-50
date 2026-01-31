
# Mobile App Conversion Plan: PropFirm Knowledge Journal

## Overview

This plan converts the existing PropFirm Knowledge Journal web application into a production-ready mobile app for Android and iOS using Capacitor. The existing codebase, Supabase backend, and all features will be preserved while adding mobile-specific optimizations.

---

## Phase 1: Capacitor Configuration and Mobile Wrapper

### 1.1 Update Capacitor Configuration
**File: `capacitor.config.ts`**
- Add server configuration for hot reload during development
- Configure splash screen settings for native splash
- Add status bar and safe area configurations
- Enable hardware acceleration for WebView

### 1.2 Create Capacitor Plugins Setup
**New file: `src/lib/capacitor.ts`**
- Initialize Capacitor plugins (StatusBar, SplashScreen, Haptics, App, Keyboard)
- Create utility functions for native features
- Handle platform detection (iOS/Android/Web)

---

## Phase 2: Native Splash Screen with Smooth Loading

### 2.1 Create Splash Screen Component
**New file: `src/components/SplashScreen.tsx`**
- Dark minimal design with PropFirm Knowledge logo centered
- Fade and scale animation using Framer Motion
- Auto-hide after auth check (under 3 seconds)
- Seamless transition to dashboard or login

### 2.2 Update App Entry Point
**File: `src/App.tsx`**
- Integrate splash screen as initial view
- Check auth state during splash
- Route to Dashboard (authenticated) or Login (unauthenticated)
- Prevent white flash between states

---

## Phase 3: Authentication Persistence

### 3.1 Enhance Auth Context
**File: `src/contexts/AuthContext.tsx`**
- Configure Supabase for persistent sessions on mobile
- Add proper session verification on app launch
- Implement token refresh handling
- Add loading state management during auth checks

### 3.2 Update Protected Route
**File: `src/components/ProtectedRoute.tsx`**
- Show loading indicator during session verification
- Prevent flash between login and dashboard
- Handle expired tokens gracefully

---

## Phase 4: Mobile Navigation with Burger Menu

### 4.1 Create Mobile Header Component
**New file: `src/components/MobileHeader.tsx`**
- Fixed top header bar with app title
- Burger menu icon on the left
- Smooth hamburger-to-X animation

### 4.2 Create Mobile Slide-in Menu
**New file: `src/components/MobileMenu.tsx`**
- Slide-in navigation from left side
- Menu items: Dashboard, Stats, Calendar, Trade History, Settings, Logout
- Shadow backdrop overlay
- Close on item selection or outside tap
- Smooth 200ms slide animation

### 4.3 Create Responsive Layout Wrapper
**New file: `src/components/MobileLayout.tsx`**
- Detect mobile vs desktop viewport
- Render mobile header + menu for mobile
- Keep desktop sidebar for larger screens
- Handle safe areas for notch devices

### 4.4 Update Main App Layout
**File: `src/App.tsx`**
- Integrate MobileLayout wrapper
- Conditional rendering based on viewport
- Preserve existing desktop sidebar behavior

---

## Phase 5: Touch-Friendly UI Improvements

### 5.1 Update Global Styles
**File: `src/index.css`**
- Add minimum touch target size (44px) utility classes
- Enhance font sizes for mobile readability
- High contrast text improvements
- Mobile-specific spacing utilities

### 5.2 Update StatsCard Component
**File: `src/components/StatsCard.tsx`**
- Larger font sizes for important stats
- Better touch targets
- Improved spacing for mobile

### 5.3 Update Button Components
- Add mobile-specific variants with larger touch areas
- Enhanced active states for touch feedback

---

## Phase 6: Mobile Dashboard Layout

### 6.1 Restructure Trading Dashboard
**File: `src/components/TradingDashboard.tsx`**
- Stack cards vertically on mobile
- Add skeleton loaders for data loading
- Responsive grid adjustments
- Optimize equity chart for mobile

### 6.2 Update TimeFilter for Mobile
**File: `src/components/TimeFilter.tsx`**
- Convert to horizontal scroll chips
- Add smooth scroll behavior
- Active state indicators

### 6.3 Add Floating Action Button
**New file: `src/components/FloatingActionButton.tsx`**
- Fixed position "+" button for quick trade logging
- Appears on Dashboard and Trade History
- Smooth scale animation on tap

---

## Phase 7: Trade Logging Modal Optimization

### 7.1 Update NewTradeModal for Mobile
**File: `src/components/NewTradeModal.tsx`**
- Full-screen modal on mobile
- Large inputs and touch-friendly dropdowns
- Camera/gallery image upload
- Prevent double submission
- Handle back button/swipe to close

### 7.2 Add Form Submission Guard
- Loading state during upload
- Success toast on save
- Prevent accidental back exit

---

## Phase 8: Trade History Optimization

### 8.1 Implement Infinite Scroll
**File: `src/components/TradingTable.tsx`**
- Replace table with mobile-friendly list
- Infinite scroll with pagination
- Color-coded result indicators (green/red)
- Lightweight list items

### 8.2 Add Trade List Item Component
**New file: `src/components/TradeListItem.tsx`**
- Mobile-optimized trade card
- Symbol, side, result, P&L display
- Tap to view full details
- Swipe actions for edit/delete (optional)

---

## Phase 9: Trade Review Mobile Experience

### 9.1 Update TradeReview Page
**File: `src/pages/TradeReview.tsx`**
- Stacked card layout for metrics
- Pinch-to-zoom on screenshots
- Lazy load images
- Mobile-friendly header with back button

---

## Phase 10: Mobile Calendar View

### 10.1 Update Calendar Component
**File: `src/pages/Calendar.tsx`**
- Optimize grid for mobile screens
- Colored P&L markers on days
- Tap day to show bottom sheet with trades
- Smooth month navigation

### 10.2 Create Day Detail Bottom Sheet
**New file: `src/components/DayTradesSheet.tsx`**
- Bottom sheet component for day details
- List of trades for selected day
- Swipe to dismiss

---

## Phase 11: Performance Optimizations

### 11.1 Code Splitting
**File: `vite.config.ts`**
- Add manual chunk splitting for vendors
- Lazy load route components
- Optimize bundle size

### 11.2 Query Caching
**File: `src/App.tsx`**
- Configure React Query for memory caching
- Set appropriate stale times
- Enable background refetching

### 11.3 Component Lazy Loading
- Wrap heavy components with React.lazy
- Add Suspense boundaries with skeleton loaders

---

## Phase 12: Error Handling and Offline Support

### 12.1 Enhance Error Boundary
**File: `src/components/ErrorBoundary.tsx`**
- Mobile-friendly error display
- Retry button with network check
- Prevent crash to blank screen

### 12.2 Create Network Status Handler
**New file: `src/hooks/useNetworkStatus.ts`**
- Detect online/offline status
- Show offline banner when disconnected
- Queue actions for offline mode

### 12.3 Create Offline Banner
**New file: `src/components/OfflineBanner.tsx`**
- Small banner at top when offline
- Auto-hide when connection restored

---

## Phase 13: Smooth Animations

### 13.1 Update Animation Configuration
**File: `tailwind.config.ts`**
- Ensure animations are under 200-250ms
- Add mobile-specific transition classes

### 13.2 Optimize Framer Motion Usage
- Page transition animations
- Menu slide animations
- Modal open/close
- Remove heavy effects that cause lag

---

## Phase 14: Mobile-Specific Features

### 14.1 Add Pull-to-Refresh
**New file: `src/hooks/usePullToRefresh.ts`**
- Custom hook for pull-to-refresh
- Apply to Dashboard and Trade History

### 14.2 Add Haptic Feedback
**New file: `src/lib/haptics.ts`**
- Utility for haptic feedback
- Trigger on save trade, delete, important actions

### 14.3 Remember Last Tab
**New file: `src/hooks/useLastRoute.ts`**
- Store last visited route in localStorage
- Restore on next app launch

---

## Phase 15: Final Build Configuration

### 15.1 Update Manifest
**File: `public/manifest.json`**
- Update with proper app name
- Dark theme colors
- Correct icon references

### 15.2 Update Index.html
**File: `index.html`**
- Add mobile-specific meta tags
- Status bar configuration
- Prevent zoom/scale issues

### 15.3 Android Build Configuration
**Files: `android/app/build.gradle`, `android/variables.gradle`**
- Verify signing configuration
- Set proper version codes
- Enable ProGuard for release

---

## Technical Details

### New Files to Create
1. `src/lib/capacitor.ts` - Capacitor plugin initialization
2. `src/components/SplashScreen.tsx` - Native-like splash screen
3. `src/components/MobileHeader.tsx` - Mobile header bar
4. `src/components/MobileMenu.tsx` - Slide-in navigation
5. `src/components/MobileLayout.tsx` - Responsive layout wrapper
6. `src/components/FloatingActionButton.tsx` - Quick trade FAB
7. `src/components/TradeListItem.tsx` - Mobile trade list item
8. `src/components/DayTradesSheet.tsx` - Calendar day details
9. `src/components/OfflineBanner.tsx` - Offline indicator
10. `src/hooks/useNetworkStatus.ts` - Network detection
11. `src/hooks/usePullToRefresh.ts` - Pull refresh
12. `src/hooks/useLastRoute.ts` - Route persistence
13. `src/lib/haptics.ts` - Haptic feedback utilities

### Files to Modify
1. `capacitor.config.ts` - Mobile configuration
2. `src/App.tsx` - Layout and routing
3. `src/contexts/AuthContext.tsx` - Session persistence
4. `src/components/ProtectedRoute.tsx` - Loading states
5. `src/components/TradingDashboard.tsx` - Mobile layout
6. `src/components/TimeFilter.tsx` - Horizontal scroll
7. `src/components/NewTradeModal.tsx` - Full-screen modal
8. `src/components/TradingTable.tsx` - Mobile list view
9. `src/pages/TradeReview.tsx` - Mobile optimization
10. `src/pages/Calendar.tsx` - Mobile calendar
11. `src/components/StatsCard.tsx` - Touch-friendly
12. `src/index.css` - Mobile utilities
13. `tailwind.config.ts` - Animation timing
14. `vite.config.ts` - Code splitting
15. `public/manifest.json` - App metadata
16. `index.html` - Mobile meta tags

### Dependencies to Add
- `@capacitor/status-bar` - Status bar control
- `@capacitor/splash-screen` - Native splash
- `@capacitor/haptics` - Haptic feedback
- `@capacitor/app` - App lifecycle
- `@capacitor/keyboard` - Keyboard handling

---

## Post-Implementation Steps (For User)

1. **Export to GitHub** via Lovable's "Export to GitHub" button
2. **Clone locally** and run `npm install`
3. **Add platforms**: `npx cap add ios` and/or `npx cap add android`
4. **Update native projects**: `npx cap update`
5. **Build web assets**: `npm run build`
6. **Sync to native**: `npx cap sync`
7. **Run on device**: `npx cap run android` or `npx cap run ios`
8. **Generate release build**: Follow existing `RELEASE_AND_PLAYSTORE.md` guide

---

## Quality Checklist

- [ ] No lag when scrolling lists or opening trades
- [ ] Text and icons clearly visible on all phone sizes
- [ ] Clean, minimal, professional dark UI
- [ ] Burger menu navigation feels smooth and native
- [ ] App works reliably on low and mid-range devices
- [ ] Launch time under 3 seconds
- [ ] No console errors in release build
