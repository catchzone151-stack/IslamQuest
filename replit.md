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
  - XP, streak, coin, challenge rewards still function normally (no god mode)
- **Developer Tools**:
  - Toggle Beta Mode ON/OFF
  - Reset Onboarding State
  - Reset Full Progress (including friends, challenges, daily quests, all progress)
  - View Debug Info (XP, coins, streak, level, completed lessons, app version)
  - Subtle "BETA – Not Final" watermark in Settings when active
- **Security**: Menu not discoverable through normal UI, local-storage based only
- **Safety**: When betaMode = false, app behaves exactly as production release

### UI/UX Decisions
- **Design**: Mobile-first responsive design with a bottom navigation pattern.
- **Responsive Design (November 2025)**: Complete mobile-first audit with progressive enhancement for safe-area support. CSS-based fallback + enhancement pattern ensures 90-110px BottomNav clearance on ALL browsers (legacy + modern), with safe-area bonus on iOS/Android notch devices. Inline numeric fallbacks (90px, 110px) override with CSS !important + env() for safe-area-inset-bottom. All modals support safe-area with fallback padding. Touch targets meet 44px accessibility minimum.
- **Theming**: Consistent color palette using CSS variables: Navy for backgrounds, Gold for accents, Emerald Green for success, and Light gray for text.
- **Animations**: GPU-optimized CSS and Framer Motion animations for smooth 60fps transitions and interactive elements.
- **Loading UX**: Custom LoadingScreen with shimmer skeleton loaders and eager image preloading to prevent layout shifts and pop-in lag.

### Technical Implementations
- **Frontend**: React 18.2, Vite, JavaScript, React Router DOM v7.9.
- **State Management**: Local state with React hooks, global state with Zustand (for `progressStore`, `userStore`, `friendsStore`, `modalStore`, `eventsStore`, `dailyQuestStore`), and LocalStorage for persistence (with future migration to Supabase).
- **Performance (November 2025)**: Route-based code splitting with eager preloading on mount. Duolingo-style image preloading using `import.meta.glob` auto-discovery loads ALL production images (~43 images) in ~400-1000ms immediately on app start. Critical hero assets use `<link rel="preload">` for instant first paint. Direct navigation (no transition delays) ensures instant page switches. `React.memo` optimizes component re-renders. Result: zero image pop-in lag across entire app.
- **Modal System**: Unified, global modal system with 21 modal types, dual rendering strategies (inline/portal), Duolingo-style fade+scale animations, and race condition protection.

### Feature Specifications
- **Content Structure**: 14 complete learning paths with lessons and quizzes, exclusively sourced from Qur'an and Sahih Hadith. Each lesson includes standardized formatting (paragraphs, Arabic evidence, source citations, "Key Lesson Learned").
- **Progression Model**: XP and coin rewards, streak system, certificates for path completion. Features a universal lesson locking system enforcing sequential progression and a tiered freemium model with premium unlocking content. Includes a 10-level Diamond progression system.
- **Social Features**: Friend management (add/search, requests), friends leaderboard (Friend of the Week), activity feed, and quick messaging.
- **Gamification**:
    - **Friend Challenges**: 4 game modes (Mind Duel, Lightning Round, Fill-the-Gap, Lightning Chain) with a 48-hour active window, questions from shared completed lessons, and rewards.
    - **Boss Level (November 2025)**: Daily ultra-hard challenge for Level 8+ users featuring 12 randomized questions from a pool of 90 authentic Islamic questions in 30 seconds. Rewards: +500 XP, +100 coins for wins (60%+ correct, i.e., 8/12). Includes robust scoring fix (setTimeout with state capture), direct mode passing via closure to bypass async state issues, visible countdown timer, and appropriate mascot display (congratulation on win, defeated on loss).
    - **Global Events**: Weekly competitive events (4 themed challenges) with 10 hard MCQs, entry fees, provisional and final leaderboards, and rank-based rewards.
    - **Daily Quests**: Solo daily challenge with 8 MCQs from user's completed lessons, awards XP and coins, resets daily.
    - **Streak Freeze**: Duolingo-style streak protection with purchasable shields and an option to repair broken streaks.

### System Design Choices
- **Authentication**: Supabase Auth integration planned using `@supabase/auth-helpers-react` and `@supabase/supabase-js`. Currently, LocalStorage is used for temporary persistence.
- **Asset Management**: Centralized `assets.js` for optimized WebP images.
- **Development & Deployment**: Vite for development and production builds.

## External Dependencies

### Third-Party Services
- **Supabase**: Configured for authentication, database, and real-time subscriptions.

### Core Libraries
- **UI & Animation**: `framer-motion`, `lucide-react`, `react-router-dom`.
- **State Management**: `zustand`.
- **Build Tool**: `vite`.

### Asset Dependencies
- **Media**: WebP images for all visual assets and SVG favicon. All assets are locally bundled.
- **Mascots (November 2025)**: 9 culturally authentic Islamic mascot characters in WebP format (99-205KB each):
  - `mascot_reading.webp` - Home page featured mascot
  - `mascot_boss.webp` - Challenge and boss level contexts
  - `mascot_congratulation.webp` - Success and achievement celebrations
  - `mascot_waving.webp` - Daily quests and friendly greetings
  - `mascot_pointing.webp` - Teaching and lesson contexts
  - `mascot_onboarding.webp` - Onboarding flow
  - `mascot_dua.webp` - Quiz states and contemplative moments
  - `mascot_defeated.webp` - Failure states (available for future use)
  - `mascot_tasbih.webp` - Spiritual contexts (available for future use)