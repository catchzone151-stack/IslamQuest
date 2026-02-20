# Islam Quest - Educational Mobile Web App

## Overview
Islam Quest is a mobile-first web application providing a gamified Islamic learning platform. Its purpose is to offer an interactive and engaging educational experience through structured learning paths covering Islamic beliefs, prophet stories, and essential knowledge. The project aims to make Islamic education accessible and foster continuous learning and spiritual growth, featuring a mascot (Zayd), achievements, customizable avatars, quizzes, and a social friends system. The business vision is to make Islamic education engaging and widely accessible, tapping into significant market potential for a gamified, faith-based learning platform.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The application utilizes a mobile-first responsive design with a bottom navigation, edge-to-edge layouts, and safe-area support. It features a comprehensive layout, a ScrollToTop component, timeline-based learning paths, and a consistent color palette using CSS variables. GPU-optimized CSS and Framer Motion provide smooth animations, while custom LoadingScreens with shimmer skeletons and eager image preloading enhance user experience.

### Technical Implementations
The frontend is built with React 18.2, Vite, JavaScript, and React Router DOM v7.9. State management is handled by local React hooks and global Zustand stores (e.g., `progressStore`, `userStore`, `friendsStore`), with LocalStorage for persistence. A dynamic challenge question engine prevents repetition and scales difficulty using memoization. Performance is optimized with route-based code splitting, eager image preloading, and `React.memo`. A global modal system features multiple types and dual rendering strategies. A global back button handler intercepts physical phone back presses. Arabic honorifics are dynamically added.

### Feature Specifications
The application offers 14 learning paths with lessons and quizzes derived from Qur'an and Sahih Hadith. Progression involves XP, coin rewards, a streak system, lesson locking, a freemium model, and a 10-level Diamond progression system. Quizzes require a 75% passing threshold. The premium model offers unlimited access and features. Social features include friend management, leaderboards, activity feeds, and quick messaging. Gamification elements comprise four friend challenge modes, a daily Boss Level, weekly Global Events, Daily Quests, and a Streak Freeze system. The Revise tab offers "Review Mistakes" and "Smart Revision" modes. Customizable avatars (32 selectable, 2 hidden) are available, along with an Easter Egg.

### System Design Choices

**Identity vs Progress Separation**: User identity and progress data are separated and synced independently to the cloud. Avatars are stored as integer indices.

**Profile Creation Architecture**: Profiles are created post-onboarding. The startup sequence involves silent authentication, device ID checks, and then either onboarding or loading existing stores.

**Supabase Integration**: Silent account creation on first launch with permanent Supabase UID. `progressStore` automatically syncs to Supabase cloud with throttling and AES encryption. Cloud data is restored if newer on app start.

**Streak System (Feb 2026 Refactor)**: Local state uses `lastStreakDate` + `streak` fields (renamed from `lastCompletedActivityDate`). A `_localStreakTs` timestamp tracks when the local streak was last mutated. Cloud sync uses a merge guard: if `_localStreakTs > cloudUpdatedAt`, local streak data is preserved regardless of cloud values. The DB column remains `last_completed_activity_date` for backward compatibility. All streak mutations set `_localStreakTs = Date.now()`. Trace logs use `[IQ_STREAK_TRACE]` prefix with events: `MEANINGFUL_ACTIVITY_DETECTED`, `STREAK_BEFORE/AFTER`, `SYNC_PAYLOAD_STREAK`, `CLOUD_MERGE_DECISION`. Vite `drop_console` is disabled to allow trace logs in production builds.

**Email/Password Authentication System**: A comprehensive email/password authentication system, including email confirmation and password reset. The authentication flow is streamlined from `Bismillah` to `Home`, with deep linking for native app callbacks. A consolidated single-page signup simplifies onboarding. `useDataPreloader` ensures instant data loading before navigating to the Home screen.

**Challenge System**: Supports both Solo/Boss Challenges (local, single-player) and Friend Challenges (real-time, Supabase-backed multiplayer). Friend challenges use Realtime subscriptions for synchronization and offer four distinct game modes.

**Friend Data Loading Optimizations**: Uses `Promise.all` for parallel DB queries and Supabase Realtime subscriptions for instant updates to friend requests and challenges. Reduced polling as real-time handles most updates.

**Revision System**: The `reviseStore` tracks weak questions, syncing lightweight data to Supabase. It prioritizes unreviewed questions and provides an empty state for reviewed mistakes.

**Events System**: Global Events load cloud entries on mount, with event quiz submissions using completion time for tie-breaking.

**In-App Purchase System**: A complete backend-verified IAP system for a single lifetime premium unlock using `cordova-plugin-purchase` (CdvPurchase v13). Features include:
- Local premium persistence (`iq_iap_premium_entitlement` in localStorage) for offline access
- Auto-restore on app launch and paywall mount via `checkEntitlementOnMount()`
- "Already owned" responses treated as success (not failure)
- Deterministic UI states - never gets stuck on "Processing..."
- Idempotent receipt validation with Supabase Edge Functions
- Device binding and security via hashed device IDs

**Account Deletion System**: A "Delete My Account" option triggers a Supabase Edge Function to delete all user-related data.

**Analytics & Logging System**: An `analytics_events` table stores user events, inserted via an Edge Function with RLS policies.

**Styled Notification Modals**: Reusable `NotificationModal.jsx` provides consistent styled popups for feedback.

**Push Notification System**: Minimal, non-spam push notifications via OneSignal with strict limits:
- **Daily Streak Reminders**: Max 1 per day, only for users with active streaks who haven't opened the app today. Rotates between message variants. No generic "come back" messages.
- **Challenge Notifications**: Only triggered when a challenge is received or accepted. No reminders or follow-ups.
- **Token Registration**: Device tokens stored in `push_tokens` table with `user_id`, `device_token`, `platform`, `last_active`, `last_notification_sent`, and `updated_at` fields.
- **Edge Functions**: `send-daily-notifications` (scheduled server-side) and `send-challenge-notification` (triggered on challenge create/accept).
- **App Open Tracking**: `last_active` updated in `push_tokens` on each app open to filter out active users from streak reminders.

Asset management is centralized for optimized WebP images, including 16 Islamic mascot characters and 34 avatar options.

## External Dependencies

### Third-Party Services
-   **Supabase**: Authentication, database, real-time subscriptions, Edge Functions.
-   **OneSignal**: Push notifications for daily reminders.

### Core Libraries
-   **UI & Animation**: `framer-motion`, `lucide-react`, `react-router-dom`.
-   **State Management**: `zustand`.
-   **Build Tool**: `vite`.
-   **Encryption**: `crypto-js` (AES for cloud sync).

### Asset Dependencies
-   **Media**: Locally bundled WebP images and an SVG favicon.
-   **Mascots**: 16 WebP characters.
-   **Avatars**: 34 avatar options.