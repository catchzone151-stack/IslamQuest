// src/store/useUserStore.js
// Supabase integration with correct imports from userProfile.js

import { create } from "zustand";
import { supabase } from "../lib/supabaseClient";
import { ensureSignedIn, ensureProfile, loadCloudProfile, saveCloudProfile } from "../lib/userProfile";

// Generate or load stable device fingerprint
function loadDeviceId() {
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("device_id", id);
  }
  return id;
}

// Check localStorage for onboarding status
function checkOnboarded() {
  try {
    const data = localStorage.getItem("progress-storage");
    if (data) {
      const parsed = JSON.parse(data);
      return parsed?.state?.hasOnboarded === true;
    }
  } catch (e) {}
  return false;
}

export const useUserStore = create((set, get) => ({
  loading: true,
  isHydrated: false,  // Track if store has initialized
  hasOnboarded: checkOnboarded(), // Check localStorage on load
  user: null,         // Supabase auth user
  userId: null,       // Supabase auth user ID (set during init)
  profile: null,      // Full profile row from DB
  deviceId: loadDeviceId(),

  // Setters for userId and deviceId (used by App.jsx initAuth)
  setUserId: (userId) => set({ userId }),
  setDeviceId: (deviceId) => {
    localStorage.setItem("device_id", deviceId);
    set({ deviceId });
  },

  // --------------------------------------------------
  // INIT → Silent login + profile load
  // --------------------------------------------------
  init: async () => {
    set({ loading: true });

    try {
      // 1. Silent auth (get existing session or create hidden account)
      const user = await ensureSignedIn();

      if (!user) {
        console.error("Silent auth failed");
        set({ loading: false, isHydrated: true });
        return;
      }

      set({ user });

      // 2. Ensure profile exists (may fail if DB schema not ready)
      const deviceId = get().deviceId;
      try {
        await ensureProfile(user.id, deviceId);
      } catch (e) {
        console.log("Profile creation skipped (DB not ready):", e.message);
      }

      // 3. Load full profile (may return null if DB not ready)
      let profile = null;
      try {
        profile = await loadCloudProfile(user.id);
      } catch (e) {
        console.log("Cloud profile load skipped:", e.message);
      }

      set({
        profile,
        loading: false,
        isHydrated: true,
      });
    } catch (error) {
      console.error("Init error:", error);
      set({ loading: false, isHydrated: true });
    }
  },

  // Set onboarding complete
  setOnboarded: (value) => set({ hasOnboarded: value }),

  // Onboarding setters (store locally, sync to cloud later)
  name: localStorage.getItem("iq_name") || "",
  setName: (name) => {
    localStorage.setItem("iq_name", name);
    set({ name });
  },

  avatar: localStorage.getItem("iq_avatar") || "avatar1",
  setAvatar: (avatar) => {
    localStorage.setItem("iq_avatar", avatar);
    set({ avatar });
  },

  username: localStorage.getItem("iq_username") || "",
  setUsername: (username) => {
    localStorage.setItem("iq_username", username);
    set({ username });
  },

  handle: localStorage.getItem("iq_handle") || "",
  setHandle: (handle) => {
    localStorage.setItem("iq_handle", handle);
    set({ handle });
  },

  // --------------------------------------------------
  // UPDATE PROFILE (username, handle, avatar, etc.)
  // --------------------------------------------------
  saveProfile: async (updates) => {
    // Try both user.id and userId (set during App.jsx initAuth)
    const userId = get().user?.id || get().userId;
    if (!userId) {
      console.warn("saveProfile: No userId available, skipping sync");
      return;
    }

    console.log("saveProfile: Saving to Supabase for user", userId, updates);
    await saveCloudProfile(userId, updates);

    // Reload to get updated profile
    const updated = await loadCloudProfile(userId);
    if (updated) {
      set({ profile: updated });
      console.log("saveProfile: Profile reloaded from cloud");
    }
  },

  // --------------------------------------------------
  // REFRESH PROFILE FROM DB (optional)
  // --------------------------------------------------
  reloadProfile: async () => {
    const userId = get().user?.id || get().userId;
    if (!userId) return;

    const profile = await loadCloudProfile(userId);
    if (profile) {
      set({ profile });
    }
  },
}));
