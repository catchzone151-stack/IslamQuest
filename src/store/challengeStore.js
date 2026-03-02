import { create } from "zustand";
import { useProgressStore } from "./progressStore";
import { useFriendsStore } from "./friendsStore";
import { supabase } from "../lib/supabaseClient";
import { logXpEvent } from "../backend/xpLogs";
import { logChallengeRequest, logChallengeResult } from "../backend/challengeLogs";

import namesOfAllahQuizzesData from '../data/quizzes/namesOfAllah.json';
import foundationsQuizzesData from '../data/quizzes/foundations.json';
import prophetsQuizzesData from '../data/quizzes/prophets.json';
import prophetLifeQuizzesData from '../data/quizzes/prophetLife.json';
import wivesQuizzesData from '../data/quizzes/wivesQuizzes.json';
import tenPromisedQuizzesData from '../data/quizzes/tenPromisedQuizzes.json';
import greatestWomenQuizzesData from '../data/quizzes/greatestWomenQuizzes.json';
import companionsQuizzesData from '../data/quizzes/companionsQuizzes.json';
import angelsQuizzesData from '../data/quizzes/angelsQuizzes.json';
import endTimesQuizzesData from '../data/quizzes/endTimesQuizzes.json';
import graveQuizzesData from '../data/quizzes/graveQuizzes.json';
import judgementQuizzesData from '../data/quizzes/judgementQuizzes.json';
import hellfireQuizzesData from '../data/quizzes/hellfireQuizzes.json';
import paradiseQuizzesData from '../data/quizzes/paradiseQuizzes.json';

const STORAGE_KEY = "islamQuestChallenges_v2";
const CHALLENGE_DURATION = 48 * 60 * 60 * 1000;

export const CHALLENGE_MODES = {
  MIND_BATTLE: {
    id: "mind_battle",
    name: "Mind Battle",
    icon: "🧠",
    description: "8 questions",
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
    description: "Answer as many correctly in 30 seconds (max 40 questions)",
    questionCount: 40,
    totalTime: 30,
    rewards: { win: { xp: 120, coins: 20 }, lose: { xp: 20, coins: 0 }, draw: { xp: 50, coins: 0 } },
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    glow: "0 0 20px rgba(16, 185, 129, 0.5)"
  },
  SUDDEN_DEATH: {
    id: "sudden_death",
    name: "Sudden Death",
    icon: "⚔️",
    description: "Build the longest chain of correct answers",
    questionCount: 25,
    trackTime: true,
    rewards: { win: { xp: 200, coins: 30 }, lose: { xp: 0, coins: 0 }, draw: { xp: 100, coins: 15 } },
    gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    glow: "0 0 20px rgba(239, 68, 68, 0.5)"
  }
};

export const BOSS_LEVEL = {
  id: "boss_level",
  name: "The Boss Level",
  icon: "👑",
  description: "Daily ultra-hard challenge — 12 questions, 30 seconds",
  questionCount: 12,
  totalTime: 30,
  minLevel: 1,
  rewards: { win: { xp: 500, coins: 100 }, lose: { xp: 50, coins: 0 } },
  gradient: "linear-gradient(135deg, #1e3a5f 0%, #0f1c2e 100%)",
  glow: "0 0 30px rgba(30, 58, 95, 0.7)"
};

export const calculateLongestChain = (answers) => {
  if (!answers || answers.length === 0) return 0;
  let longest = 0;
  let current = 0;
  answers.forEach(a => {
    if (a.correct) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  });
  return longest;
};

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const useChallengeStore = create((set, get) => ({
  challenges: [],
  bossAttempts: [],
  challengeHistory: [],
  recentlyShownQuestions: [],
  questionPoolCache: null,
  cacheTimestamp: null,
  loading: false,
  error: null,

  saveToStorage: () => {
    const data = {
      challenges: get().challenges,
      bossAttempts: get().bossAttempts,
      challengeHistory: get().challengeHistory,
      recentlyShownQuestions: get().recentlyShownQuestions,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

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
    }
  },

  trackShownQuestion: (questionText) => {
    set(state => {
      const updated = [questionText, ...state.recentlyShownQuestions].slice(0, 100);
      return { recentlyShownQuestions: updated };
    });
    get().saveToStorage();
  },

  // Normalize answer option lengths and shuffle to prevent obvious clues
  normalizeAndShuffleOptions: (question) => {
    const { options, answer } = question;
    const correctAnswer = options[answer];
    
    // Create shuffled options array
    const shuffledOptions = [...options].sort(() => Math.random() - 0.5);
    const newAnswerIndex = shuffledOptions.indexOf(correctAnswer);
    
    return {
      ...question,
      options: shuffledOptions,
      answer: newAnswerIndex
    };
  },

  generateQuestionVariation: (originalQuestion) => {
    const { question, options, answer, difficulty } = originalQuestion;
    const newOptions = [...options];
    const correctAnswer = options[answer];
    const distractors = newOptions.filter((_, idx) => idx !== answer);
    const shuffledDistractors = distractors.sort(() => Math.random() - 0.5);
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
      isVariation: true
    };
  },

  // Build a global pool from ALL 14 quiz JSON files — no study-lock, no filtering by lesson progress.
  // Returns every question in the app (1600+), deduplicated by question text.
  buildGlobalQuestionPool: () => {
    const allPathsData = [
      namesOfAllahQuizzesData, foundationsQuizzesData, prophetsQuizzesData,
      prophetLifeQuizzesData, wivesQuizzesData, tenPromisedQuizzesData,
      greatestWomenQuizzesData, companionsQuizzesData, angelsQuizzesData,
      endTimesQuizzesData, graveQuizzesData, judgementQuizzesData,
      hellfireQuizzesData, paradiseQuizzesData
    ];

    const seen = new Set();
    const pool = [];

    allPathsData.forEach((pathData, pathIndex) => {
      if (!Array.isArray(pathData)) return;
      pathData.forEach(lessonData => {
        if (!Array.isArray(lessonData.questions)) return;
        lessonData.questions.forEach(q => {
          if (!q.question || seen.has(q.question)) return;
          seen.add(q.question);
          pool.push({
            question: q.question,
            options: q.options,
            answer: q.answer,
            difficulty: q.difficulty || 'medium',
            sourcePath: pathIndex + 1,
            sourceLesson: lessonData.lessonId,
          });
        });
      });
    });

    return pool;
  },

  // Legacy alias kept for any residual callers — delegates to the global pool.
  buildQuestionPool: () => get().buildGlobalQuestionPool(),

  getQuestionPool: () => {
    const { questionPoolCache, cacheTimestamp } = get();
    // Cache is valid for 5 minutes — avoids rebuilding on every question generation
    const CACHE_TTL = 5 * 60 * 1000;
    if (questionPoolCache && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_TTL) {
      return questionPoolCache.questions;
    }
    const pool = get().buildGlobalQuestionPool();
    set({ questionPoolCache: { questions: pool }, cacheTimestamp: Date.now() });
    return pool;
  },

  filterRecentQuestions: (questions) => {
    const { recentlyShownQuestions } = get();
    return questions.filter(q => !recentlyShownQuestions.includes(q.question));
  },

  expandQuestionPool: (questions, targetCount) => {
    const expanded = [...questions];
    const neededVariations = Math.max(0, targetCount - questions.length);
    if (neededVariations > 0 && questions.length > 0) {
      for (let i = 0; i < neededVariations; i++) {
        const sourceQuestion = questions[i % questions.length];
        const variation = get().generateQuestionVariation(sourceQuestion);
        expanded.push(variation);
      }
    }
    return expanded;
  },

  createChallenge: (friendId, mode) => {
    const modeConfig = typeof mode === 'string' 
      ? Object.values(CHALLENGE_MODES).find(m => m.id === mode) 
      : mode;
    
    if (!modeConfig) {
      console.error('Invalid mode:', mode);
      return { success: false, error: 'INVALID_MODE' };
    }
    
    const realFriends = useFriendsStore.getState().friends || [];
    const allFriends = useFriendsStore.getState().getAllFriends?.() || realFriends;
    const friend = allFriends.find(f => f.user_id === friendId || f.id === friendId) ||
                   realFriends.find(f => f.user_id === friendId || f.id === friendId);
    
    const questions = get().getQuestionsForMode(modeConfig);
    
    if (questions.length === 0) {
      console.error('No questions available for challenge');
      return { success: false, error: 'NO_QUESTIONS' };
    }
    
    const challenge = {
      id: generateUUID(),
      mode: modeConfig.id,
      challengerId: 'current_user',
      opponentId: friendId,
      opponentName: friend?.nickname || friend?.username || friend?.odolena_nickname || 'Friend',
      opponentAvatar: friend?.avatar || friend?.odolena_avatar || 'avatar_man_beard',
      questions: questions,
      status: 'active',
      challengerScore: null,
      challengerAnswers: null,
      challengerTime: null,
      challengerChain: null,
      opponentScore: null,
      opponentAnswers: null,
      opponentTime: null,
      opponentChain: null,
      winner: null,
      isDraw: false,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + CHALLENGE_DURATION).toISOString()
    };
    
    set(state => ({
      challenges: [...state.challenges, challenge]
    }));
    get().saveToStorage();
    
    // Log challenge request
    (async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data?.user?.id;
      if (userId) {
        logChallengeRequest(userId, modeConfig.id, friendId);
      }
    })();
    
    return { success: true, challenge };
  },
  
  submitChallengeAttempt: (challengeId, score, answers, completionTime = null, chain = null) => {
    const challenge = get().challenges.find(c => c.id === challengeId);
    if (!challenge) {
      return { success: false, error: 'CHALLENGE_NOT_FOUND' };
    }
    
    const modeConfig = typeof challenge.mode === 'string' 
      ? Object.values(CHALLENGE_MODES).find(m => m.id === challenge.mode)
      : challenge.mode;
    
    const opponentScore = Math.floor(Math.random() * (challenge.questions?.length || 8));
    const opponentTime = Math.floor(Math.random() * 60) + 20;
    const opponentChain = modeConfig?.id === 'sudden_death' 
      ? Math.floor(Math.random() * 6) + 1 
      : null;
    const opponentAnswers = (challenge.questions || []).map((q, i) => ({
      questionId: q.id || `q_${i}`,
      selectedAnswer: Math.floor(Math.random() * 4),
      correct: i < opponentScore
    }));
    
    let winnerId = null;
    let isDraw = false;
    
    if (modeConfig?.id === 'sudden_death') {
      const userChain = chain || calculateLongestChain(answers);
      if (userChain > opponentChain) {
        winnerId = 'current_user';
      } else if (opponentChain > userChain) {
        winnerId = challenge.opponentId;
      } else {
        isDraw = true;
      }
    } else {
      if (score > opponentScore) {
        winnerId = 'current_user';
      } else if (opponentScore > score) {
        winnerId = challenge.opponentId;
      } else {
        if (modeConfig?.trackTime && completionTime !== null) {
          winnerId = completionTime < opponentTime ? 'current_user' : challenge.opponentId;
        } else {
          isDraw = true;
        }
      }
    }
    
    const updatedChallenge = {
      ...challenge,
      challengerScore: score,
      challengerAnswers: answers,
      challengerTime: completionTime,
      challengerChain: chain,
      opponentScore: opponentScore,
      opponentAnswers: opponentAnswers,
      opponentTime: opponentTime,
      opponentChain: opponentChain,
      status: 'completed',
      winner: winnerId,
      isDraw: isDraw,
      completedAt: new Date().toISOString()
    };
    
    set(state => ({
      challenges: state.challenges.map(c => 
        c.id === challengeId ? updatedChallenge : c
      ),
      challengeHistory: [...state.challengeHistory, updatedChallenge]
    }));
    get().saveToStorage();
    console.log("[IQ_STREAK_TRACE] MEANINGFUL_ACTIVITY_DETECTED", { source: "solo_challenge_complete" });
    useProgressStore.getState().markDayComplete();
    
    // Log challenge result
    (async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data?.user?.id;
      if (userId) {
        const result = isDraw ? "draw" : (winnerId === 'current_user' ? "win" : "lose");
        const modeConf = typeof challenge.mode === 'string' 
          ? Object.values(CHALLENGE_MODES).find(m => m.id === challenge.mode)
          : challenge.mode;
        const xpGained = modeConf?.rewards?.[result]?.xp || 0;
        const modeId = typeof challenge.mode === 'string' ? challenge.mode : modeConf?.id;
        logChallengeResult(userId, modeId, result, xpGained, challenge.opponentId);
      }
    })();
    
    return { success: true, challenge: updatedChallenge };
  },

  loadAllMyChallenges: () => {
    return get().challenges;
  },

  saveBossAttempt: (score, answers, completionTime = null) => {
    // Boss always scores 11/12 - user must get 11 or 12 to beat the Boss
    const bossScore = 11;
    const passed = score >= bossScore;
    const rewards = passed ? BOSS_LEVEL.rewards.win : BOSS_LEVEL.rewards.lose;
    
    const attempt = {
      id: generateUUID(),
      score: score,
      answers: answers,
      completionTime: completionTime,
      completedAt: new Date().toISOString(),
      maxScore: BOSS_LEVEL.questionCount,
      passed: passed
    };
    
    set(state => ({
      bossAttempts: [...state.bossAttempts, attempt]
    }));
    get().saveToStorage();
    console.log("[IQ_STREAK_TRACE] MEANINGFUL_ACTIVITY_DETECTED", { source: "boss_challenge_complete" });
    useProgressStore.getState().markDayComplete();
    
    return { success: true, attempt, rewards };
  },

  canPlayBossToday: () => {
    const today = new Date().toDateString();
    const { bossAttempts } = get();
    const todayAttempt = bossAttempts.find(a => 
      new Date(a.completedAt).toDateString() === today
    );
    return !todayAttempt;
  },

  saveChallengeProgress: (challengeId, score, answers, isChallenger, completionTime = null) => {
    set(state => ({
      challenges: state.challenges.map(c => {
        if (c.id === challengeId) {
          let updatedChallenge = { ...c };
          if (isChallenger) {
            updatedChallenge.challengerScore = score;
            updatedChallenge.challengerAnswers = answers;
            updatedChallenge.challengerTime = completionTime;
            updatedChallenge.status = c.opponentScore !== null ? "completed" : "active";
          } else {
            updatedChallenge.opponentScore = score;
            updatedChallenge.opponentAnswers = answers;
            updatedChallenge.opponentTime = completionTime;
            updatedChallenge.status = c.challengerScore !== null ? "completed" : "active";
          }
          const modeId = typeof c.mode === 'string' ? c.mode : c.mode?.id;
          if (modeId === 'sudden_death') {
            updatedChallenge.challengerChain = updatedChallenge.challengerAnswers 
              ? calculateLongestChain(updatedChallenge.challengerAnswers) 
              : 0;
            updatedChallenge.opponentChain = updatedChallenge.opponentAnswers 
              ? calculateLongestChain(updatedChallenge.opponentAnswers) 
              : 0;
          }
          return updatedChallenge;
        }
        return c;
      })
    }));
    get().saveToStorage();
  },

  completeChallenge: (challengeId) => {
    const challenge = get().challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    let winner = null;
    const modeId = typeof challenge.mode === 'string' ? challenge.mode : challenge.mode?.id;
    const isSuddenDeath = modeId === 'sudden_death';
    
    if (isSuddenDeath) {
      let challengerChain = challenge.challengerChain;
      let opponentChain = challenge.opponentChain;
      if (challengerChain === null || challengerChain === undefined) {
        challengerChain = challenge.challengerAnswers ? calculateLongestChain(challenge.challengerAnswers) : 0;
      }
      if (opponentChain === null || opponentChain === undefined) {
        opponentChain = challenge.opponentAnswers ? calculateLongestChain(challenge.opponentAnswers) : 0;
      }
      if (challengerChain > opponentChain) {
        winner = challenge.challengerId;
      } else if (opponentChain > challengerChain) {
        winner = challenge.opponentId;
      } else {
        winner = "draw";
      }
    } else {
      if (challenge.challengerScore > challenge.opponentScore) {
        winner = challenge.challengerId;
      } else if (challenge.opponentScore > challenge.challengerScore) {
        winner = challenge.opponentId;
      } else {
        const mode = Object.values(CHALLENGE_MODES).find(m => m.id === modeId);
        if (mode?.trackTime && challenge.challengerTime !== null && challenge.opponentTime !== null) {
          winner = challenge.challengerTime < challenge.opponentTime 
            ? challenge.challengerId 
            : challenge.opponentId;
        } else {
          winner = "draw";
        }
      }
    }
    
    console.log("[IQ_STREAK_TRACE] MEANINGFUL_ACTIVITY_DETECTED", { source: "solo_challenge_finalized" });
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

  getQuestionsForMode: (mode) => {
    let config;
    if (typeof mode === 'string') {
      config = Object.values(CHALLENGE_MODES).find(m => m.id === mode);
    } else {
      config = mode;
    }
    if (!config) {
      console.error('[ChallengeStore] Invalid mode:', mode);
      return [];
    }

    const count = config.questionCount || 8;

    // Pull from the full global pool (1600+ questions, no study-lock)
    let pool = get().getQuestionPool();

    // Prefer questions not shown recently (cross-session freshness)
    const freshPool = get().filterRecentQuestions(pool);
    if (freshPool.length >= count) {
      pool = freshPool;
    }
    // If fresh pool is too small, fall back to full pool — still no duplicates within session

    // Shuffle pool with Fisher-Yates for unbiased randomness
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Deduplicate within session using a Set on question text (absolute guarantee)
    const sessionSeen = new Set();
    const selected = [];
    for (const q of shuffled) {
      if (selected.length >= count) break;
      if (sessionSeen.has(q.question)) continue;
      sessionSeen.add(q.question);
      selected.push(q);
    }

    // If somehow still short (shouldn't happen with 1600+ questions), pad from fallback
    if (selected.length < count) {
      const fallback = get().getFallbackQuestions();
      for (const q of fallback) {
        if (selected.length >= count) break;
        if (sessionSeen.has(q.question)) continue;
        sessionSeen.add(q.question);
        selected.push(q);
      }
    }

    // Normalise answer option order and track for cross-session freshness
    const normalizedQuestions = selected.map(q => {
      get().trackShownQuestion(q.question);
      return get().normalizeAndShuffleOptions(q);
    });

    console.log(`[ChallengeStore] getQuestionsForMode(${config.id}): ${normalizedQuestions.length} unique questions selected from pool of ${pool.length}`);
    return normalizedQuestions;
  },

  getFallbackQuestions: () => {
    return [
      { question: "What is the first pillar of Islam?", options: ["Prayer", "Shahada (Declaration of Faith)", "Fasting", "Charity"], answer: 1, difficulty: "medium" },
      { question: "How many daily prayers are obligatory in Islam?", options: ["3", "4", "5", "6"], answer: 2, difficulty: "easy" },
      { question: "Which prophet built the Kaaba?", options: ["Prophet Muhammad ﷺ", "Prophet Ibrahim عليه السلام", "Prophet Musa عليه السلام", "Prophet Isa عليه السلام"], answer: 1, difficulty: "medium" },
      { question: "What is the holy book of Islam?", options: ["Torah", "Bible", "Qur'an", "Vedas"], answer: 2, difficulty: "easy" },
      { question: "In which month do Muslims fast?", options: ["Rajab", "Shaban", "Ramadan", "Dhul Hijjah"], answer: 2, difficulty: "easy" },
      { question: "What is Zakat?", options: ["Fasting", "Prayer", "Charity", "Pilgrimage"], answer: 2, difficulty: "easy" },
      { question: "Where is the Kaaba located?", options: ["Medina", "Mecca", "Jerusalem", "Cairo"], answer: 1, difficulty: "easy" },
      { question: "What does 'Islam' mean?", options: ["Peace", "Submission to Allah", "Both peace and submission", "Faith"], answer: 2, difficulty: "medium" },
      { question: "Who was the first person to accept Islam?", options: ["Abu Bakr", "Khadijah رضي الله عنها", "Ali", "Umar"], answer: 1, difficulty: "medium" },
      { question: "How many verses are in Surah Al-Fatiha?", options: ["5", "6", "7", "8"], answer: 2, difficulty: "medium" },
      { question: "What is the meaning of 'Bismillah'?", options: ["In the name of Allah", "Praise be to Allah", "Allah is Great", "There is no god but Allah"], answer: 0, difficulty: "easy" },
      { question: "Which direction do Muslims face when praying?", options: ["East", "West", "Towards Mecca", "North"], answer: 2, difficulty: "easy" },
      { question: "How many surahs are in the Qur'an?", options: ["100", "114", "120", "99"], answer: 1, difficulty: "medium" },
      { question: "What is the last pillar of Islam?", options: ["Shahada", "Prayer", "Zakat", "Hajj"], answer: 3, difficulty: "medium" },
      { question: "Who was the last prophet in Islam?", options: ["Prophet Isa عليه السلام", "Prophet Musa عليه السلام", "Prophet Muhammad ﷺ", "Prophet Ibrahim عليه السلام"], answer: 2, difficulty: "easy" },
      { question: "What is the night journey of Prophet Muhammad ﷺ called?", options: ["Hijra", "Isra and Mi'raj", "Badr", "Uhud"], answer: 1, difficulty: "medium" },
      { question: "How many times is 'Allahu Akbar' said in the Adhan?", options: ["2", "4", "6", "8"], answer: 1, difficulty: "hard" },
      { question: "What was the first word revealed to Prophet Muhammad ﷺ?", options: ["Say", "Read", "Pray", "Believe"], answer: 1, difficulty: "medium" },
      { question: "Which angel brought revelations to Prophet Muhammad ﷺ?", options: ["Mikael", "Israfil", "Jibreel عليه السلام", "Azrael"], answer: 2, difficulty: "easy" },
      { question: "What is the name of the well in Mecca near the Kaaba?", options: ["Zamzam", "Safa", "Marwa", "Arafat"], answer: 0, difficulty: "medium" },
      { question: "How many prophets are mentioned by name in the Qur'an?", options: ["15", "20", "25", "30"], answer: 2, difficulty: "hard" },
      { question: "What is the shortest surah in the Qur'an?", options: ["Al-Fatiha", "Al-Ikhlas", "Al-Kawthar", "An-Nas"], answer: 2, difficulty: "hard" },
      { question: "In which city was Prophet Muhammad ﷺ born?", options: ["Medina", "Mecca", "Jerusalem", "Taif"], answer: 1, difficulty: "easy" },
      { question: "What is the Friday prayer called?", options: ["Fajr", "Jumu'ah", "Isha", "Maghrib"], answer: 1, difficulty: "easy" },
      { question: "How many rakats are in Fajr prayer?", options: ["2", "3", "4", "5"], answer: 0, difficulty: "medium" },
      { question: "What is the blessed night in Ramadan called?", options: ["Night of Power (Laylat al-Qadr)", "Night of Journey", "Night of Destiny", "Night of Blessing"], answer: 0, difficulty: "medium" },
      { question: "Who was the mother of Prophet Ismail عليه السلام?", options: ["Sarah", "Hajar", "Maryam", "Asiyah"], answer: 1, difficulty: "medium" },
      { question: "What is the first month of the Islamic calendar?", options: ["Ramadan", "Muharram", "Rajab", "Shawwal"], answer: 1, difficulty: "medium" },
      { question: "How many years did Prophet Muhammad ﷺ receive revelations?", options: ["10 years", "15 years", "23 years", "30 years"], answer: 2, difficulty: "hard" },
      { question: "What is the Arabic word for fasting?", options: ["Salah", "Sawm", "Zakat", "Hajj"], answer: 1, difficulty: "easy" },
      { question: "Which prophet is known as 'Khalilullah' (Friend of Allah)?", options: ["Prophet Musa عليه السلام", "Prophet Isa عليه السلام", "Prophet Ibrahim عليه السلام", "Prophet Nuh عليه السلام"], answer: 2, difficulty: "medium" },
      { question: "What are the two main celebrations in Islam?", options: ["Eid al-Fitr and Eid al-Adha", "Eid al-Fitr and Mawlid", "Eid al-Adha and Ashura", "Mawlid and Ashura"], answer: 0, difficulty: "easy" },
      { question: "What is the name of the treaty signed between Muslims and Quraysh?", options: ["Treaty of Medina", "Treaty of Hudaybiyyah", "Treaty of Aqaba", "Treaty of Taif"], answer: 1, difficulty: "hard" },
      { question: "Which surah is known as 'the heart of the Qur'an'?", options: ["Al-Baqarah", "Ya-Sin", "Al-Rahman", "Al-Mulk"], answer: 1, difficulty: "hard" },
      { question: "How many times should a Muslim perform Hajj in their lifetime?", options: ["Once", "Twice", "Three times", "Every year"], answer: 0, difficulty: "easy" },
      { question: "What is the meaning of 'Alhamdulillah'?", options: ["God is Great", "In the name of God", "All praise is due to Allah", "God willing"], answer: 2, difficulty: "easy" },
      { question: "Which companion was known as 'As-Siddiq' (The Truthful)?", options: ["Umar ibn al-Khattab", "Abu Bakr", "Uthman ibn Affan", "Ali ibn Abi Talib"], answer: 1, difficulty: "medium" },
      { question: "What is the prayer before dawn called?", options: ["Fajr", "Zuhr", "Asr", "Isha"], answer: 0, difficulty: "easy" },
      { question: "What is the Arabic term for supplication?", options: ["Salah", "Dua", "Dhikr", "Tasbih"], answer: 1, difficulty: "easy" },
      { question: "Which prophet was swallowed by a whale?", options: ["Prophet Musa عليه السلام", "Prophet Yunus عليه السلام", "Prophet Nuh عليه السلام", "Prophet Ayyub عليه السلام"], answer: 1, difficulty: "easy" },
      { question: "What is the meaning of 'SubhanAllah'?", options: ["All praise is due to Allah", "Glory be to Allah", "Allah is Great", "In the name of Allah"], answer: 1, difficulty: "easy" },
      { question: "How many rakats are in Isha prayer?", options: ["2", "3", "4", "5"], answer: 2, difficulty: "medium" },
      { question: "Which prophet was known for his patience?", options: ["Prophet Yusuf عليه السلام", "Prophet Ayyub عليه السلام", "Prophet Dawud عليه السلام", "Prophet Sulaiman عليه السلام"], answer: 1, difficulty: "medium" },
      { question: "What is the name of Prophet Muhammad's ﷺ grandfather?", options: ["Abu Talib", "Abdul Muttalib", "Abu Lahab", "Hashim"], answer: 1, difficulty: "medium" },
      { question: "Which surah mentions the story of Yusuf عليه السلام?", options: ["Surah Yusuf", "Surah Maryam", "Surah Al-Kahf", "Surah Al-Anbiya"], answer: 0, difficulty: "easy" },
      { question: "What is the meaning of 'La ilaha illallah'?", options: ["God is Great", "There is no god but Allah", "All praise to Allah", "In the name of Allah"], answer: 1, difficulty: "easy" },
      { question: "How many gates does Jannah have?", options: ["4", "7", "8", "12"], answer: 2, difficulty: "hard" },
      { question: "Which prophet could speak to animals?", options: ["Prophet Dawud عليه السلام", "Prophet Sulaiman عليه السلام", "Prophet Musa عليه السلام", "Prophet Isa عليه السلام"], answer: 1, difficulty: "medium" },
      { question: "What is the Arabic word for prayer?", options: ["Sawm", "Salah", "Zakat", "Hajj"], answer: 1, difficulty: "easy" },
      { question: "Which companion was known as 'Al-Farooq'?", options: ["Abu Bakr", "Umar ibn al-Khattab", "Uthman", "Ali"], answer: 1, difficulty: "medium" },
      { question: "What is the last surah of the Qur'an?", options: ["Al-Fatiha", "Al-Ikhlas", "An-Nas", "Al-Falaq"], answer: 2, difficulty: "easy" },
      { question: "How many rakats are in Zuhr prayer?", options: ["2", "3", "4", "5"], answer: 2, difficulty: "medium" },
      { question: "Which prophet was given the Zabur (Psalms)?", options: ["Prophet Musa عليه السلام", "Prophet Dawud عليه السلام", "Prophet Isa عليه السلام", "Prophet Ibrahim عليه السلام"], answer: 1, difficulty: "medium" },
      { question: "What is the meaning of 'insha'Allah'?", options: ["God willing", "God is Great", "Praise be to God", "In the name of God"], answer: 0, difficulty: "easy" },
      { question: "Which prophet is known as 'Ruhullah' (Spirit of Allah)?", options: ["Prophet Ibrahim عليه السلام", "Prophet Musa عليه السلام", "Prophet Isa عليه السلام", "Prophet Adam عليه السلام"], answer: 2, difficulty: "hard" },
      { question: "What is the name of the angel of death?", options: ["Jibreel", "Mikael", "Israfil", "Azrael"], answer: 3, difficulty: "medium" },
      { question: "How many prophets are considered 'Ulul Azm' (resolute)?", options: ["3", "4", "5", "6"], answer: 2, difficulty: "hard" },
      { question: "Which surah is also called 'Al-Hamd'?", options: ["Al-Baqarah", "Al-Fatiha", "Al-Ikhlas", "Ya-Sin"], answer: 1, difficulty: "medium" },
      { question: "What is the Arabic word for pilgrimage?", options: ["Sawm", "Salah", "Zakat", "Hajj"], answer: 3, difficulty: "easy" },
      { question: "Which prophet built the Ark?", options: ["Prophet Ibrahim عليه السلام", "Prophet Musa عليه السلام", "Prophet Nuh عليه السلام", "Prophet Isa عليه السلام"], answer: 2, difficulty: "easy" }
    ];
  },

  getBossLevelQuestionPool: () => {
    const allPathsData = [
      namesOfAllahQuizzesData, foundationsQuizzesData, prophetsQuizzesData,
      prophetLifeQuizzesData, wivesQuizzesData, tenPromisedQuizzesData,
      greatestWomenQuizzesData, companionsQuizzesData, angelsQuizzesData,
      endTimesQuizzesData, graveQuizzesData, judgementQuizzesData,
      hellfireQuizzesData, paradiseQuizzesData
    ];

    const bossPool = [];
    allPathsData.forEach((pathData, pathIndex) => {
      const allPathQuestions = [];
      pathData.forEach(lessonData => {
        if (lessonData.questions && Array.isArray(lessonData.questions)) {
          lessonData.questions.forEach(q => {
            allPathQuestions.push({
              question: q.question,
              options: q.options,
              answer: q.answer,
              difficulty: 'hard',
              sourcePath: pathIndex + 1,
              sourceLesson: lessonData.lessonId
            });
          });
        }
      });
      const totalQuestions = allPathQuestions.length;
      const lastThirdStart = Math.max(0, totalQuestions - Math.ceil(totalQuestions / 3));
      const lastThirdQuestions = allPathQuestions.slice(lastThirdStart);
      bossPool.push(...lastThirdQuestions);
    });

    return bossPool;
  },

  getBossLevelQuestions: () => {
    const targetCount = BOSS_LEVEL.questionCount || 12;

    // Boss pulls from the full global pool — same 1600+ questions, no study-lock
    let pool = get().getQuestionPool();

    // Prefer fresh (cross-session)
    const freshPool = get().filterRecentQuestions(pool);
    if (freshPool.length >= targetCount) pool = freshPool;

    // Fisher-Yates shuffle
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Set-based dedup within session — absolute guarantee of uniqueness
    const sessionSeen = new Set();
    const selected = [];
    for (const q of shuffled) {
      if (selected.length >= targetCount) break;
      if (sessionSeen.has(q.question)) continue;
      sessionSeen.add(q.question);
      selected.push(q);
    }

    // Fallback pad if somehow short
    if (selected.length < targetCount) {
      const fallback = get().getBossLevelFallbackQuestions();
      for (const q of fallback) {
        if (selected.length >= targetCount) break;
        if (sessionSeen.has(q.question)) continue;
        sessionSeen.add(q.question);
        selected.push(q);
      }
    }

    const normalizedQuestions = selected.map(q => {
      get().trackShownQuestion(q.question);
      return get().normalizeAndShuffleOptions(q);
    });

    console.log(`[ChallengeStore] getBossLevelQuestions: ${normalizedQuestions.length} unique questions`);
    return normalizedQuestions;
  },

  getBossLevelFallbackQuestions: () => {
    return [
      { question: "Which name of Allah means 'The All-Knowing'?", options: ["Al-Aleem", "Al-Hakeem", "Al-Baseer", "Al-Samee"], answer: 0, difficulty: "hard" },
      { question: "How many prophets are mentioned by name in the Qur'an?", options: ["13", "25", "40", "124,000"], answer: 1, difficulty: "hard" },
      { question: "What is the last verse revealed in the Qur'an?", options: ["Ayat al-Kursi", "The verse about debt in Surah Al-Baqarah", "The final verse of Surah Al-Baqarah", "Surah An-Nasr"], answer: 1, difficulty: "hard" },
      { question: "Which companion was known as 'The Sword of Allah'?", options: ["Ali ibn Abi Talib", "Umar ibn al-Khattab", "Khalid ibn al-Walid", "Abu Bakr as-Siddiq"], answer: 2, difficulty: "hard" },
      { question: "What was the first masjid built by Prophet Muhammad ﷺ?", options: ["Masjid al-Haram", "Masjid an-Nabawi", "Masjid Quba", "Masjid al-Aqsa"], answer: 2, difficulty: "hard" },
      { question: "How many times is Prophet Muhammad ﷺ mentioned by name in the Qur'an?", options: ["3", "4", "5", "7"], answer: 1, difficulty: "hard" },
      { question: "Which surah is called 'the heart of the Qur'an'?", options: ["Al-Fatiha", "Ya-Sin", "Al-Mulk", "Ar-Rahman"], answer: 1, difficulty: "hard" },
      { question: "In which year of Hijrah did the Battle of Badr take place?", options: ["1st year", "2nd year", "3rd year", "4th year"], answer: 1, difficulty: "hard" },
      { question: "How many angels are mentioned by name in the Qur'an?", options: ["1", "2", "3", "4"], answer: 2, difficulty: "hard" },
      { question: "What is the longest surah in the Qur'an?", options: ["Al-Baqarah", "Aal-e-Imran", "An-Nisa", "Al-An'am"], answer: 0, difficulty: "hard" },
      { question: "Which prophet is mentioned the most in the Qur'an?", options: ["Muhammad ﷺ", "Ibrahim عليه السلام", "Musa عليه السلام", "Isa عليه السلام"], answer: 2, difficulty: "hard" },
      { question: "How many years did it take for the Qur'an to be revealed?", options: ["10 years", "15 years", "23 years", "30 years"], answer: 2, difficulty: "hard" },
      { question: "Which sahabi was given the title 'Al-Farooq' (The Criterion)?", options: ["Abu Bakr", "Umar ibn al-Khattab", "Uthman ibn Affan", "Ali ibn Abi Talib"], answer: 1, difficulty: "hard" },
      { question: "In which cave did Prophet Muhammad ﷺ receive the first revelation?", options: ["Cave of Thawr", "Cave of Hira", "Cave of Uhud", "Cave of Safa"], answer: 1, difficulty: "hard" },
      { question: "What was the name of Prophet Muhammad's ﷺ mother?", options: ["Khadijah", "Aminah", "Fatimah", "Aisha"], answer: 1, difficulty: "hard" }
    ];
  },

  awardRewards: (mode, result) => {
    const config = mode === "boss_level" ? BOSS_LEVEL : CHALLENGE_MODES[mode];
    let rewards = { xp: 0, coins: 0 };
    if (config?.rewards) {
      if (result && config.rewards[result]) {
        rewards = config.rewards[result];
      } else if (config.rewards.lose) {
        rewards = config.rewards.lose;
      }
    }
    const { addXPAndCoins } = useProgressStore.getState();
    addXPAndCoins(rewards.xp, rewards.coins);
    
    // Log XP event for challenge
    if (rewards.xp > 0) {
      (async () => {
        const { data } = await supabase.auth.getUser();
        const userId = data?.user?.id;
        if (userId) {
          logXpEvent(userId, rewards.xp, "challenge");
        }
      })();
    }
    
    return rewards;
  },

  checkExpiredChallenges: () => {
    const now = Date.now();
    set(state => ({
      challenges: state.challenges.map(c => {
        if (c.status !== "completed" && new Date(c.expiresAt).getTime() < now) {
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

  getPendingChallenges: () => {
    get().checkExpiredChallenges();
    return get().challenges.filter(c => c.status === "pending");
  },

  getActiveChallenges: () => {
    get().checkExpiredChallenges();
    return get().challenges.filter(c => c.status === "active");
  },

  getCompletedChallenges: () => {
    return get().challenges.filter(c => 
      c.status === "completed" || c.status === "expired"
    );
  },

  selectRandomQuestions: (count) => {
    let allQuestions = get().getQuestionPool();
    if (allQuestions.length === 0) {
      allQuestions = get().getFallbackQuestions();
    }
    
    const freshQuestions = get().filterRecentQuestions(allQuestions);
    let pool = freshQuestions.length > 0 ? freshQuestions : allQuestions;
    
    if (pool.length < count) {
      pool = get().expandQuestionPool(pool, count);
    }
    
    const shuffled = pool.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    
    // Track shown questions and shuffle options to remove obvious clues
    const normalizedQuestions = selected.map(q => {
      get().trackShownQuestion(q.question);
      return get().normalizeAndShuffleOptions(q);
    });
    
    return normalizedQuestions;
  },

  getSharedLessons: (userId, friendId) => {
    const { completedLessons } = useProgressStore.getState();
    if (!completedLessons || !Array.isArray(completedLessons) || completedLessons.length === 0) {
      return [];
    }
    
    const userCompletedSet = new Set(
      completedLessons.map(l => `${l.pathId}-${l.lessonId}`)
    );
    
    return completedLessons.filter(lesson => 
      userCompletedSet.has(`${lesson.pathId}-${lesson.lessonId}`)
    );
  },
}));
