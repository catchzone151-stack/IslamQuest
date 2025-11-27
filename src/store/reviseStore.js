import { create } from "zustand";

const STORAGE_KEY = "islamQuestRevise";

const useReviseStore = create((set, get) => ({
  weakPool: [],
  needsSync: false,

  loadReviseData: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        set({ weakPool: Array.isArray(data.weakPool) ? data.weakPool : [] });
      }
    } catch (e) {
      console.warn("[ReviseStore] loadReviseData error:", e.message);
      set({ weakPool: [] });
    }
  },

  saveReviseData: () => {
    const { weakPool } = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ weakPool }));
  },

  getWeakPool: () => {
    const pool = get().weakPool;
    return Array.isArray(pool) ? pool : [];
  },

  setWeakPool: (arr) => {
    const safeArr = Array.isArray(arr) ? arr : [];
    set({ weakPool: safeArr, needsSync: false });
    get().saveReviseData();
  },

  saveWrongQuestion: (cardId, lessonId) => {
    const pool = [...get().weakPool];
    const existing = pool.find(
      (i) => i.cardId === cardId && i.lessonId === lessonId
    );

    const now = Date.now();

    if (!existing) {
      pool.push({
        cardId,
        lessonId,
        timesCorrect: 0,
        timesWrong: 1,
        lastReviewedAt: now,
        nextReviewAt: now,
        updatedAt: now,
      });
    } else {
      existing.timesWrong += 1;
      existing.lastReviewedAt = now;
      existing.updatedAt = now;
    }

    set({ weakPool: pool, needsSync: true });
    get().saveReviseData();
  },

  clearCorrectQuestion: (cardId, lessonId) => {
    const pool = [...get().weakPool];
    const item = pool.find(
      (i) => i.cardId === cardId && i.lessonId === lessonId
    );
    if (item) {
      item.timesCorrect += 1;
      item.updatedAt = Date.now();
    }
    set({ weakPool: pool, needsSync: true });
    get().saveReviseData();
  },
}));

export default useReviseStore;
export { useReviseStore };
