# Islam Quest - Educational Mobile Web App

## Overview

Islam Quest is a gamified Islamic learning platform built as a mobile-first web application. It provides an interactive educational experience where users progress through learning paths covering Islamic beliefs, stories of prophets, and foundational knowledge. The app features a mascot (Zayd), achievement systems, customizable avatars, and quiz-based assessments to reinforce learning.

## Recent Changes

### November 10, 2025 - Stories of the Prophets Path Implementation (Path ID 3)
- **Work Completed**: Created complete Stories of the Prophets learning path with 47 lessons covering 24 prophets in chronological order, matching quizzes, and path-specific UI
- **Content Creation**:
  - **Created 47 lessons**: Chronological coverage of 24 prophets from Adam to 'Īsā, with 2 parts each (except Idrīs with 1 part)
  - **Content structure**: Each lesson has 4 paragraphs of ~30 words each, authentic Qur'an/Sahih Hadith sources, reflection questions, ages 10+ difficulty
  - **Chronological order**: Early Prophets (Adam, Idrīs, Nuh, Hud, Salih, Ibrahim, Ismail, Lut, Ishaq, Ya'qub, Yusuf, Ayyub, Shu'ayb) → Prophets of Bani Isra'il (Musa, Harun, Dhul-Kifl, Dawud, Sulayman, Ilyas, Al-Yasa', Yunus) → Prophets before 'Īsā (Zakariyya, Yahya, 'Īsā)
  - **Built 47 matching quizzes**: 4 questions each based on specific lesson content, varied answer indices (0-2 distribution similar to Foundations path), moderate difficulty, age-appropriate language
- **UI Updates (Stories of Prophets Path Only - pathId 3)**:
  - **Mascot**: ZaydLantern mascot for Prophets path (distinct from reading/teaching mascots)
  - **Greeting**: "Let's journey through the lives of the Prophets 🌙" for motivational theme
  - **Lesson titles**: Hidden meaning subheadings to match Foundations path clean UI
  - **Section headers**: 3 gold headers positioned left-aligned: "Early Prophets" (lesson 1), "Prophets of Bani Isra'il" (lesson 18), "Prophets Before 'Īsā" (lesson 42)
- **Technical Implementation**:
  - Created `src/data/lessons/prophetsLessons.js` with all 47 lessons
  - Created `src/data/quizzes/prophets.json` with all 47 quizzes
  - Updated `src/screens/Pathway.jsx` with conditional UI rendering for pathId === 3 (mascot, greeting, hidden subtitles, section headers)
  - `src/data/lessonLoader.js` already included prophets path mapping (case 3)
  - Maintained lesson structure: id, title, meaning, description[4], evidence (arabic/translation/source), reflection, quizId
- **Files Created/Modified**: 
  - `src/data/lessons/prophetsLessons.js` (new file, 47 lessons)
  - `src/data/quizzes/prophets.json` (new file, 47 quizzes)
  - `src/screens/Pathway.jsx` (updated with path 3 conditional UI)
- **Quality Assurance**: Architect-approved as production-ready with authentic content, proper quiz alignment, and isolated UI changes for path 3

### November 10, 2025 - Foundations of Islam Path Condensation & UI Polish
- **Work Completed**: Condensed Foundations of Islam lessons and rebuilt quizzes for improved readability; applied custom UI styling for Foundations path only
- **Content Updates**:
  - **Condensed all 17 lessons**: Reduced from 80-100 words per paragraph to ~30 words per paragraph while maintaining meaning and alignment with quizzes
  - **Rebuilt all 17 quizzes**: Created fresh questions matching condensed content with varied answer indices (not always 1 or 2), balanced difficulty, age 10+ language
  - **Quiz quality**: Each quiz has 4 questions based on authentic sources (Qur'an, Sahih Bukhari, Sahih Muslim) that match specific lesson content exactly
- **UI Updates (Foundations Path Only - pathId 2)**:
  - **Mascot**: Replaced reading mascot with teaching mascot (ZaydTeaching) for Foundations path
  - **Greeting**: Changed from "As-salāmu ʿalaykum..." to "Let's strengthen your faith together 💪"
  - **Lesson titles**: Removed meaning subheadings (e.g., "The Declaration of Faith") - now shows only main titles (e.g., "Shahadah")
  - **Section headers**: Shifted left (calc(50% - 80px)) instead of centered, avoiding overlap with lesson nodes
- **Technical Implementation**:
  - Conditional rendering in `Pathway.jsx` ensures UI changes only affect pathId === 2
  - No regressions in Names of Allah path or other learning paths
  - Maintained lesson structure: arabic, title, meaning, description[4], evidence, reflection, quizId
- **Files Modified**: 
  - `src/data/lessons/foundationsLessons.js` (condensed all 68 paragraphs to ~30 words each)
  - `src/data/quizzes/foundations.json` (completely rebuilt all 17 quizzes)
  - `src/screens/Pathway.jsx` (conditional UI changes for Foundations path only)
- **Quality Assurance**: Architect-approved as production-ready with balanced quiz difficulty and proper quiz-to-lesson alignment.

### November 8, 2025 - Dynamic Lesson System Implementation
- **Problem Fixed**: Lessons were hardcoded to only show "Names of Allah" content regardless of which learning path was selected
- **Solution Implemented**:
  - Created centralized lesson data loader (`src/data/lessonLoader.js`) that maps pathId to correct lesson data
  - Created lesson data files for all 14 learning paths (previously only path 1 had content)
  - Updated `Pathway.jsx` to dynamically load lessons based on pathId
  - Updated `Lesson.jsx` to dynamically fetch correct lesson content based on pathId
- **Files Created**: 
  - `src/data/lessonLoader.js` (central routing)
  - 13 new lesson data files for paths 2-14 in `src/data/lessons/`
- **Result**: All 14 learning paths now display correct, unique lesson content without "lesson not found" errors

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: React 18.2 with Vite as the build tool
- **Language**: JavaScript (with TypeScript configuration available but not enforced)
- **Routing**: React Router DOM v7.9 for client-side navigation
- **Animation**: Framer Motion for smooth transitions and interactions
- **Icons**: Lucide React for consistent iconography

**Rationale**: Vite provides blazing-fast HMR and optimized builds compared to traditional bundlers like Webpack. React with Vite offers the quickest development experience for a single-page application with minimal configuration overhead.

**Design Pattern**: Component-based architecture with screen-level components representing different app views. The app uses a mobile-first responsive design approach with a bottom navigation pattern (88px padding-bottom reserved for nav bar).

**State Management**: 
- Local state management using React hooks (useState, useEffect)
- Zustand stores for global state (`progressStore`, `userStore`, `titleStore`)
- LocalStorage persistence for offline-first user progress
  - Progress store key: `islamQuestProgress_v2` 
  - User store key: `iq-user-v2`
  - Version suffixes prevent old cached data from overriding new content
- Future migration planned to Supabase for cloud sync

### Styling Architecture

**Approach**: CSS-in-JS using standard CSS files with CSS custom properties
- Theme system using CSS variables for consistent color palette (navy backgrounds, gold accents, emerald green highlights)
- Dual theme files: `App.css` (component styles) and `index.css` (global styles with gradient background)
- Animation utilities built-in (fadeIn keyframes for page transitions)

**Design System Colors**:
- Primary: Navy (#0B1E2D) for backgrounds
- Accent: Gold (#D4AF37) for highlights and important UI elements
- Success: Emerald Green (#10B981) for positive feedback
- Text: Light gray (#f3f4f6) for readability on dark backgrounds

### Data Architecture

**Content Structure**: Learning paths defined in progressStore
- 14 learning paths total:
  1. Names of Allah (10 lessons)
  2. Foundations of Islam (12 lessons)
  3. Stories of Prophets (8 lessons)
  4. Life of Muhammad ﷺ (10 lessons)
  5. Wives of the Prophet ﷺ (6 lessons)
  6. Ten Promised Jannah (10 lessons)
  7. Four Greatest Women (8 lessons)
  8. Stories of the Companions (10 lessons)
  9. Angels and Jinns (10 lessons)
  10. The End Times (10 lessons)
  11. The Grave (8 lessons)
  12. Day of Judgement (10 lessons)
  13. Hellfire (6 lessons)
  14. Paradise (6 lessons)
- All paths unlocked for launch (status: "available")
- Progress tracking per path with completion percentages

**Progression Model**:
- XP and coin rewards for completing lessons
- Streak system to encourage daily engagement
- Certificate awards upon path completion

**Asset Management**:
- Centralized asset system (`assets.js`) with categorized imports
- WebP format for optimized image delivery
- Categories: mascots (17 variations), avatars (16 options), badges (10 types)
- TypeScript definitions for asset autocomplete

### Authentication & User Management

**Provider**: Supabase Auth
- Integration via `@supabase/auth-helpers-react` and `@supabase/supabase-js`
- Client initialization in `/src/lib/supabase.js`
- Environment variables for API keys (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)

**Current Implementation**: 
- Supabase client configured but auth flows not yet implemented in components
- LocalStorage currently serves as temporary persistence layer
- Future: Full user profiles, progress sync, and social features

### Build & Deployment

**Development**:
- Vite dev server on port 5000 with host binding (0.0.0.0) for Replit compatibility
- **Critical Replit Configuration**: Must use `--host 0.0.0.0 --port 5000` flags in npm dev script for Replit proxy to work
- Hot Module Replacement for instant feedback
- TypeScript optional (config exists but allowJs is false)

**Replit Webview Fix (October 2025)**:
- Issue: Vite config alone wasn't exposing port 5000 to Replit's proxy (502 Bad Gateway)
- Solution: Added explicit `--host 0.0.0.0 --port 5000` flags to `package.json` dev script
- Both `vite.config.js` (host: true, port: 5000) AND npm script flags are needed for reliability

**Production**:
- `vite build` creates optimized bundle
- `vite preview` for production testing
- Static asset optimization and code splitting built-in

## External Dependencies

### Third-Party Services

**Supabase** (Primary Backend)
- **Purpose**: Authentication, database, and real-time subscriptions
- **Integration**: Client library initialized with environment variables
- **Configuration**: URL and anon key stored in `.env` (not in repo)
- **Usage**: User auth, progress persistence, leaderboards (planned)

### Core Libraries

**UI & Animation**:
- `framer-motion` (v12.23): Declarative animations for page transitions, micro-interactions
- `lucide-react` (v0.545): Icon library for consistent UI elements
- `react-router-dom` (v7.9): Client-side routing and navigation

**Development Tools**:
- `vite` (v5.0): Build tool and dev server
- `@vitejs/plugin-react`: Fast Refresh and JSX transformation
- `typescript` (v5.2): Type checking (optional, not enforced)

### Asset Dependencies

**Media Formats**:
- WebP images for mascots, avatars, badges, and certificates
- SVG favicon
- No external CDN dependencies for assets (all bundled)

### Environment Configuration

**Required Environment Variables**:
```
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

**Note**: Database schema not yet defined in codebase. Future implementation will likely include tables for: users, user_progress, achievements, streaks, and leaderboards.