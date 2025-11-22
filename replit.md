# Islam Quest - Educational Mobile Web App

## Overview
Islam Quest is a mobile-first web application designed as a gamified Islamic learning platform. Its core purpose is to provide an interactive and engaging educational experience, guiding users through structured learning paths that cover fundamental Islamic beliefs, stories of prophets, and essential knowledge. The project aims to make Islamic education accessible and foster continuous learning and spiritual growth through features like a friendly mascot (Zayd), an achievement system, customizable avatars, and quiz-based assessments.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Beta Testing Infrastructure (November 2025)
- **Beta Mode**: Hidden developer menu for closed beta testing, accessible via 5 taps on home mascot within 4 seconds
- **Features when betaMode = true**:
  - All lessons/quizzes unlocked regardless of progress or level
  - Boss Level playable below Level 8 requirement (bypasses level gate)
  - Daily Quest repeatable unlimited times
  - Simulated Friends System automatically activated (6 AI opponents with varied difficulty)
  - Challenge friends on ANY completed lesson (bypasses shared lessons requirement)
  - Challenges work even with NO completed lessons (uses fallback question pool)
  - Quick challenge button (⚔️) in Friends tab for instant challenge navigation
  - XP, streak, coin, challenge rewards still function normally (no god mode)
- **Developer Tools**:
  - Toggle Beta Mode ON/OFF
  - Reset Onboarding State
  - Reset Full Progress (including friends, challenges, daily quests, all progress)
  - View Debug Info (XP, coins, streak, level, completed lessons, app version)
  - Subtle "BETA – Not Final" watermark in Settings when active
- **Simulated Friends System (Beta Mode Only)**:
  - **6 AI Friends**: BraveBeliever, IbadahHero, NurSeeker, QuranKnight, SunnahRider, GuidedStriver
  - **Difficulty Distribution**: 2 smart (85-88% accuracy, 3-8s response), 2 medium (65-68% accuracy, 5-12s response), 2 weak (45-48% accuracy, 8-18s response)
  - **Behavior**: Auto-appear in Friends list and Global Leaderboard, accept challenges automatically with realistic delay, simulate gameplay based on difficulty
  - **Persistence**: Stored separately in localStorage, auto-initialize on beta mode ON, auto-cleanup on beta mode OFF
  - **Integration**: Work with existing challenge system, leaderboard sorting (XP→Level→Coins), Friend of the Week
  - **Challenge Testing**: Challenges can be completed fully in beta mode; shared lessons check bypassed, fallback question pool (12 basic Islamic questions) provided when no lessons completed, quick challenge button navigates to Challenge page with friend pre-selected
- **Security**: Menu not discoverable through normal UI, local-storage based only
- **Safety**: When betaMode = false, app behaves exactly as production release with simulated friends removed

### UI/UX Decisions
- **Design**: Mobile-first responsive design with a bottom navigation pattern.
- **Responsive Design (November 2025)**: Complete mobile-first audit with progressive enhancement for safe-area support. Edge-to-edge layout with 76px BottomNav clearance (exact nav bar height). CSS !important + env() safe-area-inset-bottom ensures proper spacing on iOS/Android notch devices. All modals support safe-area with fallback padding. Touch targets meet 44px accessibility minimum.
- **Scroll-to-Top (Nov 19, 2025)**: Enhanced ScrollToTop component ensures all pages scroll to the top instantly on navigation. Handles window, document, body, and .screen containers for comprehensive coverage across all browsers and scroll contexts.
- **Layout Architecture (November 2025)**: Comprehensive layout refactor eliminates viewport-based height issues and edge padding for APK builds:
  - **Zero viewport units**: All instances of 100vh, min-height: 100vh removed; replaced with height: 100% on html, body, #root to eliminate WebView issues
  - **Edge-to-edge Design (Nov 19, 2025)**: Removed all horizontal padding from `.screen` class wrapper to eliminate side borders. Individual content sections (headers, cards, carousels) have their own 16px horizontal padding for proper content spacing while maintaining flush edges.
  - **App.css Import Fix (Nov 19, 2025)**: Added missing `import "./App.css"` in src/index.jsx to ensure `.screen` CSS rules actually load in bundle
  - **Bottom Nav Clearance**: `.screen` class sets `padding-bottom: 76px` with `calc(76px + env(safe-area-inset-bottom, 0px))` for flush nav bar alignment
  - **Mascot Overlap Prevention (Nov 19, 2025)**: Fixed lesson pages where mascot (72px, positioned at top: 16px) overlapped with titles. Set title `marginTop: 100px` to ensure content starts below mascot (88px total height) with safe clearance.
  - **Friend Card Overflow Fix (Nov 19, 2025)**: Added `overflow: hidden` to friend cards, optimized button spacing, and added `flexShrink: 0` to action buttons to prevent challenge/message buttons from extending outside container boundaries.
  - **Consistent Background**: CSS variable --navy aligned to #0a2a43 across App.css and index.css, ensuring navy background extends edge-to-edge
  - **Components Updated**: ScreenContainer, ScreenWrapper, Home.jsx, all onboarding screens, main pages, challenge screens, EventModals.css, Friends.jsx, Lesson.jsx optimized
- **Theming**: Consistent color palette using CSS variables: Navy (#0a2a43) for backgrounds, Gold for accents, Emerald Green for success, and Light gray for text.
- **Animations**: GPU-optimized CSS and Framer Motion animations for smooth 60fps transitions and interactive elements.
- **Loading UX**: Custom LoadingScreen with shimmer skeleton loaders and eager image preloading to prevent layout shifts and pop-in lag.

### Technical Implementations
- **Frontend**: React 18.2, Vite, JavaScript, React Router DOM v7.9.
- **State Management**: Local state with React hooks, global state with Zustand (for `progressStore`, `userStore`, `friendsStore`, `modalStore`, `eventsStore`, `dailyQuestStore`, `challengeStore`), and LocalStorage for persistence (with future migration to Supabase).
- **Challenge Question Engine (November 2025)**: Advanced question selection system with:
  - **Universal Pool**: Questions pulled from ALL completed lessons across all learning paths (not just shared lessons)
  - **Beta Mode Enhanced Pool**: In beta mode, pulls from ALL lessons across ALL 14 paths (full database access) ensuring zero duplicates
  - **Repetition Prevention**: Tracks last 50 questions shown, prevents showing same questions repeatedly
  - **Dynamic Expansion**: Auto-generates question variations (shuffled options, same content) for users with few completed lessons
  - **Difficulty Scaling**: Mind Battle (hard/medium), Lightning Round (all), Speed Run (medium/easy preferred), Sudden Death (mixed), Boss Level (hard only)
  - **Performance Cache**: Memoized question pool rebuilt only when lessons are completed or beta mode toggled
  - **Intelligent Cache Invalidation**: Cache rebuilds when lesson completion changes OR beta mode toggles
- **Performance (November 2025)**: Route-based code splitting with eager preloading on mount. Duolingo-style image preloading using `import.meta.glob` auto-discovery loads ALL production images (~43 images) in ~400-1000ms immediately on app start. Critical hero assets use `<link rel="preload">` for instant first paint. Direct navigation (no transition delays) ensures instant page switches. `React.memo` optimizes component re-renders. Result: zero image pop-in lag across entire app.
- **Modal System**: Unified, global modal system with 21 modal types, dual rendering strategies (inline/portal), Duolingo-style fade+scale animations, and race condition protection.

### Feature Specifications
- **Content Structure**: 14 complete learning paths with lessons and quizzes, exclusively sourced from Qur'an and Sahih Hadith. Each lesson includes standardized formatting (paragraphs, Arabic evidence, source citations, "Key Lesson Learned").
- **Progression Model**: XP and coin rewards, streak system, certificates for path completion. Features a universal lesson locking system enforcing sequential progression and a tiered freemium model with premium unlocking content. Includes a 10-level Diamond progression system.
- **Social Features**: Friend management (add/search, requests), friends leaderboard (Friend of the Week), activity feed, and quick messaging.
- **Gamification**:
    - **Friend Challenges (November 2025)**: 4 game modes with 48-hour active window, questions from shared completed lessons, and rewards:
        - **Mind Battle (🧠)**: 8 questions, no time limit, fastest time wins tiebreakers, displays elapsed time counter
        - **Lightning Round (⚡)**: 10 questions in 60 seconds total
        - **Speed Run (🏃)**: Answer as many questions correctly in 30 seconds (40 questions prepared, auto-recycles if needed), wrong answers don't end game
        - **Sudden Death (⛓️)**: 25 questions - one wrong ends the game, fastest time wins draws (auto-recycles questions if user has completed fewer than 25 lessons)
    - **Boss Level (November 2025)**: Daily ultra-hard challenge for Level 8+ users featuring 12 randomized questions from a pool of 90 authentic Islamic questions in 30 seconds. Rewards: +500 XP, +100 coins for wins (60%+ correct, i.e., 8/12). Includes robust scoring fix (setTimeout with state capture), direct mode passing via closure to bypass async state issues, visible countdown timer, and appropriate mascot display (congratulation on win, defeated on loss).
    - **Global Events**: Weekly competitive events (4 themed challenges) with 10 hard MCQs, entry fees, provisional and final leaderboards, and rank-based rewards.
    - **Daily Quests**: Solo daily challenge with 8 MCQs from user's completed lessons, awards XP and coins, resets daily.
    - **Streak Freeze**: Duolingo-style streak protection with purchasable shields and an option to repair broken streaks.

### System Design Choices
- **Authentication**: Supabase Auth integration planned using `@supabase/auth-helpers-react` and `@supabase/supabase-js`. Currently, LocalStorage is used for temporary persistence.
- **Asset Management**: Centralized `assets.js` for optimized WebP images.
- **Development & Deployment**: Vite for development and production builds.

## Cleanup Status (November 22, 2025)

### Badge & Certificate System - COMPLETELY REMOVED ✅
- **Removed Files**: `src/assets/certificates/`, `src/assets/.originals_backup/`, badge/certificate components
- **Removed Logic**: `earnCertificate()` function, badge award triggers, badge modal types
- **Store Cleanup**: progressStore, modalStore, eventsStore all verified clean
- **Route Cleanup**: No badge/certificate routes found in Router (routing done in App.jsx)
- **Asset Cleanup**: public folder clean (no badge/cert assets)
- **Status**: System completely purged, zero badge/certificate references remaining

## External Dependencies

### Third-Party Services
- **Supabase**: Configured for authentication, database, and real-time subscriptions.

### Core Libraries
- **UI & Animation**: `framer-motion`, `lucide-react`, `react-router-dom`.
- **State Management**: `zustand`.
- **Build Tool**: `vite`.

### Asset Dependencies
- **Media**: WebP images for all visual assets and SVG favicon. All assets are locally bundled.
- **Mascots (November 2025)**: 11 culturally authentic Islamic mascot characters in WebP format (99-205KB each):
  - `mascot_sitting.webp` - Home page featured mascot, lesson pages, and all quiz states (start, thinking, correct, incorrect)
  - `mascot_running.webp` - Speed Run challenge mode icon (replaces running emoji)
  - `mascot_boss.webp` - Challenge and boss level contexts
  - `mascot_congratulation.webp` - Success and achievement celebrations (quiz pass, challenge wins)
  - `mascot_waving.webp` - Daily quests and friendly greetings
  - `mascot_pointing.webp` - Teaching contexts
  - `mascot_onboarding.webp` - Onboarding flow
  - `mascot_defeated.webp` - Failure states (quiz fail, challenge losses)
  - `mascot_reading.webp` - Legacy mascot (replaced by mascot_sitting)
  - `mascot_dua.webp` - Contemplative moments
  - `mascot_tasbih.webp` - Spiritual contexts