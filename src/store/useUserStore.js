// src/store/useUserStore.js
// -------------------------------------------------------
// Identity Store - Manages username, avatar, handle
// Separate from progressStore which manages xp/coins/streak
// -------------------------------------------------------
// ARCHITECTURE (Nov 2025):
// - Profiles are ONLY created after onboarding via createProfileAfterOnboarding()
// - init() only CHECKS for existing profile, never creates one
// - completeOnboarding() creates the profile if it doesn't exist

import { create } from "zustand";
import { createDailyLeaderboardSnapshot } from "../backend/leaderboardSnapshots";
import { supabase } from "../lib/supabaseClient";
import { safeCall } from "../lib/supabaseSafe";
import { 
  ensureSignedIn, 
  checkProfileExists, 
  createProfileAfterOnboarding,
  loadCloudProfile, 
  saveCloudProfile, 
  isProfileComplete 
} from "../lib/userProfile";

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

// Ensure device_id always exists
if (!localStorage.getItem("device_id")) {
  localStorage.setItem("device_id", crypto.randomUUID());
}

// Check if onboarding was completed based on localStorage flag
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

  // Progress sync fields
  xp: 0,
  streak: 0,
  lastStreakUpdate: null,
  streakShield: false,
  lastXpGain: null,

  // Setters for userId and deviceId
  setUserId: (userId) => set({ userId }),
  setDeviceId: (deviceId) => {
    localStorage.setItem("device_id", deviceId);
    set({ deviceId });
  },

  // --------------------------------------------------
  // INIT → Called from App.jsx after silentAuth
  // Only CHECKS for profile - NEVER creates one
  // --------------------------------------------------
  init: async () => {
    set({ loading: true });

    try {
      const user = (await safeCall(() => ensureSignedIn())) ?? null;

      if (!user) {
        console.error("Silent auth failed");
        set({ loading: false, isHydrated: true, profileReady: false });
        return;
      }

      set({ user, userId: user.id });

      // Check if profile exists (DO NOT create it here)
      const existingProfile = await checkProfileExists(user.id);

      if (!existingProfile) {
        // No profile = user needs onboarding
        console.log("NO PROFILE → ONBOARDING REQUIRED");
        localStorage.removeItem("iq_profile_complete");
        set({ 
          loading: false, 
          isHydrated: true, 
          profileReady: false,
          hasOnboarded: false,
        });
        return;
      }

      // Profile exists - load full data
      const fullProfile = await loadCloudProfile(user.id);

      if (!fullProfile) {
        console.warn("[UserStore] Missing profile from cloud");
        set({ loading: false, isHydrated: true, profileReady: false });
        return;
      }
      
      // Determine if onboarding is complete
      const needsOnboarding = !isProfileComplete(fullProfile);
      
      if (needsOnboarding) {
        // Profile exists but is incomplete (missing username/handle)
        localStorage.removeItem("iq_profile_complete");
        console.log("INCOMPLETE PROFILE → ONBOARDING REQUIRED");
      } else {
        // Profile is complete - restore local state from cloud
        localStorage.setItem("iq_profile_complete", "true");
        if (fullProfile) {
          localStorage.setItem("iq_username", fullProfile.username || "");
          localStorage.setItem("iq_handle", fullProfile.handle || "");
          localStorage.setItem("iq_avatar", fullProfile.avatar || DEFAULT_AVATAR);
        }
        console.log("PROFILE COMPLETE → Loading app");
      }

      set({
        profile: fullProfile,
        profileReady: !needsOnboarding,
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
  // SET PROFILE FROM SYNC - Called by profileSync merge
  // --------------------------------------------------
  setProfileFromSync: (data) => {
    if (!data) return;
    set({
      xp: data.xp ?? 0,
      streak: data.streak ?? 0,
      lastStreakUpdate: data.lastStreakUpdate ?? data.lastStreakDate ?? null,
      streakShield: data.streakShield ?? data.shieldCount ?? 0,
      lastXpGain: data.lastXpGain ?? null,
    });
  },

  // --------------------------------------------------
  // SET ONBOARDED - Only call after profile save succeeds
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
  // Only works if profile already exists
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
      }
    }

    return result;
  },

  // --------------------------------------------------
  // COMPLETE ONBOARDING - Final step after all screens
  // Creates profile if missing, then marks onboarding done
  // --------------------------------------------------
  completeOnboarding: async () => {
    const { username, avatar, handle, userId, user, deviceId } = get();
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

    // Check if profile already exists
    const existingProfile = await checkProfileExists(uid);

    let result;
    if (existingProfile) {
      // Profile exists - update it
      console.log("Profile exists, updating identity fields...");
      result = await saveCloudProfile(uid, {
        username,
        avatar: avatar || DEFAULT_AVATAR,
        handle,
      });
    } else {
      // No profile - create it
      console.log("Creating new profile...");
      result = await createProfileAfterOnboarding({
        userId: uid,
        deviceId: deviceId,
        username,
        avatar: avatar || DEFAULT_AVATAR,
        handle,
      });
    }

    if (result.success) {
      // Load the full profile
      const fullProfile = await loadCloudProfile(uid);
      
      // Update localStorage
      localStorage.setItem("iq_profile_complete", "true");
      localStorage.setItem("iq_username", username);
      localStorage.setItem("iq_handle", handle);
      localStorage.setItem("iq_avatar", avatar || DEFAULT_AVATAR);
      
      // Update store
      set({ 
        hasOnboarded: true, 
        profileReady: true,
        profile: fullProfile,
      });
      
      console.log("ONBOARDING COMPLETE → Profile saved");
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
  // SYNC USER PROFILE - Refresh from cloud
  // --------------------------------------------------
  syncUserProfile: async () => {
    const { data } = await supabase.auth.getUser();
    const userId = data?.user?.id;
    if (!userId) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profile) {
      set({
        xp: profile.xp ?? 0,
        streak: profile.streak ?? 0,
        streakShield: profile.shield_count ?? 0,
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
