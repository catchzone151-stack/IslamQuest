// src/store/useUserStore.js
// -------------------------------------------------------
// Identity Store - Manages username, avatar, handle
// Separate from progressStore which manages xp/coins/streak
// -------------------------------------------------------

import { create } from "zustand";
import { supabase } from "../lib/supabaseClient";
import { ensureSignedIn, ensureProfile, loadCloudProfile, saveCloudProfile, isProfileComplete } from "../lib/userProfile";

// Default avatar for new users
const DEFAULT_AVATAR = "avatar_man_lantern";

// Generate or load stable device fingerprint
function loadDeviceId() {
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("device_id", id);
  }
  return id;
}

// Check if onboarding was completed based on profile completeness
// Returns false if profile is missing required identity fields
function checkOnboardedFromStorage() {
  try {
    const profileStr = localStorage.getItem("iq_profile_complete");
    return profileStr === "true";
  } catch (e) {}
  return false;
}

export const useUserStore = create((set, get) => ({
  // Core state
  loading: true,
  isHydrated: false,
  hasOnboarded: checkOnboardedFromStorage(),
  profileReady: false,  // True when profile is fully loaded from cloud
  
  // Auth state
  user: null,
  userId: null,
  profile: null,
  deviceId: loadDeviceId(),

  // Identity fields (synced to cloud via saveProfile)
  name: localStorage.getItem("iq_name") || "",
  avatar: localStorage.getItem("iq_avatar") || DEFAULT_AVATAR,
  username: localStorage.getItem("iq_username") || "",
  handle: localStorage.getItem("iq_handle") || "",

  // Setters for userId and deviceId
  setUserId: (userId) => set({ userId }),
  setDeviceId: (deviceId) => {
    localStorage.setItem("device_id", deviceId);
    set({ deviceId });
  },

  // --------------------------------------------------
  // INIT → Called from App.jsx after silentAuth
  // Only loads profile - does NOT create it
  // --------------------------------------------------
  init: async () => {
    set({ loading: true });

    try {
      const user = await ensureSignedIn();

      if (!user) {
        console.error("Silent auth failed");
        set({ loading: false, isHydrated: true, profileReady: false });
        return;
      }

      set({ user, userId: user.id });

      // Ensure profile exists in DB
      const deviceId = get().deviceId;
      const profile = await ensureProfile(user.id, deviceId);

      if (!profile) {
        console.warn("Profile not ready");
        set({ loading: false, isHydrated: true, profileReady: false });
        return;
      }

      // Load full profile from cloud
      const fullProfile = await loadCloudProfile(user.id);
      
      // Determine if onboarding is needed
      const needsOnboarding = !isProfileComplete(fullProfile);
      
      if (needsOnboarding) {
        // Clear corrupted onboarding state
        localStorage.removeItem("iq_profile_complete");
        console.log("ONBOARDING REQUIRED");
      } else {
        // Profile is complete - restore local state from cloud
        localStorage.setItem("iq_profile_complete", "true");
        if (fullProfile) {
          localStorage.setItem("iq_username", fullProfile.username || "");
          localStorage.setItem("iq_handle", fullProfile.handle || "");
          localStorage.setItem("iq_avatar", fullProfile.avatar || DEFAULT_AVATAR);
        }
      }

      set({
        profile: fullProfile,
        profileReady: true,
        hasOnboarded: !needsOnboarding,
        loading: false,
        isHydrated: true,
        // Restore identity from cloud profile
        username: fullProfile?.username || "",
        handle: fullProfile?.handle || "",
        avatar: fullProfile?.avatar || DEFAULT_AVATAR,
        name: fullProfile?.username || "",
      });

    } catch (error) {
      console.error("Init error:", error);
      set({ loading: false, isHydrated: true, profileReady: false });
    }
  },

  // --------------------------------------------------
  // ONBOARDING SETTERS
  // Store locally during onboarding, sync to cloud at end
  // --------------------------------------------------
  setName: (name) => {
    localStorage.setItem("iq_name", name);
    set({ name });
  },

  setAvatar: (avatar) => {
    localStorage.setItem("iq_avatar", avatar);
    set({ avatar });
  },

  setUsername: (username) => {
    localStorage.setItem("iq_username", username);
    set({ username });
  },

  setHandle: (handle) => {
    localStorage.setItem("iq_handle", handle);
    set({ handle });
  },

  // --------------------------------------------------
  // SET ONBOARDED - Only call after saveProfile succeeds
  // --------------------------------------------------
  setOnboarded: (value) => {
    if (value) {
      localStorage.setItem("iq_profile_complete", "true");
    } else {
      localStorage.removeItem("iq_profile_complete");
    }
    set({ hasOnboarded: value });
  },

  // --------------------------------------------------
  // SAVE PROFILE - Updates ONLY identity fields
  // NEVER updates xp, coins, streak, shield_count
  // NEVER sends null values
  // --------------------------------------------------
  saveProfile: async (updates) => {
    const userId = get().user?.id || get().userId;
    if (!userId) {
      console.warn("saveProfile: No userId available");
      return { success: false };
    }

    // Filter to only identity fields - strip any progress fields
    const identityFields = {};
    if (updates.username) identityFields.username = updates.username;
    if (updates.avatar) identityFields.avatar = updates.avatar;
    if (updates.handle) identityFields.handle = updates.handle;

    // Don't send empty updates
    if (Object.keys(identityFields).length === 0) {
      console.warn("saveProfile: No identity fields to update");
      return { success: false };
    }

    const result = await saveCloudProfile(userId, identityFields);

    if (result.success) {
      // Reload profile from cloud to confirm changes
      const updated = await loadCloudProfile(userId);
      if (updated) {
        set({ profile: updated });
        console.log("ONBOARDING COMPLETE");
      }
    }

    return result;
  },

  // --------------------------------------------------
  // COMPLETE ONBOARDING - Final step after all screens
  // Saves all identity fields and marks onboarding done
  // --------------------------------------------------
  completeOnboarding: async () => {
    const { username, avatar, handle, userId, user } = get();
    const uid = user?.id || userId;

    if (!uid) {
      console.error("completeOnboarding: No user ID");
      return false;
    }

    // Validate all required fields are present
    if (!username || !handle) {
      console.error("completeOnboarding: Missing required fields", { username, handle });
      return false;
    }

    // Save all identity fields to cloud
    const result = await saveCloudProfile(uid, {
      username,
      avatar: avatar || DEFAULT_AVATAR,
      handle,
    });

    if (result.success) {
      localStorage.setItem("iq_profile_complete", "true");
      set({ hasOnboarded: true });
      console.log("ONBOARDING COMPLETE");
      return true;
    }

    console.error("completeOnboarding: Save failed", result.error);
    return false;
  },

  // --------------------------------------------------
  // REFRESH PROFILE FROM DB
  // --------------------------------------------------
  reloadProfile: async () => {
    const userId = get().user?.id || get().userId;
    if (!userId) return;

    const profile = await loadCloudProfile(userId);
    if (profile) {
      set({ 
        profile,
        username: profile.username || "",
        handle: profile.handle || "",
        avatar: profile.avatar || DEFAULT_AVATAR,
      });
    }
  },

  // --------------------------------------------------
  // RESET USER DATA (for logout)
  // --------------------------------------------------
  resetUserData: () => {
    // Clear all identity localStorage items
    localStorage.removeItem("iq_name");
    localStorage.removeItem("iq_avatar");
    localStorage.removeItem("iq_username");
    localStorage.removeItem("iq_handle");
    localStorage.removeItem("iq_profile_complete");
    localStorage.removeItem("device_id");
    
    // Reset store state
    set({
      user: null,
      userId: null,
      profile: null,
      profileReady: false,
      hasOnboarded: false,
      name: "",
      avatar: DEFAULT_AVATAR,
      username: "",
      handle: "",
      deviceId: "",
      loading: false,
      isHydrated: true,
    });
  },

  // Alias for setName (used by Login.jsx)
  setDisplayName: (name) => {
    localStorage.setItem("iq_name", name);
    set({ name });
  },
}));
