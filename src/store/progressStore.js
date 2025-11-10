// src/store/progressStore.js
import { create } from "zustand";
import { useTitleStore } from "./useTitleStore";

const STORAGE_KEY = "islamQuestProgress_v3";

const DEFAULT_PATHS = [
  { id: 1, title: "Names of Allah", progress: 0.35, totalLessons: 104, completedLessons: 3, status: "available" },
  { id: 2, title: "Foundations of Islam", progress: 0.1, totalLessons: 17, completedLessons: 1, status: "available" },
  { id: 3, title: "Stories of Prophets", progress: 0.08, totalLessons: 47, completedLessons: 1, status: "available" },
  { id: 4, title: "Life of Muhammad ﷺ", progress: 0.05, totalLessons: 78, completedLessons: 0, status: "available" },
  { id: 5, title: "Wives of the Prophet ﷺ", progress: 0, totalLessons: 13, completedLessons: 0, status: "available" },
  { id: 6, title: "Ten Promised Jannah", progress: 0, totalLessons: 10, completedLessons: 0, status: "available" },
  { id: 7, title: "Four Greatest Women", progress: 0, totalLessons: 12, completedLessons: 0, status: "available" },
  { id: 8, title: "Stories of the Companions", progress: 0, totalLessons: 32, completedLessons: 0, status: "available" },
  { id: 9, title: "Angels and Jinns", progress: 0, totalLessons: 11, completedLessons: 0, status: "available" },
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
  freezeTokens: 1,
  xpMultiplier: 0,
  level: 1,
  lastLogin: null,
  avatar: "default",
  displayName: "Student of Knowledge",
  certificates: [],
  lessonStates: {},
  lockedLessons: {},
  hasPremium: false,

  // 🌙 Learning Paths
  paths: DEFAULT_PATHS,

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
      set(savedData);
    }
  },

  // 🌙 Daily streak
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
    const newLevel = Math.floor(newXP / 100) + 1;
    set({ xp: newXP, level: newLevel });
    get().saveProgress();
  },

  addCoins: (amount) => {
    set((s) => ({ coins: s.coins + amount }));
    get().saveProgress();
  },

  // 🏆 Certificates
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
  applyQuizResults: (payload, pathId, lessonId) => {
    if (!payload) return;
    const { xp, coins } = payload;
    if (xp) get().addXP(xp);
    if (coins) get().addCoins(coins);

    set((state) => {
      const lessonStates = { ...(state.lessonStates || {}) };
      const pathState = { ...(lessonStates[pathId] || {}) };
      pathState[lessonId] = { passed: true, bestScore: 1 };
      lessonStates[pathId] = pathState;
      return { lessonStates };
    });

    const path = get().paths.find((x) => x.id === pathId);
    const passedCount = Object.values(get().lessonStates[pathId] || {}).filter(
      (x) => x.passed
    ).length;

    const ratio =
      path && path.totalLessons > 0
        ? Math.min(1, passedCount / path.totalLessons)
        : 0;

    get().setPathProgress(pathId, passedCount, path ? path.totalLessons : 0);
    if (ratio === 1) get().earnCertificate(pathId, "Completed: " + path.title);

    // unlock next lesson
    get().unlockLesson(pathId, lessonId + 1);
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

  isUnlocked: (pathId, lessonId) => {
    if (lessonId === 1) return true;
    const { lockedLessons, hasPremium } = get();
    if (hasPremium) return true; // premium users bypass locks
    return (
      lockedLessons[pathId] &&
      lockedLessons[pathId][lessonId] &&
      lockedLessons[pathId][lessonId].unlocked
    );
  },

  // 💳 Premium unlock
  unlockPremium: () => {
    set({ hasPremium: true });
    get().saveProgress();
  },

  resetAllLocks: () => {
    set({ lockedLessons: {} });
    get().saveProgress();
  },
}));

useProgressStore.getState().loadProgress();
