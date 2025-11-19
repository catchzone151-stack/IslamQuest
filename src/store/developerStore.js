import { create } from "zustand";
import { useProgressStore } from "./progressStore";
import { useUserStore } from "./useUserStore";
import { useChallengeStore } from "./challengeStore";
import { useDailyQuestStore } from "./dailyQuestStore";
import { useFriendsStore } from "./friendsStore";

const STORAGE_KEY = "islamQuestDeveloper_v1";
const APP_VERSION = "1.0.0-beta";

export const useDeveloperStore = create((set, get) => ({
  betaMode: true,
  showDeveloperMenu: false,
  appVersion: APP_VERSION,

  toggleBetaMode: () => {
    const newBetaMode = !get().betaMode;
    set({ betaMode: newBetaMode });
    
    // 🤖 Handle simulated friends based on beta mode
    const friendsStore = useFriendsStore.getState();
    if (newBetaMode) {
      // Turning beta mode ON - initialize simulated friends
      friendsStore.initializeSimulatedFriends();
    } else {
      // Turning beta mode OFF - cleanup simulated friends
      friendsStore.cleanupSimulatedFriends();
    }
    
    get().saveToStorage();
  },

  setBetaMode: (enabled) => {
    set({ betaMode: enabled });
    
    // 🤖 Handle simulated friends based on beta mode
    const friendsStore = useFriendsStore.getState();
    if (enabled) {
      friendsStore.initializeSimulatedFriends();
    } else {
      friendsStore.cleanupSimulatedFriends();
    }
    
    get().saveToStorage();
  },

  openDeveloperMenu: () => {
    set({ showDeveloperMenu: true });
  },

  closeDeveloperMenu: () => {
    set({ showDeveloperMenu: false });
  },

  resetOnboarding: () => {
    useUserStore.getState().resetOnboarding();
  },

  resetFullProgress: () => {
    if (!window.confirm("⚠️ This will reset ALL progress (XP, coins, streak, lessons). Continue?")) {
      return;
    }

    // Reset all stores
    useProgressStore.getState().resetAllProgress?.();
    useUserStore.getState().resetOnboarding();
    
    // Reset challenges (check if method exists)
    const challengeStore = useChallengeStore.getState();
    if (challengeStore.resetAllChallenges) {
      challengeStore.resetAllChallenges();
    } else {
      // Manual reset if method doesn't exist
      localStorage.removeItem("islamQuestChallenges_v1");
      useChallengeStore.setState({ challenges: [], bossAttempts: [], challengeHistory: [] });
    }
    
    // Reset daily quest (check if method exists)
    const dailyQuestStore = useDailyQuestStore.getState();
    if (dailyQuestStore.resetDailyQuest) {
      dailyQuestStore.resetDailyQuest();
    } else {
      // Manual reset if method doesn't exist
      localStorage.removeItem("islamQuestDailyQuest");
      useDailyQuestStore.setState({ date: null, questions: [], completed: false, rewardGiven: false });
    }
    
    // Reset friends (clear all friends and requests)
    localStorage.removeItem("islamQuestFriends_v1");
    useFriendsStore.setState({ 
      friends: [], 
      incomingRequests: [], 
      outgoingRequests: [], 
      activityFeed: [], 
      friendOfWeek: null, 
      hasUnseenRequests: false 
    });

    alert("✅ All progress has been reset!");
  },

  getDebugInfo: () => {
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
    let betaModeValue = true; // Default to true for testing
    
    if (saved) {
      try {
        const data = JSON.parse(saved);
        betaModeValue = data.betaMode ?? true;
      } catch (error) {
        console.error("Failed to load developer settings:", error);
      }
    }
    
    // Always set the state, even if no saved data
    set({ betaMode: betaModeValue });
    
    // 🤖 Initialize simulated friends if beta mode is enabled
    if (betaModeValue) {
      const friendsStore = useFriendsStore.getState();
      friendsStore.initializeSimulatedFriends();
    }
  },
}));

// 🤖 Initialize simulated friends immediately if beta mode is enabled by default
if (useDeveloperStore.getState().betaMode) {
  // Wait for friends store to be available, then initialize
  setTimeout(() => {
    const friendsStore = useFriendsStore.getState();
    if (friendsStore.initializeSimulatedFriends) {
      friendsStore.initializeSimulatedFriends();
    }
  }, 0);
}
