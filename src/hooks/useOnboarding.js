import { useCallback } from "react";
import { useUserStore } from "../store/useUserStore";
import { supabase } from "../lib/supabaseClient";

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

  /**
   * checkHandleAvailable — always queries the DB directly, never uses cached state.
   *
   * Rules:
   * - Trims and lowercases before querying.
   * - Uses ILIKE for case-insensitive match (catches "Lal" vs "lal").
   * - Fails CLOSED: any DB error returns available=false to prevent false positives.
   * - currentUserId: pass the signed-in user's ID to allow re-use of their own handle
   *   (e.g. editing profile). Pass null for new signups.
   */
  const checkHandleAvailable = useCallback(async (handle, currentUserId = null) => {
    const trimmed = handle.trim().toLowerCase().replace(/^@/, "");

    console.log("[HANDLE_CHECK] ── checkHandleAvailable called ──────────────");
    console.log("[HANDLE_CHECK] raw input:", handle);
    console.log("[HANDLE_CHECK] normalised handle:", trimmed);
    console.log("[HANDLE_CHECK] currentUserId:", currentUserId);

    if (!trimmed || trimmed.length < 2) {
      console.log("[HANDLE_CHECK] REJECT — too short");
      return { available: false, error: "Handle must be at least 2 characters" };
    }

    if (!/^[a-z0-9_]+$/.test(trimmed)) {
      console.log("[HANDLE_CHECK] REJECT — invalid characters");
      return { available: false, error: "Only letters, numbers, and underscores allowed" };
    }

    try {
      // Use the check_handle_available RPC (SECURITY DEFINER) instead of a
      // direct table query. Direct queries against profiles fail silently for
      // unauthenticated users (signup page) because RLS blocks the read and
      // returns an empty array — falsely showing the handle as available.
      // The RPC bypasses RLS and returns a plain boolean.
      const { data, error } = await supabase.rpc("check_handle_available", {
        p_handle: trimmed,
        p_current_user_id: currentUserId || null,
      });

      console.log("[HANDLE_CHECK] RPC raw data (true=available):", data);
      console.log("[HANDLE_CHECK] RPC error:", error);

      // ── Fail CLOSED on any RPC error ─────────────────────────────────────
      if (error) {
        console.warn("[HANDLE_CHECK] RPC error — failing closed:", error.message);
        return { available: false, error: "Could not verify handle. Please try again." };
      }

      if (data === true) {
        console.log("[HANDLE_CHECK] AVAILABLE ✅");
        return { available: true, error: null };
      }

      console.log("[HANDLE_CHECK] TAKEN ❌");
      return { available: false, error: "Handle already taken" };
    } catch (e) {
      // ── Fail CLOSED on exception too ─────────────────────────────────────
      console.warn("[HANDLE_CHECK] Exception — failing closed:", e);
      return { available: false, error: "Could not verify handle. Please try again." };
    }
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
    completeOnboarding,
  };
}

export { ONBOARDING_STEPS };
