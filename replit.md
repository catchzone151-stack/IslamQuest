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
**Supabase Integration Status**: Phase 3 Step 1 complete (WRITE sync implemented). Anonymous auth and device fingerprinting ready. The progressStore now automatically syncs to Supabase cloud on all state changes (XP, coins, quiz completion, lesson unlocks, premium purchases) with 5-second throttling and AES encryption for sensitive data. Sync will activate once Supabase database tables are created (Phase 2). Asset management is centralized via `assets.js` for optimized WebP images. Development and deployment use Vite.

## External Dependencies

### Third-Party Services
- **Supabase**: Used for authentication, database, and real-time subscriptions.

### Core Libraries
- **UI & Animation**: `framer-motion`, `lucide-react`, `react-router-dom`.
- **State Management**: `zustand`.
- **Build Tool**: `vite`.
- **Encryption**: `crypto-js` (AES encryption for cloud sync).

### Asset Dependencies
- **Media**: All visual assets are locally bundled WebP images and an SVG favicon.
- **Mascots**: 16 culturally authentic Islamic mascot characters in WebP format, all actively used across various UI contexts (recently optimized - removed 4 unused mascots).
- **Avatars**: 34 total avatar options (32 selectable by users + 2 hidden ninja avatars for special accounts).