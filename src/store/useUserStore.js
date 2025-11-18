// src/store/useUserStore.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// 🛠️ DEV MODE: Skip onboarding for testing
const DEV_MODE = true;

export const useUserStore = create(
  persist(
    (set, get) => ({
      // state
      name: DEV_MODE ? "Developer" : "",
      avatar: DEV_MODE ? "avatar_dino" : null,
      hasOnboarded: DEV_MODE ? true : false,

      // hydration flag (so router waits until store is loaded from storage)
      isHydrated: false,

      // actions
      setName: (name) => set({ name }),
      setAvatar: (avatar) => set({ avatar }),
      completeOnboarding: () => set({ hasOnboarded: true }),
      resetUser: () => set({ name: "", avatar: null, hasOnboarded: false }),

      // internal: set hydrated after rehydrate finishes
      _setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "iq-user-v2", // localStorage key
      storage: createJSONStorage(() => localStorage),
      // when the store rehydrates from storage, flip isHydrated to true
      onRehydrateStorage: () => (state, error) => {
        // called after rehydration (success or error)
        if (state && typeof state._setHydrated === "function") {
          state._setHydrated();
          
          // 🛠️ DEV MODE: Override persisted values for testing
          if (DEV_MODE) {
            state.name = "Developer";
            state.avatar = "avatar_dino";
            state.hasOnboarded = true;
          }
        }
      },
    }
  )
);
