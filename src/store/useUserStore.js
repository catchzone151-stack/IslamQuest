// src/store/useUserStore.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useUserStore = create(
  persist(
    (set, get) => ({
      // state
      name: "",
      username: null,
      avatar: null,
      id: crypto.randomUUID(),
      hasOnboarded: false,

      // hydration flag (so router waits until store is loaded from storage)
      isHydrated: false,

      // actions
      setName: (name) => set({ name }),
      setUsername: (username) => set({ username }),
      setAvatar: (avatar) => set({ avatar }),
      setId: (id) => set({ id }),
      completeOnboarding: () => set({ hasOnboarded: true }),
      resetUser: () => set({ name: "", username: null, avatar: null, hasOnboarded: false }),
      
      // 🛠️ Reset onboarding state (for developer/testing purposes)
      resetOnboarding: () => set({ name: "", username: null, avatar: null, hasOnboarded: false }),

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
        }
      },
    }
  )
);
