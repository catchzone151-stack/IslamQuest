// src/store/useTitleStore.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { titles } from "../data/titles";
import { useProgressStore } from "./progressStore";

export const useTitleStore = create(
  persist(
    (set, get) => ({
      currentTier: 1,
      reflectionsCount: 0,

      // === evaluate title based on metrics ===
      evaluateTitle: () => {
        const progress = useProgressStore.getState();
        const { lessonStates, paths, streak } = progress;

        const lessonsCompleted = Object.values(lessonStates || {}).reduce(
          (sum, path) => sum + Object.values(path).filter((l) => l.passed).length,
          0
        );
        const pathsCompleted = (paths || []).filter((p) => p.progress === 1).length;
        const reflections = get().reflectionsCount;
        const tier = get().currentTier;

        let newTier = tier;

        // === Title progression rules (matches Title doc) ===
        if (lessonsCompleted >= 1) newTier = Math.max(newTier, 1);
        if (lessonsCompleted >= 3) newTier = Math.max(newTier, 2);
        if (pathsCompleted >= 1) newTier = Math.max(newTier, 3);
        if (streak >= 7) newTier = Math.max(newTier, 4);
        if (reflections >= 5) newTier = Math.max(newTier, 5);
        if (pathsCompleted >= 3) newTier = Math.max(newTier, 6);
        if (streak >= 30) newTier = Math.max(newTier, 7);
        if (reflections >= 15) newTier = Math.max(newTier, 8);
        if (pathsCompleted >= 6) newTier = Math.max(newTier, 9);
        if (pathsCompleted >= 12 && reflections >= 20)
          newTier = Math.max(newTier, 10);

        if (newTier !== tier) set({ currentTier: newTier });
      },

      addReflection: () => {
        const count = get().reflectionsCount + 1;
        set({ reflectionsCount: count });
        get().evaluateTitle();
      },

      resetTitles: () => set({ currentTier: 1, reflectionsCount: 0 }),
    }),
    {
      name: "iq-title",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
