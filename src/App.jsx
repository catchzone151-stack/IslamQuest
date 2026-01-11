// src/App.jsx
import React, { useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";

// ✅ Critical imports (loaded immediately)
import GlobalErrorBoundary from "./components/GlobalErrorBoundary.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import BottomNav from "./components/BottomNav.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import ModalController from "./components/ModalController.jsx";
import OfflineConnectionBanner from "./components/OfflineConnectionBanner.jsx";
import { ModalProvider, ModalRoot } from "./providers/ModalProvider.jsx";
import { ShimmerCard, ShimmerImage } from "./components/ShimmerLoader.jsx";
import { useUserStore } from "./store/useUserStore";
import { useProgressStore } from "./store/progressStore";
import { useDailyQuestStore } from "./store/dailyQuestStore";
import { preloadAllAssets } from "./utils/imagePreloader";
import { useModalStore, MODAL_TYPES } from "./store/modalStore";
import { supabase, ensureSignedIn } from "./lib/supabaseClient";
import { getDeviceFingerprint } from "./lib/deviceFingerprint";
import { syncOnAppOpen, syncOnForeground } from "./sync/engine.js";
import OneSignal from "onesignal-cordova-plugin";
import { createDailyLeaderboardSnapshot } from "./backend/leaderboardSnapshots";
import { initDeepLinkListener } from "./utils/deepLinkHandler";
import { initializeIAP, restorePurchases } from "./services/iapService";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";


// ✅ Onboarding screens (loaded immediately for first-time users)
import BismillahScreen from "./onboarding/BismillahScreen.jsx";
import SalaamScreen from "./onboarding/SalaamScreen.jsx";
import AuthChoiceScreen from "./onboarding/AuthChoiceScreen.jsx";
import NameHandleScreen from "./onboarding/NameHandleScreen.jsx";
import AvatarScreen from "./onboarding/AvatarScreen.jsx";
import HandleScreen from "./onboarding/HandleScreen.jsx";

// 🚀 LAZY LOADED ROUTES - Split bundle for proper hydration
const Home = lazy(() => import("./pages/Home"));
const Pathway = lazy(() => import("./screens/Pathway.jsx"));
const Lesson = lazy(() => import("./pages/Lesson.jsx"));
const Challenge = lazy(() => import("./pages/Challenge.jsx"));
const ChallengeGame = lazy(
  () => import("./pages/challenges/ChallengeGame.jsx"),
);
const FriendChallengeGame = lazy(
  () => import("./pages/challenges/FriendChallengeGame.jsx"),
);
const DailyQuestGame = lazy(() => import("./pages/DailyQuestGame.jsx"));
const Friends = lazy(() => import("./pages/Friends.jsx"));
const FriendProfile = lazy(() => import("./pages/FriendProfile"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const Settings = lazy(() => import("./pages/Settings.jsx"));
const Revise = lazy(() => import("./pages/Revise.jsx"));
const AuthPage = lazy(() => import("./pages/AuthPage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const SignUpPage = lazy(() => import("./pages/SignUpPage.jsx"));
const QuizScreen = lazy(() => import("./screens/QuizScreen.jsx"));
const GlobalEvents = lazy(() => import("./pages/GlobalEvents.jsx"));
const ResetPremium = lazy(() => import("./pages/ResetPremium.jsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.jsx"));
const Goodbye = lazy(() => import("./pages/Goodbye.jsx"));
const CheckEmailScreen = lazy(() => import("./pages/CheckEmailScreen.jsx"));

// 🌙 Loading Component for lazy routes
function LoadingScreen() {
  return (
    <div
      className="screen no-extra-space"
      style={{
        background:
          "radial-gradient(circle at 20% 20%, rgba(10,15,30,1) 0%, rgba(3,6,20,1) 70%)",
        color: "white",
        padding: "20px",
      }}
    >
      {/* Header Shimmer */}
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <ShimmerImage width="60px" height="60px" borderRadius="50%" />
          <div style={{ flex: 1 }}>
            <ShimmerCard
              style={{ marginBottom: "8px", height: "24px", width: "70%" }}
            />
            <ShimmerCard style={{ height: "16px", width: "50%" }} />
          </div>
        </div>

        {/* Content Cards Shimmer */}
        <ShimmerCard style={{ marginBottom: "16px" }} />
        <ShimmerCard style={{ marginBottom: "16px" }} />
        <ShimmerCard />

        {/* Loading Indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            marginTop: "40px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid rgba(212, 175, 55, 0.3)",
              borderTop: "3px solid #D4AF37",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ color: "#D4AF37", fontSize: "0.95rem", fontWeight: 500 }}>
            Loading…
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// 📱 DEEP LINK HANDLER - Handles auth callbacks from email links on native apps
function DeepLinkHandler() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const cleanup = initDeepLinkListener(navigate);
    return cleanup;
  }, [navigate]);
  
  return null;
}

// 🔄 Onboarding step redirector - resumes from saved step
function OnboardingRedirector() {
  const savedStep = localStorage.getItem("iq_onboarding_step");
  
  const hasName = localStorage.getItem("iq_name");
  const hasHandle = localStorage.getItem("iq_handle");
  
  if (hasName && hasHandle && !savedStep) {
    return <Navigate to="/login" replace />;
  }
  
  const stepRoutes = {
    bismillah: "/onboarding/bismillah",
    salaam: "/onboarding/salaam",
    authchoice: "/onboarding/auth-choice",
    login: "/login",
    signup: "/signup",
    namehandle: "/onboarding/namehandle",
    avatar: "/onboarding/avatar",
    handle: "/onboarding/handle",
    auth: "/login",
    checkemail: "/check-email",
  };
  
  const targetRoute = (savedStep && stepRoutes[savedStep]) 
    ? stepRoutes[savedStep] 
    : "/onboarding/bismillah";
  
  return <Navigate to={targetRoute} replace />;
}

// ✅ Optional: temporary placeholder for future quiz
function PlaceholderQuizPage() {
  return (
    <div
      className="screen no-extra-space"
      style={{
        background:
          "radial-gradient(circle at 20% 20%, rgba(10,15,30,1) 0%, rgba(3,6,20,1) 70%)",
        color: "white",
        padding: "16px",
      }}
    >
      <div
        style={{
          fontSize: "0.8rem",
          color: "#8b8b8b",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "8px",
        }}
      >
        Quiz (Coming Soon)
      </div>

      <div
        style={{
          fontSize: "1rem",
          fontWeight: 600,
          lineHeight: 1.4,
          background:
            "linear-gradient(90deg, #fff 0%, #fff6d2 40%, #ffd98a 100%)",
          WebkitBackgroundClip: "text",
          color: "transparent",
          marginBottom: "12px",
        }}
      >
        You'll answer questions from this lesson for XP and coins.
      </div>

      <div style={{ color: "#cfcfcf", fontSize: "0.9rem", lineHeight: 1.5 }}>
        You tapped “Take Quiz 🎯”. This will become a scored quiz in shā’ Allāh.
      </div>
    </div>
  );
}

// 🔄 PRODUCTION STORAGE VERSION
const PRODUCTION_VERSION = "iq_production_v1";

export default function App() {
  const { hasOnboarded, isHydrated } = useUserStore();
  const { grantCoins, coins } = useProgressStore();
  
  // Force re-render workaround for Zustand subscription issues in React StrictMode
  const [renderKey, setRenderKey] = React.useState(0);
  const [forceReady, setForceReady] = React.useState(false);
  
  React.useEffect(() => {
    // Subscribe to store changes and force re-render when hydration completes
    const unsubscribe = useUserStore.subscribe(
      (state) => {
        if (state.isHydrated && !isHydrated) {
          console.log("[App] Store hydrated, triggering re-render");
          setRenderKey(prev => prev + 1);
        }
      }
    );
    
    // Also check immediately in case we missed the update
    const currentState = useUserStore.getState();
    if (currentState.isHydrated && !isHydrated) {
      console.log("[App] Store already hydrated, triggering re-render");
      setRenderKey(prev => prev + 1);
    }
    
    // Fallback: Force ready after 5 seconds to prevent infinite loading
    const timeout = setTimeout(() => {
      const state = useUserStore.getState();
      if (!state.isHydrated) {
        console.warn("[App] Timeout: Forcing app ready after 5 seconds");
        useUserStore.setState({ 
          isHydrated: true, 
          loading: false,
          hasOnboarded: false,
          profileReady: false,
        });
        setForceReady(true);
      }
    }, 5000);
    
    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [isHydrated]);
  
  // Get the most current state directly from store to avoid stale closure issues
  const storeState = useUserStore.getState();
  const actualIsHydrated = isHydrated || storeState.isHydrated || forceReady;
  const actualHasOnboarded = storeState.hasOnboarded;

  // 🔄 VERSIONED STORAGE RESET: Clear all legacy data on first production load
  // IMPORTANT: Uses module-level flag to prevent reload loops from React StrictMode
  useEffect(() => {
    // Prevent double-run from React StrictMode
    if (window.__iq_migration_running || window.__iq_migration_complete) {
      console.log("⏭️ Skipping storage migration (already processed this session)");
      return;
    }
    window.__iq_migration_running = true;

    if (window.__iq_migration_failed) {
      console.warn("⚠️ Skipping storage migration (storage unavailable)");
      window.__iq_migration_running = false;
      return;
    }

    // Capability probe: check if localStorage is available
    const isStorageAvailable = () => {
      try {
        const testKey = "__iq_storage_test__";
        localStorage.setItem(testKey, "1");
        localStorage.removeItem(testKey);
        return true;
      } catch (e) {
        console.error("localStorage not available:", e);
        window.__iq_migration_failed = true;
        return false;
      }
    };

    if (!isStorageAvailable()) {
      console.warn(
        "⚠️ Storage migration skipped: localStorage unavailable (private mode?)",
      );
      window.__iq_migration_running = false;
      return;
    }

    try {
      // Skip migration if it previously failed (persist across sessions)
      const migrationFailed = localStorage.getItem("iq_migration_failed");
      if (migrationFailed === "true") {
        console.warn("⚠️ Skipping storage migration (previous failure)");
        window.__iq_migration_complete = true;
        window.__iq_migration_running = false;
        return;
      }

      const currentVersion = localStorage.getItem("app_storage_version");

      if (currentVersion !== PRODUCTION_VERSION) {
        console.log("🔄 Production migration: Clearing all legacy data...");

        let allKeysRemoved = true;

        // Get all localStorage keys
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          // Keep only the new production namespace
          if (
            key &&
            !key.startsWith(PRODUCTION_VERSION) &&
            key !== "app_storage_version"
          ) {
            keysToRemove.push(key);
          }
        }

        // Clear legacy keys
        keysToRemove.forEach((key) => {
          try {
            localStorage.removeItem(key);
          } catch (e) {
            console.warn(`Failed to remove key: ${key}`, e);
            allKeysRemoved = false;
          }
        });

        // Clear sessionStorage completely
        try {
          sessionStorage.clear();
        } catch (e) {
          console.warn("Failed to clear sessionStorage", e);
          allKeysRemoved = false;
        }

        // Set new version marker
        try {
          localStorage.setItem("app_storage_version", PRODUCTION_VERSION);
        } catch (e) {
          console.error("Failed to set version marker", e);
          allKeysRemoved = false;
        }

        // Only reload if storage operations succeeded AND not in dev mode reload loop
        if (allKeysRemoved) {
          console.log(
            "✅ Production migration complete. App will start fresh.",
          );
          window.__iq_migration_complete = true;
          // Use a short delay to ensure state is saved before reload
          setTimeout(() => {
            window.location.reload();
          }, 100);
          return;
        } else {
          console.warn(
            "⚠️ Storage migration partially failed. Continuing with current state.",
          );
          // Mark migration as failed to prevent infinite retry loops
          try {
            localStorage.setItem("iq_migration_failed", "true");
          } catch (e) {
            console.error("Cannot persist migration failure flag", e);
          }
        }
      } else {
        console.log("✅ Storage version matches, no migration needed");
      }

      window.__iq_migration_complete = true;
      window.__iq_migration_running = false;
    } catch (error) {
      // Fallback for private mode or localStorage errors
      console.error("Storage reset failed:", error);
      try {
        localStorage.setItem("iq_migration_failed", "true");
      } catch (e) {
        // Silently fail - app will continue with defaults
      }
      window.__iq_migration_complete = true;
      window.__iq_migration_running = false;
      // Continue app initialization with default state (no reload)
    }
  }, []);

  // 🔐 SUPABASE: Silent auth + profile check + email confirmation + cloud sync
  // SEQUENCE: deviceId → auth check → email confirmation check → profile check → onboarding OR load stores
  // IMPORTANT: Uses module-level flag to prevent double-init from React StrictMode
  useEffect(() => {
    // Prevent double-run from React StrictMode
    // BUT: If store is not hydrated, we must run init even if flags are set (HMR recovery)
    const storeState = useUserStore.getState();
    if ((window.__iq_auth_init_running || window.__iq_auth_init_complete) && storeState.isHydrated) {
      console.log("⏭️ Skipping auth init (already processed this session)");
      return;
    }
    window.__iq_auth_init_running = true;

    async function initAuth() {
      try {
        const { setDeviceId } = useUserStore.getState();

        const fp = getDeviceFingerprint();
        setDeviceId(fp);

        // Check if we're on the check-email page with auth tokens - let that page handle auth
        const currentPath = window.location.pathname;
        const hasAuthTokens = window.location.hash.includes('access_token') || 
                              window.location.search.includes('code=');
        
        if (currentPath === '/check-email' && hasAuthTokens) {
          console.log("[App] Auth tokens detected on check-email page, deferring to that handler");
          window.__iq_auth_init_complete = true;
          window.__iq_auth_init_running = false;
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          if (!session.user.email_confirmed_at && !session.user.email?.includes('@iq-hidden-')) {
            console.log("User logged in but email not confirmed → check-email");
            localStorage.setItem("iq_onboarding_step", "checkemail");
            useUserStore.setState({ 
              user: session.user, 
              userId: session.user.id,
              loading: false, 
              isHydrated: true, 
              profileReady: false,
              hasOnboarded: false,
            });
            window.__iq_auth_init_complete = true;
            window.__iq_auth_init_running = false;
            return;
          }
        }

        await useUserStore.getState().init();

        const { user, profileReady, handle, hasOnboarded } = useUserStore.getState();
        
        if (!user) {
          console.warn("No user after init");
          window.__iq_auth_init_complete = true;
          window.__iq_auth_init_running = false;
          return;
        }

        console.log("🔐 Signed in as", user.id);

        if (profileReady && hasOnboarded && !handle) {
          console.error("🚨 CRITICAL: User marked as onboarded but missing handle - forcing handle screen");
          localStorage.setItem("iq_onboarding_step", "handle");
          useUserStore.setState({ 
            profileReady: false,
            hasOnboarded: false,
          });
          window.__iq_auth_init_complete = true;
          window.__iq_auth_init_running = false;
          return;
        }

        if (profileReady) {
          await useUserStore.getState().syncUserProfile();
          await useDailyQuestStore.getState().loadDailyQuestFromCloud(user.id);
          await useProgressStore.getState().loadStreakShieldFromCloud();
          console.log("✅ Cloud sync completed");
        }

        window.__iq_auth_init_complete = true;
        window.__iq_auth_init_running = false;
      } catch (error) {
        console.error("initAuth error:", error);
        window.__iq_auth_init_complete = true;
        window.__iq_auth_init_running = false;
      }
    }

    initAuth();
  }, []);

  // 🚀 PERFORMANCE: Preload ALL assets and route modules IMMEDIATELY for instant Duolingo-style loading
  useEffect(() => {
    // Preload ALL images instantly (mascots, avatars, UI icons, everything)
    preloadAllAssets();

    // Eagerly preload ALL route modules to avoid suspension on any navigation
    Promise.all([
      import("./pages/Home"),
      import("./screens/Pathway.jsx"),
      import("./pages/Lesson.jsx"),
      import("./screens/QuizScreen.jsx"),
      import("./pages/Challenge.jsx"),
      import("./pages/challenges/ChallengeGame.jsx"),
      import("./pages/DailyQuestGame.jsx"),
      import("./pages/GlobalEvents.jsx"),
      import("./pages/Friends.jsx"),
      import("./pages/Profile.jsx"),
      import("./pages/Settings.jsx"),
      import("./pages/Revise.jsx"),
      import("./pages/AuthPage.jsx"),
    ]);
  }, []);

  // 🔙 ANDROID BACK BUTTON: Exit app on Home screen, normal navigation elsewhere
  useEffect(() => {
    const handleBackButton = (event) => {
      const currentPath = window.location.pathname;
      
      // Only intercept back button on home page - exit app directly
      const isHomePage = currentPath === "/" || currentPath === "/home";
      
      if (!isHomePage) {
        // Let all other pages navigate normally
        return;
      }
      
      // On Home screen: exit app immediately (no modal)
      event.preventDefault();
      
      if (Capacitor.isNativePlatform()) {
        // Use Capacitor to minimize/exit the app
        CapacitorApp.minimizeApp();
      } else {
        // Web fallback: just go back in history
        window.history.back();
      }
    };

    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []);
  
  // 🔄 SYNC ENGINE LIFECYCLE HOOKS
  useEffect(() => {
    // Sync on app open
    syncOnAppOpen();
    
    // Initialize IAP on app launch (triggers silentAutoRestore)
    initializeIAP().then((result) => {
      console.log("[App] IAP initialization result:", JSON.stringify(result));
      
      // Auto-restore on native platforms (Android/iOS) for reinstall scenarios
      if (Capacitor.isNativePlatform()) {
        console.log("[App] Native platform detected - triggering auto-restore");
        restorePurchases().then((restoreResult) => {
          console.log("[App] Auto-restore result:", JSON.stringify(restoreResult));
        }).catch((err) => {
          console.log("[App] Auto-restore failed (non-fatal):", err.message);
        });
      }
    }).catch((err) => {
      console.log("[App] IAP initialization failed (non-fatal):", err.message);
    });

    // Sync when app/tab regains focus
    const handleFocus = () => {
      syncOnForeground();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // 📊 DAILY LEADERBOARD SNAPSHOT (once per day)
  useEffect(() => {
    const runDailySnapshot = async () => {
      const lastRun = localStorage.getItem("last_snapshot_run");
      const today = new Date().toDateString();

      if (lastRun !== today) {
        await createDailyLeaderboardSnapshot();
        localStorage.setItem("last_snapshot_run", today);
      }
    };

    runDailySnapshot();
  }, []);

  // 📍 APP OPEN TRACKING (for push notification filtering)
  // Updates profiles.updated_at to track last app open time
  // This ensures daily notifications are only sent to users who haven't opened today
  useEffect(() => {
    const updateProfileTimestamp = async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) return;

        // Update profiles.updated_at to mark app open time
        await supabase
          .from("profiles")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", auth.user.id);

        console.log("📍 App open tracked (profiles.updated_at updated)");
      } catch (err) {
        // Silent fail - not critical
        console.warn("Could not update profiles.updated_at:", err.message);
      }
    };

    if (actualHasOnboarded) {
      updateProfileTimestamp();
    }
  }, [actualHasOnboarded]);

  // 🔔 ONESIGNAL: Initialize on startup, request permission when app becomes active
  // Runs unconditionally on native platforms (Android/iOS)
  // App ID is hardcoded to ensure it's bundled into the Android APK
  const ONESIGNAL_APP_ID = "8540fbcb-05eb-411b-bc60-857801e4b099";
  
  useEffect(() => {
    const platform = Capacitor.getPlatform();
    const isNative = platform === "android" || platform === "ios";

    console.log("🔔 [OS-DEBUG] Platform check:", platform, "isNative:", isNative);

    if (!isNative) {
      console.log("🔔 [OS-DEBUG] Web platform - skipping OneSignal native init");
      return;
    }

    console.log("🔔 [OS-DEBUG] Initializing OneSignal with App ID:", ONESIGNAL_APP_ID);

    try {
      // Initialize OneSignal immediately on native
      OneSignal.initialize(ONESIGNAL_APP_ID);
      console.log("🔔 [OS-DEBUG] OneSignal.initialize() called successfully");
    } catch (initErr) {
      console.error("🔔 [OS-DEBUG] OneSignal.initialize() FAILED:", initErr);
    }

    // Log full OneSignal state after a delay
    setTimeout(async () => {
      try {
        const subId = OneSignal.User?.pushSubscription?.id || null;
        const optedIn = OneSignal.User?.pushSubscription?.optedIn || false;
        const token = OneSignal.User?.pushSubscription?.token || null;
        console.log("🔔 [OS-DEBUG] State after 2s - subscriptionId:", subId, "optedIn:", optedIn, "token:", token);
      } catch (stateErr) {
        console.error("🔔 [OS-DEBUG] Failed to read OneSignal state:", stateErr);
      }
    }, 2000);

    // Track if permission has been requested to ensure it only runs once
    let permissionRequested = false;

    // Request permission when app becomes active
    const requestPermissionOnActive = async (state) => {
      if (state.isActive && !permissionRequested) {
        permissionRequested = true;
        console.log("🔔 [OS-DEBUG] App active, requesting notification permission...");
        try {
          const permissionGranted = await OneSignal.Notifications.requestPermission(true);
          console.log("🔔 [OS-DEBUG] Permission result:", permissionGranted);
          
          // Log state immediately after permission
          const subIdAfter = OneSignal.User?.pushSubscription?.id || null;
          console.log("🔔 [OS-DEBUG] After permission - subscriptionId:", subIdAfter);
        } catch (err) {
          console.error("🔔 [OS-DEBUG] Permission request FAILED:", err.message, err);
        }
      }
    };

    // Listen for app state changes
    const listenerPromise = CapacitorApp.addListener('appStateChange', requestPermissionOnActive);

    // Also request immediately in case app is already active
    requestPermissionOnActive({ isActive: true });

    return () => {
      listenerPromise.then(listener => listener.remove());
    };
  }, []);

  // 🔔 ONESIGNAL: Login user and save token after authentication
  // Triggered by Supabase auth state changes (not Zustand hydration)
  useEffect(() => {
    const loginOneSignalUser = async () => {
      console.log("🔔 [OS-DEBUG] loginOneSignalUser() starting...");
      const platform = Capacitor.getPlatform();
      const isNative = platform === "android" || platform === "ios";

      console.log("🔔 [OS-DEBUG] Login check - platform:", platform, "isNative:", isNative);

      if (!isNative) {
        console.log("🔔 [OS-DEBUG] Not native, skipping OneSignal login");
        return;
      }

      try {
        const { data: auth } = await supabase.auth.getUser();
        console.log("🔔 [OS-DEBUG] Auth check - user:", auth?.user?.id || "none");
        
        if (!auth?.user) {
          console.log("🔔 [OS-DEBUG] No authenticated user, skipping OneSignal login");
          return;
        }

        // Wait for subscription to be ready before login
        let subscriptionId = OneSignal.User?.pushSubscription?.id || null;
        console.log("🔔 [OS-DEBUG] Initial subscriptionId:", subscriptionId);

        if (!subscriptionId) {
          console.log("🔔 [OS-DEBUG] Subscription not ready, waiting 1s for retry...");
          await new Promise(resolve => setTimeout(resolve, 1000));
          subscriptionId = OneSignal.User?.pushSubscription?.id || null;
          console.log("🔔 [OS-DEBUG] After retry - subscriptionId:", subscriptionId);
        }

        if (!subscriptionId) {
          console.log("🔔 [OS-DEBUG] Subscription not ready, login skipped");
          return;
        }

        // Login user to OneSignal (links device to user ID)
        console.log("🔔 [OS-DEBUG] Calling OneSignal.login() with userId:", auth.user.id);
        try {
          OneSignal.login(auth.user.id);
          console.log("🔔 [OS-DEBUG] OneSignal login applied to subscription");
        } catch (loginErr) {
          console.error("🔔 [OS-DEBUG] OneSignal.login() FAILED:", loginErr);
        }
      } catch (err) {
        console.error("🔔 [OS-DEBUG] loginOneSignalUser() EXCEPTION:", err.message, err);
      }
    };

    // Listen to Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        console.log("🔔 [OS-DEBUG] Auth state triggered OneSignal login");
        loginOneSignalUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ✅ Wait until Zustand store is rehydrated (prevents onboarding redirect)
  if (!actualIsHydrated) {
    return (
      <div
        className="screen no-extra-space"
        style={{
          background: "radial-gradient(circle at 20% 20%, #0a0f1e, #030614)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>Loading your progress… 🌙</p>
      </div>
    );
  }

  return (
    <GlobalErrorBoundary>
      <ErrorBoundary>
        <OfflineConnectionBanner />
        <ModalProvider>
        <BrowserRouter>
          <DeepLinkHandler />
          <ScrollToTop />
          <div
            className="screen no-extra-space app-root-container"
            style={{
              background:
                "radial-gradient(circle at 20% 20%, rgba(10,15,30,1) 0%, rgba(3,6,20,1) 70%)",
              color: "white",
            }}
          >
            <Routes>
              {!actualHasOnboarded ? (
                <>
                  {/* ✅ ONBOARDING FLOW: Bismillah → Salaam → AuthChoice → (Login OR SignUp) → CheckEmail → Home */}
                  <Route
                    path="/onboarding/bismillah"
                    element={<BismillahScreen />}
                  />
                  <Route path="/onboarding/salaam" element={<SalaamScreen />} />
                  <Route path="/onboarding/auth-choice" element={<AuthChoiceScreen />} />
                  {/* Legacy routes (for resume support) */}
                  <Route path="/onboarding/namehandle" element={<NameHandleScreen />} />
                  <Route path="/onboarding/avatar" element={<AvatarScreen />} />
                  <Route path="/onboarding/handle" element={<HandleScreen />} />
                  {/* Login page */}
                  <Route
                    path="/login"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <LoginPage />
                      </Suspense>
                    }
                  />
                  {/* Sign up page */}
                  <Route
                    path="/signup"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <SignUpPage />
                      </Suspense>
                    }
                  />
                  {/* Legacy auth page (redirect to login) */}
                  <Route
                    path="/auth"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <LoginPage />
                      </Suspense>
                    }
                  />
                  {/* Check email confirmation screen */}
                  <Route
                    path="/check-email"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <CheckEmailScreen />
                      </Suspense>
                    }
                  />
                  {/* Reset password route available during onboarding */}
                  <Route
                    path="/reset-password"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <ResetPassword />
                      </Suspense>
                    }
                  />
                  {/* Goodbye screen after account deletion */}
                  <Route
                    path="/goodbye"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <Goodbye />
                      </Suspense>
                    }
                  />
                  {/* Fallback — resume from saved step or start from bismillah */}
                  <Route path="*" element={<OnboardingRedirector />} />
                </>
              ) : (
                <>
                  {/* ✅ MAIN APP ROUTES - Lazy loaded for proper hydration */}
                  <Route
                    path="/"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <Home />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/path/:pathId"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <Pathway />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/path/:pathId/lesson/:lessonId"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <Lesson />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/path/:pathId/quiz/:lessonId"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <QuizScreen />
                      </Suspense>
                    }
                  />

                  <Route
                    path="/challenge"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <Challenge />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/challenge/:challengeId"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <ChallengeGame />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/challenge/friend/:challengeId"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <FriendChallengeGame />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/daily-quest"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <DailyQuestGame />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/events"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <GlobalEvents />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/friends"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <Friends />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/friend/:userId"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <FriendProfile />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <Profile />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <Settings />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/revise"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <Revise />
                      </Suspense>
                    }
                  />
                  {/* /auth redirects to login for backward compatibility */}
                  <Route
                    path="/auth"
                    element={<Navigate to="/" replace />}
                  />
                  <Route
                    path="/reset-premium"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <ResetPremium />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/reset-password"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <ResetPassword />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/goodbye"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <Goodbye />
                      </Suspense>
                    }
                  />

                  {/* fallback */}
                  <Route
                    path="*"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <Home />
                      </Suspense>
                    }
                  />
                </>
              )}
            </Routes>
          </div>

          {/* ✅ Persistent bottom navigation */}
          {actualHasOnboarded && <BottomNav />}

          {/* 💎 Centralized Modal System */}
          <ModalController />

          {/* 🚪 Portal root for heavy modals */}
          <ModalRoot />
        </BrowserRouter>
      </ModalProvider>
      </ErrorBoundary>
    </GlobalErrorBoundary>
  );
}
