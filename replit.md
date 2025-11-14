# Islam Quest - Educational Mobile Web App

## Overview
Islam Quest is a mobile-first web application designed as a gamified Islamic learning platform. Its core purpose is to provide an interactive educational experience, guiding users through structured learning paths that cover fundamental Islamic beliefs, stories of prophets, and other essential knowledge. Key capabilities include a friendly mascot (Zayd), an achievement system, customizable avatars, and quiz-based assessments to reinforce learning. The project aims to make Islamic education engaging and accessible, fostering continuous learning and spiritual growth.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Technology Stack**: React 18.2, Vite, JavaScript, React Router DOM v7.9, Framer Motion, Lucide React.
- **Design Pattern**: Component-based architecture with a mobile-first responsive design and a bottom navigation pattern.
- **State Management**: Local state using React hooks, global state with Zustand (`progressStore`, `userStore`, `friendsStore`), and LocalStorage for persistence. Future migration to Supabase for cloud synchronization is planned.

### Styling Architecture
- **Approach**: CSS-in-JS using standard CSS files with custom properties for theming.
- **Theme System**: CSS variables define a consistent color palette: Navy (#0B1E2D) for backgrounds, Gold (#D4AF37) for accents, Emerald Green (#10B981) for success, and Light gray (#f3f4f6) for text.
- **Animation**: Built-in CSS keyframes (e.g., fadeIn) for page transitions.

### Data Architecture
- **Content Structure**: 14 complete learning paths (Paths 1-14), each with lessons and quizzes. Content includes "Names of Allah," "Foundations of Islam," "Stories of Prophets," "Life of Muhammad ﷺ," "Understanding Hellfire," and "The Beauty of Paradise." All paths are "available" by default and leverage exclusively Qur'an and Sahih Hadith (Bukhari, Muslim, Abu Dawud, Tirmidhi) as primary sources.
- **Content Standards**: All lessons follow strict formatting: 3 paragraphs (18-28 words each, targeting ~23), Arabic evidence with English translation, source citations, and "Key Lesson Learned" sections. Age 10+ appropriate language throughout. Quizzes have 4 MCQs per lesson with balanced answer indices.
- **Recent Completion (November 2025)**: Paths 13 (Understanding Hellfire - 19 lessons, 76 quiz questions) and 14 (The Beauty of Paradise - 20 lessons, 80 quiz questions) completed with full content, evidence, and assessments.
- **Progression Model**: XP and coin rewards for lesson completion, streak system for daily engagement, and certificates for path completion.
- **Diamond Level System (November 2025)**: Complete 10-level progression system replacing old titles. Levels 1-10 with unique diamond colors (Bronze→Legendary Gold Gradient), auto-calculated XP thresholds designed for quick early progression (Level 2 at 280 XP ≈2 quizzes), level-up detection triggers Zayd mascot popup animation. Global modal integration in App.jsx. Components: `DiamondIcon`, `LevelBadge`, `ViewAllLevelsModal`, `ZaydLevelUpPopup`. Integrated across Profile, Friends leaderboard, and activity feed. Prepared for Supabase migration with clean store architecture.
- **Asset Management**: Centralized `assets.js` system for optimized WebP images (mascots, avatars, badges).
- **Friends System (Phase 4 - November 2025)**: Complete social features including friend management (add/search by nickname), friend requests (incoming/outgoing with accept/decline), friends leaderboard with Friend of the Week, activity feed with Zayd mascot appearances, and quick messaging with 10 pre-set kid-safe motivational messages. All data stored in LocalStorage with Supabase-ready architecture for Phase 5. Friends display diamond level badges throughout.
- **Global Events System (November 2025)**: Weekly competitive events featuring 4 themed challenges (Pillar Clash, Names of Allah Mastery, Faith Test, Seerah Challenge) with 10 hard MCQs each. GMT-based scheduling (Friday-Thursday weeks, results unlock Thursday 22:00). 25 coin entry fee per event, provisional results shown immediately, final results with Top 10 leaderboards and rank-based rewards (1st: +1000 XP/+300 coins). Complete modal system with Zayd mascot integration, countdown animations, and XP/coin rewards integrated with progressStore. Auto-advance quiz flow (500ms delay after answer selection, no Next button). Comprehensive defensive checks prevent duplicate charges, closure issues resolved with selectedAnswerRef, final answer async race condition fixed by passing complete answers array to handleQuizComplete. InsufficientCoinsModal with Zayd mascot for friendly error handling. All data stored in eventsStore with LocalStorage persistence, Supabase-ready architecture. Dev coin grant (5000 coins) gated behind import.meta.env.DEV and hydration check. **Dev Mode Features (November 2025)**: Unlimited quiz retries enabled in development mode via `import.meta.env.DEV` guards at blocking points (GlobalEvents click handler, EventQuiz countdown handler) while preserving true entry state for UI features. Entry blocking moved to GlobalEvents level before navigation for immediate user feedback. **Badge System**: Dual badge system with red "NEW!" badge for un-entered events (disappears on entry) and blue "RESULTS!" badge for unlocked results (disappears after viewing). **Critical Bug Fixes**: FinalResultsModal infinite loop resolved by consolidating function selectors into unified state selector with shallow comparison. Components: `GlobalEvents`, `EventQuiz`, `EventInfoModal`, `CountdownModal`, `ProvisionalResultsModal`, `FinalResultsModal`, `InsufficientCoinsModal`. Question banks in `eventQuestions.js` with 40 total questions sourced from Qur'an and Sahih Hadith.

### Authentication & User Management
- **Provider**: Supabase Auth, integrated via `@supabase/auth-helpers-react` and `@supabase/supabase-js`.
- **Current Status**: Supabase client is configured, but full authentication flows are not yet implemented in components. LocalStorage serves as a temporary persistence layer.

### Build & Deployment
- **Development**: Vite dev server on port 5000 with host binding `0.0.0.0` for Replit compatibility.
- **Production**: `vite build` for optimized bundles and `vite preview` for testing.

## External Dependencies

### Third-Party Services
- **Supabase**: Used for authentication, database, and real-time subscriptions, configured with environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).

### Core Libraries
- **UI & Animation**: `framer-motion`, `lucide-react`, `react-router-dom`.
- **Development Tools**: `vite`, `@vitejs/plugin-react`, `typescript`.

### Asset Dependencies
- **Media Formats**: WebP images for all visual assets (mascots, avatars, badges, certificates) and SVG favicon. All assets are bundled locally.