# Islam Quest - Educational Mobile Web App

## Overview
Islam Quest is a mobile-first web application designed as a gamified Islamic learning platform. Its core purpose is to provide an interactive educational experience, guiding users through structured learning paths that cover fundamental Islamic beliefs, stories of prophets, and other essential knowledge. Key capabilities include a friendly mascot (Zayd), an achievement system, customizable avatars, and quiz-based assessments to reinforce learning. The project aims to make Islamic education engaging and accessible, fostering continuous learning and spiritual growth.

## Recent Changes

### November 10, 2025 - Paths 8 & 9 Implementation (Stories of the Companions & Angels in Islam)
- **Work Completed**: Created two complete learning paths with lessons, quizzes, and proper quiz routing
- **Path 8 - Stories of the Companions (32 lessons)**:
  - **Content**: Major Sahaba including Abu Bakr, Umar, Uthman, Ali, Bilal, Salman, Abu Dharr, Hamza, Mus'ab, Abdullah ibn Mas'ud, Abdullah ibn Abbas, Abdullah ibn Umar, Abu Huraira, Zayd ibn Harithah, Khalid ibn Walid, Amr ibn al-As, Sa'd ibn Mu'adh, Sa'd ibn Ubadah, Usayd ibn Hudayr, Anas ibn Malik, Abu Ayyub al-Ansari, Abu Talha, Ubayy ibn Ka'b, Mu'adh ibn Jabal, Abu Ubaidah ibn al-Jarrah, Ammar ibn Yasir, Suhaib ar-Rumi, Talhah ibn Ubaydullah, Az-Zubayr ibn al-Awwam, Saeed ibn Zayd, Abdur Rahman ibn Awf, Saad ibn Abi Waqqas
  - **Structure**: 4 paragraphs per lesson (~30 words each), 1 Qur'an ayah or Sahih hadith (Arabic + English), Key Lesson Learned
  - **Sources**: ONLY Qur'an and Sahih Bukhari/Muslim with proper citations
  - **32 quizzes**: 128 total questions (4 MCQs per quiz), balanced answer distribution (29, 32, 36, 31), aligned with lesson content
  - **UI**: Default mascot and greeting (no path-specific customization)
- **Path 9 - Angels in Islam (11 lessons)**:
  - **Content**: Jibrīl (Gabriel), Mīkā'īl (Michael), Isrāfīl, Angel of Death (Malak al-Mawt), Munkar and Nakir, Guardian Angels (Mu'aqqibat), Recording Angels (Kiraman Katibin), Mālik (Guardian of Hellfire), Ridwān (Guardian of Paradise), Angel of the Mountains, Angels in Worship
  - **Structure**: 3 paragraphs per lesson (~30 words each), 1 Qur'an ayah or Sahih hadith (Arabic + English), Key Lesson Learned
  - **Sources**: ONLY Qur'an and Sahih Bukhari/Muslim with proper citations
  - **Content Note**: All Jinn content excluded (focus only on angels)
  - **11 quizzes**: 44 total questions (4 MCQs per quiz), perfect answer distribution (11 at each index 0-3), aligned with lesson content
  - **UI**: Default mascot and greeting (no path-specific customization)
- **Technical Implementation**:
  - Created `src/data/lessons/companionsLessons.js` (32 lessons, authentic sources)
  - Created `src/data/quizzes/companionsQuizzes.json` (32 quizzes, 128 questions)
  - Created `src/data/lessons/angelsLessons.js` (11 lessons, authentic sources, no Jinn content)
  - Created `src/data/quizzes/angelsQuizzes.json` (11 quizzes, 44 questions)
  - Updated `src/data/quizEngine.js` to import and route Path 8 and 9 quizzes (cases 8 & 9)
  - `src/data/lessonLoader.js` already included Path 8 & 9 mapping (cases 8 & 9)
- **Files Created/Modified**:
  - `src/data/lessons/companionsLessons.js` (new file, 32 lessons)
  - `src/data/quizzes/companionsQuizzes.json` (new file, 32 quizzes)
  - `src/data/lessons/angelsLessons.js` (new file, 11 lessons)
  - `src/data/quizzes/angelsQuizzes.json` (new file, 11 quizzes)
  - `src/data/quizEngine.js` (added Path 8 & 9 quiz routing)
- **Quality Assurance**: All sources verified as Qur'an/Sahih hadith, quiz alignment confirmed, answer distribution balanced, no regressions on paths 1-7

### November 10, 2025 - Path 7 Implementation (Four Greatest Women in Islam)
- **Work Completed**: Created complete learning path with lessons, quizzes, and path-specific UI customizations
- **Path 7 - Four Greatest Women in Islam (12 lessons)**:
  - **Content**: Maryam (3 lessons), Asiyah (3 lessons), Khadijah (3 lessons), Fatimah (3 lessons)
  - **Structure**: 3 paragraphs per lesson, 1 Qur'an ayah or Sahih hadith (Arabic + English), Key Lesson Learned
  - **Sources**: ONLY Qur'an and Sahih Bukhari/Muslim with proper citations
    - Maryam: Qur'an 3:37, 19:24-25, 3:42
    - Asiyah: Qur'an 66:11, 28:9, 66:11
    - Khadijah: Sahih Bukhari 3815, 3, Sahih Muslim 2435
    - Fatimah: Sahih Bukhari 3623, 5362, 3624
  - **12 quizzes**: 48 total questions (4 MCQs per quiz), balanced answer distribution (13, 12, 11, 12), aligned with lesson content
  - **UI**: ZaydCheer mascot (celebratory theme), greeting "Celebrate the four greatest women in Islam ✨", section headers (Maryam, Asiyah, Khadijah, Fatimah)
- **Technical Implementation**:
  - Created `src/data/lessons/fourWomenLessons.js` (12 lessons, authentic sources)
  - Created `src/data/quizzes/greatestWomenQuizzes.json` (12 quizzes, 48 questions)
  - Updated `src/data/quizEngine.js` to import and route Path 7 quizzes (case 7)
  - Updated `src/screens/Pathway.jsx` with conditional UI rendering for pathId 7 (mascot, greeting, section headers)
  - `src/data/lessonLoader.js` already included Path 7 mapping (case 7)
- **Files Created/Modified**:
  - `src/data/lessons/fourWomenLessons.js` (new file, 12 lessons)
  - `src/data/quizzes/greatestWomenQuizzes.json` (new file, 12 quizzes)
  - `src/data/quizEngine.js` (added Path 7 quiz routing)
  - `src/screens/Pathway.jsx` (updated with Path 7 conditional UI)
- **Quality Assurance**: All sources verified as Qur'an/Sahih hadith, quiz alignment confirmed, quiz structure corrected to match engine format

### November 10, 2025 - Paths 5 & 6 Implementation (Wives of the Prophet ﷺ & Ten Promised Jannah)
- **Work Completed**: Created two complete learning paths with lessons, quizzes, and path-specific UI customizations
- **Path 5 - Wives of the Prophet ﷺ (13 lessons)**:
  - **Content**: Khadijah (2 lessons), Aishah (2 lessons), Sawdah, Hafsah, Zaynab bint Khuzaymah, Umm Salamah, Zaynab bint Jahsh, Juwayriyyah, Safiyyah, Umm Habibah, Maymunah (1 lesson each)
  - **Structure**: 3 paragraphs per lesson (18-28 words each, verified compliant), 1 Sahih hadith (Arabic + English), Key Lesson Learned
  - **Sources**: ONLY Sahih Bukhari and Sahih Muslim with proper citations
  - **13 quizzes**: 52 total questions (4 MCQs per quiz), balanced answer distribution, aligned with lesson content
  - **UI**: ZaydHappy mascot (family theme), greeting "Meet the noble Mothers of the Believers 🌸", hidden subtitles
- **Path 6 - Ten Promised Jannah (10 lessons)**:
  - **Content**: Abu Bakr, Umar, Uthman, Ali, Talhah, Zubayr, Abd al-Rahman ibn Awf, Saad ibn Abi Waqqas, Saeed ibn Zayd, Abu Ubaydah (one lesson per companion)
  - **Structure**: 3 paragraphs per lesson (18-28 words each, verified compliant), 1 Qur'an ayah or Sahih hadith (Arabic + English), Key Lesson Learned
  - **Sources**: Book "Ten Promised Paradise" + Sahih Bukhari/Muslim hadith
  - **10 quizzes**: 40 total questions (4 MCQs per quiz), perfect answer distribution (10 at each index 0-3), aligned with lesson content
  - **UI**: ZaydShield mascot (heroic theme), greeting "Learn from the heroes promised Paradise 🕊️", hidden subtitles
- **Technical Implementation**:
  - Created `src/data/lessons/wivesLessons.js` (13 lessons, strict word count compliance)
  - Created `src/data/quizzes/wivesQuizzes.json` (13 quizzes, 52 questions)
  - Created `src/data/lessons/tenPromisedLessons.js` (10 lessons, strict word count compliance)
  - Created `src/data/quizzes/tenPromisedQuizzes.json` (10 quizzes, 40 questions)
  - Updated `src/data/quizEngine.js` to import and route Path 5 and 6 quizzes (cases 5 & 6)
  - Updated `src/screens/Pathway.jsx` with conditional UI rendering for pathId 5 & 6 (mascots, greetings, hidden subtitles)
  - `src/data/lessonLoader.js` already included Path 5 & 6 mapping (cases 5 & 6)
- **Files Created/Modified**: 
  - `src/data/lessons/wivesLessons.js` (new file, 13 lessons)
  - `src/data/quizzes/wivesQuizzes.json` (new file, 13 quizzes)
  - `src/data/lessons/tenPromisedLessons.js` (new file, 10 lessons)
  - `src/data/quizzes/tenPromisedQuizzes.json` (new file, 10 quizzes)
  - `src/data/quizEngine.js` (added Path 5 & 6 quiz routing)
  - `src/screens/Pathway.jsx` (updated with Path 5 & 6 conditional UI)
- **Quality Assurance**: Paragraph word counts verified (18-28 words), quiz alignment confirmed, no regressions on paths 1-4

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Technology Stack**: React 18.2, Vite, JavaScript, React Router DOM v7.9, Framer Motion, Lucide React.
- **Design Pattern**: Component-based architecture with a mobile-first responsive design and a bottom navigation pattern.
- **State Management**: Local state using React hooks, global state with Zustand (`progressStore`, `userStore`, `titleStore`), and LocalStorage for persistence. Future migration to Supabase for cloud synchronization is planned.

### Styling Architecture
- **Approach**: CSS-in-JS using standard CSS files with custom properties for theming.
- **Theme System**: CSS variables define a consistent color palette: Navy (#0B1E2D) for backgrounds, Gold (#D4AF37) for accents, Emerald Green (#10B981) for success, and Light gray (#f3f4f6) for text.
- **Animation**: Built-in CSS keyframes (e.g., fadeIn) for page transitions.

### Data Architecture
- **Content Structure**: 14 predefined learning paths, each with lessons and quizzes. Examples include "Names of Allah," "Foundations of Islam," "Stories of Prophets," and "Life of Muhammad ﷺ." All paths are "available" by default.
- **Progression Model**: XP and coin rewards for lesson completion, streak system for daily engagement, and certificates for path completion.
- **Asset Management**: Centralized `assets.js` system for optimized WebP images (mascots, avatars, badges).

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