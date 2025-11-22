# Islam Quest - Educational Mobile Web App

## Overview
Islam Quest is a mobile-first web application designed as a gamified Islamic learning platform. Its core purpose is to provide an interactive and engaging educational experience, guiding users through structured learning paths that cover fundamental Islamic beliefs, stories of prophets, and essential knowledge. The project aims to make Islamic education accessible and foster continuous learning and spiritual growth through features like a friendly mascot (Zayd), an achievement system, customizable avatars, and quiz-based assessments.

## User Preferences
Preferred communication style: Simple, everyday language.

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
- **Progression Model**: XP and coin rewards, streak system, universal lesson locking for sequential progression, tiered freemium model, and a 10-level Diamond progression system.
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
- **Mascots (November 22, 2025)**: 16 culturally authentic Islamic mascot characters in WebP format (60KB-209KB each):
  - **Core Mascots** (10):
    - `mascot_sitting.webp` - Home page, lesson pages, quiz states
    - `mascot_running.webp` - Speed Run challenge mode
    - `mascot_boss.webp` - Challenge and boss contexts
    - `mascot_congratulation.webp` - Success celebrations
    - `mascot_waving.webp` - Daily quests
    - `mascot_pointing.webp` - Teaching contexts (renamed from teaching, Nov 22)
    - `mascot_onboarding.webp` - Onboarding flow
    - `mascot_defeated.webp` - Failure states
    - `mascot_reading.webp` - Legacy mascot
    - `mascot_tasbih.webp` - Spiritual contexts
  - **Extended Variants** (6): sitting_v2, pointing_v2 (replaces dua), quiz, scholar, locked, power
  - **Note**: `mascot_dua` removed and replaced with `mascot_pointing_v2` throughout codebase