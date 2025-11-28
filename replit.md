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

**Challenge System**: The challenge system operates in two modes:
-   **Solo/Boss Challenges (Local)**: All single-player challenge functionality runs locally without Supabase dependency. `createChallenge()` builds local challenge objects, `submitChallengeAttempt()` generates random opponent results locally, and `saveBossAttempt()` stores Boss Level attempts in localStorage. Questions are pulled from completed lesson pools or a diverse fallback pool.
-   **Friend Challenges (Supabase-Backed)**: Real-time multiplayer challenges use Supabase for synchronization. `friendChallengesStore.js` manages the full challenge lifecycle with Realtime subscriptions. The `friend_challenges` table stores challenge data, questions (as JSONB), scores, times, and completion status. Both players receive identical question sets for fairness. Four game modes are supported: Mind Battle (untimed), Lightning Round (timed), Sudden Death (chain-based), and Speed Run (speed-based). Winner determination considers score, time, and chain length depending on mode. Rewards are distributed only when both players complete their attempts.

**Revision System**: The `reviseStore` stores lightweight data (cardId, lessonId, tracking counts) for weak questions, with full question content looked up at render time. Cloud sync is handled via `revisionSync.js` with specific Supabase table `revision_items`.

**Events System**: Global Events load cloud entries on mount. Event quiz submissions pass completion time for tiebreaker rankings.

**Dev Mode System**: A toggle in Settings enables local-only testing for all features without affecting production data, indicated by a "DEV MODE ACTIVE" banner.

**In-App Purchase System**: A complete backend-verified IAP system with lifetime unlocks for individual (£4.99) and family (£18) plans.
-   **Architecture**: Uses `iapService.js` (Capacitor for native StoreKit/Google Play), `purchaseVerificationService.js` (Supabase Edge Functions), `premiumStateService.js` (offline caching, device binding), `deviceService.js` (unique device IDs), and `familyService.js` (family group management). Deep linking handles family invite acceptance.
-   **Backend (Supabase Edge Functions)**: Handles receipt verification (Apple/Google APIs), premium status validation, device registration, family invite acceptance, and webhook processing for refunds.
-   **Database Tables**: `users`, `purchases`, `family_groups`, `family_members` manage user, purchase, and family data.
-   **Security**: Nonce for replay attack prevention, hashed device IDs, backend-only premium activation, device limits, and refund webhooks.
-   **Purchase Flow**: User initiates, native store handles, receipt sent to Supabase Edge Function for verification, which then updates user and purchase records.
-   **Restore Purchases**: Calls native store's restore API, verifies receipts with backend, and restores premium status.

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