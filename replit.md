# Islam Quest - Educational Mobile Web App

## Overview
Islam Quest is a mobile-first web application designed as a gamified Islamic learning platform. Its core purpose is to provide an interactive and engaging educational experience, guiding users through structured learning paths covering fundamental Islamic beliefs, stories of prophets, and essential knowledge. The project aims to make Islamic education accessible and foster continuous learning and spiritual growth through features like a friendly mascot (Zayd), an achievement system, customizable avatars, quiz-based assessments, and a complete social friends system. The business vision is to make Islamic education engaging and widely accessible, with significant market potential for a gamified, faith-based learning platform.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The application features a mobile-first responsive design with a bottom navigation pattern, edge-to-edge layouts, and safe-area support. It includes a comprehensive layout refactor, a ScrollToTop component, structured learning paths in a timeline format, and a consistent color palette with CSS variables. GPU-optimized CSS and Framer Motion animations provide smooth transitions, and custom LoadingScreens with shimmer skeleton loaders and eager image preloading enhance the user experience.

### Technical Implementations
The frontend is built with React 18.2, Vite, JavaScript, and React Router DOM v7.9. State management uses local React hooks and global Zustand stores (e.g., `progressStore`, `userStore`, `friendsStore`), with LocalStorage for persistence. A sophisticated challenge question engine dynamically selects questions, prevents repetition, scales difficulty, and uses memoization. Performance is optimized with route-based code splitting, Duolingo-style eager image preloading, and `React.memo`. A unified, global modal system features multiple types, dual rendering strategies, and race condition protection. A global back button handler intercepts physical phone back button presses. Arabic honorifics are dynamically added for authenticity.

### Feature Specifications
The application offers 14 learning paths with lessons and quizzes sourced from Qur'an and Sahih Hadith. Progression includes XP and coin rewards, a streak system, universal lesson locking, a freemium model, and a 10-level Diamond progression system. A 75% passing threshold applies to quizzes, daily quests, and global events.
The premium model offers free tier limits and premium plans (Individual £4.99/month, Family £18/month) for unlimited access, Global Events, and a premium badge. Social features include friend management, a leaderboard, activity feed, and quick messaging. Gamification elements comprise four friend challenge modes, a daily Boss Level, weekly Global Events, Daily Quests, and a Streak Freeze system. The Revise tab features "Review Mistakes" and "Smart Revision" modes. Customizable avatars (32 selectable, 2 hidden) are available. An Easter Egg awards +1 XP when the mascot is tapped 5 times within 3.5 seconds.

### System Design Choices

**Identity vs Progress Separation**: Identity data (username, avatar, handle) and progress data (xp, coins, streak) are cleanly separated and synced independently to the cloud. Avatars are stored as integer indices.

**Profile Creation Architecture**: Profiles are created only after onboarding completion, ensuring all required fields are present. Startup sequence involves silent authentication, device ID checks, and then either onboarding or loading existing stores.

**Supabase Integration**: Silent account creation on first launch with permanent Supabase UID. Auto-login on app open. `progressStore` automatically syncs to Supabase cloud on state changes with throttling and AES encryption. Cloud data is restored on app start if newer.

**Email/Password Authentication System**: Proper email/password auth with email confirmation support.
-   **Auth Flow (Rebuilt Dec 2025)**: Bismillah → Salaam → AuthChoice → (Login OR SignUp) → CheckEmail → Data Preload → Home.
-   **AuthChoiceScreen** (`/onboarding/auth-choice`): Central choice screen with "Create Account" and "I already have an account" buttons, mascot, and Terms/Privacy footer.
-   **LoginPage** (`/login`): Email + password fields, Forgot Password link, Sign In button (disabled until valid), link to sign up page.
-   **SignUpPage** (`/signup`): Consolidated single-page signup with Display Name, Username (handle), Email, Password, and Avatar Picker. All fields on one screen for faster onboarding. Handle uniqueness validation included.
-   **Email Confirmation**: After signup, users are redirected to `CheckEmailScreen` which polls for email confirmation. Uses `useDataPreloader` hook to preload all data (friends, leaderboard, progress, quests, events, challenges) via Promise.all BEFORE navigating to Home for instant app experience.
-   **Supabase Auth Methods**: `signUp` for registration, `signInWithPassword` for login, `resetPasswordForEmail` for forgot password (redirects to `/reset-password`), `updateUser` for password reset.
-   **Password Reset**: `resetPasswordForEmail` sends a reset link, user clicks → `/reset-password` page → enters new password → `updateUser` → redirects to login. All user data preserved.
-   **Onboarding Persistence**: Current step saved in localStorage (`iq_onboarding_step`), app resumes from saved step if closed mid-onboarding.
-   **Session Handling**: On app start, checks email confirmation status. Unconfirmed users → CheckEmail screen. Confirmed users with profile → Home.
-   **Routes**: `/onboarding/auth-choice` (choose login or signup), `/login` (login page), `/signup` (consolidated signup page), `/check-email` (email confirmation), `/reset-password` (password reset after email link).
-   **Hooks**: `useOnboarding` manages onboarding state and flow, `useDataPreloader` handles instant data loading via Promise.all.

**Challenge System**: The challenge system operates in two modes:
-   **Solo/Boss Challenges (Local)**: All single-player challenge functionality runs locally without Supabase dependency. `createChallenge()` builds local challenge objects, `submitChallengeAttempt()` generates random opponent results locally, and `saveBossAttempt()` stores Boss Level attempts in localStorage. Questions are pulled from completed lesson pools or a diverse fallback pool.
-   **Friend Challenges (Supabase-Backed)**: Real-time multiplayer challenges use Supabase for synchronization. `friendChallengesStore.js` manages the full challenge lifecycle with Realtime subscriptions. The `friend_challenges` table stores challenge data, questions (as JSONB), scores, times, and completion status. Both players receive identical question sets for fairness. Four game modes are supported: Mind Battle (untimed), Lightning Round (timed), Sudden Death (chain-based), and Speed Run (speed-based). Winner determination considers score, time, and chain length depending on mode. Rewards are distributed only when both players complete their attempts.

**Friend Data Loading Optimizations (Dec 2025)**: Duolingo-style instant loading for all friend-related flows:
-   **Parallel DB Queries**: `friendsStore.loadAll()` uses `Promise.all` to fetch friends, sent requests, and received requests simultaneously, then batches all profile lookups into a single query.
-   **Real-time Subscriptions**: Both `friendsStore` and `friendChallengesStore` have Supabase Realtime subscriptions for the `friends` and `friend_challenges` tables respectively, enabling instant UI updates when friend requests or challenges are sent/received.
-   **FriendChallengeWaitingModal**: Uses real-time subscription instead of polling for instant status updates when waiting for opponent to complete challenge.
-   **Orphaned Challenge Cleanup**: Challenges from non-friends are automatically filtered out and deleted in background during load.
-   **Reduced Polling**: Background polling reduced to 15 seconds as fallback since real-time handles most updates instantly.

**Revision System**: The `reviseStore` stores lightweight data (cardId, lessonId, tracking counts) for weak questions, with full question content looked up at render time. Cloud sync is handled via `revisionSync.js` with specific Supabase table `revision_items`.
-   **Permanent Unlock**: Once a user makes their first mistake, `reviewMistakesUnlocked` is set to `true` and persisted via `progressStore.saveProgress()`. This flag is never reset to `false`.
-   **Question Tracking**: Each weak question tracks `reviewedOnce` (true if answered during revision), `firstWrongAt` (timestamp of first mistake), `lastReviewedAt` (null until reviewed), `timesCorrect`, and `timesWrong`.
-   **Sorting Priority**: Unreviewed questions (`reviewedOnce: false`) appear at the top of revision sessions, followed by reviewed questions sorted by `timesWrong`.
-   **Empty State**: When unlocked but no mistakes exist, the Review Mistakes card shows a green checkmark with "No mistakes to review" message instead of locking.

**Events System**: Global Events load cloud entries on mount. Event quiz submissions pass completion time for tiebreaker rankings.

**In-App Purchase System**: A complete backend-verified IAP system with a single lifetime premium unlock (£4.99).
-   **Architecture**: Uses `iapService.js` (Capacitor for native StoreKit/Google Play), `purchaseVerificationService.js` (Supabase Edge Functions), `premiumStateService.js` (offline caching, device binding), and `deviceService.js` (unique device IDs).
-   **Backend (Supabase Edge Functions)**: Handles receipt verification (Apple/Google APIs), premium status validation, device registration, and webhook processing for refunds.
-   **Database Tables**: `users`, `purchases` manage user and purchase data.
-   **Security**: Nonce for replay attack prevention, hashed device IDs, backend-only premium activation, device limits, and refund webhooks.
-   **Purchase Flow**: User initiates, native store handles, receipt sent to Supabase Edge Function for verification, which then updates user and purchase records.
-   **Restore Purchases**: Calls native store's restore API, verifies receipts with backend, and restores premium status.
-   **Single Product**: `premium_lifetime` (£4.99 one-time) - All features unlocked forever.

**Account Deletion System**: A "Delete My Account" option in Settings triggers a Supabase Edge Function to delete all user-related data. A "Goodbye" screen is shown post-deletion.

**Analytics & Logging System**: An `analytics_events` table stores user events (e.g., purchase, logout, account deletion). An Edge Function (`log-event`) inserts events from the client, with RLS policies restricting read access.

**Styled Notification Modals**: Reusable `NotificationModal.jsx` provides consistent styled popups for feedback, including `DeleteAccountModal.jsx` for account deletion. All modals use consistent styling and Framer Motion animations.

Asset management is centralized via `assets.js` for optimized WebP images, including 16 culturally authentic Islamic mascot characters and 34 avatar options.

## External Dependencies

### Third-Party Services
-   **Supabase**: Authentication, database, real-time subscriptions, and Edge Functions.
-   **OneSignal**: Push notifications via `react-onesignal` v2 API, integrated for daily reminders using Supabase Edge Functions.

### Core Libraries
-   **UI & Animation**: `framer-motion`, `lucide-react`, `react-router-dom`.
-   **State Management**: `zustand`.
-   **Build Tool**: `vite`.
-   **Encryption**: `crypto-js` (AES for cloud sync).

### Asset Dependencies
-   **Media**: Locally bundled WebP images and an SVG favicon.
-   **Mascots**: 16 WebP characters used across UI.
-   **Avatars**: 34 total avatar options.

## Mobile Build (Capacitor)

### Configuration
-   **App Name**: IslamQuest
-   **App ID**: com.islamquest.app
-   **Web Directory**: dist
-   **Config File**: capacitor.config.ts

### One-Time Setup (Already Completed)
These commands were run once to initialize Capacitor - DO NOT run again:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init "IslamQuest" "com.islamquest.app" --web-dir dist
npx cap add android
npx cap add ios
```

### Every Build Commands
Run these after making code changes:
```bash
npm run build          # Build Vite app to dist/
npx cap sync           # Sync web assets to android/ and ios/
```

### Open in IDE
```bash
npx cap open android   # Opens project in Android Studio for building APK/AAB
npx cap open ios       # Opens project in Xcode for building IPA
```

### Key Files (Permanent - Do Not Delete)
-   `capacitor.config.ts` - Capacitor configuration
-   `android/` - Native Android project folder
-   `ios/` - Native iOS project folder

### In-App Purchase Configuration

**Product ID**: `premium_lifetime` (one-time non-consumable purchase)

**Android (Google Play Billing)**:
-   Permission added: `com.android.vending.BILLING` in `AndroidManifest.xml`
-   Billing Library: `com.android.billingclient:billing:7.0.0` in `app/build.gradle`
-   Product ID in Google Play Console: `premium_lifetime`
-   Requires uploading APK/AAB to testing track before products are visible

**iOS (StoreKit)**:
-   Entitlements file: `ios/App/App/App.entitlements`
-   Product ID in App Store Connect: `premium_lifetime`
-   Enable "In-App Purchase" capability in Xcode when building

**IAP Service**: `src/services/iapService.js` handles both platforms with backend verification via Supabase Edge Functions.