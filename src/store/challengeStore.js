import { create } from "zustand";
import { useProgressStore } from "./progressStore";
import { useFriendsStore } from "./friendsStore";
import { useDeveloperStore } from "./developerStore";

const STORAGE_KEY = "islamQuestChallenges_v1";
const CHALLENGE_DURATION = 48 * 60 * 60 * 1000; // 48 hours in ms

// Challenge modes with config
export const CHALLENGE_MODES = {
  MIND_DUEL: {
    id: "mind_duel",
    name: "Mind Duel",
    icon: "🧠",
    description: "8 challenging Islamic questions",
    questionCount: 8,
    trackTime: true,
    rewards: { win: { xp: 100, coins: 20 }, lose: { xp: 20, coins: 0 }, draw: { xp: 50, coins: 0 } },
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
    glow: "0 0 20px rgba(139, 92, 246, 0.5)"
  },
  LIGHTNING_ROUND: {
    id: "lightning_round",
    name: "Lightning Round",
    icon: "⚡",
    description: "10 questions in 60 seconds",
    questionCount: 10,
    totalTime: 60,
    rewards: { win: { xp: 150, coins: 25 }, lose: { xp: 25, coins: 0 } },
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    glow: "0 0 20px rgba(245, 158, 11, 0.5)"
  },
  SPEED_RUN: {
    id: "speed_run",
    name: "Speed Run",
    icon: "🏃",
    description: "Answer as many questions correctly in 30 seconds",
    questionCount: 40,
    totalTime: 30,
    rewards: { win: { xp: 120, coins: 20 }, lose: { xp: 20, coins: 0 }, draw: { xp: 50, coins: 0 } },
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    glow: "0 0 20px rgba(16, 185, 129, 0.5)"
  },
  SUDDEN_DEATH: {
    id: "sudden_death",
    name: "Sudden Death",
    icon: "⛓️",
    description: "25 questions - one wrong ends the game, fastest time wins draws",
    questionCount: 25,
    trackTime: true,
    rewards: { win: { xp: 200, coins: 30 }, lose: { xp: 25, coins: 0 } },
    gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    glow: "0 0 20px rgba(239, 68, 68, 0.5)"
  }
};

export const BOSS_LEVEL = {
  id: "boss_level",
  name: "Boss Level",
  icon: "👑",
  description: "Daily ultra-hard challenge - 12 questions in 30s",
  questionCount: 12,
  totalTime: 30,
  minLevel: 8,
  rewards: { win: { xp: 500, coins: 100 }, lose: { xp: 50, coins: 0 } },
  gradient: "linear-gradient(135deg, #1e3a5f 0%, #0f1c2e 100%)",
  glow: "0 0 30px rgba(30, 58, 95, 0.7)"
};

export const useChallengeStore = create((set, get) => ({
  // State
  challenges: [], // All friend challenges
  bossAttempts: [], // Boss level attempts
  challengeHistory: [], // Completed challenges
  recentlyShownQuestions: [], // Last 50 questions to avoid repetition
  questionPoolCache: null, // Memoized question pool
  cacheTimestamp: null, // When cache was built
  
  // Helper: Save to storage (Supabase-ready)
  saveToStorage: () => {
    const data = {
      challenges: get().challenges,
      bossAttempts: get().bossAttempts,
      challengeHistory: get().challengeHistory,
      recentlyShownQuestions: get().recentlyShownQuestions,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  // Helper: Load from storage
  loadFromStorage: () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      set({
        challenges: data.challenges || [],
        bossAttempts: data.bossAttempts || [],
        challengeHistory: data.challengeHistory || [],
        recentlyShownQuestions: data.recentlyShownQuestions || [],
      });
      
      // 🤖 Rehydrate simulated friend auto-responses
      get().rehydrateSimulatedResponses();
    }
  },

  // 📝 Track recently shown questions (last 50)
  trackShownQuestion: (questionText) => {
    set(state => {
      const updated = [questionText, ...state.recentlyShownQuestions].slice(0, 50);
      return { recentlyShownQuestions: updated };
    });
    get().saveToStorage();
  },

  // 🔄 Generate question variation (same meaning, different wording)
  generateQuestionVariation: (originalQuestion) => {
    const { question, options, answer, difficulty } = originalQuestion;
    
    // Create distractor variations by shuffling options
    const newOptions = [...options];
    const correctAnswer = options[answer];
    
    // Remove correct answer and shuffle remaining
    const distractors = newOptions.filter((_, idx) => idx !== answer);
    const shuffledDistractors = distractors.sort(() => Math.random() - 0.5);
    
    // Rebuild options array with correct answer in random position
    const newAnswerIndex = Math.floor(Math.random() * 4);
    const finalOptions = [];
    for (let i = 0; i < 4; i++) {
      if (i === newAnswerIndex) {
        finalOptions.push(correctAnswer);
      } else {
        finalOptions.push(shuffledDistractors.shift());
      }
    }
    
    return {
      ...originalQuestion,
      options: finalOptions,
      answer: newAnswerIndex,
      isVariation: true // Mark as auto-generated
    };
  },

  // 🏗️ Build question pool from ALL completed lessons
  buildQuestionPool: () => {
    const { lessonStates } = useProgressStore.getState();
    const allQuestions = [];
    
    // Iterate through all lesson states to find completed lessons
    Object.keys(lessonStates).forEach(lessonKey => {
      const lessonState = lessonStates[lessonKey];
      // Check if lesson is completed
      if (lessonState?.completed === true || lessonState?.passed === true) {
        // Add all questions from this lesson
        if (lessonState.questions && Array.isArray(lessonState.questions)) {
          allQuestions.push(...lessonState.questions.map(q => ({
            ...q,
            sourceLesson: lessonKey
          })));
        }
      }
    });
    
    return allQuestions;
  },

  // 🎯 Get question pool with caching
  getQuestionPool: () => {
    const { questionPoolCache, cacheTimestamp } = get();
    const { lessonStates } = useProgressStore.getState();
    
    // Check if cache is valid (rebuild if lesson states changed)
    const currentLessonCount = Object.keys(lessonStates).filter(
      key => lessonStates[key]?.completed || lessonStates[key]?.passed
    ).length;
    
    // Rebuild cache if invalid or empty
    if (!questionPoolCache || !cacheTimestamp || 
        questionPoolCache.lessonCount !== currentLessonCount) {
      const pool = get().buildQuestionPool();
      set({
        questionPoolCache: { questions: pool, lessonCount: currentLessonCount },
        cacheTimestamp: Date.now()
      });
      return pool;
    }
    
    return questionPoolCache.questions;
  },

  // 🚫 Filter out recently shown questions
  filterRecentQuestions: (questions) => {
    const { recentlyShownQuestions } = get();
    return questions.filter(q => !recentlyShownQuestions.includes(q.question));
  },

  // 🎲 Expand question pool with variations (for users with few completed lessons)
  expandQuestionPool: (questions, targetCount) => {
    const expanded = [...questions];
    const neededVariations = Math.max(0, targetCount - questions.length);
    
    if (neededVariations > 0 && questions.length > 0) {
      // Generate variations by cycling through original questions
      for (let i = 0; i < neededVariations; i++) {
        const sourceQuestion = questions[i % questions.length];
        const variation = get().generateQuestionVariation(sourceQuestion);
        expanded.push(variation);
      }
    }
    
    return expanded;
  },

  // Get shared completed lessons between two users
  getSharedLessons: (userId, friendId) => {
    // 🤖 BETA MODE: Allow challenges on any quiz regardless of shared lessons
    const betaMode = useDeveloperStore.getState()?.betaMode;
    
    // Get current user's completed lessons
    const { lessonStates } = useProgressStore.getState();
    const currentUserCompletedLessons = Object.keys(lessonStates).filter(
      key => lessonStates[key]?.completed === true
    );
    
    if (betaMode) {
      // In beta mode, return ALL user's completed lessons (bypass shared requirement)
      return currentUserCompletedLessons;
    }
    
    // Get friend's completed lessons from friendsStore
    // In LocalStorage mode, friends have a completedLessons array
    // In Supabase mode, we'll fetch from DB
    const { friends } = useFriendsStore.getState();
    const friend = friends.find(f => f.id === friendId);
    
    let friendCompletedLessons = [];
    if (friend) {
      // If friend has completedLessons stored, use it
      if (friend.completedLessons && Array.isArray(friend.completedLessons)) {
        friendCompletedLessons = friend.completedLessons;
      } else {
        // Mock for friends without stored lesson data
        // Simulate friend has completed a random subset (deterministic based on friend ID)
        // This ensures consistency across sessions
        const seed = friend.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        friendCompletedLessons = currentUserCompletedLessons.filter((_, index) => 
          ((seed + index) % 3) !== 0 // Deterministic ~66% overlap
        );
      }
    }
    
    // Find intersection (lessons both have completed)
    const shared = currentUserCompletedLessons.filter(lesson => 
      friendCompletedLessons.includes(lesson)
    );
    
    return shared;
  },

  // Create a new challenge (Supabase-ready structure)
  createChallenge: (friendId, mode) => {
    const currentUserId = "current_user"; // Will be from auth later
    const betaMode = useDeveloperStore.getState()?.betaMode;
    const sharedLessons = get().getSharedLessons(currentUserId, friendId);
    
    // 🤖 BETA MODE: If no completed lessons, use fallback lesson IDs for testing
    let lessonsToUse = sharedLessons;
    if (betaMode && sharedLessons.length === 0) {
      // Use first lesson from each path as fallback
      lessonsToUse = [
        "path1_lesson1", "path2_lesson1", "path3_lesson1", "path4_lesson1",
        "path5_lesson1", "path6_lesson1", "path7_lesson1", "path8_lesson1"
      ];
    } else if (!betaMode && sharedLessons.length === 0) {
      // In production mode, require shared lessons
      return { success: false, error: "NO_SHARED_LESSONS" };
    }

    // Normalize mode to object (might be passed as string ID or object)
    let config;
    if (typeof mode === 'string') {
      config = Object.values(CHALLENGE_MODES).find(m => m.id === mode);
    } else {
      config = mode;
    }
    
    if (!config) {
      console.error('Invalid mode:', mode);
      return { success: false, error: "INVALID_MODE" };
    }
    
    const questions = get().getQuestionsForMode(config, lessonsToUse);
    
    if (questions.length === 0) {
      return { success: false, error: "NO_QUESTIONS" };
    }

    const challenge = {
      id: `challenge_${Date.now()}`,
      challengerId: currentUserId,
      opponentId: friendId,
      mode: config.id,
      questions: questions,
      challengerScore: null, // Not played yet
      opponentScore: null,
      challengerAnswers: null,
      opponentAnswers: null,
      status: "pending", // pending, active, completed
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + CHALLENGE_DURATION).toISOString(),
      winner: null,
    };

    set(state => ({
      challenges: [...state.challenges, challenge]
    }));
    
    get().saveToStorage();
    
    // 🤖 Check if opponent is simulated and schedule auto-response
    const { isSimulatedFriend } = useFriendsStore.getState();
    if (isSimulatedFriend(friendId)) {
      get().scheduleSimulatedResponse(challenge.id, friendId);
    }
    
    return { success: true, challenge };
  },

  // 🤖 Schedule auto-response for simulated friend
  scheduleSimulatedResponse: (challengeId, friendId) => {
    const { friends } = useFriendsStore.getState();
    const friend = friends.find(f => f.id === friendId);
    
    if (!friend || !friend.isSimulated) return;

    // Random delay based on friend's response delay range
    const { min, max } = friend.responseDelay;
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    
    // Calculate and store expected response time
    const expectedResponseTime = Date.now() + delay;
    
    // Update challenge with scheduled response time
    set(state => ({
      challenges: state.challenges.map(c =>
        c.id === challengeId ? { ...c, simulatedResponseTime: expectedResponseTime } : c
      )
    }));
    get().saveToStorage();

    setTimeout(() => {
      get().simulateFriendResponse(challengeId, friend);
    }, delay);
  },
  
  // 🤖 Rehydrate simulated responses on app reload
  rehydrateSimulatedResponses: () => {
    const challenges = get().challenges;
    const { friends } = useFriendsStore.getState();
    
    challenges.forEach(challenge => {
      // Check if this is a pending simulated challenge with scheduled response time
      if (
        challenge.simulatedResponseTime &&
        challenge.opponentScore === null &&
        challenge.status !== 'completed'
      ) {
        const friend = friends.find(f => f.id === challenge.opponentId);
        if (friend && friend.isSimulated) {
          const now = Date.now();
          const timeLeft = challenge.simulatedResponseTime - now;
          
          if (timeLeft > 0) {
            // Response still pending - reschedule
            setTimeout(() => {
              get().simulateFriendResponse(challenge.id, friend);
            }, timeLeft);
          } else {
            // Response overdue - execute immediately
            get().simulateFriendResponse(challenge.id, friend);
          }
        }
      }
    });
  },

  // 🤖 Simulate friend playing the challenge
  simulateFriendResponse: (challengeId, friend) => {
    const challenge = get().challenges.find(c => c.id === challengeId);
    if (!challenge || challenge.opponentScore !== null) return;

    const { questions } = challenge;
    const accuracy = friend.accuracy;

    // Simulate answers based on accuracy
    const simulatedAnswers = questions.map((q, index) => {
      const willGetCorrect = Math.random() < accuracy;
      if (willGetCorrect) {
        return q.answer; // Correct answer
      } else {
        // Random wrong answer
        const wrongOptions = [0, 1, 2, 3].filter(opt => opt !== q.answer);
        return wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
      }
    });

    // Calculate score
    const score = simulatedAnswers.filter((ans, idx) => ans === questions[idx].answer).length;

    // Generate completion time for time-tracked modes (Sudden Death, Mind Duel)
    const mode = Object.values(CHALLENGE_MODES).find(m => m.id === challenge.mode);
    let completionTime = null;
    if (mode?.trackTime) {
      // Simulate realistic completion time based on friend difficulty
      const baseTime = questions.length * 3; // 3 seconds per question base
      const randomFactor = friend.difficulty?.responseTime?.[0] || 5;
      const randomRange = (friend.difficulty?.responseTime?.[1] || 10) - randomFactor;
      completionTime = baseTime + (questions.length * (randomFactor + Math.random() * randomRange));
    }

    // Save the opponent's progress
    get().saveChallengeProgress(challengeId, score, simulatedAnswers, false, completionTime);
    
    // If challenger has also played, complete the challenge
    if (challenge.challengerScore !== null) {
      get().completeChallenge(challengeId);
    }
  },

  // Save challenge progress
  saveChallengeProgress: (challengeId, score, answers, isChallenger, completionTime = null) => {
    set(state => ({
      challenges: state.challenges.map(c => {
        if (c.id === challengeId) {
          if (isChallenger) {
            return {
              ...c,
              challengerScore: score,
              challengerAnswers: answers,
              challengerTime: completionTime,
              status: c.opponentScore !== null ? "completed" : "active"
            };
          } else {
            return {
              ...c,
              opponentScore: score,
              opponentAnswers: answers,
              opponentTime: completionTime,
              status: c.challengerScore !== null ? "completed" : "active"
            };
          }
        }
        return c;
      })
    }));
    
    get().saveToStorage();
  },

  // Complete challenge and determine winner
  completeChallenge: (challengeId) => {
    const challenge = get().challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    let winner = null;
    if (challenge.challengerScore > challenge.opponentScore) {
      winner = challenge.challengerId;
    } else if (challenge.opponentScore > challenge.challengerScore) {
      winner = challenge.opponentId;
    } else {
      // Scores are equal - check if it's a time-based mode (Sudden Death, Mind Duel)
      const mode = Object.values(CHALLENGE_MODES).find(m => m.id === challenge.mode);
      if (mode?.trackTime && challenge.challengerTime !== null && challenge.opponentTime !== null) {
        // Fastest time wins
        winner = challenge.challengerTime < challenge.opponentTime 
          ? challenge.challengerId 
          : challenge.opponentId;
      } else {
        winner = "draw";
      }
    }
    
    // 🛡️ Mark day as complete for streak tracking
    useProgressStore.getState().markDayComplete();

    set(state => ({
      challenges: state.challenges.map(c =>
        c.id === challengeId ? { ...c, winner, status: "completed" } : c
      ),
      challengeHistory: [...state.challengeHistory, { ...challenge, winner }]
    }));

    get().saveToStorage();
    return winner;
  },

  // Get questions for a specific mode
  getQuestionsForMode: (mode, sharedLessons) => {
    // Mode can be an object or a string ID - normalize it
    let config;
    if (typeof mode === 'string') {
      // Find mode by ID
      config = Object.values(CHALLENGE_MODES).find(m => m.id === mode);
    } else {
      // Mode is already an object
      config = mode;
    }
    
    if (!config) {
      console.error('Invalid mode:', mode);
      return [];
    }
    
    // 🎯 NEW SYSTEM: Get ALL questions from user's completed lessons (NOT just shared)
    let allQuestions = get().getQuestionPool();
    
    // If no completed lessons, use minimal fallback for beta testing
    if (allQuestions.length === 0) {
      allQuestions = get().getBetaFallbackQuestions();
    }
    
    // 🚫 Remove recently shown questions (last 50)
    const freshQuestions = get().filterRecentQuestions(allQuestions);
    
    // 📊 Apply difficulty scaling based on mode
    let filteredQuestions = freshQuestions;
    
    if (config.id === 'mind_duel') {
      // Mind Duel: Highest reasoning complexity
      filteredQuestions = freshQuestions.filter(q => 
        q.difficulty === 'hard' || q.difficulty === 'medium'
      );
    } else if (config.id === 'lightning_round') {
      // Lightning Round: Fastest recall (all difficulties)
      filteredQuestions = freshQuestions;
    } else if (config.id === 'speed_run') {
      // Speed Run: Quick recall (medium/easy preferred)
      filteredQuestions = freshQuestions.filter(q => 
        q.difficulty !== 'hard' || Math.random() > 0.5
      );
    } else if (config.id === 'sudden_death') {
      // Sudden Death: Mix of all difficulties for 25 questions
      filteredQuestions = freshQuestions;
    }
    
    // Fallback if filtering removed too many
    if (filteredQuestions.length === 0) {
      filteredQuestions = freshQuestions;
    }
    
    const count = config.questionCount || 8;
    
    // 🎲 Expand pool if needed (generate variations)
    if (filteredQuestions.length < count) {
      filteredQuestions = get().expandQuestionPool(filteredQuestions, count);
    }
    
    // Shuffle and select
    const shuffled = filteredQuestions.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    
    // 📝 Track shown questions to avoid repetition
    selected.forEach(q => get().trackShownQuestion(q.question));
    
    return selected;
  },

  // 🤖 BETA MODE: Fallback question pool for testing without completed lessons
  getBetaFallbackQuestions: () => {
    return [
      {
        question: "What is the first pillar of Islam?",
        options: ["Prayer", "Shahada (Declaration of Faith)", "Fasting", "Charity"],
        answer: 1,
        difficulty: "hard"
      },
      {
        question: "How many daily prayers are obligatory in Islam?",
        options: ["3", "4", "5", "6"],
        answer: 2,
        difficulty: "hard"
      },
      {
        question: "Which prophet built the Kaaba?",
        options: ["Prophet Muhammad ﷺ", "Prophet Ibrahim ﷺ", "Prophet Musa ﷺ", "Prophet Isa ﷺ"],
        answer: 1,
        difficulty: "hard"
      },
      {
        question: "What is the holy book of Islam?",
        options: ["Torah", "Bible", "Qur'an", "Vedas"],
        answer: 2,
        difficulty: "hard"
      },
      {
        question: "In which month do Muslims fast?",
        options: ["Rajab", "Shaban", "Ramadan", "Dhul Hijjah"],
        answer: 2,
        difficulty: "hard"
      },
      {
        question: "What is Zakat?",
        options: ["Fasting", "Prayer", "Charity", "Pilgrimage"],
        answer: 2,
        difficulty: "hard"
      },
      {
        question: "Where is the Kaaba located?",
        options: ["Medina", "Mecca", "Jerusalem", "Cairo"],
        answer: 1,
        difficulty: "hard"
      },
      {
        question: "What does 'Islam' mean?",
        options: ["Peace", "Submission to Allah", "Both peace and submission", "Faith"],
        answer: 2,
        difficulty: "hard"
      },
      {
        question: "Who was the first person to accept Islam?",
        options: ["Abu Bakr", "Khadijah", "Ali", "Umar"],
        answer: 1,
        difficulty: "hard"
      },
      {
        question: "How many verses are in Surah Al-Fatiha?",
        options: ["5", "6", "7", "8"],
        answer: 2,
        difficulty: "hard"
      },
      {
        question: "What is the meaning of 'Bismillah'?",
        options: ["In the name of Allah", "Praise be to Allah", "Allah is Great", "There is no god but Allah"],
        answer: 0,
        difficulty: "hard"
      },
      {
        question: "Which direction do Muslims face when praying?",
        options: ["East", "West", "Towards Mecca", "North"],
        answer: 2,
        difficulty: "hard"
      }
    ];
  },

  // Get questions for Boss Level (from ALL completed lessons - hardest tier only)
  getBossLevelQuestions: () => {
    // 🎯 NEW SYSTEM: Pull from user's completed lessons (hardest questions only)
    let allQuestions = get().getQuestionPool();
    
    // Filter for HARD difficulty only (highest tier)
    let hardQuestions = allQuestions.filter(q => q.difficulty === 'hard');
    
    // 🚫 Remove recently shown questions
    hardQuestions = get().filterRecentQuestions(hardQuestions);
    
    // If pool is too small, expand with variations
    const targetCount = BOSS_LEVEL.questionCount || 12;
    if (hardQuestions.length < targetCount) {
      // If no hard questions, use fallback pool
      if (hardQuestions.length === 0) {
        hardQuestions = get().getBossLevelFallbackQuestions();
      } else {
        // Expand pool with variations
        hardQuestions = get().expandQuestionPool(hardQuestions, targetCount);
      }
    }
    
    // Shuffle and select
    const shuffled = hardQuestions.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, targetCount);
    
    // 📝 Track shown questions
    selected.forEach(q => get().trackShownQuestion(q.question));
    
    return selected;
  },

  // 🤖 Fallback ultra-hard questions for Boss Level (when no lessons completed)
  getBossLevelFallbackQuestions: () => {
    // Pool of 90 ultra-hard Islamic questions
    const questionPool = [
      {
        question: "Which name of Allah means 'The All-Knowing'?",
        options: ["Al-Aleem", "Al-Hakeem", "Al-Baseer", "Al-Samee"],
        answer: 0
      },
      {
        question: "How many prophets are mentioned by name in the Qur'an?",
        options: ["13", "25", "40", "124,000"],
        answer: 1
      },
      {
        question: "What is the last verse revealed in the Qur'an?",
        options: ["Ayat al-Kursi", "The verse about debt in Surah Al-Baqarah", "The final verse of Surah Al-Baqarah", "Surah An-Nasr"],
        answer: 1
      },
      {
        question: "Which companion was known as 'The Sword of Allah'?",
        options: ["Ali ibn Abi Talib", "Umar ibn al-Khattab", "Khalid ibn al-Walid", "Abu Bakr as-Siddiq"],
        answer: 2
      },
      {
        question: "What was the first masjid built by Prophet Muhammad ﷺ?",
        options: ["Masjid al-Haram", "Masjid an-Nabawi", "Masjid Quba", "Masjid al-Aqsa"],
        answer: 2
      },
      {
        question: "How many times is Prophet Muhammad ﷺ mentioned by name in the Qur'an?",
        options: ["3", "4", "5", "7"],
        answer: 1
      },
      {
        question: "Which surah is called 'the heart of the Qur'an'?",
        options: ["Al-Fatiha", "Ya-Sin", "Al-Mulk", "Ar-Rahman"],
        answer: 1
      },
      {
        question: "In which year of Hijrah did the Battle of Badr take place?",
        options: ["1st year", "2nd year", "3rd year", "4th year"],
        answer: 1
      },
      {
        question: "How many angels are mentioned by name in the Qur'an?",
        options: ["1", "2", "3", "4"],
        answer: 2
      },
      {
        question: "What is the longest surah in the Qur'an?",
        options: ["Al-Baqarah", "Aal-e-Imran", "An-Nisa", "Al-An'am"],
        answer: 0
      },
      {
        question: "Which prophet is mentioned the most in the Qur'an?",
        options: ["Muhammad ﷺ", "Ibrahim ﷺ", "Musa ﷺ", "Isa ﷺ"],
        answer: 2
      },
      {
        question: "How many years did it take for the Qur'an to be revealed?",
        options: ["10 years", "15 years", "23 years", "30 years"],
        answer: 2
      },
      {
        question: "Which sahabi was given the title 'Al-Farooq' (The Criterion)?",
        options: ["Abu Bakr", "Umar ibn al-Khattab", "Uthman ibn Affan", "Ali ibn Abi Talib"],
        answer: 1
      },
      {
        question: "In which cave did Prophet Muhammad ﷺ receive the first revelation?",
        options: ["Cave of Thawr", "Cave of Hira", "Cave of Uhud", "Cave of Safa"],
        answer: 1
      },
      {
        question: "What was the name of Prophet Muhammad's ﷺ mother?",
        options: ["Khadijah", "Aminah", "Fatimah", "Aisha"],
        answer: 1
      },
      {
        question: "How many times is Sajdah (prostration) mentioned in the Qur'an?",
        options: ["11", "13", "15", "17"],
        answer: 2
      },
      {
        question: "Which surah does not begin with Bismillah?",
        options: ["Al-Fatiha", "At-Tawbah", "Al-Ikhlas", "An-Nas"],
        answer: 1
      },
      {
        question: "Who was the first male to accept Islam?",
        options: ["Ali ibn Abi Talib", "Abu Bakr as-Siddiq", "Umar ibn al-Khattab", "Uthman ibn Affan"],
        answer: 1
      },
      {
        question: "How many Makki surahs are in the Qur'an?",
        options: ["82", "86", "90", "93"],
        answer: 1
      },
      {
        question: "Which prophet could speak to animals and jinn?",
        options: ["Dawud ﷺ", "Sulaiman ﷺ", "Musa ﷺ", "Isa ﷺ"],
        answer: 1
      },
      {
        question: "What is the shortest surah in the Qur'an?",
        options: ["Al-Ikhlas", "Al-Kawthar", "Al-Asr", "An-Nasr"],
        answer: 1
      },
      {
        question: "In which battle did Prophet Muhammad ﷺ lose his tooth?",
        options: ["Battle of Badr", "Battle of Uhud", "Battle of Khandaq", "Battle of Hunayn"],
        answer: 1
      },
      {
        question: "How many wives did Prophet Muhammad ﷺ have?",
        options: ["9", "11", "13", "15"],
        answer: 1
      },
      {
        question: "Which angel is responsible for blowing the trumpet on the Day of Judgment?",
        options: ["Jibril", "Mikail", "Israfil", "Azrael"],
        answer: 2
      },
      {
        question: "What was the occupation of Prophet Muhammad ﷺ before prophethood?",
        options: ["Farmer", "Merchant/Shepherd", "Scholar", "Soldier"],
        answer: 1
      },
      {
        question: "Which surah is recommended to be recited on Friday?",
        options: ["Al-Mulk", "Al-Kahf", "Ar-Rahman", "Ya-Sin"],
        answer: 1
      },
      {
        question: "How many children did Prophet Muhammad ﷺ have?",
        options: ["5", "6", "7", "8"],
        answer: 2
      },
      {
        question: "Which companion compiled the Qur'an into one book first?",
        options: ["Umar ibn al-Khattab", "Abu Bakr as-Siddiq", "Uthman ibn Affan", "Ali ibn Abi Talib"],
        answer: 1
      },
      {
        question: "What does 'Al-Qadr' mean?",
        options: ["The Power", "The Decree/Divine Will", "The Night", "The Book"],
        answer: 1
      },
      {
        question: "In which year did the Hijrah (migration) to Madinah occur?",
        options: ["610 CE", "615 CE", "622 CE", "630 CE"],
        answer: 2
      },
      {
        question: "Which two surahs are called 'Az-Zahrawayn' (The Two Radiant Ones)?",
        options: ["Al-Fatiha & Al-Ikhlas", "Al-Baqarah & Aal-e-Imran", "Ya-Sin & Ar-Rahman", "Al-Mulk & Al-Waqi'ah"],
        answer: 1
      },
      {
        question: "How many years did Prophet Nuh ﷺ preach to his people?",
        options: ["500 years", "750 years", "950 years", "1000 years"],
        answer: 2
      },
      {
        question: "Which battle is known as 'Yawm al-Furqan' (Day of Criterion)?",
        options: ["Battle of Badr", "Battle of Uhud", "Battle of Khandaq", "Battle of Hunayn"],
        answer: 0
      },
      {
        question: "What is the name of the gate of Paradise reserved for those who fast?",
        options: ["Bab al-Jihad", "Bab al-Salah", "Bab ar-Rayyan", "Bab al-Sadaqah"],
        answer: 2
      },
      {
        question: "Which surah mentions two prophets in its name?",
        options: ["Surah Ibrahim", "Surah Yunus", "Surah Hud", "No surah has two prophets in its name"],
        answer: 3
      },
      {
        question: "How many times is Iblees mentioned by name in the Qur'an?",
        options: ["9", "11", "13", "15"],
        answer: 1
      },
      {
        question: "What was the name of Prophet Muhammad's ﷺ grandfather?",
        options: ["Abdullah", "Abdul Muttalib", "Abu Talib", "Hashim"],
        answer: 1
      },
      {
        question: "Which prophet is known as 'Kalimullah' (The one who spoke to Allah)?",
        options: ["Ibrahim ﷺ", "Musa ﷺ", "Isa ﷺ", "Muhammad ﷺ"],
        answer: 1
      },
      {
        question: "In which surah is the verse of the Throne (Ayat al-Kursi) found?",
        options: ["Al-Fatiha", "Al-Baqarah", "Aal-e-Imran", "An-Nisa"],
        answer: 1
      },
      {
        question: "How many daughters did Prophet Muhammad ﷺ have?",
        options: ["2", "3", "4", "5"],
        answer: 2
      },
      {
        question: "Which companion was promised Paradise while still alive?",
        options: ["Only Abu Bakr", "Only Umar", "The ten promised Paradise (Asharah Mubasharah)", "All companions"],
        answer: 2
      },
      {
        question: "What is the longest verse in the Qur'an about?",
        options: ["Prayer", "Debt and financial transactions", "Fasting", "Hajj"],
        answer: 1
      },
      {
        question: "Which prophet's name is mentioned 25 times in the Qur'an?",
        options: ["Ibrahim ﷺ", "Nuh ﷺ", "Isa ﷺ", "Musa ﷺ"],
        answer: 2
      },
      {
        question: "What was the first thing created by Allah according to hadith?",
        options: ["The Throne", "The Pen", "Light", "Water"],
        answer: 1
      },
      {
        question: "How many pillars does Iman (faith) have?",
        options: ["4", "5", "6", "7"],
        answer: 2
      },
      {
        question: "Which surah is known as the 'Mother of the Qur'an'?",
        options: ["Al-Fatiha", "Al-Baqarah", "Ya-Sin", "Al-Ikhlas"],
        answer: 0
      },
      {
        question: "What is the Arabic term for the standing position in prayer?",
        options: ["Ruku", "Qiyam", "Sujud", "Julus"],
        answer: 1
      },
      {
        question: "Which companion was known as 'Dhul-Nurayn' (The Possessor of Two Lights)?",
        options: ["Abu Bakr", "Umar", "Uthman ibn Affan", "Ali"],
        answer: 2
      },
      {
        question: "How many prostrations of recitation (Sajdah Tilawah) are in the Qur'an?",
        options: ["11", "14", "15", "17"],
        answer: 2
      },
      {
        question: "Which month were the Muslims commanded to fast?",
        options: ["Muharram", "Rajab", "Sha'ban", "Ramadan"],
        answer: 3
      },
      {
        question: "What is the name of the well of Zamzam's original name?",
        options: ["Bir Zamzam", "Bir Isma'il", "It was always called Zamzam", "Bir Hajar"],
        answer: 2
      },
      {
        question: "Which prophet had control over the wind?",
        options: ["Ibrahim ﷺ", "Sulaiman ﷺ", "Dawud ﷺ", "Musa ﷺ"],
        answer: 1
      },
      {
        question: "How many sons did Prophet Muhammad ﷺ have?",
        options: ["1", "2", "3", "4"],
        answer: 2
      },
      {
        question: "What is the night when the Qur'an was first revealed called?",
        options: ["Laylat al-Isra", "Laylat al-Qadr", "Laylat al-Bara'ah", "Laylat al-Mi'raj"],
        answer: 1
      },
      {
        question: "Which angel is responsible for rain and provisions?",
        options: ["Jibril", "Mikail", "Israfil", "Malik"],
        answer: 1
      },
      {
        question: "How many Madani surahs are in the Qur'an?",
        options: ["24", "28", "32", "36"],
        answer: 1
      },
      {
        question: "What is the Arabic word for the pillar of Islam regarding charity?",
        options: ["Sadaqah", "Zakat", "Khums", "Fitrah"],
        answer: 1
      },
      {
        question: "Which companion was the first to be martyred in Islam?",
        options: ["Hamza", "Sumayah bint Khayyat", "Mus'ab ibn Umair", "Yasir ibn Amir"],
        answer: 1
      },
      {
        question: "Which surah was revealed entirely at once?",
        options: ["Al-Fatiha", "Al-Ikhlas", "Both Al-Fatiha and Al-Ikhlas", "Al-Kawthar"],
        answer: 0
      },
      {
        question: "How many times is the word 'Jannah' (Paradise) mentioned in the Qur'an?",
        options: ["66", "77", "88", "99"],
        answer: 1
      },
      {
        question: "Which prophet is associated with the miracle of the she-camel?",
        options: ["Salih ﷺ", "Hud ﷺ", "Shu'ayb ﷺ", "Lut ﷺ"],
        answer: 0
      },
      {
        question: "What was the age of Prophet Muhammad ﷺ when he passed away?",
        options: ["60 years", "61 years", "63 years", "65 years"],
        answer: 2
      },
      {
        question: "Which Khalifah compiled the Qur'an into one standardized text?",
        options: ["Abu Bakr", "Umar", "Uthman", "Ali"],
        answer: 2
      },
      {
        question: "What is the reward for reciting Surah Al-Ikhlas according to hadith?",
        options: ["Equal to 1/3 of the Qur'an", "Equal to 1/2 of the Qur'an", "Equal to full Qur'an", "10 rewards"],
        answer: 0
      },
      {
        question: "Which direction did Muslims first pray towards?",
        options: ["Makkah", "Madinah", "Jerusalem (Al-Aqsa)", "Yemen"],
        answer: 2
      },
      {
        question: "How many camels were sacrificed as ransom for Prophet Muhammad ﷺ's grandfather's vow?",
        options: ["50", "75", "100", "150"],
        answer: 2
      },
      {
        question: "Which surah is entirely about the Oneness of Allah?",
        options: ["Al-Fatiha", "Al-Ikhlas", "Al-Nas", "Al-Falaq"],
        answer: 1
      },
      {
        question: "What was the name of the first mosque built in Madinah?",
        options: ["Masjid Quba", "Masjid an-Nabawi", "Masjid Qiblatain", "Masjid al-Jumu'ah"],
        answer: 0
      },
      {
        question: "Which prophet's people were destroyed by a loud blast (Sayhah)?",
        options: ["Hud ﷺ", "Salih ﷺ", "Shu'ayb ﷺ", "Lut ﷺ"],
        answer: 1
      },
      {
        question: "How many types of Tawheed (Oneness of Allah) are there?",
        options: ["1", "2", "3", "4"],
        answer: 2
      },
      {
        question: "Which battle did the angels participate in helping the Muslims?",
        options: ["Battle of Badr", "Battle of Uhud", "Battle of Khandaq", "All of the above"],
        answer: 0
      },
      {
        question: "What is the name of the first male martyr in Islam?",
        options: ["Hamza", "Yasir ibn Amir", "Mus'ab ibn Umair", "Zayd ibn Harithah"],
        answer: 1
      },
      {
        question: "Which prophet was swallowed by a whale?",
        options: ["Musa ﷺ", "Yunus ﷺ", "Nuh ﷺ", "Sulaiman ﷺ"],
        answer: 1
      },
      {
        question: "How many prayers (Salawat) are mentioned in the Qur'an by specific names?",
        options: ["3", "4", "5", "7"],
        answer: 0
      },
      {
        question: "Which companion was the first to accept Islam from among the youth?",
        options: ["Abu Bakr", "Ali ibn Abi Talib", "Uthman", "Zubair ibn al-Awwam"],
        answer: 1
      },
      {
        question: "What is the name of the bridge that all must cross on the Day of Judgment?",
        options: ["As-Sirat", "Al-Mawazin", "Al-Hawd", "Al-A'raf"],
        answer: 0
      },
      {
        question: "Which prophet is known as 'Sayyid al-Awliya' (Leader of the Saints)?",
        options: ["Ibrahim ﷺ", "Musa ﷺ", "Isa ﷺ", "None - this title is not for prophets"],
        answer: 3
      },
      {
        question: "How many surahs in the Qur'an are named after prophets?",
        options: ["4", "5", "6", "7"],
        answer: 2
      },
      {
        question: "Which angel is responsible for taking souls?",
        options: ["Jibril", "Mikail", "Azrael (Malak al-Mawt)", "Israfil"],
        answer: 2
      },
      {
        question: "What was the name of Prophet Muhammad's ﷺ wet nurse?",
        options: ["Aminah", "Halimah as-Sa'diyah", "Barakah", "Thuwaybah"],
        answer: 1
      },
      {
        question: "Which surah contains the famous verse 'Allah does not burden a soul beyond what it can bear'?",
        options: ["Al-Baqarah", "Aal-e-Imran", "An-Nisa", "Al-An'am"],
        answer: 0
      },
      {
        question: "How many heavens are mentioned in Islam?",
        options: ["3", "5", "7", "9"],
        answer: 2
      },
      {
        question: "Which prophet had a staff that turned into a serpent?",
        options: ["Ibrahim ﷺ", "Musa ﷺ", "Harun ﷺ", "Sulaiman ﷺ"],
        answer: 1
      },
      {
        question: "What is the name of the tree in Paradise from which Adam and Eve ate?",
        options: ["Tuba Tree", "Zaqqum Tree", "The Forbidden Tree", "Sidrat al-Muntaha"],
        answer: 2
      },
      {
        question: "Which companion was known as 'The Scribe of Revelation'?",
        options: ["Zayd ibn Thabit", "Abdullah ibn Mas'ud", "Ubayy ibn Ka'b", "All of the above"],
        answer: 3
      },
      {
        question: "In which surah is the story of the People of the Cave (Ashab al-Kahf)?",
        options: ["Al-Kahf", "Al-Ankabut", "Al-Isra", "Maryam"],
        answer: 0
      },
      {
        question: "How many times is Maryam (Mary) mentioned by name in the Qur'an?",
        options: ["19", "25", "34", "40"],
        answer: 2
      },
      {
        question: "Which battle is known as the 'Battle of the Trench'?",
        options: ["Battle of Badr", "Battle of Uhud", "Battle of Khandaq", "Battle of Hunayn"],
        answer: 2
      },
      {
        question: "What is the Arabic term for the obligatory charity given at the end of Ramadan?",
        options: ["Zakat", "Sadaqah", "Zakat al-Fitr", "Khums"],
        answer: 2
      },
      {
        question: "Which prophet is mentioned as 'Dhul-Kifl' in the Qur'an?",
        options: ["Ilyas ﷺ", "Ayyub ﷺ", "Dhul-Kifl ﷺ", "Yusha ﷺ"],
        answer: 2
      }
    ];
    
    // Return pool (selection and shuffling handled by getBossLevelQuestions)
    return questionPool.map(q => ({ ...q, difficulty: "hard" }));
  },

  // Boss Level: Check if can play today
  canPlayBossToday: () => {
    // 🧪 BETA MODE: Allow unlimited Boss Level plays for testing
    if (useDeveloperStore.getState().betaMode) {
      return true;
    }
    
    const today = new Date().toDateString();
    const { bossAttempts } = get();
    const todayAttempt = bossAttempts.find(a => 
      new Date(a.completedAt).toDateString() === today
    );
    return !todayAttempt;
  },

  // Boss Level: Save attempt
  saveBossAttempt: (score, answers) => {
    const attempt = {
      id: `boss_${Date.now()}`,
      score: score,
      answers: answers,
      completedAt: new Date().toISOString(),
      maxScore: BOSS_LEVEL.questionCount
    };

    set(state => ({
      bossAttempts: [...state.bossAttempts, attempt]
    }));

    get().saveToStorage();
    return attempt;
  },

  // Award rewards
  awardRewards: (mode, result) => {
    const config = mode === "boss_level" ? BOSS_LEVEL : CHALLENGE_MODES[mode];
    
    // Safe rewards access - handle invalid results like "pending"
    let rewards = { xp: 0, coins: 0 };
    if (config?.rewards) {
      if (result && config.rewards[result]) {
        rewards = config.rewards[result];
      } else if (config.rewards.lose) {
        rewards = config.rewards.lose;
      }
    }
    
    const { addXP, addCoins } = useProgressStore.getState();
    addXP(rewards.xp);
    addCoins(rewards.coins);
    
    return rewards;
  },

  // Auto-expire challenges after 48h
  checkExpiredChallenges: () => {
    const now = Date.now();
    set(state => ({
      challenges: state.challenges.map(c => {
        if (c.status !== "completed" && new Date(c.expiresAt).getTime() < now) {
          // Auto-win for whoever played
          let winner = null;
          if (c.challengerScore !== null && c.opponentScore === null) {
            winner = c.challengerId;
          } else if (c.opponentScore !== null && c.challengerScore === null) {
            winner = c.opponentId;
          }
          return { ...c, status: "expired", winner };
        }
        return c;
      })
    }));
    get().saveToStorage();
  },

  // Get pending challenges for current user
  getPendingChallenges: () => {
    get().checkExpiredChallenges();
    const currentUserId = "current_user";
    return get().challenges.filter(c => 
      (c.challengerId === currentUserId || c.opponentId === currentUserId) &&
      c.status === "pending"
    );
  },

  // Get active challenges (one player finished, waiting for other)
  getActiveChallenges: () => {
    get().checkExpiredChallenges();
    const currentUserId = "current_user";
    return get().challenges.filter(c =>
      (c.challengerId === currentUserId || c.opponentId === currentUserId) &&
      c.status === "active"
    );
  },

  // Get completed challenges
  getCompletedChallenges: () => {
    const currentUserId = "current_user";
    return get().challenges.filter(c =>
      (c.challengerId === currentUserId || c.opponentId === currentUserId) &&
      (c.status === "completed" || c.status === "expired")
    );
  }
}));
