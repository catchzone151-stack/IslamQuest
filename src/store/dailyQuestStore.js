import { create } from "zustand";
import { useProgressStore } from "./progressStore";
import {
  getQuizForLesson
} from "../data/quizEngine";

const STORAGE_KEY = "islamQuestDailyQuest";

// Helper: Check if date is today (GMT)
function isToday(dateStr) {
  if (!dateStr) return false;
  const today = new Date().toISOString().split("T")[0];
  return dateStr === today;
}

// Helper: Get today's date in YYYY-MM-DD (GMT)
function getTodayGMT() {
  return new Date().toISOString().split("T")[0];
}

// Helper: Shuffle array (Fisher-Yates)
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Helper: Generate 8 random MCQs from user's completed lessons
// Slightly harder: pull from all paths, mix difficulty
function generateDailyQuestions() {
  const { lessonStates } = useProgressStore.getState();
  
  // Get all completed lessons
  const completedLessons = Object.keys(lessonStates)
    .filter(key => lessonStates[key]?.completed === true)
    .map(key => {
      const [pathId, lessonId] = key.split("-").map(Number);
      return { pathId, lessonId };
    });

  if (completedLessons.length === 0) {
    return [];
  }

  // Collect ALL questions from completed lessons
  const allQuestions = [];
  completedLessons.forEach(({ pathId, lessonId }) => {
    const quizData = getQuizForLesson(lessonId, pathId);
    if (quizData && quizData.questions) {
      quizData.questions.forEach(q => {
        allQuestions.push({
          ...q,
          pathId,
          lessonId,
          text: q.question || q.text,
          correctIndex: q.answer !== undefined ? q.answer : q.correctIndex,
        });
      });
    }
  });

  if (allQuestions.length === 0) {
    return [];
  }

  // Shuffle and pick 8 questions
  const shuffled = shuffle(allQuestions);
  const selected = shuffled.slice(0, Math.min(8, shuffled.length));

  // Shuffle options for each question
  return selected.map((q, index) => {
    const indexedOptions = q.options.map((opt, i) => ({ opt, i }));
    const shuffledOptions = shuffle(indexedOptions);
    const newOptions = shuffledOptions.map(x => x.opt);
    const newCorrectIndex = shuffledOptions.findIndex(x => x.i === q.correctIndex);

    return {
      id: `dq_${index + 1}`,
      text: q.text,
      options: newOptions,
      correctIndex: newCorrectIndex,
    };
  });
}

export const useDailyQuestStore = create((set, get) => ({
  // Daily Quest state
  date: null,
  questions: [],
  completed: false,
  rewardGiven: false,

  // Load from LocalStorage
  loadDailyQuest: () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      set(data);
    }
  },

  // Save to LocalStorage
  saveDailyQuest: () => {
    const data = get();
    const toSave = {
      date: data.date,
      questions: data.questions,
      completed: data.completed,
      rewardGiven: data.rewardGiven,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  },

  // Check if Daily Quest is ready for today
  // If new day, generate fresh questions
  // Returns true if quest is available
  checkAndGenerateDailyQuest: () => {
    const today = getTodayGMT();
    const state = get();

    // If already today's quest, no need to regenerate
    if (isToday(state.date)) {
      return true;
    }

    // New day - generate new quest
    const questions = generateDailyQuestions();

    if (questions.length === 0) {
      // User hasn't completed any lessons yet
      return false;
    }

    set({
      date: today,
      questions,
      completed: false,
      rewardGiven: false,
    });

    get().saveDailyQuest();
    return true;
  },

  // Complete Daily Quest and award rewards
  // Supabase-ready: will become async DB operation
  completeDailyQuest: (correctCount) => {
    const state = get();

    if (state.completed || !isToday(state.date)) {
      return;
    }

    // Award rewards
    const xp = 60;
    const coins = 20;

    useProgressStore.getState().addXPAndCoins(xp, coins);

    set({
      completed: true,
      rewardGiven: true,
    });

    get().saveDailyQuest();
  },

  // Check if quest is available (user has completed lessons)
  isQuestAvailable: () => {
    const { lessonStates } = useProgressStore.getState();
    const completedCount = Object.keys(lessonStates).filter(
      key => lessonStates[key]?.completed === true
    ).length;
    return completedCount > 0;
  },

  // Get quest status
  getQuestStatus: () => {
    const state = get();
    const today = getTodayGMT();

    if (!isToday(state.date)) {
      return "new_day"; // Fresh quest can be generated
    }

    if (state.completed) {
      return "completed"; // Come back tomorrow
    }

    if (state.questions.length > 0) {
      return "ready"; // Ready to play
    }

    return "unavailable"; // No completed lessons
  },
}));
