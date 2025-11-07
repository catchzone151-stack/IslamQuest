// src/store/progressStore.js
import { create } from "zustand";
import { useTitleStore } from "./useTitleStore";


const STORAGE_KEY = "islamQuestProgress";
const SIX_PILLARS_PATH_TITLE = "Six Pillars of Belief";
const SIX_PILLARS_TOTAL_LESSONS = 6;

export const useProgressStore = create((set, get) => ({
  xp: 0,
  coins: 0,

  // ✅ Streak system
  streak: 0,
  lastStudyDate: null,
  freezeTokens: 1, // max 1 token

  // ✅ XP multiplier % (0/10/20/30/50)
  xpMultiplier: 0,

  level: 1,
  lastLogin: null,
  avatar: "default",
  displayName: "Student of Knowledge",

  // ✅ Removed badges entirely
  certificates: [],
  lessonStates: {},

  // ✅ Paths (for lesson progress)
  paths: [
    { id: 1, title: "Names of Allah", progress: 0.35, status: "available" },
    { id: 2, title: SIX_PILLARS_PATH_TITLE, progress: 0.2, status: "available" },
    { id: 3, title: "Stories of Prophets", progress: 0.1, status: "available" },
    { id: 4, title: "Life of Muhammad ﷺ", progress: 0.08, status: "available" },
    { id: 5, title: "Ten Promised Paradise", progress: 0, status: "available" },
    { id: 6, title: "Four Greatest Women", progress: 0, status: "available" },
    { id: 7, title: "Minor Signs", progress: 0, status: "coming_soon" },
    { id: 8, title: "Major Signs", progress: 0, status: "coming_soon" },
    { id: 9, title: "The Grave", progress: 0, status: "coming_soon" },
    { id: 10, title: "Day of Judgement", progress: 0, status: "coming_soon" },
    { id: 11, title: "Hellfire", progress: 0, status: "coming_soon" },
    { id: 12, title: "Paradise", progress: 0, status: "coming_soon" },
  ],

  // ✅ Save to localStorage
  saveProgress: () => {
    const data = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  // ✅ Load from localStorage
  loadProgress: () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) set(JSON.parse(saved));
  },

  // ✅ Duolingo-style daily streak
  triggerDailyStudy: () => {
    const today = new Date().toDateString();
    const { lastStudyDate, streak, freezeTokens } = get();

    if (lastStudyDate === today) return;

    if (!lastStudyDate) {
      set({ streak: 1, lastStudyDate: today });
    } else {
      const diff = new Date(today) - new Date(lastStudyDate);
      const oneDay = 86400000;

      if (diff <= oneDay * 2) {
        set({ streak: streak + 1, lastStudyDate: today });
      } else {
        if (freezeTokens > 0) {
          set({ freezeTokens: freezeTokens - 1, lastStudyDate: today });
        } else {
          set({ streak: 1, lastStudyDate: today });
        }
      }
    }

    get().calculateXPMultiplier();
    get().saveProgress();
  },

  // ✅ XP multiplier calculation
  calculateXPMultiplier: () => {
    const streak = get().streak;
    let bonus = 0;
    if (streak >= 30) bonus = 50;
    else if (streak >= 14) bonus = 30;
    else if (streak >= 7) bonus = 20;
    else if (streak >= 3) bonus = 10;
    set({ xpMultiplier: bonus });
  },

  // ✅ XP handling
  addXP: (amount) => {
    const { xp, xpMultiplier } = get();
    const bonus = Math.round((amount * xpMultiplier) / 100);
    const total = amount + bonus;
    const newXP = xp + total;
    const newLevel = Math.floor(newXP / 100) + 1;
    set({ xp: newXP, level: newLevel });
    get().saveProgress();
  },

  // ✅ Coins handling
  addCoins: (amount) => {
    set((s) => ({ coins: s.coins + amount }));
    get().saveProgress();
  },

  // ✅ Certificates
  earnCertificate: (id, title) => {
    const { certificates } = get();
    if (!certificates.some((c) => c.id === id)) {
      set({
        certificates: [
          ...certificates,
          { id, title, earnedAt: new Date().toISOString() },
        ],
      });
      get().saveProgress();
    }
  },

  // ✅ Update path progress
  setPathProgress: (pathId, ratio) => {
    const { paths } = get();
    const updated = paths.map((p) =>
      p.id === pathId ? { ...p, progress: ratio } : p
    );
    set({ paths: updated });
    get().saveProgress();
  },

  // ✅ Full lesson reward logic (no badges)
  applyQuizResults: (
    payload,
    pathId,
    lessonId,
    totalLessons = SIX_PILLARS_TOTAL_LESSONS
  ) => {
    if (!payload) return;
    const { xp, coins } = payload;
    if (xp) get().addXP(xp);
    if (coins) get().addCoins(coins);
    

    // Update lesson states
    set((state) => {
      const lessonStates = { ...(state.lessonStates || {}) };
      const pathState = { ...(lessonStates[pathId] || {}) };
      pathState[lessonId] = { passed: true, bestScore: 1 };
      lessonStates[pathId] = pathState;
      return { lessonStates };
    });

    // Update progress
    const passedCount = Object.values(get().lessonStates[pathId] || {}).filter(
      (x) => x.passed
    ).length;
    const ratio = Math.min(1, passedCount / totalLessons);

    const progressPathId = (
      get().paths.find((x) => x.title === SIX_PILLARS_PATH_TITLE) || {}
    ).id;
    if (progressPathId) get().setPathProgress(progressPathId, ratio);

    // Auto-award certificate if completed
    if (ratio === 1)
      get().earnCertificate(pathId, "Completed: " + SIX_PILLARS_PATH_TITLE);

    get().saveProgress();
  },
}));

useProgressStore.getState().loadProgress();
