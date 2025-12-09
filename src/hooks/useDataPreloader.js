import { useCallback } from "react";
import { useUserStore } from "../store/useUserStore";
import { useProgressStore } from "../store/progressStore";
import { useDailyQuestStore } from "../store/dailyQuestStore";
import { useFriendsStore } from "../store/friendsStore";
import { useFriendChallengesStore } from "../store/friendChallengesStore";
import { useEventsStore } from "../store/eventsStore";
import { supabase } from "../lib/supabaseClient";
import { avatarIndexToKey } from "../utils/avatarUtils";

export function useDataPreloader() {
  const preloadAllData = useCallback(async (userId) => {
    if (!userId) {
      console.error("[DataPreloader] No userId provided");
      return { success: false, error: "No user ID" };
    }

    console.log("[DataPreloader] Starting parallel data load for:", userId);
    const startTime = Date.now();

    try {
      const results = await Promise.all([
        loadProfile(userId),
        loadProgress(userId),
        loadDailyQuest(userId),
        loadFriends(),
        loadFriendChallenges(),
        loadStreakShield(),
      ]);

      const elapsed = Date.now() - startTime;
      console.log(`[DataPreloader] All data loaded in ${elapsed}ms`);

      const [profileResult, progressResult] = results;

      if (!profileResult.success) {
        return { success: false, error: "Failed to load profile" };
      }

      return {
        success: true,
        profile: profileResult.profile,
        elapsed,
      };
    } catch (error) {
      console.error("[DataPreloader] Error:", error);
      return { success: false, error: error.message };
    }
  }, []);

  return { preloadAllData };
}

async function loadProfile(userId) {
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("[DataPreloader] Profile load error:", error);
      return { success: false, error: error.message };
    }

    if (!profile) {
      return { success: false, error: "No profile found" };
    }

    const avatarKey = typeof profile.avatar === "number"
      ? avatarIndexToKey(profile.avatar)
      : profile.avatar || "avatar_man_lantern";

    useUserStore.setState({
      profile,
      username: profile.username || "",
      handle: profile.handle || "",
      avatar: avatarKey,
      name: profile.username || "",
      profileReady: true,
    });

    localStorage.setItem("iq_name", profile.username || "");
    localStorage.setItem("iq_handle", profile.handle || "");
    localStorage.setItem("iq_avatar", avatarKey);

    return { success: true, profile };
  } catch (e) {
    console.error("[DataPreloader] Profile error:", e);
    return { success: false, error: e.message };
  }
}

async function loadProgress(userId) {
  try {
    await useProgressStore.getState().loadFromSupabase();
    return { success: true };
  } catch (e) {
    console.warn("[DataPreloader] Progress load warning:", e);
    return { success: true };
  }
}

async function loadDailyQuest(userId) {
  try {
    await useDailyQuestStore.getState().loadDailyQuestFromCloud(userId);
    return { success: true };
  } catch (e) {
    console.warn("[DataPreloader] Daily quest load warning:", e);
    return { success: true };
  }
}

async function loadFriends() {
  try {
    await useFriendsStore.getState().initialize();
    return { success: true };
  } catch (e) {
    console.warn("[DataPreloader] Friends load warning:", e);
    return { success: true };
  }
}

async function loadFriendChallenges() {
  try {
    await useFriendChallengesStore.getState().initialize();
    return { success: true };
  } catch (e) {
    console.warn("[DataPreloader] Friend challenges load warning:", e);
    return { success: true };
  }
}

async function loadStreakShield() {
  try {
    await useProgressStore.getState().loadStreakShieldFromCloud();
    return { success: true };
  } catch (e) {
    console.warn("[DataPreloader] Streak shield load warning:", e);
    return { success: true };
  }
}

export async function preloadUserData(userId) {
  if (!userId) {
    console.error("[preloadUserData] No userId provided");
    return { success: false, error: "No user ID" };
  }

  console.log("[preloadUserData] Starting parallel data load...");
  const startTime = Date.now();

  try {
    const results = await Promise.all([
      loadProfile(userId),
      loadProgress(userId),
      loadDailyQuest(userId),
      loadFriends(),
      loadFriendChallenges(),
      loadStreakShield(),
    ]);

    const elapsed = Date.now() - startTime;
    console.log(`[preloadUserData] Complete in ${elapsed}ms`);

    const [profileResult] = results;
    return {
      success: profileResult.success,
      profile: profileResult.profile,
      elapsed,
    };
  } catch (error) {
    console.error("[preloadUserData] Error:", error);
    return { success: false, error: error.message };
  }
}
