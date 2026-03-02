// src/store/useUserStore.js
// -------------------------------------------------------
// Identity Store - Manages username, avatar, handle
// Separate from progressStore which manages xp/coins/streak
// -------------------------------------------------------
// ARCHITECTURE (Nov 2025):
// - Profiles are created by the database trigger on auth.users insert
// - completeOnboarding() updates the trigger-created profile with user's chosen identity
// - init() only CHECKS for existing profile, never creates one

import { create } from "zustand";
import { createDailyLeaderboardSnapshot } from "../backend/leaderboardSnapshots";
import { supabase, ensureSignedIn } from "../lib/supabaseClient";
import { safeCall } from "../lib/supabaseSafe";
import { 
  checkProfileExists, 
  loadCloudProfile, 
  saveCloudProfile, 
  isProfileComplete 
} from "../lib/userProfile";
import { avatarKeyToIndex } from "../utils/avatarUtils";

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
  awaitingProfileSetup: false, // True when DB trigger hasn't created the profile yet
  requiresHandle: false, // True when user has a generated "User_" username and must set a real one
  retryCount: 0,
  maxRetriesReached: false,
  
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
  // Includes timeout to prevent app getting stuck
  // --------------------------------------------------
  init: async () => {
    // Prevent double initialization
    const currentState = get();
    if (currentState.isHydrated) {
      console.log("[UserStore] Already hydrated, skipping init");
      return;
    }

    set({ loading: true });
    console.log("[UserStore] Starting init...");

    // Timeout to ensure we never get stuck on loading screen
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Init timeout")), 10000)
    );

    try {
      const initLogic = async () => {
        console.log("[UserStore] Calling ensureSignedIn...");
        const user = (await safeCall(() => ensureSignedIn())) ?? null;
        console.log("[UserStore] ensureSignedIn result:", user?.id || "null");

        if (!user) {
          console.error("Silent auth failed");
          set({ loading: false, isHydrated: true, profileReady: false, hasOnboarded: false });
          return;
        }

        set({ user, userId: user.id });

        // Check if profile exists — retry up to 10x (250ms apart) to allow DB trigger to fire
        let existingProfile = null;
        for (let i = 0; i < 10; i++) {
          existingProfile = await checkProfileExists(user.id);
          if (existingProfile) break;
          if (i < 9) await new Promise(r => setTimeout(r, 250));
        }

        if (!existingProfile) {
          // Trigger still hasn't fired — show wait screen instead of redirecting
          set({ awaitingProfileSetup: true, loading: false, isHydrated: true });
          return;
        }

        // Profile exists - load full data
        const fullProfile = await loadCloudProfile(user.id);

        if (!fullProfile) {
          console.warn("[UserStore] Missing profile from cloud");
          set({ loading: false, isHydrated: true, profileReady: false, hasOnboarded: false });
          return;
        }
        
        // If profile is missing username, handle, or has wrong avatar, recover from sign-up metadata
        const missingUsername = !fullProfile.username || fullProfile.username.match(/^User\d{4}$/);
        const missingHandle = !fullProfile.handle || fullProfile.handle.trim().length === 0;
        const storedAvatarKey = localStorage.getItem("iq_avatar");
        const profileAvatarKey = fullProfile.avatar || "avatar_1";
        const needsAvatarUpdate = !!(storedAvatarKey && storedAvatarKey !== profileAvatarKey);

        if (missingUsername || missingHandle || needsAvatarUpdate) {
          const metaName = user.user_metadata?.desired_username || localStorage.getItem("iq_name");
          const metaHandle = user.user_metadata?.desired_handle || localStorage.getItem("iq_handle");
          const metaAvatarIndex = user.user_metadata?.desired_avatar_index;
          const updatePayload = {};
          if (missingUsername && metaName) updatePayload.username = metaName;
          if (missingHandle && metaHandle) updatePayload.handle = metaHandle;
          if (needsAvatarUpdate) {
            updatePayload.avatar = typeof metaAvatarIndex === "number" && metaAvatarIndex > 0
              ? metaAvatarIndex
              : avatarKeyToIndex(storedAvatarKey);
          }

          if (Object.keys(updatePayload).length > 0) {
            console.log("[UserStore] Recovering missing profile fields:", updatePayload);
            const { error: recoverError } = await supabase
              .from("profiles")
              .update(updatePayload)
              .eq("user_id", user.id);
            if (!recoverError) {
              if (updatePayload.username) fullProfile.username = updatePayload.username;
              if (updatePayload.handle) fullProfile.handle = updatePayload.handle;
              if (updatePayload.avatar) fullProfile.avatar = storedAvatarKey;
              console.log("[UserStore] Profile fields recovered successfully");
            } else {
              console.error("[UserStore] Profile recovery failed:", recoverError);
            }
          }
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
          localStorage.removeItem("iq_onboarding_step");
          if (fullProfile) {
            localStorage.setItem("iq_username", fullProfile.username || "");
            localStorage.setItem("iq_handle", fullProfile.handle || "");
            localStorage.setItem("iq_avatar", fullProfile.avatar || DEFAULT_AVATAR);
          }
          console.log("PROFILE COMPLETE → Loading app");
        }

        // If the profile is complete but username is still auto-generated, force handle setup
        const hasGeneratedUsername = !needsOnboarding && fullProfile?.username?.startsWith("User_");

        set({
          profile: fullProfile,
          profileReady: !needsOnboarding,
          hasOnboarded: !needsOnboarding,
          requiresHandle: hasGeneratedUsername,
          loading: false,
          isHydrated: true,
          // Restore identity from cloud profile
          username: fullProfile?.username || "",
          handle: fullProfile?.handle || "",
          avatar: fullProfile?.avatar || DEFAULT_AVATAR,
          name: fullProfile?.username || "",
        });
      };

      await Promise.race([initLogic(), timeoutPromise]);
      console.log("[UserStore] Init completed successfully");

    } catch (error) {
      console.error("Init error:", error?.message || error);
      // Always set isHydrated to prevent stuck loading screen
      set({ loading: false, isHydrated: true, profileReady: false, hasOnboarded: false });
    }
  },

  // Retry after showing the awaitingProfileSetup screen
  retryInit: async () => {
    const { retryCount } = get();
    if (retryCount >= 5) {
      set({ maxRetriesReached: true });
      return;
    }
    set({ awaitingProfileSetup: false, isHydrated: false, loading: true, retryCount: retryCount + 1 });
    await get().init();
  },

  clearRequiresHandle: () => {
    set({ requiresHandle: false });
  },

  // --------------------------------------------------
  // ONBOARDING SETTERS
  // Store locally during onboarding, sync to cloud at end
  // --------------------------------------------------
  setName: (name) => {
    localStorage.setItem("iq_name", name);
    set({ name });
    // Sync name change to cloud (stored as username)
    const saveProfile = get().saveProfile;
    if (saveProfile) {
      saveProfile({ username: name });
    }
  },

  setAvatar: (avatar) => {
    localStorage.setItem("iq_avatar", avatar);
    set({ avatar });
    // Sync avatar change to cloud
    const saveProfile = get().saveProfile;
    if (saveProfile) {
      saveProfile({ avatar });
    }
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

    // DB trigger guarantees profile exists after signup - always update
    console.log("Updating profile identity fields...");
    const result = await saveCloudProfile(uid, {
      username,
      avatar: avatar || DEFAULT_AVATAR,
      handle,
    });

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
      return { success: true };
    }

    console.error("completeOnboarding: Save failed", result.error);
    return { success: false, error: result.error };
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
