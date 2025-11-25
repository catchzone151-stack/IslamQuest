import { create } from "zustand";
import { useProgressStore } from "./progressStore";
import { useFriendsStore } from "./friendsStore";
import { supabase } from "../lib/supabaseClient";
import { getQuizForLesson } from "../data/quizEngine";
import { isDevMode, DEV_MOCK_FRIENDS } from "../config/dev";

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
  minLevel: 8,
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
      const updated = [questionText, ...state.recentlyShownQuestions].slice(0, 50);
      return { recentlyShownQuestions: updated };
    });
    get().saveToStorage();
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

  buildQuestionPool: () => {
    const { lessonStates } = useProgressStore.getState();
    const allQuestions = [];
    Object.keys(lessonStates).forEach(lessonKey => {
      const lessonState = lessonStates[lessonKey];
      if (lessonState?.completed === true || lessonState?.passed === true) {
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

  getQuestionPool: () => {
    const { questionPoolCache, cacheTimestamp } = get();
    const { lessonStates } = useProgressStore.getState();
    const currentLessonCount = Object.keys(lessonStates).filter(
      key => lessonStates[key]?.completed || lessonStates[key]?.passed
    ).length;
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

  getCurrentUserId: async () => {
    const { data: auth } = await supabase.auth.getUser();
    return auth?.user?.id || null;
  },

  createChallengeCloud: async (opponentId, mode) => {
    try {
      set({ loading: true, error: null });
      
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        set({ loading: false, error: "Not authenticated" });
        return { success: false, error: "NOT_AUTHENTICATED" };
      }
      
      const challengerId = auth.user.id;
      
      let config;
      if (typeof mode === 'string') {
        config = Object.values(CHALLENGE_MODES).find(m => m.id === mode);
      } else {
        config = mode;
      }
      
      if (!config) {
        set({ loading: false, error: "Invalid mode" });
        return { success: false, error: "INVALID_MODE" };
      }
      
      const questions = get().getQuestionsForMode(config, []);
      
      if (questions.length === 0) {
        set({ loading: false, error: "No questions available" });
        return { success: false, error: "NO_QUESTIONS" };
      }
      
      const expiresAt = new Date(Date.now() + CHALLENGE_DURATION).toISOString();
      
      const { data, error } = await supabase
        .from('challenges')
        .insert({
          challenger_id: challengerId,
          opponent_id: opponentId,
          mode: config.id,
          questions: questions,
          status: 'pending',
          expires_at: expiresAt
        })
        .select()
        .maybeSingle();
      
      if (error) {
        console.error('Create challenge error:', error);
        set({ loading: false, error: error.message });
        return { success: false, error: error.message };
      }
      
      const formattedChallenge = get().formatChallengeFromCloud(data);
      
      set(state => ({
        challenges: [...state.challenges, formattedChallenge],
        loading: false
      }));
      get().saveToStorage();
      
      return { success: true, challenge: formattedChallenge };
    } catch (err) {
      console.error('Create challenge error:', err);
      set({ loading: false, error: err.message });
      return { success: false, error: err.message };
    }
  },

  submitChallengeAttempt: async (challengeId, score, answers, completionTime = null, chain = null) => {
    try {
      set({ loading: true, error: null });
      
      if (isDevMode()) {
        return get().submitChallengeAttemptLocal(challengeId, score, answers, completionTime, chain);
      }
      
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        set({ loading: false });
        return { success: false, error: "NOT_AUTHENTICATED" };
      }
      
      const userId = auth.user.id;
      
      const { data: challenge, error: fetchError } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', challengeId)
        .maybeSingle();
      
      if (fetchError || !challenge) {
        set({ loading: false });
        return { success: false, error: "CHALLENGE_NOT_FOUND" };
      }
      
      const isChallenger = challenge.challenger_id === userId;
      const isOpponent = challenge.opponent_id === userId;
      
      if (!isChallenger && !isOpponent) {
        set({ loading: false });
        return { success: false, error: "NOT_PARTICIPANT" };
      }
      
      const updateData = {
        status: 'active'
      };
      
      if (isChallenger) {
        if (challenge.challenger_score !== null) {
          set({ loading: false });
          return { success: false, error: "ALREADY_PLAYED" };
        }
        updateData.challenger_score = score;
        updateData.challenger_answers = answers;
        updateData.challenger_time = completionTime;
        updateData.challenger_chain = chain;
        updateData.challenger_played_at = new Date().toISOString();
      } else {
        if (challenge.opponent_score !== null) {
          set({ loading: false });
          return { success: false, error: "ALREADY_PLAYED" };
        }
        updateData.opponent_score = score;
        updateData.opponent_answers = answers;
        updateData.opponent_time = completionTime;
        updateData.opponent_chain = chain;
        updateData.opponent_played_at = new Date().toISOString();
      }
      
      const otherPlayerPlayed = isChallenger 
        ? challenge.opponent_score !== null 
        : challenge.challenger_score !== null;
      
      if (otherPlayerPlayed) {
        updateData.status = 'completed';
        updateData.completed_at = new Date().toISOString();
        
        const challengerScore = isChallenger ? score : challenge.challenger_score;
        const opponentScore = isChallenger ? challenge.opponent_score : score;
        const challengerTime = isChallenger ? completionTime : challenge.challenger_time;
        const opponentTime = isChallenger ? challenge.opponent_time : completionTime;
        const challengerChain = isChallenger ? chain : challenge.challenger_chain;
        const opponentChain = isChallenger ? challenge.opponent_chain : chain;
        
        const modeId = challenge.mode;
        const isSuddenDeath = modeId === 'sudden_death';
        
        let winnerId = null;
        let isDraw = false;
        
        if (isSuddenDeath) {
          const cChain = challengerChain || 0;
          const oChain = opponentChain || 0;
          if (cChain > oChain) {
            winnerId = challenge.challenger_id;
          } else if (oChain > cChain) {
            winnerId = challenge.opponent_id;
          } else {
            isDraw = true;
          }
        } else {
          if (challengerScore > opponentScore) {
            winnerId = challenge.challenger_id;
          } else if (opponentScore > challengerScore) {
            winnerId = challenge.opponent_id;
          } else {
            const mode = Object.values(CHALLENGE_MODES).find(m => m.id === modeId);
            if (mode?.trackTime && challengerTime !== null && opponentTime !== null) {
              winnerId = challengerTime < opponentTime 
                ? challenge.challenger_id 
                : challenge.opponent_id;
            } else {
              isDraw = true;
            }
          }
        }
        
        updateData.winner_id = winnerId;
        updateData.is_draw = isDraw;
      }
      
      const { data: updated, error: updateError } = await supabase
        .from('challenges')
        .update(updateData)
        .eq('id', challengeId)
        .select()
        .maybeSingle();
      
      if (updateError) {
        console.error('Update challenge error:', updateError);
        set({ loading: false });
        return { success: false, error: updateError.message };
      }
      
      const formattedChallenge = get().formatChallengeFromCloud(updated);
      
      set(state => ({
        challenges: state.challenges.map(c => 
          c.id === challengeId ? formattedChallenge : c
        ),
        loading: false
      }));
      
      if (updated.status === 'completed') {
        set(state => ({
          challengeHistory: [...state.challengeHistory, formattedChallenge]
        }));
      }
      
      get().saveToStorage();
      useProgressStore.getState().markDayComplete();
      
      return { success: true, challenge: formattedChallenge };
    } catch (err) {
      console.error('Submit attempt error:', err);
      set({ loading: false, error: err.message });
      return { success: false, error: err.message };
    }
  },

  formatChallengeFromCloud: (data) => {
    if (!data) return null;
    return {
      id: data.id,
      challengerId: data.challenger_id,
      opponentId: data.opponent_id,
      mode: data.mode,
      questions: data.questions || [],
      challengerScore: data.challenger_score,
      opponentScore: data.opponent_score,
      challengerAnswers: data.challenger_answers,
      opponentAnswers: data.opponent_answers,
      challengerTime: data.challenger_time,
      opponentTime: data.opponent_time,
      challengerChain: data.challenger_chain,
      opponentChain: data.opponent_chain,
      status: data.status,
      winner: data.winner_id || (data.is_draw ? 'draw' : null),
      isDraw: data.is_draw,
      createdAt: data.created_at,
      expiresAt: data.expires_at,
      completedAt: data.completed_at
    };
  },

  loadPendingChallenges: async () => {
    try {
      set({ loading: true, error: null });
      
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        set({ loading: false });
        return [];
      }
      
      const userId = auth.user.id;
      
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('opponent_id', userId)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Load pending challenges error:', error);
        set({ loading: false });
        return [];
      }
      
      const formatted = (data || []).map(c => get().formatChallengeFromCloud(c));
      
      set(state => {
        const existingIds = new Set(state.challenges.map(c => c.id));
        const newChallenges = formatted.filter(c => !existingIds.has(c.id));
        return {
          challenges: [...state.challenges.filter(c => c.status !== 'pending' || c.challengerId === userId), ...formatted],
          loading: false
        };
      });
      
      return formatted;
    } catch (err) {
      console.error('Load pending error:', err);
      set({ loading: false });
      return [];
    }
  },

  loadActiveChallenges: async () => {
    try {
      set({ loading: true, error: null });
      
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        set({ loading: false });
        return [];
      }
      
      const userId = auth.user.id;
      
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Load active challenges error:', error);
        set({ loading: false });
        return [];
      }
      
      const formatted = (data || []).map(c => get().formatChallengeFromCloud(c));
      
      set(state => {
        const activeIds = new Set(formatted.map(c => c.id));
        const otherChallenges = state.challenges.filter(c => 
          c.status !== 'active' || !activeIds.has(c.id)
        );
        return {
          challenges: [...otherChallenges, ...formatted],
          loading: false
        };
      });
      
      return formatted;
    } catch (err) {
      console.error('Load active error:', err);
      set({ loading: false });
      return [];
    }
  },

  loadChallengeHistory: async (limit = 20) => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return [];
      
      const userId = auth.user.id;
      
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Load history error:', error);
        return [];
      }
      
      const formatted = (data || []).map(c => get().formatChallengeFromCloud(c));
      set({ challengeHistory: formatted });
      
      return formatted;
    } catch (err) {
      console.error('Load history error:', err);
      return [];
    }
  },

  loadAllMyChallenges: async () => {
    try {
      set({ loading: true, error: null });
      
      if (isDevMode()) {
        console.log('🔧 DEV MODE: Returning local challenges only');
        set({ loading: false });
        return get().challenges;
      }
      
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        set({ loading: false });
        return [];
      }
      
      const userId = auth.user.id;
      
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`)
        .in('status', ['pending', 'active'])
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Load all challenges error:', error);
        set({ loading: false });
        return [];
      }
      
      const formatted = (data || []).map(c => get().formatChallengeFromCloud(c));
      set({ challenges: formatted, loading: false });
      get().saveToStorage();
      
      return formatted;
    } catch (err) {
      console.error('Load all error:', err);
      set({ loading: false });
      return [];
    }
  },

  saveBossAttemptCloud: async (score, answers, completionTime = null) => {
    try {
      const passed = score >= Math.ceil(BOSS_LEVEL.questionCount * 0.75);
      const rewards = passed ? BOSS_LEVEL.rewards.win : BOSS_LEVEL.rewards.lose;
      
      if (isDevMode()) {
        console.log('🔧 DEV MODE: Boss attempt saved locally only');
        const attempt = {
          id: `dev_boss_${Date.now()}`,
          score: score,
          answers: answers,
          completedAt: new Date().toISOString(),
          maxScore: BOSS_LEVEL.questionCount,
          passed: passed
        };
        
        set(state => ({
          bossAttempts: [...state.bossAttempts, attempt]
        }));
        get().saveToStorage();
        useProgressStore.getState().markDayComplete();
        
        return { success: true, attempt, rewards };
      }
      
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        return { success: false, error: "NOT_AUTHENTICATED" };
      }
      
      const userId = auth.user.id;
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('boss_attempts')
        .insert({
          user_id: userId,
          attempt_date: today,
          score: score,
          answers: answers,
          completion_time: completionTime,
          passed: passed,
          xp_earned: rewards.xp,
          coins_earned: rewards.coins
        })
        .select()
        .maybeSingle();
      
      if (error) {
        if (error.code === '23505') {
          return { success: false, error: "ALREADY_ATTEMPTED_TODAY" };
        }
        console.error('Save boss attempt error:', error);
        return { success: false, error: error.message };
      }
      
      const attempt = {
        id: data.id,
        score: data.score,
        answers: data.answers,
        completedAt: data.created_at,
        maxScore: BOSS_LEVEL.questionCount,
        passed: data.passed
      };
      
      set(state => ({
        bossAttempts: [...state.bossAttempts, attempt]
      }));
      get().saveToStorage();
      
      useProgressStore.getState().markDayComplete();
      
      return { success: true, attempt, rewards };
    } catch (err) {
      console.error('Save boss attempt error:', err);
      return { success: false, error: err.message };
    }
  },

  loadBossAttemptToday: async () => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return null;
      
      const userId = auth.user.id;
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('boss_attempts')
        .select('*')
        .eq('user_id', userId)
        .eq('attempt_date', today)
        .maybeSingle();
      
      if (error || !data) return null;
      
      return {
        id: data.id,
        score: data.score,
        answers: data.answers,
        completedAt: data.created_at,
        maxScore: BOSS_LEVEL.questionCount,
        passed: data.passed
      };
    } catch (err) {
      console.error('Load boss attempt error:', err);
      return null;
    }
  },

  canPlayBossTodayCloud: async () => {
    if (isDevMode()) {
      console.log('🔧 DEV MODE: Boss Level always playable');
      return true;
    }
    const attempt = await get().loadBossAttemptToday();
    return !attempt;
  },

  createChallenge: (friendId, mode) => {
    if (isDevMode()) {
      return get().createChallengeLocal(friendId, mode);
    }
    return get().createChallengeCloud(friendId, mode);
  },
  
  createChallengeLocal: (friendId, mode) => {
    console.log('🔧 DEV MODE: Creating local challenge');
    const modeConfig = typeof mode === 'string' 
      ? Object.values(CHALLENGE_MODES).find(m => m.id === mode) 
      : mode;
    
    if (!modeConfig) {
      console.error('Invalid mode:', mode);
      return { success: false, error: 'INVALID_MODE' };
    }
    
    const friend = DEV_MOCK_FRIENDS.find(f => f.odolena_user_id === friendId);
    const questions = get().selectRandomQuestions(modeConfig.questionCount);
    
    const challenge = {
      id: `dev_challenge_${Date.now()}`,
      mode: modeConfig.id,
      challengerId: 'dev_user',
      opponentId: friendId,
      opponentName: friend?.odolena_nickname || 'Test Friend',
      opponentAvatar: friend?.odolena_avatar || 'avatar_man_beard',
      questions: questions,
      status: 'active',
      challengerScore: null,
      challengerAnswers: null,
      challengerTime: null,
      opponentScore: null,
      opponentAnswers: null,
      opponentTime: null,
      winner: null,
      isDraw: false,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
    };
    
    set(state => ({
      challenges: [...state.challenges, challenge]
    }));
    get().saveToStorage();
    
    return { success: true, challenge };
  },
  
  submitChallengeAttemptLocal: (challengeId, score, answers, completionTime = null, chain = null) => {
    console.log('🔧 DEV MODE: Submitting challenge attempt locally with auto-opponent');
    
    const challenge = get().challenges.find(c => c.id === challengeId);
    if (!challenge) {
      set({ loading: false });
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
        winnerId = 'dev_user';
      } else if (opponentChain > userChain) {
        winnerId = challenge.opponentId;
      } else {
        isDraw = true;
      }
    } else {
      if (score > opponentScore) {
        winnerId = 'dev_user';
      } else if (opponentScore > score) {
        winnerId = challenge.opponentId;
      } else {
        if (modeConfig?.trackTime && completionTime !== null) {
          winnerId = completionTime < opponentTime ? 'dev_user' : challenge.opponentId;
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
      challengeHistory: [...state.challengeHistory, updatedChallenge],
      loading: false
    }));
    get().saveToStorage();
    useProgressStore.getState().markDayComplete();
    
    return { success: true, challenge: updatedChallenge };
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

  getQuestionsForMode: (mode, sharedLessons) => {
    let config;
    if (typeof mode === 'string') {
      config = Object.values(CHALLENGE_MODES).find(m => m.id === mode);
    } else {
      config = mode;
    }
    if (!config) {
      console.error('Invalid mode:', mode);
      return [];
    }
    
    let allQuestions = get().getQuestionPool();
    if (allQuestions.length === 0) {
      allQuestions = get().getBetaFallbackQuestions();
    }
    
    const freshQuestions = get().filterRecentQuestions(allQuestions);
    let filteredQuestions = freshQuestions;
    
    if (config.id === 'mind_battle') {
      filteredQuestions = freshQuestions.filter(q => 
        q.difficulty === 'hard' || q.difficulty === 'medium'
      );
    } else if (config.id === 'lightning_round') {
      filteredQuestions = freshQuestions;
    } else if (config.id === 'speed_run') {
      filteredQuestions = freshQuestions.filter(q => 
        q.difficulty !== 'hard' || Math.random() > 0.5
      );
    } else if (config.id === 'sudden_death') {
      filteredQuestions = freshQuestions;
    }
    
    if (filteredQuestions.length === 0) {
      filteredQuestions = freshQuestions;
    }
    
    const count = config.questionCount || 8;
    if (filteredQuestions.length < count) {
      filteredQuestions = get().expandQuestionPool(filteredQuestions, count);
    }
    
    const shuffled = filteredQuestions.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    selected.forEach(q => get().trackShownQuestion(q.question));
    
    return selected;
  },

  getBetaFallbackQuestions: () => {
    return [
      { question: "What is the first pillar of Islam?", options: ["Prayer", "Shahada (Declaration of Faith)", "Fasting", "Charity"], answer: 1, difficulty: "hard" },
      { question: "How many daily prayers are obligatory in Islam?", options: ["3", "4", "5", "6"], answer: 2, difficulty: "hard" },
      { question: "Which prophet built the Kaaba?", options: ["Prophet Muhammad ﷺ", "Prophet Ibrahim ﷺ", "Prophet Musa ﷺ", "Prophet Isa ﷺ"], answer: 1, difficulty: "hard" },
      { question: "What is the holy book of Islam?", options: ["Torah", "Bible", "Qur'an", "Vedas"], answer: 2, difficulty: "hard" },
      { question: "In which month do Muslims fast?", options: ["Rajab", "Shaban", "Ramadan", "Dhul Hijjah"], answer: 2, difficulty: "hard" },
      { question: "What is Zakat?", options: ["Fasting", "Prayer", "Charity", "Pilgrimage"], answer: 2, difficulty: "hard" },
      { question: "Where is the Kaaba located?", options: ["Medina", "Mecca", "Jerusalem", "Cairo"], answer: 1, difficulty: "hard" },
      { question: "What does 'Islam' mean?", options: ["Peace", "Submission to Allah ﷻ", "Both peace and submission", "Faith"], answer: 2, difficulty: "hard" },
      { question: "Who was the first person to accept Islam?", options: ["Abu Bakr", "Khadijah", "Ali", "Umar"], answer: 1, difficulty: "hard" },
      { question: "How many verses are in Surah Al-Fatiha?", options: ["5", "6", "7", "8"], answer: 2, difficulty: "hard" },
      { question: "What is the meaning of 'Bismillah'?", options: ["In the name of Allah ﷻ", "Praise be to Allah ﷻ", "Allah ﷻ is Great", "There is no god but Allah ﷻ"], answer: 0, difficulty: "hard" },
      { question: "Which direction do Muslims face when praying?", options: ["East", "West", "Towards Mecca", "North"], answer: 2, difficulty: "hard" }
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
    let allQuestions = get().getBossLevelQuestionPool();
    allQuestions = get().filterRecentQuestions(allQuestions);
    
    const targetCount = BOSS_LEVEL.questionCount || 12;
    if (allQuestions.length < targetCount) {
      if (allQuestions.length === 0) {
        allQuestions = get().getBossLevelFallbackQuestions();
      } else {
        allQuestions = get().expandQuestionPool(allQuestions, targetCount);
      }
    }
    
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, targetCount);
    selected.forEach(q => get().trackShownQuestion(q.question));
    
    return selected;
  },

  getBossLevelFallbackQuestions: () => {
    return [
      { question: "Which name of Allah ﷻ means 'The All-Knowing'?", options: ["Al-Aleem", "Al-Hakeem", "Al-Baseer", "Al-Samee"], answer: 0, difficulty: "hard" },
      { question: "How many prophets are mentioned by name in the Qur'an?", options: ["13", "25", "40", "124,000"], answer: 1, difficulty: "hard" },
      { question: "What is the last verse revealed in the Qur'an?", options: ["Ayat al-Kursi", "The verse about debt in Surah Al-Baqarah", "The final verse of Surah Al-Baqarah", "Surah An-Nasr"], answer: 1, difficulty: "hard" },
      { question: "Which companion was known as 'The Sword of Allah ﷻ'?", options: ["Ali ibn Abi Talib", "Umar ibn al-Khattab", "Khalid ibn al-Walid", "Abu Bakr as-Siddiq"], answer: 2, difficulty: "hard" },
      { question: "What was the first masjid built by Prophet Muhammad ﷺ?", options: ["Masjid al-Haram", "Masjid an-Nabawi", "Masjid Quba", "Masjid al-Aqsa"], answer: 2, difficulty: "hard" },
      { question: "How many times is Prophet Muhammad ﷺ mentioned by name in the Qur'an?", options: ["3", "4", "5", "7"], answer: 1, difficulty: "hard" },
      { question: "Which surah is called 'the heart of the Qur'an'?", options: ["Al-Fatiha", "Ya-Sin", "Al-Mulk", "Ar-Rahman"], answer: 1, difficulty: "hard" },
      { question: "In which year of Hijrah did the Battle of Badr take place?", options: ["1st year", "2nd year", "3rd year", "4th year"], answer: 1, difficulty: "hard" },
      { question: "How many angels are mentioned by name in the Qur'an?", options: ["1", "2", "3", "4"], answer: 2, difficulty: "hard" },
      { question: "What is the longest surah in the Qur'an?", options: ["Al-Baqarah", "Aal-e-Imran", "An-Nisa", "Al-An'am"], answer: 0, difficulty: "hard" },
      { question: "Which prophet is mentioned the most in the Qur'an?", options: ["Muhammad ﷺ", "Ibrahim ﷺ", "Musa ﷺ", "Isa ﷺ"], answer: 2, difficulty: "hard" },
      { question: "How many years did it take for the Qur'an to be revealed?", options: ["10 years", "15 years", "23 years", "30 years"], answer: 2, difficulty: "hard" },
      { question: "Which sahabi was given the title 'Al-Farooq' (The Criterion)?", options: ["Abu Bakr", "Umar ibn al-Khattab", "Uthman ibn Affan", "Ali ibn Abi Talib"], answer: 1, difficulty: "hard" },
      { question: "In which cave did Prophet Muhammad ﷺ receive the first revelation?", options: ["Cave of Thawr", "Cave of Hira", "Cave of Uhud", "Cave of Safa"], answer: 1, difficulty: "hard" },
      { question: "What was the name of Prophet Muhammad's ﷺ mother?", options: ["Khadijah", "Aminah", "Fatimah", "Aisha"], answer: 1, difficulty: "hard" }
    ];
  },

  canPlayBossToday: () => {
    const today = new Date().toDateString();
    const { bossAttempts } = get();
    const todayAttempt = bossAttempts.find(a => 
      new Date(a.completedAt).toDateString() === today
    );
    return !todayAttempt;
  },

  saveBossAttempt: (score, answers) => {
    return get().saveBossAttemptCloud(score, answers);
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

  syncToSupabase: async () => {
    await get().loadAllMyChallenges();
  },

  loadFromSupabase: async () => {
    await get().loadAllMyChallenges();
  },

  selectRandomQuestions: (count) => {
    let allQuestions = get().getQuestionPool();
    if (allQuestions.length === 0) {
      allQuestions = get().getBetaFallbackQuestions();
    }
    
    const freshQuestions = get().filterRecentQuestions(allQuestions);
    let pool = freshQuestions.length > 0 ? freshQuestions : allQuestions;
    
    if (pool.length < count) {
      pool = get().expandQuestionPool(pool, count);
    }
    
    const shuffled = pool.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    selected.forEach(q => get().trackShownQuestion(q.question));
    
    return selected;
  },

  getSharedLessons: (userId, friendId) => {
    if (isDevMode()) {
      console.log('🔧 DEV MODE: Returning mock shared lessons for challenge');
      return [
        { pathId: 1, lessonId: 1 },
        { pathId: 1, lessonId: 2 },
        { pathId: 1, lessonId: 3 },
        { pathId: 2, lessonId: 1 },
        { pathId: 2, lessonId: 2 },
        { pathId: 3, lessonId: 1 },
        { pathId: 3, lessonId: 2 },
        { pathId: 3, lessonId: 3 },
        { pathId: 4, lessonId: 1 },
        { pathId: 5, lessonId: 1 },
      ];
    }
    
    const { completedLessons } = useProgressStore.getState();
    const userCompletedSet = new Set(
      completedLessons.map(l => `${l.pathId}-${l.lessonId}`)
    );
    
    return completedLessons.filter(lesson => 
      userCompletedSet.has(`${lesson.pathId}-${lesson.lessonId}`)
    );
  },
}));
