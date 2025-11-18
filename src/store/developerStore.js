import { create } from "zustand";

const STORAGE_KEY = "islamQuestDeveloper_v1";
const APP_VERSION = "1.0.0-beta";

export const useDeveloperStore = create((set, get) => ({
  betaMode: false,
  showDeveloperMenu: false,
  appVersion: APP_VERSION,

  toggleBetaMode: () => {
    const newBetaMode = !get().betaMode;
    set({ betaMode: newBetaMode });
    get().saveToStorage();
  },

  setBetaMode: (enabled) => {
    set({ betaMode: enabled });
    get().saveToStorage();
  },

  openDeveloperMenu: () => {
    set({ showDeveloperMenu: true });
  },

  closeDeveloperMenu: () => {
    set({ showDeveloperMenu: false });
  },

  resetOnboarding: () => {
    const { useUserStore } = require("./useUserStore");
    useUserStore.getState().resetOnboarding();
  },

  resetFullProgress: () => {
    if (!window.confirm("⚠️ This will reset ALL progress (XP, coins, streak, lessons). Continue?")) {
      return;
    }

    const { useProgressStore } = require("./progressStore");
    const { useUserStore } = require("./useUserStore");
    const { useChallengeStore } = require("./challengeStore");
    const { useDailyQuestStore } = require("./dailyQuestStore");

    useProgressStore.getState().resetAllProgress();
    useUserStore.getState().resetOnboarding();
    useChallengeStore.getState().resetAllChallenges();
    useDailyQuestStore.getState().resetDailyQuest();

    alert("✅ All progress has been reset!");
  },

  getDebugInfo: () => {
    const { useProgressStore } = require("./progressStore");
    const { useUserStore } = require("./useUserStore");
    
    const { xp, coins, streak, level, levelColor, levelBadge, lessonStates } = useProgressStore.getState();
    const { hasCompletedOnboarding } = useUserStore.getState();
    
    const completedLessons = Object.values(lessonStates).filter(
      state => state?.completed === true
    ).length;

    return {
      xp,
      coins,
      streak,
      level,
      levelColor,
      levelBadge,
      completedLessons,
      hasCompletedOnboarding,
      appVersion: APP_VERSION,
      betaMode: get().betaMode
    };
  },

  saveToStorage: () => {
    const data = {
      betaMode: get().betaMode,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  loadFromStorage: () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        set({ betaMode: data.betaMode || false });
      } catch (error) {
        console.error("Failed to load developer settings:", error);
      }
    }
  },
}));
