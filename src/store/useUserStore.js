// src/store/useUserStore.js
// Full replacement — correct Supabase integration + real DB schema alignment.

import { create } from "zustand";
import { supabase } from "../lib/supabaseClient";
import { getOrCreateProfile, updateProfile } from "../lib/userProfile";

// Generate or load stable device fingerprint
function loadDeviceId() {
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("device_id", id);
  }
  return id;
}

export const useUserStore = create((set, get) => ({
  loading: true,
  user: null,         // Supabase auth user
  profile: null,      // Full profile row from DB
  deviceId: loadDeviceId(),

  // --------------------------------------------------
  // INIT → Silent login + profile load
  // --------------------------------------------------
  init: async () => {
    set({ loading: true });

    // 1. Get current session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    let user = session?.user;

    // 2. If no user → silently sign in anonymously
    if (!user) {
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        console.error("Silent auth error:", error);
        set({ loading: false });
        return;
      }

      user = data.user;
    }

    set({ user });

    // 3. Load or create profile
    const deviceId = get().deviceId;
    const profile = await getOrCreateProfile(user.id, deviceId);

    set({
      profile,
      loading: false,
    });
  },

  // --------------------------------------------------
  // UPDATE PROFILE (username, handle, avatar, etc.)
  // --------------------------------------------------
  saveProfile: async (updates) => {
    const userId = get().user?.id;
    if (!userId) return;

    const updated = await updateProfile(userId, updates);

    if (updated) {
      set({ profile: updated });
    }
  },

  // --------------------------------------------------
  // REFRESH PROFILE FROM DB (optional)
  // --------------------------------------------------
  reloadProfile: async () => {
    const userId = get().user?.id;
    if (!userId) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!error && data) {
      set({ profile: data });
    }
  },
}));
