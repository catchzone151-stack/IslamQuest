import { useCallback } from "react";
import { useUserStore } from "../store/useUserStore";
import { supabase } from "../lib/supabaseClient";
import { avatarKeyToIndex } from "../utils/avatarUtils";
import { useProgressStore } from "../store/progressStore";

const ONBOARDING_STEPS = {
  BISMILLAH: "bismillah",
  SALAAM: "salaam",
  AUTH_CHOICE: "authchoice",
  LOGIN: "login",
  SIGNUP: "signup",
  CHECK_EMAIL: "checkemail",
};

const STEP_ROUTES = {
  [ONBOARDING_STEPS.BISMILLAH]: "/onboarding/bismillah",
  [ONBOARDING_STEPS.SALAAM]: "/onboarding/salaam",
  [ONBOARDING_STEPS.AUTH_CHOICE]: "/onboarding/auth-choice",
  [ONBOARDING_STEPS.LOGIN]: "/login",
  [ONBOARDING_STEPS.SIGNUP]: "/signup",
  [ONBOARDING_STEPS.CHECK_EMAIL]: "/check-email",
};

export function useOnboarding() {
  const saveStep = useCallback((step) => {
    localStorage.setItem("iq_onboarding_step", step);
  }, []);

  const getStep = useCallback(() => {
    return localStorage.getItem("iq_onboarding_step") || ONBOARDING_STEPS.BISMILLAH;
  }, []);

  const getStepRoute = useCallback((step) => {
    return STEP_ROUTES[step] || STEP_ROUTES[ONBOARDING_STEPS.BISMILLAH];
  }, []);

  const clearStep = useCallback(() => {
    localStorage.removeItem("iq_onboarding_step");
  }, []);

  const saveUserData = useCallback((data) => {
    if (data.name) localStorage.setItem("iq_name", data.name);
    if (data.handle) localStorage.setItem("iq_handle", data.handle);
    if (data.avatar) localStorage.setItem("iq_avatar", data.avatar);
    if (data.email) localStorage.setItem("iq_email", data.email);
  }, []);

  const getUserData = useCallback(() => {
    return {
      name: localStorage.getItem("iq_name") || "",
      handle: localStorage.getItem("iq_handle") || "",
      avatar: localStorage.getItem("iq_avatar") || "avatar_man_lantern",
      email: localStorage.getItem("iq_email") || "",
    };
  }, []);

  const clearUserData = useCallback(() => {
    localStorage.removeItem("iq_name");
    localStorage.removeItem("iq_handle");
    localStorage.removeItem("iq_avatar");
    localStorage.removeItem("iq_email");
  }, []);

  const checkHandleAvailable = useCallback(async (handle, currentUserId = null) => {
    const trimmed = handle.trim().toLowerCase().replace(/^@/, "");
    
    if (!trimmed || trimmed.length < 2) {
      return { available: false, error: "Handle must be at least 2 characters" };
    }

    if (!/^[a-z0-9_]+$/.test(trimmed)) {
      return { available: false, error: "Only letters, numbers, and underscores allowed" };
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("handle, user_id")
        .eq("handle", trimmed);

      if (error) {
        console.warn("Handle check error:", error);
        return { available: true, error: null };
      }

      if (data && data.length > 0) {
        const otherUser = data.find(d => d.user_id !== currentUserId);
        if (otherUser) {
          return { available: false, error: "Handle already taken" };
        }
      }

      return { available: true, error: null };
    } catch (e) {
      console.warn("Handle check failed:", e);
      return { available: true, error: null };
    }
  }, []);

  const createProfile = useCallback(async (userId, data) => {
    const { name, handle, avatar } = data;
    const avatarIndex = avatarKeyToIndex(avatar);
    const progressState = useProgressStore.getState();

    const { error } = await supabase
      .from("profiles")
      .upsert({
        user_id: userId,
        username: name,
        handle: handle.trim().toLowerCase().replace(/^@/, ""),
        avatar: avatarIndex,
        xp: progressState.xp || 0,
        coins: progressState.coins || 0,
        streak: progressState.streak || 0,
        created_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (error) {
      console.error("Profile creation error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }, []);

  const completeOnboarding = useCallback(() => {
    clearStep();
    localStorage.setItem("iq_profile_complete", "true");
    
    useUserStore.setState({
      hasOnboarded: true,
      profileReady: true,
      loading: false,
      isHydrated: true,
    });
  }, [clearStep]);

  return {
    STEPS: ONBOARDING_STEPS,
    saveStep,
    getStep,
    getStepRoute,
    clearStep,
    saveUserData,
    getUserData,
    clearUserData,
    checkHandleAvailable,
    createProfile,
    completeOnboarding,
  };
}

export { ONBOARDING_STEPS };
