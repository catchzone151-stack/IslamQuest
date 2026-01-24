// src/store/progressStore.js
import { create } from "zustand";
import { getCurrentLevel, checkLevelUp } from "../utils/diamondLevels";
import { FREE_LESSON_LIMITS, PREMIUM_ONLY_PATHS, isPremiumOnlyPath } from "./premiumConfig";
import { useModalStore, MODAL_TYPES } from "./modalStore";
import { supabase } from "../lib/supabaseClient";
import CryptoJS from "crypto-js";
import { getQuizForLesson } from "../data/quizEngine";
import { logStreakEvent } from "../backend/streakLogs";
import { logXpEvent } from "../backend/xpLogs";
import { logPurchase } from "../backend/purchaseLogs";
import { setPathStarted, setPathCompleted, setIqState, syncStreakTags } from "../services/pushTags";

const STORAGE_KEY = "islamQuestProgress_v4";

const DEFAULT_PATHS = [
  { id: 1, title: "Names of Allah", progress: 0, totalLessons: 104, completedLessons: 0, status: "available" },
  { id: 2, title: "Foundations of Islam", progress: 0, totalLessons: 17, completedLessons: 0, status: "available" },
  { id: 3, title: "Stories of Prophets", progress: 0, totalLessons: 47, completedLessons: 0, status: "available" },
  { id: 4, title: "Life of Muhammad ﷺ", progress: 0, totalLessons: 78, completedLessons: 0, status: "available" },
  { id: 5, title: "Wives of the Prophet ﷺ", progress: 0, totalLessons: 13, completedLessons: 0, status: "available" },
  { id: 6, title: "Ten Promised Jannah", progress: 0, totalLessons: 10, completedLessons: 0, status: "available" },
  { id: 7, title: "Four Greatest Women", progress: 0, totalLessons: 12, completedLessons: 0, status: "available" },
  { id: 8, title: "Stories of the Companions", progress: 0, totalLessons: 32, completedLessons: 0, status: "available" },
  { id: 9, title: "Angels", progress: 0, totalLessons: 11, completedLessons: 0, status: "available" },
  { id: 10, title: "The End Times", progress: 0, totalLessons: 13, completedLessons: 0, status: "available" },
  { id: 11, title: "The Grave", progress: 0, totalLessons: 12, completedLessons: 0, status: "available" },
  { id: 12, title: "Day of Judgement", progress: 0, totalLessons: 16, completedLessons: 0, status: "available" },
  { id: 13, title: "Hellfire", progress: 0, totalLessons: 19, completedLessons: 0, status: "available" },
  { id: 14, title: "Paradise", progress: 0, totalLessons: 20, completedLessons: 0, status: "available" },
];

const ENCRYPTION_KEY = "IQ_SYNC_V1";

function encryptJSON(obj) {
  try {
    return CryptoJS.AES.encrypt(JSON.stringify(obj), ENCRYPTION_KEY).toString();
  } catch (e) {
    console.error("Encryption failed:", e);
    return null;
  }
}

function decryptJSON(cipher) {
  try {
    const bytes = CryptoJS.AES.decrypt(cipher, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (e) {
    console.error("Decryption failed:", e);
    return null;
  }
}

export const useProgressStore = create((set, get) => ({
  // 🪙 Base user stats
  xp: 0,
  coins: 0,
  streak: 0,
  lastStudyDate: null,
  lastCompletedActivityDate: null, // Unified tracking for all activities
  shieldCount: 0, // Streak freeze shields (max 3)
  needsRepairPrompt: false, // Show repair modal on next open
  brokenStreakValue: 0, // Store streak value before break for repair
  xpMultiplier: 0,
  level: 1, // Diamond level (1-10)
  lastLogin: null,
  lessonStates: {},
  lockedLessons: {},
  hasPremium: false, // Deprecated: derived from premiumStatus, kept for backwards compatibility
  
  // 💳 Premium System (Supabase-ready)
  premium: false, // New: Simple boolean for premium status
  premiumType: null, // null | "individual" | "family"
  premiumActivatedAt: null, // Timestamp when premium was activated
  premiumStatus: "free", // "free" | "individual" (kept for backwards compatibility)
  
  // 🔊 System Preferences
  vibrationEnabled: true, // Haptic feedback toggle
  _premiumMigrationV1: false, // Internal: tracks if premium lock migration has run

  // 📚 Revise Feature Unlocks
  reviewMistakesUnlocked: false, // Unlocks after first mistake
  smartRevisionUnlocked: false, // Unlocks after 25 completed lessons

  // 🌙 Learning Paths
  paths: DEFAULT_PATHS,
  
  // 🔒 Lock Readiness Flag
  locksReady: false, // Gates lock checks until applyLockingRules completes

  // 🧠 Save & Load
  saveProgress: () => {
    const data = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  saveLessonSummary: async (lessonId, status) => {
    // status = "completed", "in-progress", "started"
    const current = get().lessonStates || {};
    const updated = {
      ...current,
      [lessonId]: {
        status,
        updatedAt: Date.now(),
      },
    };

    set({ lessonStates: updated });

    // Push encrypted lesson_states to profile
    const { data } = await supabase.auth.getUser();
    const userId = data?.user?.id;
    if (!userId) return;

    // Encrypt lesson_states before sending to Supabase (column is TEXT type)
    const encryptedStates = encryptJSON(updated);
    if (!encryptedStates) {
      console.error("Failed to encrypt lesson_states");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        lesson_states: encryptedStates,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
    
    if (error) {
      console.error("Failed to save lesson summary:", error);
    }
  },

  loadProgress: () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const savedData = JSON.parse(saved);
      if (savedData.paths) {
        savedData.paths = savedData.paths.map(savedPath => {
          const defaultPath = DEFAULT_PATHS.find(p => p.id === savedPath.id);
          return {
            ...savedPath,
            totalLessons: defaultPath ? defaultPath.totalLessons : savedPath.totalLessons,
            title: defaultPath ? defaultPath.title : savedPath.title,
          };
        });
      }
      
      // 🔒 Initialize lockedLessons based on existing progress for migration
      if (!savedData.lockedLessons || Object.keys(savedData.lockedLessons).length === 0) {
        savedData.lockedLessons = get().normalizeLocks(savedData.lessonStates || {});
      }
      
      // 💳 Migrate legacy hasPremium to premiumStatus
      if (!savedData.premiumStatus) {
        savedData.premiumStatus = savedData.hasPremium ? "individual" : "free";
      }
      // Derive hasPremium from premiumStatus for backwards compatibility
      savedData.hasPremium = savedData.premiumStatus !== "free";
      
      // 💳 INSTANT PREMIUM UX: Check IAP entitlement BEFORE set() for instant UI
      try {
        const iapState = localStorage.getItem("iq_iap_premium_entitlement");
        if (iapState) {
          const parsed = JSON.parse(iapState);
          if (parsed?.isPremium === true) {
            console.log("[ProgressStore] IAP entitlement found - instant premium UI");
            savedData.premium = true;
            savedData.premiumStatus = parsed.planType || "single";
            savedData.hasPremium = true;
          }
        }
      } catch (e) {
        // Ignore parse errors
      }
      
      if (savedData.vibrationEnabled === undefined) {
        savedData.vibrationEnabled = true;
      }
      
      // 📚 MIGRATION: Initialize Revise unlock flags if missing
      if (savedData.reviewMistakesUnlocked === undefined) {
        savedData.reviewMistakesUnlocked = false;
      }
      if (savedData.smartRevisionUnlocked === undefined) {
        savedData.smartRevisionUnlocked = false;
      }
      
      set(savedData);
      
      // 📚 MIGRATION: Recalculate Revise unlock states from existing data
      // This ensures legacy users get unlocks based on their existing progress
      get().migrateReviseUnlocks();
      
      // 🔒 MIGRATION: Recalculate all locks for premium system (Nov 2025 premium rebuild)
      // This ensures legacy users who unlocked premium lessons before the premium
      // system rebuild have their locks re-evaluated based on new premium rules
      const needsMigration = !savedData._premiumMigrationV1;
      if (needsMigration) {
        console.log("🔒 Running premium system migration...");
        get().applyLockingRules(); // Recalculate all locks
        set({ _premiumMigrationV1: true }); // Mark migration as complete
      }
      
      set({ locksReady: true }); // Mark locks as ready
      get().saveProgress(); // Persist the normalized locks, premium status, and migration flag
    } else {
      // 🔒 CRITICAL: For fresh installs (including post-storage-reset), ensure defaults exist and apply locking
      console.log("🔒 Initializing premium locking for fresh install...");
      
      // Explicitly initialize default state for fresh install
      const currentState = get();
      if (!currentState.paths || currentState.paths.length === 0) {
        set({ paths: DEFAULT_PATHS });
      }
      if (!currentState.lockedLessons || Object.keys(currentState.lockedLessons).length === 0) {
        set({ lockedLessons: {} });
      }
      
      // Now apply locking rules on initialized state
      get().applyLockingRules();
      set({ locksReady: true }); // Mark locks as ready
      get().saveProgress(); // Persist the initial locked state
    }
  },

  // 🔊 Toggle vibration
  setVibrationEnabled: (enabled) => {
    set({ vibrationEnabled: enabled });
    get().saveProgress();
  },

  // Set streak shield from sync (cloud → local)
  setStreakShieldFromSync: (data) => {
    if (!data) return;
    set({
      shieldCount: data.shieldCount ?? 0,
      lastShieldUsed: data.lastUsed ?? null,
    });
  },
  
  // 🔒 Normalize locks based on lesson completion
  normalizeLocks: (lessonStates) => {
    const locks = {};
    
    // For each path, unlock lessons based on completion
    for (let pathId = 1; pathId <= 14; pathId++) {
      locks[pathId] = {};
      const pathState = lessonStates[pathId] || {};
      const passedLessons = Object.keys(pathState)
        .filter(lessonId => pathState[lessonId]?.passed)
        .map(Number)
        .sort((a, b) => a - b);
      
      // Find the highest completed lesson
      const maxCompleted = passedLessons.length > 0 ? Math.max(...passedLessons) : 0;
      
      // Unlock all lessons up to and including the next lesson after max completed
      for (let lessonId = 1; lessonId <= maxCompleted + 1; lessonId++) {
        locks[pathId][lessonId] = { unlocked: true };
      }
    }
    
    return locks;
  },

  // 🛡️ Mark day as complete (unified tracking for all activities)
  // Called from: applyQuizResults, daily quest completion, challenge completion, event completion
  // Model: today→no change, yesterday→+1, older/null→=1
  markDayComplete: () => {
    const today = new Date().toDateString();
    const { lastCompletedActivityDate, streak } = get();

    console.log(`[STREAK] before update: streak=${streak} lastActivity=${lastCompletedActivityDate}`);

    // Case 1: lastActivityDate === today → no change
    if (lastCompletedActivityDate === today) {
      console.log(`[STREAK] after update: no change (already today)`);
      return;
    }

    // Case 2: lastActivityDate is null → streakCount = 1
    if (!lastCompletedActivityDate) {
      set({ 
        streak: 1,
        lastCompletedActivityDate: today,
        lastStudyDate: today,
      });
      get().calculateXPMultiplier();
      get().saveProgress();
      syncStreakTags("streak_increment");
      console.log(`[STREAK] after update: streak=1 (first activity)`);
      return;
    }

    // Calculate days since last activity
    const lastDate = new Date(lastCompletedActivityDate);
    const currentDate = new Date(today);
    const diffTime = currentDate - lastDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Case 3: lastActivityDate === yesterday → streakCount += 1
    if (diffDays === 1) {
      const newStreak = streak + 1;
      set({ 
        streak: newStreak,
        lastCompletedActivityDate: today,
        lastStudyDate: today,
      });
      get().calculateXPMultiplier();
      get().saveProgress();
      syncStreakTags("streak_increment");
      console.log(`[STREAK] after update: streak=${newStreak} (consecutive day)`);
      
      // Log streak maintained
      (async () => {
        const { data } = await supabase.auth.getUser();
        const userId = data?.user?.id;
        if (userId) {
          logStreakEvent(userId, true);
        }
      })();
    } else {
      // Case 4: lastActivityDate < yesterday → streakCount = 1
      set({ 
        streak: 1,
        lastCompletedActivityDate: today,
        lastStudyDate: today,
      });
      get().calculateXPMultiplier();
      get().saveProgress();
      syncStreakTags("streak_increment");
      console.log(`[STREAK] after update: streak=1 (gap of ${diffDays} days)`);
    }
  },

  // 🌙 Check streak status on app open
  // This runs once per session to detect breaks and consume shields if needed
  checkStreakOnAppOpen: () => {
    const today = new Date().toDateString();
    const { lastCompletedActivityDate, streak, shieldCount, needsRepairPrompt } = get();

    // Already checked today or already needs repair
    if (lastCompletedActivityDate === today || needsRepairPrompt) return;

    // First time user
    if (!lastCompletedActivityDate) {
      return;
    }

    // Calculate days since last activity
    const lastDate = new Date(lastCompletedActivityDate);
    const currentDate = new Date(today);
    const diffTime = currentDate - lastDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Streak is safe (activity yesterday or today)
    if (diffDays <= 1) {
      return;
    }

    // Calculate how many shields needed to cover the gap
    // If missed 2 days, need 1 shield. If missed 3 days, need 2 shields, etc.
    const shieldsNeeded = diffDays - 1;

    // Try to use shields to cover the gap
    if (shieldCount >= shieldsNeeded) {
      // Enough shields - consume them and preserve streak
      // Set lastCompletedActivityDate to yesterday so next activity increments properly
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();
      
      set({ 
        shieldCount: shieldCount - shieldsNeeded,
        lastCompletedActivityDate: yesterdayStr,
        lastStudyDate: yesterdayStr, // Keep for consistency
      });
      get().saveProgress();
      
      // 🌐 Phase 4: Sync consumed shields to cloud
      setTimeout(() => get().syncStreakShieldToCloud(), 50);
      
      // Log streak maintained (shield saved it)
      (async () => {
        const { data } = await supabase.auth.getUser();
        const userId = data?.user?.id;
        if (userId) {
          logStreakEvent(userId, true);
        }
      })();
      
      return;
    }

    // No shields - streak breaks
    const brokenValue = streak;
    set({ 
      brokenStreakValue: streak,
      streak: 0,
      needsRepairPrompt: true,
    });
    get().calculateXPMultiplier();
    get().saveProgress();
    
    syncStreakTags("streak_broken");
    
    // Log streak break
    (async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data?.user?.id;
      if (userId) {
        logStreakEvent(userId, false);
      }
    })();
  },

  // 🛡️ Purchase streak freeze shield
  // Phase 4: Now syncs shield count to Supabase cloud
  purchaseShield: async () => {
    const { coins, shieldCount } = get();
    const SHIELD_COST = 250;
    const MAX_SHIELDS = 3;

    // Already at max
    if (shieldCount >= MAX_SHIELDS) {
      return { success: false, reason: "max" };
    }

    // Not enough coins
    if (coins < SHIELD_COST) {
      return { success: false, reason: "insufficient_coins" };
    }

    // Purchase successful
    const newShieldCount = shieldCount + 1;
    set({ 
      coins: coins - SHIELD_COST,
      shieldCount: newShieldCount,
    });
    get().saveProgress();
    
    // 🌐 Phase 4: Sync shield count to cloud
    setTimeout(() => get().syncStreakShieldToCloud(), 50);
    
    // Log streak maintained (shield purchased)
    (async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data?.user?.id;
      if (userId) {
        logStreakEvent(userId, true);
      }
    })();
    
    return { success: true };
  },

  // 🔧 Repair broken streak
  // Phase 4: Now syncs shield count AND full progress to Supabase cloud
  repairStreak: async () => {
    const { coins, brokenStreakValue, shieldCount } = get();
    const REPAIR_COST = 200;
    const MAX_SHIELDS = 3;

    // Not enough coins
    if (coins < REPAIR_COST) {
      return { success: false, reason: "insufficient_coins" };
    }

    // Repair successful - restore streak to previous value
    const restoredStreak = brokenStreakValue;
    const newShieldCount = Math.min(shieldCount + 1, MAX_SHIELDS);
    const today = new Date().toDateString();
    
    set({ 
      coins: coins - REPAIR_COST,
      streak: restoredStreak,
      shieldCount: newShieldCount,
      needsRepairPrompt: false,
      brokenStreakValue: 0,
      lastCompletedActivityDate: today,
    });
    get().calculateXPMultiplier();
    get().saveProgress();
    
    // 🌐 Sync repaired streak + coins + shield to Supabase cloud immediately
    const { data } = await supabase.auth.getUser();
    const userId = data?.user?.id;
    if (userId) {
      try {
        await supabase.from("profiles").update({
          streak: restoredStreak,
          coins: coins - REPAIR_COST,
          shield_count: newShieldCount,
          last_completed_activity_date: today,
        }).eq("id", userId);
        console.log("✅ Streak repaired and synced to cloud:", restoredStreak);
      } catch (err) {
        console.error("Failed to sync repaired streak to cloud:", err);
      }
      
      // Log streak repaired event
      logStreakEvent(userId, true);
    }
    
    return { success: true, giftedShield: true, restoredStreak };
  },

  // ❌ Skip streak repair
  skipRepair: () => {
    const today = new Date().toDateString();
    set({ 
      needsRepairPrompt: false,
      brokenStreakValue: 0,
      streak: 0,
      lastCompletedActivityDate: today,
      lastStudyDate: today,
    });
    get().calculateXPMultiplier();
    get().saveProgress();
  },

  // 🌙 Legacy function - kept for backward compatibility
  triggerDailyStudy: () => {
    get().markDayComplete();
  },

  // ⭐ XP multiplier
  calculateXPMultiplier: () => {
    const streak = get().streak;
    let bonus = 0;
    if (streak >= 30) bonus = 50;
    else if (streak >= 14) bonus = 30;
    else if (streak >= 7) bonus = 20;
    else if (streak >= 3) bonus = 10;
    set({ xpMultiplier: bonus });
  },

  // 🪙 XP & Coins
  addXP: (amount) => {
    const { xp, xpMultiplier } = get();
    const bonus = Math.round((amount * xpMultiplier) / 100);
    const total = amount + bonus;
    const newXP = xp + total;
    
    // 💎 Check for level up using Diamond Level System
    const levelUpResult = checkLevelUp(xp, newXP);
    const newDiamondLevel = getCurrentLevel(newXP);
    
    set({ 
      xp: newXP, 
      level: newDiamondLevel.level,
    });
    
    // 🎉 Trigger level-up notification if leveled up
    if (levelUpResult.leveledUp) {
      useModalStore.getState().showModal(MODAL_TYPES.LEVEL_UP, {
        levelUpData: levelUpResult
      });
    }
    
    get().saveProgress();
    setTimeout(() => get().syncToSupabase(), 50);
    
    // Log streak maintained (daily activity)
    (async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data?.user?.id;
      if (userId) {
        logStreakEvent(userId, true);
      }
    })();
  },

  addCoins: (amount) => {
    set((s) => ({ coins: s.coins + amount }));
    get().saveProgress();
    setTimeout(() => get().syncToSupabase(), 50);
  },

  // Combined helper for XP and coins (used by Daily Quest, Revise, etc.)
  addXPAndCoins: (xp, coins) => {
    if (xp) get().addXP(xp);
    if (coins) get().addCoins(coins);
  },

  removeCoins: (amount) => {
    const { coins } = get();
    if (coins < amount) {
      return false; // Insufficient funds
    }
    set((s) => ({ coins: s.coins - amount }));
    get().saveProgress();
    return true; // Success
  },

  // 🛠️ Dev helper - grant coins for testing
  grantCoins: (amount) => {
    set((s) => ({ coins: s.coins + amount }));
    get().saveProgress();
  },

  // 📘 Path progress
  setPathProgress: (pathId, completedLessons, totalLessons) => {
    const { paths } = get();
    const ratio = totalLessons > 0 ? completedLessons / totalLessons : 0;
    const updated = paths.map((p) =>
      p.id === pathId
        ? { ...p, completedLessons, totalLessons, progress: ratio }
        : p
    );
    set({ paths: updated });
    get().saveProgress();
  },

  // ✅ Quiz results
  applyQuizResults: (payload, pathId, lessonId, passed = true, score = null) => {
    console.log("[STREAK_TRACE] lesson_complete reached", { pathId, lessonId, passed, score });
    if (!payload) return;
    const { xp, coins } = payload;
    
    // Capture passedCount BEFORE state update (for push tag transition detection)
    const passedCountBefore = Object.values(get().lessonStates?.[pathId] || {}).filter(
      (x) => x.passed
    ).length;
    
    // Always record attempt in lessonStates (for tracking/analytics)
    set((state) => {
      const lessonStates = { ...(state.lessonStates || {}) };
      const pathState = { ...(lessonStates[pathId] || {}) };
      const currentState = pathState[lessonId] || { passed: false, bestScore: 0 };
      
      // Update state: preserve previous pass status, update best score
      pathState[lessonId] = { 
        passed: passed || currentState.passed, // Once passed, always passed
        bestScore: score !== null ? Math.max(score, currentState.bestScore || 0) : currentState.bestScore
      };
      lessonStates[pathId] = pathState;
      return { lessonStates };
    });
    
    // Only award XP/coins, update progress, and unlock if passed
    if (!passed) {
      console.log("[STREAK_TRACE] quiz NOT passed - markDayComplete will NOT be called");
    }
    if (passed) {
      if (xp) get().addXP(xp);
      if (coins) get().addCoins(coins);
      
      // Log XP event for quiz completion
      if (xp) {
        (async () => {
          const { data } = await supabase.auth.getUser();
          const userId = data?.user?.id;
          if (userId) {
            logXpEvent(userId, xp, "quiz");
          }
        })();
      }

      const path = get().paths.find((x) => x.id === pathId);
      const passedCountAfter = Object.values(get().lessonStates[pathId] || {}).filter(
        (x) => x.passed
      ).length;
      const totalLessons = path?.totalLessons || 0;

      const ratio =
        path && path.totalLessons > 0
          ? Math.min(1, passedCountAfter / path.totalLessons)
          : 0;

      get().setPathProgress(pathId, passedCountAfter, path ? path.totalLessons : 0);

      // Push tags: fire based on count transitions (deterministic, no duplicates)
      try {
        if (passedCountBefore === 0 && passedCountAfter === 1) {
          setPathStarted(pathId);
        }
        if (totalLessons > 0 && passedCountBefore < totalLessons && passedCountAfter === totalLessons) {
          setPathCompleted(pathId);
        }
      } catch (err) {
        // Silent fail for push tags
      }

      // Check if path is now completed
      if (path && passedCountAfter === path.totalLessons && path.totalLessons > 0) {
        useModalStore.getState().showModal(MODAL_TYPES.PATH_COMPLETED, {
          pathTitle: path.title
        });
      }

      // unlock next lesson
      get().unlockLesson(pathId, lessonId + 1);
      
      // 🛡️ Mark day as complete for streak tracking
      console.log("[STREAK_TRIGGER] quiz_complete");
      console.log("[STREAK_TRACE] calling markDayComplete");
      get().markDayComplete();
      console.log("[STREAK_TRACE] markDayComplete finished (streak=" + get().streak + ")");
      
      // 📚 Check and unlock Smart Revision if 25 lessons completed
      get().checkAndUnlockSmartRevision();
    }
    
    get().saveProgress();
    setTimeout(() => get().syncToSupabase(), 50);
  },

  // 🔒 Lock/Unlock
  unlockLesson: (pathId, lessonId) => {
    const { lockedLessons } = get();
    const updated = { ...lockedLessons };
    if (!updated[pathId]) updated[pathId] = {};
    updated[pathId][lessonId] = { unlocked: true };
    set({ lockedLessons: updated });
    get().saveProgress();
    setTimeout(() => get().syncToSupabase(), 50);
  },

  // 🔒 CRITICAL: Ensure locks are ready before any access
  // Returns false if locks aren't ready, otherwise true
  ensureLocksReady: () => {
    const { locksReady } = get();
    return locksReady;
  },

  // 🔒 Central lesson unlock check (combines sequential + premium limits)
  // This is the NEW core function - use this everywhere!
  isLessonUnlocked: (pathId, lessonId) => {
    // Gate all lock checks until hydration completes
    if (!get().ensureLocksReady()) {
      return false; // Safe default: locked during hydration
    }
    
    const { lockedLessons, premiumStatus } = get();
    
    // Lesson 1 is always unlocked
    if (lessonId === 1) return true;
    
    // Check sequential unlocking FIRST (applies to ALL users including premium)
    // Must complete previous lesson to unlock next one
    if (!lockedLessons[pathId]) return false;
    const isSequentiallyUnlocked = !!(
      lockedLessons[pathId][lessonId] &&
      lockedLessons[pathId][lessonId].unlocked
    );
    
    if (!isSequentiallyUnlocked) return false;
    
    // For free users: check premium paywall limits
    if (premiumStatus === "free") {
      const freeLimit = FREE_LESSON_LIMITS[pathId] || 0;
      if (lessonId > freeLimit) {
        return false; // Locked by premium paywall
      }
    }
    
    // Premium users: sequential check passed, premium bypass applies
    return true;
  },

  // 🔒 DEPRECATED: Backwards compatibility wrapper
  // Use isLessonUnlocked() instead
  isUnlocked: (pathId, lessonId) => {
    return get().isLessonUnlocked(pathId, lessonId);
  },

  // 🔒 NEW UNIFIED LOCKING SYSTEM (Spec-compliant)
  // Returns the lock state of a lesson: "unlocked" | "progressLocked" | "premiumLocked"
  getLessonLockState: (pathId, lessonId) => {
    const { lockedLessons, premium, premiumStatus, locksReady, lessonStates } = get();
    
    // CRITICAL: During initialization, assume all lessons are locked until locks are computed
    if (!locksReady) {
      return "progressLocked"; // Safe default during hydration
    }
    
    const isUserPremium = premium || premiumStatus !== "free";
    
    // Lesson 1 is always unlocked (except for premium-only paths)
    if (lessonId === 1) {
      // Check if path itself is premium-only
      if (isPremiumOnlyPath(pathId) && !isUserPremium) {
        return "premiumLocked";
      }
      return "unlocked";
    }
    
    // 🎯 NEW: Check if path is fully completed - if so, unlock all lessons for replay
    const pathLessonCounts = {
      1: 104, 2: 17, 3: 22, 4: 17, 5: 13, 6: 10, 7: 4, 8: 10,
      9: 10, 10: 17, 11: 6, 12: 7, 13: 6, 14: 6
    };
    const totalLessons = pathLessonCounts[pathId] || 0;
    const pathState = lessonStates[pathId] || {};
    const completedCount = Object.keys(pathState)
      .filter(id => pathState[id]?.passed)
      .length;
    
    const isPathCompleted = completedCount === totalLessons && totalLessons > 0;
    
    // If path is completed, all lessons are unlocked (premium check still applies)
    if (isPathCompleted) {
      // Still check premium paywall for completed paths
      if (!isUserPremium) {
        const freeLimit = FREE_LESSON_LIMITS[pathId] || 0;
        if (lessonId > freeLimit) {
          return "premiumLocked";
        }
      }
      return "unlocked";
    }
    
    // Check sequential progress lock FIRST
    const isSequentiallyUnlocked = !!(
      lockedLessons[pathId] &&
      lockedLessons[pathId][lessonId] &&
      lockedLessons[pathId][lessonId].unlocked
    );
    
    if (!isSequentiallyUnlocked) {
      return "progressLocked"; // Must complete previous lessons first
    }
    
    // Check premium paywall limits
    if (!isUserPremium) {
      const freeLimit = FREE_LESSON_LIMITS[pathId] || 0;
      if (lessonId > freeLimit) {
        return "premiumLocked"; // Beyond free tier limit
      }
    }
    
    return "unlocked";
  },

  // 🔒 Check if lesson is locked due to premium paywall
  isPremiumLocked: (pathId, lessonId) => {
    if (!get().ensureLocksReady()) {
      return false; // Safe default during hydration
    }
    const lockState = get().getLessonLockState(pathId, lessonId);
    return lockState === "premiumLocked";
  },

  // 🔒 Check if user can access a lesson (for UI/navigation)
  canAccessLesson: (pathId, lessonId) => {
    if (!get().ensureLocksReady()) {
      return false; // Safe default: no access during hydration
    }
    const lockState = get().getLessonLockState(pathId, lessonId);
    return lockState === "unlocked";
  },

  // 🔒 Apply locking rules (recalculate all locks based on current progress)
  applyLockingRules: () => {
    const { lessonStates } = get();
    const locks = {};
    
    // Helper: Get total lessons for each path
    const pathLessonCounts = {
      1: 104, // Names of Allah
      2: 17,  // Foundations
      3: 22,  // Prophets
      4: 17,  // Prophet's Life
      5: 13,  // Wives
      6: 10,  // Ten Promised
      7: 4,   // Four Women
      8: 10,  // Companions
      9: 10,  // Angels
      10: 17, // End Times
      11: 6,  // The Grave
      12: 7,  // Judgement
      13: 6,  // Hellfire
      14: 6,  // Paradise
    };
    
    // For each path, unlock lessons based on completion
    for (let pathId = 1; pathId <= 14; pathId++) {
      locks[pathId] = {};
      const pathState = lessonStates[pathId] || {};
      const passedLessons = Object.keys(pathState)
        .filter(lessonId => pathState[lessonId]?.passed)
        .map(Number)
        .sort((a, b) => a - b);
      
      const totalLessons = pathLessonCounts[pathId] || 0;
      
      // Standard sequential unlocking: unlock up to next lesson
      // Completion NEVER locks anything - it just keeps everything unlocked
      const maxPassed = passedLessons.length > 0 ? Math.max(...passedLessons) : 0;
      for (let lessonId = 1; lessonId <= maxPassed + 1 && (totalLessons === 0 || lessonId <= totalLessons); lessonId++) {
        locks[pathId][lessonId] = { unlocked: true };
      }
    }
    
    set({ lockedLessons: locks, locksReady: true });
    get().saveProgress();
  },

  // 💳 Premium unlock (updates all premium fields)
  unlockPremium: (planType = "individual") => {
    const now = Date.now();
    set({ 
      premium: true,
      premiumType: planType,
      premiumActivatedAt: now,
      premiumStatus: planType, // backwards compatibility
      hasPremium: true, // backwards compatibility
    });
    get().saveProgress();
    setTimeout(() => get().syncToSupabase(), 50);
  },

  // 💳 Set premium from IAP entitlement (called by iapService)
  setPremium: (planType = "single") => {
    set({
      premium: true,
      premiumStatus: planType,
      hasPremium: true,
    });
    get().saveProgress();
  },

  // 💳 ASYNC PLACEHOLDER: Purchase Individual Plan (£4.99)
  // Later: integrate with payment provider (Stripe/RevenueCat/Supabase)
  purchaseIndividual: async () => {
    const now = Date.now();
    // Simulate async payment (will be real API call later)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    set({ 
      premium: true,
      premiumType: "individual",
      premiumActivatedAt: now,
      premiumStatus: "individual", // backwards compatibility
      hasPremium: true, // backwards compatibility
    });
    get().saveProgress();
    setTimeout(() => get().syncToSupabase(), 50);
    
    // Log purchase to Supabase
    (async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data?.user?.id;
      if (userId) {
        logPurchase(userId, "individual_plan", 4.99, "GBP");
      }
    })();
    
    return { success: true, plan: "individual" };
  },

  // 💳 PLACEHOLDER: Restore previous purchases
  // Later: check with payment provider for existing purchases
  restorePurchases: () => {
    // Read from localStorage to check for saved premium status
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return { 
        success: false, 
        message: "No previous purchases found" 
      };
    }
    
    const savedData = JSON.parse(saved);
    const savedPremiumStatus = savedData.premiumStatus || "free";
    
    if (savedPremiumStatus !== "free") {
      // Rehydrate premium state from localStorage
      set({ 
        premiumStatus: savedPremiumStatus,
        hasPremium: true,
      });
      get().saveProgress(); // Ensure consistency
      
      return { 
        success: true, 
        message: "Premium plan restored successfully!",
        plan: savedPremiumStatus 
      };
    }
    
    return { 
      success: false, 
      message: "No previous purchases found" 
    };
  },

  resetAllLocks: () => {
    set({ lockedLessons: {} });
    get().saveProgress();
  },

  // 📚 Get total completed lessons across all paths
  getTotalCompletedLessons: () => {
    const { lessonStates } = get();
    let total = 0;
    
    Object.keys(lessonStates).forEach(pathId => {
      const pathState = lessonStates[pathId] || {};
      const passedCount = Object.values(pathState).filter(lesson => lesson.passed).length;
      total += passedCount;
    });
    
    return total;
  },

  // 📚 Unlock Review Mistakes (called when first mistake is saved)
  unlockReviewMistakes: () => {
    const { reviewMistakesUnlocked } = get();
    if (!reviewMistakesUnlocked) {
      set({ reviewMistakesUnlocked: true });
      get().saveProgress();
    }
  },

  // 📚 Check and unlock Smart Revision if 25 lessons completed
  checkAndUnlockSmartRevision: () => {
    const { smartRevisionUnlocked } = get();
    if (smartRevisionUnlocked) return; // Already unlocked
    
    const totalCompleted = get().getTotalCompletedLessons();
    if (totalCompleted >= 25) {
      set({ smartRevisionUnlocked: true });
      get().saveProgress();
    }
  },

  // 📚 MIGRATION: Recalculate Revise unlock states from existing data
  // Called during loadProgress to ensure legacy users get unlocks
  migrateReviseUnlocks: () => {
    const { reviewMistakesUnlocked, smartRevisionUnlocked } = get();
    let needsSave = false;
    
    // Check Review Mistakes: unlock if weak pool exists in reviseStore
    if (!reviewMistakesUnlocked) {
      const reviseData = localStorage.getItem("islamQuestRevise");
      if (reviseData) {
        const parsed = JSON.parse(reviseData);
        if (parsed.weakPool && parsed.weakPool.length > 0) {
          set({ reviewMistakesUnlocked: true });
          needsSave = true;
        }
      }
    }
    
    // Check Smart Revision: unlock if 25+ lessons completed
    if (!smartRevisionUnlocked) {
      const totalCompleted = get().getTotalCompletedLessons();
      if (totalCompleted >= 25) {
        set({ smartRevisionUnlocked: true });
        needsSave = true;
      }
    }
    
    if (needsSave) {
      get().saveProgress();
    }
  },
  
  // 🧹 Reset all progress to default (for developer/testing purposes)
  resetAllProgress: () => {
    set({
      xp: 0,
      coins: 0,
      streak: 0,
      level: 1, // Reset Diamond level
      lastStudyDate: null,
      lastCompletedActivityDate: null,
      lastLogin: null,
      shieldCount: 0,
      needsRepairPrompt: false,
      brokenStreakValue: 0,
      xpMultiplier: 0,
      lessonStates: {},
      lockedLessons: {},
      paths: DEFAULT_PATHS,
      premiumStatus: "free",
      hasPremium: false,
      reviewMistakesUnlocked: false,
      smartRevisionUnlocked: false,
    });
    get().saveProgress();
  },
  
  // 🧹 Force reset for testing (removes all progress)
  forceResetForTesting: () => {
    localStorage.clear();
    window.location.reload();
  },

  serializeForSupabase: () => {
    const state = get();

    // ONLY sync progress fields - NEVER identity fields
    // Identity (username, avatar, handle) is managed by useUserStore
    return {
      xp: state.xp,
      coins: state.coins,
      streak: state.streak,
      last_completed_activity_date: state.lastCompletedActivityDate,
      premium: state.premium,
      shield_count: state.shieldCount,
      // Encrypt lesson progress data for cloud storage
      lesson_states: state.lessonStates && Object.keys(state.lessonStates).length > 0 
        ? encryptJSON(state.lessonStates) 
        : null,
      paths: state.paths && state.paths.length > 0 
        ? encryptJSON(state.paths) 
        : null,
      locked_lessons: state.lockedLessons && Object.keys(state.lockedLessons).length > 0 
        ? encryptJSON(state.lockedLessons) 
        : null,
      updated_at: new Date().toISOString()
    };
  },

  getLastUpdatedAt: () => {
    const ts = localStorage.getItem("iq_last_cloud_sync");
    return ts ? Number(ts) : 0;
  },

  setLastUpdatedAt: (ts) => {
    localStorage.setItem("iq_last_cloud_sync", String(ts));
  },

  setFromCloudSync: (data, cloudUpdatedAt = null) => {
    if (!data) return;
    
    const newLevel = getCurrentLevel(data.xp || 0);
    
    // CRITICAL: Store-owned premium MUST override cloud false
    // Check IAP local storage to prevent regression
    let finalPremium = data.premium ?? get().premium;
    try {
      const iapState = localStorage.getItem("iq_iap_premium_entitlement");
      if (iapState) {
        const parsed = JSON.parse(iapState);
        if (parsed?.isPremium === true) {
          console.log("[CloudSync] IAP entitlement found - preserving premium despite cloud state");
          finalPremium = true;
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
    
    set({
      xp: data.xp ?? get().xp,
      coins: data.coins ?? get().coins,
      streak: data.streak ?? get().streak,
      lastCompletedActivityDate: data.last_completed_activity_date ?? get().lastCompletedActivityDate,
      shieldCount: data.shieldCount ?? get().shieldCount,
      premium: finalPremium,
      hasPremium: finalPremium,
      premiumStatus: finalPremium ? (get().premiumStatus !== "free" ? get().premiumStatus : "individual") : "free",
      level: newLevel?.level ?? get().level,
    });
    
    if (cloudUpdatedAt) {
      get().setLastUpdatedAt(new Date(cloudUpdatedAt).getTime());
    }
    get().saveProgress();
  },

  syncToSupabase: async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user || !user.data || !user.data.user) return;

      const userId = user.data.user.id;

      const payload = get().serializeForSupabase();
      const last = get().getLastUpdatedAt();
      const now = Date.now();

      // avoid excessive calls
      if (now - last < 5000) return;

      // write
      const { error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("user_id", userId);

      if (!error) {
        get().setLastUpdatedAt(now);
        console.log("✅ Synced to Supabase");
      } else {
        console.log("❌ Sync error:", error);
      }

    } catch (err) {
      console.log("❌ Sync failed:", err);
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🛡️ PHASE 4: STREAK SHIELD CLOUD SYNC FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  // Load streak shields from Supabase profiles table
  loadStreakShieldFromCloud: async () => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth || !auth.user) {
        console.log("❌ loadStreakShieldFromCloud: No user logged in");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("shield_count")
        .eq("user_id", auth.user.id)
        .maybeSingle();

      if (error) {
        console.log("❌ loadStreakShieldFromCloud error:", error.message);
        return;
      }

      if (data && data.shield_count !== undefined) {
        set({ shieldCount: data.shield_count });
        get().saveProgress();
        console.log("✅ Streak shields loaded from cloud:", data.shield_count);
      }

    } catch (err) {
      console.log("❌ loadStreakShieldFromCloud failed:", err);
    }
  },

  // Sync streak shields to Supabase profiles table
  syncStreakShieldToCloud: async () => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth || !auth.user) {
        console.log("❌ syncStreakShieldToCloud: No user logged in");
        return;
      }

      const { shieldCount } = get();

      const { error } = await supabase
        .from("profiles")
        .update({ 
          shield_count: shieldCount,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", auth.user.id);

      if (error) {
        console.log("❌ syncStreakShieldToCloud error:", error.message);
        return;
      }

      console.log("✅ Streak shields synced to cloud:", shieldCount);

    } catch (err) {
      console.log("❌ syncStreakShieldToCloud failed:", err);
    }
  },

  loadFromSupabase: async () => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth || !auth.user) {
        console.log("No Supabase user logged in.");
        return;
      }

      const userId = auth.user.id;

      // Load cloud row
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error || !data) {
        console.log("No cloud profile found or error:", error);
        return;
      }

      // Decrypt encrypted JSON fields
      const lessonStates = data.lesson_states ? decryptJSON(data.lesson_states) : {};
      const lockedLessons = data.locked_lessons ? decryptJSON(data.locked_lessons) : {};
      const paths = data.paths ? decryptJSON(data.paths) : null;

      const cloudTs = new Date(data.updated_at).getTime();
      const localTs = get().getLastUpdatedAt();

      // Choose freshest source
      const shouldOverwriteLocal = cloudTs > localTs;

      if (!shouldOverwriteLocal) {
        console.log("Local data newer → keeping device data.");
        return;
      }

      // Build final restored state
      // NOTE: ONLY progress fields - identity (username, avatar, handle) is managed by useUserStore
      const restored = {
        xp: data.xp ?? get().xp,
        coins: data.coins ?? get().coins,
        streak: data.streak ?? get().streak,
        lastCompletedActivityDate: data.last_completed_activity_date ?? get().lastCompletedActivityDate,

        premium: data.premium ?? false,
        hasPremium: data.premium ?? false,

        // 🛡️ Phase 4: Streak shields cloud sync
        shieldCount: data.shield_count ?? get().shieldCount,
      };
      
      // Restore lesson progress if cloud has data
      if (lessonStates && Object.keys(lessonStates).length > 0) {
        restored.lessonStates = lessonStates;
      }
      if (lockedLessons && Object.keys(lockedLessons).length > 0) {
        restored.lockedLessons = lockedLessons;
      }
      if (paths && paths.length > 0) {
        // Merge cloud paths with defaults to ensure totalLessons is correct
        restored.paths = paths.map(cloudPath => {
          const defaultPath = DEFAULT_PATHS.find(p => p.id === cloudPath.id);
          return {
            ...cloudPath,
            totalLessons: defaultPath ? defaultPath.totalLessons : cloudPath.totalLessons,
            title: defaultPath ? defaultPath.title : cloudPath.title,
          };
        });
      }

      // Apply restored state
      set(restored);
      get().saveProgress();

      // Mark restore time
      get().setLastUpdatedAt(Date.now());

      console.log("✅ Restored from Supabase (cloud → device)", { 
        xp: restored.xp, 
        coins: restored.coins, 
        lessonStatesCount: Object.keys(restored.lessonStates || {}).length,
        pathsCount: restored.paths?.length || 0
      });
    } catch (err) {
      console.log("❌ loadFromSupabase failed:", err);
    }
  },
}));

useProgressStore.getState().loadProgress();

setTimeout(() => {
  useProgressStore.getState().loadFromSupabase();
}, 300);
