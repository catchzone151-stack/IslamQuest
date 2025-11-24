// src/store/progressStore.js
import { create } from "zustand";
import { getCurrentLevel, checkLevelUp } from "../utils/diamondLevels";
import { FREE_LESSON_LIMITS, PREMIUM_ONLY_PATHS, isPremiumOnlyPath } from "./premiumConfig";
import { useModalStore, MODAL_TYPES } from "./modalStore";

const STORAGE_KEY = "islamQuestProgress_v4";

const DEFAULT_PATHS = [
  { id: 1, title: "Names of Allah ﷻ", progress: 0, totalLessons: 104, completedLessons: 0, status: "available" },
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
  avatar: "default",
  username: null, // Unique username (set during onboarding)
  displayName: "Student of Knowledge", // Display name / nickname
  lessonStates: {},
  lockedLessons: {},
  hasPremium: false, // Deprecated: derived from premiumStatus, kept for backwards compatibility
  
  // 💳 Premium System (Supabase-ready)
  premium: false, // New: Simple boolean for premium status
  premiumType: null, // null | "individual" | "family"
  premiumActivatedAt: null, // Timestamp when premium was activated
  premiumStatus: "free", // "free" | "individual" | "family" (kept for backwards compatibility)
  familyPlanId: null, // For family plan sync (future Supabase feature)
  familyMembers: [], // Array of { id, name, avatar, xp } for family plan
  
  // 🔊 System Preferences
  vibrationEnabled: true, // Haptic feedback toggle
  _premiumMigrationV1: false, // Internal: tracks if premium lock migration has run

  // 📚 Revise Feature Unlocks
  reviewMistakesUnlocked: false, // Unlocks after first mistake
  smartRevisionUnlocked: false, // Unlocks after 40 completed lessons

  // 🌙 Learning Paths
  paths: DEFAULT_PATHS,
  
  // 🔒 Lock Readiness Flag
  locksReady: false, // Gates lock checks until applyLockingRules completes

  // 🧠 Save & Load
  saveProgress: () => {
    const data = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
      if (savedData.familyPlanId === undefined) {
        savedData.familyPlanId = null;
      }
      // Derive hasPremium from premiumStatus for backwards compatibility
      savedData.hasPremium = savedData.premiumStatus !== "free";
      
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
  markDayComplete: () => {
    const today = new Date().toDateString();
    const { lastCompletedActivityDate, streak } = get();

    // Already counted today (but allow restart if streak is 0 from skip/break)
    if (lastCompletedActivityDate === today && streak > 0) return;

    // First time user
    if (!lastCompletedActivityDate) {
      set({ 
        streak: 1,
        lastCompletedActivityDate: today,
        lastStudyDate: today,
      });
      get().calculateXPMultiplier();
      get().saveProgress();
      return;
    }

    // Calculate days since last activity
    const lastDate = new Date(lastCompletedActivityDate);
    const currentDate = new Date(today);
    const diffTime = currentDate - lastDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Consecutive day - increment streak
    if (diffDays === 1) {
      set({ 
        streak: streak + 1,
        lastCompletedActivityDate: today,
        lastStudyDate: today,
      });
      get().calculateXPMultiplier();
      get().saveProgress();
    } else if (diffDays === 0) {
      // Same day - check if streak needs to be initialized (from skip repair)
      if (streak === 0) {
        set({ 
          streak: 1,
          lastCompletedActivityDate: today,
          lastStudyDate: today,
        });
        get().calculateXPMultiplier();
        get().saveProgress();
      } else {
        // Already counted today with active streak
        set({ 
          lastCompletedActivityDate: today,
          lastStudyDate: today,
        });
        get().saveProgress();
      }
    } else {
      // Gap > 1 day - streak was broken, start fresh
      set({ 
        streak: 1,
        lastCompletedActivityDate: today,
        lastStudyDate: today,
      });
      get().calculateXPMultiplier();
      get().saveProgress();
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
      return;
    }

    // No shields - streak breaks
    set({ 
      brokenStreakValue: streak,
      streak: 0,
      needsRepairPrompt: true,
    });
    get().calculateXPMultiplier();
    get().saveProgress();
  },

  // 🛡️ Purchase streak freeze shield
  purchaseShield: () => {
    const { coins, shieldCount } = get();
    const SHIELD_COST = 100;
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
    set({ 
      coins: coins - SHIELD_COST,
      shieldCount: shieldCount + 1,
    });
    get().saveProgress();
    return { success: true };
  },

  // 🔧 Repair broken streak
  repairStreak: () => {
    const { coins, brokenStreakValue, shieldCount } = get();
    const REPAIR_COST = 200;
    const MAX_SHIELDS = 3;

    // Not enough coins
    if (coins < REPAIR_COST) {
      return { success: false, reason: "insufficient_coins" };
    }

    // Repair successful
    const newShieldCount = Math.min(shieldCount + 1, MAX_SHIELDS);
    set({ 
      coins: coins - REPAIR_COST,
      streak: brokenStreakValue,
      shieldCount: newShieldCount,
      needsRepairPrompt: false,
      brokenStreakValue: 0,
      lastCompletedActivityDate: new Date().toDateString(),
    });
    get().calculateXPMultiplier();
    get().saveProgress();
    return { success: true, giftedShield: true };
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
  },

  addCoins: (amount) => {
    set((s) => ({ coins: s.coins + amount }));
    get().saveProgress();
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
    if (!payload) return;
    const { xp, coins } = payload;
    
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
    if (passed) {
      if (xp) get().addXP(xp);
      if (coins) get().addCoins(coins);

      const path = get().paths.find((x) => x.id === pathId);
      const passedCount = Object.values(get().lessonStates[pathId] || {}).filter(
        (x) => x.passed
      ).length;

      const ratio =
        path && path.totalLessons > 0
          ? Math.min(1, passedCount / path.totalLessons)
          : 0;

      get().setPathProgress(pathId, passedCount, path ? path.totalLessons : 0);

      // unlock next lesson
      get().unlockLesson(pathId, lessonId + 1);
      
      // 🛡️ Mark day as complete for streak tracking
      get().markDayComplete();
      
      // 📚 Check and unlock Smart Revision if 40 lessons completed
      get().checkAndUnlockSmartRevision();
    }
    
    get().saveProgress();
  },

  // 🔒 Lock/Unlock
  unlockLesson: (pathId, lessonId) => {
    const { lockedLessons } = get();
    const updated = { ...lockedLessons };
    if (!updated[pathId]) updated[pathId] = {};
    updated[pathId][lessonId] = { unlocked: true };
    set({ lockedLessons: updated });
    get().saveProgress();
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
      const completedCount = passedLessons.length;
      
      // 🎯 NEW: If path is fully completed, unlock ALL lessons for replay
      if (completedCount === totalLessons && totalLessons > 0) {
        for (let lessonId = 1; lessonId <= totalLessons; lessonId++) {
          locks[pathId][lessonId] = { unlocked: true };
        }
      } else {
        // Standard sequential unlocking: unlock up to next lesson
        const maxCompleted = passedLessons.length > 0 ? Math.max(...passedLessons) : 0;
        for (let lessonId = 1; lessonId <= maxCompleted + 1; lessonId++) {
          locks[pathId][lessonId] = { unlocked: true };
        }
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
  },

  // 💳 ASYNC PLACEHOLDER: Purchase Individual Plan (£4.99)
  // Later: integrate with payment provider (Stripe/RevenueCat/Supabase)
  purchaseIndividual: async () => {
    const now = Date.now();
    // Simulate async payment (will be real API call later)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Clear family data when switching to individual plan
    set({ 
      premium: true,
      premiumType: "individual",
      premiumActivatedAt: now,
      premiumStatus: "individual", // backwards compatibility
      hasPremium: true, // backwards compatibility
      familyPlanId: null,
      familyMembers: [],
    });
    get().saveProgress();
    return { success: true, plan: "individual" };
  },

  // 💳 ASYNC PLACEHOLDER: Purchase Family Plan (£18 for 6 users)
  // Later: integrate with payment provider + Supabase for family sync
  purchaseFamily: async () => {
    const now = Date.now();
    // Generate random family plan ID (will come from Supabase later)
    const familyId = `family_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate async payment (will be real API call later)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    set({ 
      premium: true,
      premiumType: "family",
      premiumActivatedAt: now,
      premiumStatus: "family", // backwards compatibility
      hasPremium: true, // backwards compatibility
      familyPlanId: familyId,
      familyMembers: [], // Owner can invite up to 5 members
    });
    get().saveProgress();
    return { success: true, plan: "family", familyId };
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
        familyPlanId: savedData.familyPlanId || null,
        familyMembers: savedData.familyMembers || [],
      });
      get().saveProgress(); // Ensure consistency
      
      return { 
        success: true, 
        message: `${savedPremiumStatus === "individual" ? "Individual" : "Family"} plan restored successfully!`,
        plan: savedPremiumStatus 
      };
    }
    
    return { 
      success: false, 
      message: "No previous purchases found" 
    };
  },

  // 👨‍👩‍👧‍👦 PLACEHOLDER: Add family member
  // Later: sync with Supabase family table
  addFamilyMember: (memberData) => {
    const { familyMembers } = get();
    if (familyMembers.length >= 5) {
      return { success: false, message: "Family plan is full (max 5 members)" };
    }
    
    const newMember = {
      id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: memberData.name || "Family Member",
      avatar: memberData.avatar || null,
      joinedAt: new Date().toISOString(),
    };
    
    set({ familyMembers: [...familyMembers, newMember] });
    get().saveProgress();
    return { success: true, member: newMember };
  },

  // 👨‍👩‍👧‍👦 PLACEHOLDER: Remove family member
  // Later: sync with Supabase
  removeFamilyMember: (memberId) => {
    const { familyMembers } = get();
    set({ familyMembers: familyMembers.filter(m => m.id !== memberId) });
    get().saveProgress();
    return { success: true };
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

  // 📚 Check and unlock Smart Revision if 40 lessons completed
  checkAndUnlockSmartRevision: () => {
    const { smartRevisionUnlocked } = get();
    if (smartRevisionUnlocked) return; // Already unlocked
    
    const totalCompleted = get().getTotalCompletedLessons();
    if (totalCompleted >= 40) {
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
    
    // Check Smart Revision: unlock if 40+ lessons completed
    if (!smartRevisionUnlocked) {
      const totalCompleted = get().getTotalCompletedLessons();
      if (totalCompleted >= 40) {
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
      familyPlanId: null,
      familyMembers: [],
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

  // Supabase sync functions (Phase 1: empty placeholders)
  syncToSupabase: async () => {},
  loadFromSupabase: async () => {},
}));

useProgressStore.getState().loadProgress();
