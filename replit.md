# Islam Quest - Educational Mobile Web App

## Overview
Islam Quest is a mobile-first web application designed as a gamified Islamic learning platform. Its core purpose is to provide an interactive and engaging educational experience, guiding users through structured learning paths that cover fundamental Islamic beliefs, stories of prophets, and essential knowledge. The project aims to make Islamic education accessible and foster continuous learning and spiritual growth through features like a friendly mascot (Zayd), an achievement system, customizable avatars, quiz-based assessments, and a complete social friends system. The business vision is to make Islamic education engaging and widely accessible, with significant market potential for a gamified, faith-based learning platform.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The application features a mobile-first responsive design with a bottom navigation pattern, edge-to-edge layouts, and safe-area support. A comprehensive layout refactor eliminates viewport-based height issues and ensures consistent spacing. The ScrollToTop component ensures instant page scrolling on navigation. Learning paths are displayed in a structured timeline with a 3-column layout. Theming uses a consistent color palette with CSS variables (Navy, Gold, Emerald Green, Light Gray), and GPU-optimized CSS and Framer Motion animations provide smooth transitions. Custom LoadingScreens with shimmer skeleton loaders and eager image preloading enhance the user experience.

### Technical Implementations
The frontend is built with React 18.2, Vite, JavaScript, and React Router DOM v7.9. State management utilizes local React hooks and global Zustand stores for `progressStore`, `userStore`, `friendsStore`, `modalStore`, `eventsStore`, `dailyQuestStore`, and `challengeStore`, with LocalStorage for persistence. A sophisticated challenge question engine dynamically selects questions, prevents repetition, scales difficulty, and uses memoization for performance. Performance is optimized with route-based code splitting, Duolingo-style eager image preloading, critical hero asset preloading, direct navigation, and `React.memo`. A unified, global modal system features multiple types, dual rendering strategies, Duolingo-style animations, and race condition protection. A global back button handler intercepts physical phone back button presses with a custom exit confirmation modal. Arabic honorifics (ﷻ, ﷺ, عليه السلام) are dynamically added across the application for authenticity.

### Feature Specifications
The application includes 14 complete learning paths with lessons and quizzes, exclusively sourced from Qur'an and Sahih Hadith. The progression model incorporates XP and coin rewards, a streak system, universal lesson locking for sequential progress, a comprehensive freemium model, and a 10-level Diamond progression system. All quizzes, daily quests, and global events require a 75% passing threshold.
The premium model offers free tier limits (0-3 free lessons depending on the path) and premium plans (Individual £4.99/month, Family £18/month) for access to all 14 paths, unlimited lessons, Global Events, and a premium badge. Paths 11-14 and Global Events are premium-only. Social features include friend management, a friends leaderboard, an activity feed, and quick messaging. Gamification elements comprise four friend challenge modes (Mind Battle, Lightning Round, Speed Run, Sudden Death), a daily Boss Level (pulls questions from the last third of all 14 paths combined), weekly Global Events, Daily Quests, and a Streak Freeze system. The Revise tab features two modes: Review Mistakes (unlocks after first quiz mistake) and Smart Revision (unlocks after completing 40 lessons), with intelligent migration logic for existing users. The application supports customizable avatars, with 32 selectable options plus 2 hidden ninja avatars reserved for special accounts. An Easter Egg on the Home page awards +1 XP when the mascot is tapped 5 times within 3.5 seconds, accompanied by a sparkle animation on the XP counter.

### System Design Choices

**Identity vs Progress Separation (Nov 2025 Refactor)**: The app now cleanly separates identity data from progress data:
- **Identity (useUserStore)**: Manages username, avatar, handle - synced via `saveCloudProfile()` which only updates these three fields, never sends null values
- **Progress (progressStore)**: Manages xp, coins, streak, shield_count - synced via `syncToSupabase()` which never touches identity fields
- **Avatar Storage**: Stored as INTEGER index in Supabase (0-33), converted to/from string key in app via `avatarKeyToIndex()` and `avatarIndexToKey()`
- **Profile Completeness**: `isProfileComplete()` checks if username (not "UserXXXX" pattern) and handle are set - triggers onboarding if incomplete

**Profile Creation Architecture (Nov 2025)**:
- Profiles are ONLY created after onboarding completes, NEVER at app startup
- `init()` uses `checkProfileExists()` - only checks, never inserts
- `completeOnboarding()` calls `createProfileAfterOnboarding()` to insert profile with ALL required fields (no nulls)
- If profile already exists but incomplete, `saveCloudProfile()` updates identity fields
- Startup sequence: silentAuth → deviceId → checkProfileExists → onboarding OR load stores

**Supabase Integration Status**: Silent account creation on first launch with permanent Supabase UID. Auto-login on every app open using hidden email/password credentials. The progressStore automatically syncs to Supabase cloud on all state changes (WRITE) with 5-second throttling and AES encryption for sensitive data. On app start, it restores from cloud if cloud data is newer (READ). Note: Challenges are now 100% local (no Supabase), while Global Events remain cloud-backed.

**Challenge System (100% Local - Nov 2025 Refactor)**:
- All challenge functionality runs locally with NO Supabase dependency
- `createChallenge()` builds local challenge objects with `crypto.randomUUID()` fallback
- `submitChallengeAttempt()` generates random opponent results locally and determines winner
- `saveBossAttempt()` stores Boss Level attempts in localStorage
- `canPlayBossToday()` checks local bossAttempts array
- `getQuestionsForMode()` pulls from completed lesson pools, falls back to 60 diverse fallback questions
- Fallback questions cover all difficulty levels; expandQuestionPool() recycles for high-count modes (Speed Run)
- Boss Level locked at level >= 8 only (no premium/lesson requirements)
- Winner determination uses 'current_user' sentinel for challenger ID

**Revision System (Nov 2025 Refactor)**: The reviseStore uses a lightweight data structure that only stores cardId, lessonId, and tracking counts (timesWrong, timesCorrect, lastReviewedAt, updatedAt) - NOT full question content. Question content is looked up at render time via `getQuizForLesson()` using the cardId format `${pathId}_${lessonId}_${questionIndex}`. Key functions:
- `saveWrongQuestion(cardId, lessonId)` - Called when user answers incorrectly in QuizScreen
- `clearCorrectQuestion(cardId, lessonId)` - Called when user answers correctly in Revise mode
- `getWeakPool()` - Returns array of weak question references
- Revise.jsx uses `enrichWeakPool()` to hydrate cardIds with full question data from quizEngine
- Cloud sync via `revisionSync.js` with `convertToCloudRow()`/`convertFromCloudRow()` in `revisionData.js`
- Supabase table `revision_items` requires unique constraint on `(user_id, lesson_id, card_id)`

**Events System (Phase 6)**: Global Events load cloud entries on mount via `loadMyEntries`. Event quiz submissions pass completion time to `enterEventCloud` for tiebreaker rankings. The 75% pass threshold applies to all quizzes, daily quests, boss level, and global events.

**Dev Mode System**: A toggle in Settings enables local-only testing without touching Supabase. When DEV_MODE is true: challenges generate fake opponents with random results, Boss Level allows unlimited plays, Global Events use mock leaderboards, and all rewards are applied locally. A persistent yellow banner shows "DEV MODE ACTIVE" at the top of the screen. Configuration is stored in `src/config/dev.js` and persisted via localStorage. This allows safe testing of all Phase 6 features without polluting production data.

**Payment Service (Nov 2025)**: Unified payment service layer ready for Google Play Billing and Apple IAP integration:
- Located at `src/services/paymentService.js`
- Provides: `loadProducts()`, `purchase(productId)`, `confirmPurchase()`, `restorePurchases()`
- Automatically detects Capacitor native platform for Google/Apple IAP
- Falls back to existing `purchaseIndividual()`/`purchaseFamily()` on web
- On successful purchase: logs to Supabase `purchases` table with platform & receipt, then activates premium via existing `unlockPremium()` function
- `restorePurchases()` checks Supabase purchases table first, then native store, then localStorage
- Product IDs: `individual_monthly` (£4.99), `family_monthly` (£18.00)
- Store product IDs: `islamquest_individual_monthly` / `islamquest.individual.monthly` (Google/Apple)
- **No restructuring**: All existing premium logic (`premium`, `hasPremium`, `premiumStatus`, `purchaseIndividual`, `purchaseFamily`) remains untouched

Asset management is centralized via `assets.js` for optimized WebP images. Development and deployment use Vite.

## External Dependencies

### Third-Party Services
- **Supabase**: Used for authentication, database, and real-time subscriptions.
- **OneSignal**: Push notifications via react-onesignal v2 API. Initialized in App.jsx after onboarding, uses `OneSignal.login()` with Supabase user ID, prompts for permission via `OneSignal.Slidedown.promptPush()`, stores subscription ID to `push_tokens` table. Supabase Edge Function (`send-daily-notifications`) sends automated daily reminders via CRON. Requires `VITE_ONESIGNAL_APP_ID` env var and `ONESIGNAL_REST_API_KEY` secret in Edge Function.

### Core Libraries
- **UI & Animation**: `framer-motion`, `lucide-react`, `react-router-dom`.
- **State Management**: `zustand`.
- **Build Tool**: `vite`.
- **Encryption**: `crypto-js` (AES encryption for cloud sync).

### Asset Dependencies
- **Media**: All visual assets are locally bundled WebP images and an SVG favicon.
- **Mascots**: 16 culturally authentic Islamic mascot characters in WebP format, all actively used across various UI contexts (recently optimized - removed 4 unused mascots).
- **Avatars**: 34 total avatar options (32 selectable by users + 2 hidden ninja avatars for special accounts).