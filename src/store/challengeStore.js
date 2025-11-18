import { create } from "zustand";
import { useProgressStore } from "./progressStore";
import { useFriendsStore } from "./friendsStore";

const STORAGE_KEY = "islamQuestChallenges_v1";
const CHALLENGE_DURATION = 48 * 60 * 60 * 1000; // 48 hours in ms

// Challenge modes with config
export const CHALLENGE_MODES = {
  MIND_DUEL: {
    id: "mind_duel",
    name: "Mind Duel",
    icon: "🧠",
    description: "6-8 hard MCQs with 12s each",
    questionCount: 8,
    timePerQuestion: 12,
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
  FILL_THE_GAP: {
    id: "fill_the_gap",
    name: "Fill-the-Gap",
    icon: "📝",
    description: "8-10 cloze questions from lessons",
    questionCount: 9,
    timePerQuestion: 15,
    rewards: { win: { xp: 120, coins: 20 }, lose: { xp: 20, coins: 0 } },
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    glow: "0 0 20px rgba(16, 185, 129, 0.5)"
  },
  LIGHTNING_CHAIN: {
    id: "lightning_chain",
    name: "Lightning Chain",
    icon: "⛓️",
    description: "Increasing difficulty, one wrong ends",
    timePerQuestion: 10,
    rewards: { win: { xp: 130, coins: 20 }, lose: { xp: 25, coins: 0 } },
    gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    glow: "0 0 20px rgba(239, 68, 68, 0.5)"
  }
};

export const BOSS_LEVEL = {
  id: "boss_level",
  name: "Boss Level",
  icon: "👑", // Will be replaced with Zayd mascot image
  description: "Daily ultra-hard challenge",
  questionCount: 5,
  totalTime: 30,
  minLevel: 8,
  rewards: { win: { xp: 300, coins: 50 }, lose: { xp: 50, coins: 0 } },
  gradient: "linear-gradient(135deg, #1e3a5f 0%, #0f1c2e 100%)", // Dark blue gradient
  glow: "0 0 30px rgba(30, 58, 95, 0.7)"
};

export const useChallengeStore = create((set, get) => ({
  // State
  challenges: [], // All friend challenges
  bossAttempts: [], // Boss level attempts
  challengeHistory: [], // Completed challenges
  
  // Helper: Save to storage (Supabase-ready)
  saveToStorage: () => {
    const data = {
      challenges: get().challenges,
      bossAttempts: get().bossAttempts,
      challengeHistory: get().challengeHistory,
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
      });
    }
  },

  // Get shared completed lessons between two users
  getSharedLessons: (userId, friendId) => {
    // Get current user's completed lessons
    const { lessonStates } = useProgressStore.getState();
    const currentUserCompletedLessons = Object.keys(lessonStates).filter(
      key => lessonStates[key]?.completed === true
    );
    
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
    const sharedLessons = get().getSharedLessons(currentUserId, friendId);
    
    // Check if they have shared lessons
    if (sharedLessons.length === 0) {
      return { success: false, error: "NO_SHARED_LESSONS" };
    }

    const config = CHALLENGE_MODES[mode];
    const questions = get().getQuestionsForMode(mode, sharedLessons);
    
    if (questions.length === 0) {
      return { success: false, error: "NO_QUESTIONS" };
    }

    const challenge = {
      id: `challenge_${Date.now()}`,
      challengerId: currentUserId,
      opponentId: friendId,
      mode: mode,
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
    return { success: true, challenge };
  },

  // Save challenge progress
  saveChallengeProgress: (challengeId, score, answers, isChallenger) => {
    set(state => ({
      challenges: state.challenges.map(c => {
        if (c.id === challengeId) {
          if (isChallenger) {
            return {
              ...c,
              challengerScore: score,
              challengerAnswers: answers,
              status: c.opponentScore !== null ? "completed" : "active"
            };
          } else {
            return {
              ...c,
              opponentScore: score,
              opponentAnswers: answers,
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
      winner = "draw";
    }
    
    // 🛡️ Mark day as complete for streak tracking
    const { useProgressStore } = require("./progressStore");
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
    const config = CHALLENGE_MODES[mode];
    const { lessonStates } = useProgressStore.getState();
    
    // Get all questions from shared lessons
    let allQuestions = [];
    sharedLessons.forEach(lessonKey => {
      const lessonState = lessonStates[lessonKey];
      if (lessonState?.questions) {
        allQuestions = [...allQuestions, ...lessonState.questions];
      }
    });

    // Filter for hard questions and shuffle
    const hardQuestions = allQuestions.filter(q => q.difficulty === "hard" || Math.random() > 0.3);
    const shuffled = hardQuestions.sort(() => Math.random() - 0.5);
    
    const count = config.questionCount || 8;
    return shuffled.slice(0, count);
  },

  // Get questions for Boss Level (from ANY lesson)
  getBossLevelQuestions: () => {
    // Pool of 30 ultra-hard Islamic questions
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
      }
    ];
    
    // Shuffle and select 5 random questions
    const shuffled = [...questionPool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5);
    
    // Add IDs and return
    return selected.map((q, index) => ({
      id: `boss_q${index + 1}_${Date.now()}`,
      ...q,
      difficulty: "hard"
    }));
  },

  // Boss Level: Check if can play today
  canPlayBossToday: () => {
    // 🛠️ DEV MODE: Always allow Boss Level play for testing
    const DEV_MODE = true;
    if (DEV_MODE) return true;
    
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
    const rewards = config.rewards[result] || config.rewards.lose;
    
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
