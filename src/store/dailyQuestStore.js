import { create } from "zustand";
import { useProgressStore } from "./progressStore";
import {
  getQuizForLesson
} from "../data/quizEngine";
import { supabase } from "../lib/supabaseClient";
import { logXpEvent } from "../backend/xpLogs";

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
  // lessonStates structure: { [pathId]: { [lessonId]: { passed: true } } }
  const completedLessons = [];
  Object.keys(lessonStates).forEach(pathId => {
    const pathState = lessonStates[pathId];
    // Defensive guard: skip if pathState is undefined/null
    if (!pathState || typeof pathState !== 'object') return;
    
    Object.keys(pathState).forEach(lessonId => {
      if (pathState[lessonId]?.passed === true) {
        completedLessons.push({ 
          pathId: parseInt(pathId), 
          lessonId: parseInt(lessonId) 
        });
      }
    });
  });

  if (completedLessons.length === 0) {
    return [];
  }

  // Collect ALL questions from completed lessons
  const allQuestions = [];
  completedLessons.forEach(({ pathId, lessonId }) => {
    const quizData = getQuizForLesson(lessonId, pathId);
    // getQuizForLesson returns array directly, not object with questions property
    if (quizData && Array.isArray(quizData) && quizData.length > 0) {
      quizData.forEach(q => {
        // Normalize different quiz schema formats
        const text = q.text || q.question || q.prompt;
        const options = q.options || q.choices;
        const correctIndex = q.correctIndex !== undefined ? q.correctIndex : 
                           (q.answer !== undefined ? q.answer : q.correctChoice);
        
        // Only add if we have valid data
        if (text && options && Array.isArray(options) && correctIndex !== undefined) {
          allQuestions.push({
            ...q,
            pathId,
            lessonId,
            text,
            options,
            correctIndex,
          });
        }
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
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        set({
          date: data.date || null,
          questions: Array.isArray(data.questions) ? data.questions : [],
          completed: Boolean(data.completed),
          rewardGiven: Boolean(data.rewardGiven),
        });
      }
    } catch (e) {
      console.warn("[DailyQuestStore] loadDailyQuest error:", e.message);
      set({ date: null, questions: [], completed: false, rewardGiven: false });
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

  // Set daily quest from sync (cloud → local)
  setDailyQuestFromSync: (data) => {
    if (!data) return;
    
    let questions = [];
    try {
      if (data.questions) {
        if (typeof data.questions === "string") {
          questions = JSON.parse(data.questions);
        } else if (Array.isArray(data.questions)) {
          questions = data.questions;
        }
      }
    } catch (e) {
      console.warn("[DailyQuestStore] Failed to parse questions:", e.message);
      questions = [];
    }

    if (!Array.isArray(questions)) questions = [];

    set({
      date: data.quest_date || null,
      questions: questions,
      completed: Boolean(data.completed),
      rewardGiven: Boolean(data.reward_given),
    });
    get().saveDailyQuest();
  },

  // Check if Daily Quest is ready for today
  // If new day, generate fresh questions
  // Returns true if quest is available
  // Phase 4: Now syncs new quest to Supabase cloud
  checkAndGenerateDailyQuest: async () => {
    const today = getTodayGMT();
    const state = get();
    
    // If already today's quest AND has questions, no need to regenerate
    if (isToday(state.date) && state.questions.length > 0) {
      return true;
    }

    // New day OR missing questions - generate new quest
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

    // 🌐 Phase 4: Sync new quest to Supabase cloud
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (auth && auth.user) {
        await get().saveDailyQuestToCloud(auth.user.id, {
          date: today,
          questions,
          completed: false,
          rewardGiven: false,
        });
      }
    } catch (err) {
      console.log("❌ Cloud sync after quest generation failed:", err);
    }

    return true;
  },

  // Complete Daily Quest and award rewards
  // Phase 4: Now syncs completion to Supabase cloud
  completeDailyQuest: async (correctCount) => {
    const state = get();

    if (state.completed || !isToday(state.date)) {
      return;
    }

    // Award rewards
    const xp = 60;
    const coins = 20;

    useProgressStore.getState().addXPAndCoins(xp, coins);
    
    // Log XP event for daily quest
    (async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data?.user?.id;
      if (userId) {
        logXpEvent(userId, xp, "daily_quest");
      }
    })();
    
    // 🛡️ Mark day as complete for streak tracking
    useProgressStore.getState().markDayComplete();

    set({
      completed: true,
      rewardGiven: true,
    });

    get().saveDailyQuest();

    // 🌐 Phase 4: Sync completion to Supabase cloud
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (auth && auth.user) {
        await get().markDailyQuestCompleted(auth.user.id);
      }
    } catch (err) {
      console.log("❌ Cloud sync after quest completion failed:", err);
    }
  },
  
  // Track daily quest completion for analytics
  setQuestAnalyticsEvent: () => {
    // Analytics event will be called from component using useAnalytics
  },

  // Check if quest is available (user has completed lessons)
  isQuestAvailable: () => {
    const { lessonStates } = useProgressStore.getState();
    // Count all completed lessons across all paths
    let completedCount = 0;
    Object.keys(lessonStates).forEach(pathId => {
      const pathState = lessonStates[pathId];
      // Defensive guard: skip if pathState is undefined/null
      if (!pathState || typeof pathState !== 'object') return;
      
      Object.keys(pathState).forEach(lessonId => {
        if (pathState[lessonId]?.passed === true) {
          completedCount++;
        }
      });
    });
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

  // ═══════════════════════════════════════════════════════════════════════════
  // 🌐 PHASE 4: SUPABASE CLOUD SYNC FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  // Load daily quest from Supabase cloud
  loadDailyQuestFromCloud: async (userId) => {
    if (!userId) {
      console.log("❌ loadDailyQuestFromCloud: No userId provided");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("daily_quests")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.log("❌ loadDailyQuestFromCloud error:", error.message);
        return;
      }

      if (!data) {
        console.log("📥 No cloud quest found - checking local quest");
        let state = get();
        
        if (!state.date || state.questions.length === 0) {
          console.log("🔄 No local quest - generating new quest");
          const hasQuest = await get().checkAndGenerateDailyQuest();
          if (!hasQuest) {
            console.log("⚠️ Cannot generate quest - no completed lessons");
            return;
          }
          state = get();
        }
        
        if (state.date && state.questions.length > 0) {
          console.log("📤 Uploading quest to cloud...");
          await get().saveDailyQuestToCloud(userId, {
            date: state.date,
            questions: state.questions,
            completed: state.completed,
            rewardGiven: state.rewardGiven,
          });
        }
        return;
      }

      const today = getTodayGMT();
      const cloudDate = data.quest_date;

      if (cloudDate !== today) {
        console.log("🔄 Cloud quest expired - generating new local quest");
        const hasQuest = await get().checkAndGenerateDailyQuest();
        if (hasQuest) {
          const state = get();
          await get().saveDailyQuestToCloud(userId, {
            date: state.date,
            questions: state.questions,
            completed: state.completed,
            rewardGiven: state.rewardGiven,
          });
        }
        return;
      }

      console.log("✅ Restoring daily quest from cloud");
      const questions = data.questions ? JSON.parse(data.questions) : [];
      
      set({
        date: data.quest_date,
        questions: questions,
        completed: data.completed || false,
        rewardGiven: data.reward_given || false,
      });

      get().saveDailyQuest();

    } catch (err) {
      console.log("❌ loadDailyQuestFromCloud failed:", err);
    }
  },

  // Save daily quest to Supabase cloud
  saveDailyQuestToCloud: async (userId, questData) => {
    if (!userId) {
      console.log("❌ saveDailyQuestToCloud: No userId provided");
      return;
    }

    try {
      const payload = {
        user_id: userId,
        quest_date: questData.date,
        questions: JSON.stringify(questData.questions),
        completed: questData.completed || false,
        reward_given: questData.rewardGiven || false,
        updated_at: new Date().toISOString(),
      };

      // Upsert (insert or update if exists)
      const { error } = await supabase
        .from("daily_quests")
        .upsert(payload, { onConflict: "user_id" });

      if (error) {
        console.log("❌ saveDailyQuestToCloud error:", error.message);
        return;
      }

      console.log("✅ Daily quest saved to cloud");

    } catch (err) {
      console.log("❌ saveDailyQuestToCloud failed:", err);
    }
  },

  // Mark daily quest as completed in cloud
  markDailyQuestCompleted: async (userId) => {
    if (!userId) {
      console.log("❌ markDailyQuestCompleted: No userId provided");
      return;
    }

    try {
      const state = get();
      
      const { error } = await supabase
        .from("daily_quests")
        .update({
          completed: true,
          reward_given: true,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) {
        console.log("❌ markDailyQuestCompleted error:", error.message);
        return;
      }

      console.log("✅ Daily quest completion synced to cloud");

    } catch (err) {
      console.log("❌ markDailyQuestCompleted failed:", err);
    }
  },

  // Create or update daily quest in cloud (wrapper for flexibility)
  createOrUpdateDailyQuest: async (userId, quest) => {
    if (!userId) {
      console.log("❌ createOrUpdateDailyQuest: No userId provided");
      return;
    }

    await get().saveDailyQuestToCloud(userId, quest);
  },

  // Sync current local state to cloud (convenience wrapper)
  syncToSupabase: async () => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth || !auth.user) return;

      const state = get();
      if (state.date && state.questions.length > 0) {
        await get().saveDailyQuestToCloud(auth.user.id, {
          date: state.date,
          questions: state.questions,
          completed: state.completed,
          rewardGiven: state.rewardGiven,
        });
      }
    } catch (err) {
      console.log("❌ syncToSupabase failed:", err);
    }
  },

  // Load from cloud (convenience wrapper)
  loadFromSupabase: async () => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth || !auth.user) return;

      await get().loadDailyQuestFromCloud(auth.user.id);
    } catch (err) {
      console.log("❌ loadFromSupabase failed:", err);
    }
  },
}));
