# Islam Quest - Educational Mobile Web App

## Overview
Islam Quest is a mobile-first web application designed as a gamified Islamic learning platform. Its core purpose is to provide an interactive and engaging educational experience, guiding users through structured learning paths that cover fundamental Islamic beliefs, stories of prophets, and essential knowledge. The project aims to make Islamic education accessible and foster continuous learning and spiritual growth through features like a friendly mascot (Zayd), an achievement system, customizable avatars, quiz-based assessments, and a complete social friends system.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Major Updates (November 23, 2025)

### ✅ Premium UI/UX Polish (Complete - November 23, 2025)
- **Lock Overlays**: Added visual grey overlays with Lock icons to premium-only paths (11-14) on Home carousel, indicating "Premium Only" status
- **Global Events Overlay**: Added "Coming Soon Ramadan 2025" overlay to Global Events widget, consistent with temporary disable status
- **Premium Page Redesign**: Complete redesign from full-screen to compact modal-style (~520px centered), featuring sitting mascot, glassmorphism, stacked pricing cards, and gold gradient buttons matching modal theme
- **Navigation Blocking**: Implemented proper premium gating with `ensureLocksReady()` check - clicking locked paths now shows premium paywall modal (MODAL_TYPES.PURCHASE) instead of allowing navigation
- **Production Guards**: Premium paths properly gated with modal system, no bypass routes

### ✅ Production Launch Cleanup (Complete - November 22, 2025)
- **All Dev/Beta Infrastructure Removed**: Deleted developerStore.js, DeveloperModal, debug routes, betaMode checks, test bypasses, and developer menu triggers
- **Versioned Storage Migration**: Implemented "iq_production_v1" namespace with automatic legacy data cleanup and error handling for restricted storage environments
- **Premium System Hardening**: 
  - Removed EventQuiz preload to prevent premium bypass via deep links
  - Added `locksReady` flag gating all lock accessors during hydration
  - Storage capability probe with window-level fallback for private mode browsers
- **Global Events**: Temporarily disabled with "Coming Soon Ramadan 2025" modal (premium feature)
- **Production Guards**: Clean codebase with no dev bypasses, test modes, or debug UI - ready for public deployment

### Premium System Rebuild (Complete Rewrite)
- **Quiz Scoring Update**: Changed from hardcoded "3 out of 4" to universal 75% passing threshold (applies to all quizzes, daily quests, events)
- **Supabase-Ready Fields**: Added `premium` (boolean), `premiumType` ("individual" | "family"), `premiumActivatedAt` (timestamp) to progressStore
- **Unified Locking System**: New functions replace scattered logic:
  - `getLessonLockState(pathId, lessonId)` → Returns "unlocked" | "progressLocked" | "premiumLocked"
  - `isPremiumLocked(pathId, lessonId)` → Boolean premium paywall check
  - `canAccessLesson(pathId, lessonId)` → Boolean UI/navigation check
  - `applyLockingRules()` → Recalculates all locks based on current progress
- **Premium Config**: Exact free lesson limits per path (paths 11-14 = 0 free lessons, paths 5-7 = 2, others = 3)
- **Premium-Only Paths**: Paths 11-14 (The Grave, Day of Judgement, Hellfire, Paradise) require premium from lesson 1
- **Global Events**: Now premium-only feature with grey overlay and premium redirect for free users
- **Premium Page**: New `/premium` route with Duolingo-style design, two plan options (Individual £4.99, Family £18), and comprehensive benefits list
- **UI Updates**: Grey overlays with lock icons on premium-only paths; updated Profile popup with X close button, updated benefits, and redirect to Premium page
- **Async Purchase Functions**: `purchaseIndividual()` and `purchaseFamily()` now async for future payment integration
- **Backwards Compatibility**: Maintained `hasPremium` and `premiumStatus` fields alongside new system

### New Friends System (Duolingo-Style)
- **Complete Replacement**: Removed legacy AI friends system; implemented production-ready username-based friends system
- **Username Onboarding**: Added new username selection step after avatar selection during onboarding
- **User Identity Model**: Users now have unique usernames (3-20 chars, lowercase letters/numbers/underscore), plus display nicknames
- **Friendship Architecture**: Single source of truth with `friendships` array (Supabase-ready design)
- **Core Features**: Send/accept/decline/cancel friend requests; search users by username; friend profiles; remove friends
- **UI Components**: Three-tab interface (Friends, Requests, Search) with Islam Quest theming
- **No Legacy Code**: Removed all simulated friends, beta helpers, and dev tools from friends system

## System Architecture

### UI/UX Decisions
- **Design**: Mobile-first responsive design with a bottom navigation pattern, featuring edge-to-edge layouts and safe-area support.
- **Layout**: Comprehensive layout refactor eliminating viewport-based height issues and ensuring consistent spacing, especially for bottom navigation clearance and content alignment.
- **Scrolling**: Enhanced ScrollToTop component ensures all pages scroll to the top instantly on navigation.
- **PathPage Layout**: Structured timeline display with a 3-column layout for learning paths, including section headings, vertical timeline, and lesson titles.
- **Theming**: Consistent color palette using CSS variables (Navy, Gold, Emerald Green, Light Gray).
- **Animations**: GPU-optimized CSS and Framer Motion animations for smooth transitions.
- **Loading UX**: Custom LoadingScreen with shimmer skeleton loaders and eager image preloading.

### Technical Implementations
- **Frontend**: React 18.2, Vite, JavaScript, React Router DOM v7.9.
- **State Management**: Local state with React hooks, global state with Zustand (`progressStore`, `userStore`, `friendsStore`, `modalStore`, `eventsStore`, `dailyQuestStore`, `challengeStore`), and LocalStorage for persistence.
- **Challenge Question Engine**: Advanced question selection system pulling from completed lessons, preventing repetition, dynamically expanding question variations, scaling difficulty, and using a memoized cache for performance.
- **Performance**: Route-based code splitting, Duolingo-style eager image preloading, critical hero asset preloading, direct navigation, and `React.memo` for component optimization.
- **Modal System**: Unified, global modal system with multiple types, dual rendering strategies, Duolingo-style animations, and race condition protection.

### Feature Specifications
- **Content Structure**: 14 complete learning paths with lessons and quizzes, exclusively sourced from Qur'an and Sahih Hadith, each with standardized formatting.
- **Progression Model**: XP and coin rewards, streak system, universal lesson locking for sequential progression, comprehensive premium freemium model, and a 10-level Diamond progression system.
- **Quiz Logic (Updated November 22, 2025 - Universal 75% Rule)**:
  - **Universal Passing Threshold**: All quizzes now use 75% rule (changed from hardcoded 3/4) via `calculateResults()` in quizEngine.js
  - **Lesson Quizzes**: Require 75% (3/4 for 4-question quizzes) to pass and unlock next lesson
  - **Daily Quest**: Uses 75% threshold with 5 questions
  - **Global Events**: Uses 75% threshold with 10 questions
  - **Score Tracking**: progressStore tracks actual scores in bestScore field, preserves previous passes when recording failed attempts
  - **Mascot Display Rules**: pointing_v2 during all quiz gameplay, sitting_v2 for low scores, congratulation for passing scores
  - **Rewards**: Only awarded (XP/coins) and lessons only unlock when quiz is passed, but all attempts are recorded
- **Premium Model (Rebuilt November 22, 2025)**:
  - **Free Tier Limits**: Paths 1-4,8-10 (3 free lessons), Paths 5-7 (2 free lessons), Paths 11-14 (0 free lessons - premium-only)
  - **Premium Plans**: Individual (£4.99/month), Family (£18/month for 6 users)
  - **Premium Benefits**: All 14 paths, unlimited lessons, Global Events access, premium badge
  - **Locking System**: Sequential progression + premium paywall (both apply, premium users still unlock sequentially)
  - **Premium-Only Features**: Paths 11-14 (The Grave, Day of Judgement, Hellfire, Paradise) + Global Events
- **Social Features**: Friend management, friends leaderboard (Friend of the Week), activity feed, and quick messaging.
- **Gamification**:
    - **Friend Challenges**: 4 game modes (Mind Battle, Lightning Round, Speed Run, Sudden Death) with a 48-hour active window, questions from shared completed lessons, and rewards.
    - **Boss Level**: Daily ultra-hard challenge for Level 8+ users with randomized questions and specific rewards.
    - **Global Events**: Weekly competitive events with themed challenges, leaderboards, and rank-based rewards.
    - **Daily Quests**: Solo daily challenge with MCQs from completed lessons, awarding XP and coins.
    - **Streak Freeze**: Duolingo-style streak protection with purchasable shields.

### System Design Choices
- **Authentication**: Supabase Auth integration planned; currently uses LocalStorage for temporary persistence.
- **Asset Management**: Centralized `assets.js` for optimized WebP images.
- **Development & Deployment**: Vite for development and production builds.
- **Beta Testing Infrastructure**: Hidden developer menu for closed beta testing with features like unlocked lessons/quizzes, playable Boss Level, unlimited daily quests, simulated friends system (6 AI opponents), and enhanced challenge testing capabilities. Developer tools include toggling Beta Mode, resetting progress, and viewing debug info.

## External Dependencies

### Third-Party Services
- **Supabase**: Configured for authentication, database, and real-time subscriptions.

### Core Libraries
- **UI & Animation**: `framer-motion`, `lucide-react`, `react-router-dom`.
- **State Management**: `zustand`.
- **Build Tool**: `vite`.

### Asset Dependencies
- **Media**: WebP images for all visual assets and SVG favicon. All assets are locally bundled.
- **Mascots (November 22, 2025)**: 17 culturally authentic Islamic mascot characters in WebP format (60KB-209KB each):
  - **Core Mascots** (10):
    - `mascot_sitting.webp` - Home page, lesson pages, quiz states
    - `mascot_running.webp` - Speed Run challenge mode
    - `mascot_boss.webp` - Challenge and boss contexts
    - `mascot_congratulation.webp` - Success celebrations
    - `mascot_waving.webp` - Daily quests
    - `mascot_pointing.webp` - Teaching contexts (replaced with new pointing/teaching pose, Nov 22)
    - `mascot_onboarding.webp` - Onboarding flow
    - `mascot_defeated.webp` - Failure states
    - `mascot_reading.webp` - Legacy mascot
    - `mascot_tasbih.webp` - Spiritual contexts
  - **Extended Variants** (7): sitting_v2, pointing_v2 (replaces dua), quiz, scholar, locked, power, countdown
  - **Countdown Mascot**: `mascot_countdown.webp` - Exclusive mascot for all countdown timers (3-2-1) in challenges and events
  - **Note**: `mascot_dua` removed and replaced with `mascot_pointing_v2` throughout codebase