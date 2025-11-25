// src/App.jsx
import React, { useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ✅ Critical imports (loaded immediately)
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
import { ensureProfile } from "./lib/userProfile";
import { getDeviceFingerprint } from "./lib/deviceFingerprint";

// ✅ Onboarding screens (loaded immediately for first-time users)
import BismillahScreen from "./onboarding/BismillahScreen.jsx";
import SalaamScreen from "./onboarding/SalaamScreen.jsx";
import NameScreen from "./onboarding/NameScreen.jsx";
import AvatarScreen from "./onboarding/AvatarScreen.jsx";
import UsernameScreen from "./onboarding/UsernameScreen.jsx";

// 🚀 LAZY LOADED ROUTES - Split bundle for proper hydration
const Home = lazy(() => import("./pages/Home"));
const Pathway = lazy(() => import("./screens/Pathway.jsx"));
const Lesson = lazy(() => import("./pages/Lesson.jsx"));
const Challenge = lazy(() => import("./pages/Challenge.jsx"));
const ChallengeGame = lazy(
  () => import("./pages/challenges/ChallengeGame.jsx"),
);
const DailyQuestGame = lazy(() => import("./pages/DailyQuestGame.jsx"));
const Friends = lazy(() => import("./pages/Friends.jsx"));
const FriendProfile = lazy(() => import("./pages/FriendProfile"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const Premium = lazy(() => import("./pages/Premium.jsx"));
const Settings = lazy(() => import("./pages/Settings.jsx"));
const Revise = lazy(() => import("./pages/Revise.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const QuizScreen = lazy(() => import("./screens/QuizScreen.jsx"));
const GlobalEvents = lazy(() => import("./pages/GlobalEvents.jsx"));
const ResetPremium = lazy(() => import("./pages/ResetPremium.jsx"));

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

  // 🔄 VERSIONED STORAGE RESET: Clear all legacy data on first production load
  useEffect(() => {
    // Module-level flag for storage failure (survives even when localStorage fails)
    if (!window.__iq_storage_available_checked) {
      window.__iq_storage_available_checked = false;
    }
    if (window.__iq_migration_failed) {
      console.warn("⚠️ Skipping storage migration (storage unavailable)");
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
      return;
    }

    try {
      // Skip migration if it previously failed (persist across sessions)
      const migrationFailed = localStorage.getItem("iq_migration_failed");
      if (migrationFailed === "true") {
        console.warn("⚠️ Skipping storage migration (previous failure)");
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

        // Only reload if storage operations succeeded
        if (allKeysRemoved) {
          console.log(
            "✅ Production migration complete. App will start fresh.",
          );
          window.location.reload();
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
      }
    } catch (error) {
      // Fallback for private mode or localStorage errors
      console.error("Storage reset failed:", error);
      try {
        localStorage.setItem("iq_migration_failed", "true");
      } catch (e) {
        // Silently fail - app will continue with defaults
      }
      // Continue app initialization with default state (no reload)
    }
  }, []);

  // 🔐 SUPABASE: Silent auth + profile creation + Phase 4 cloud sync
  useEffect(() => {
    async function initAuth() {
      const { setUserId, setDeviceId } = useUserStore.getState();

      const fp = getDeviceFingerprint();
      setDeviceId(fp);

      try {
        const user = await ensureSignedIn();
        if (user) {
          console.log("🔐 Signed in as", user.id);
          setUserId(user.id);

          // 🔹 CREATE PROFILE ROW IF MISSING
          console.log("👤 Calling ensureProfile for", user.id, fp);
          await ensureProfile(user.id, fp);

          // Initialize user store (will load profile)
          await useUserStore.getState().init();

          // 🌐 Phase 4: Load cloud data after silent auth
          await useDailyQuestStore.getState().loadDailyQuestFromCloud(user.id);
          await useProgressStore.getState().loadStreakShieldFromCloud();

          console.log("✅ Phase 4: Cloud sync completed after silent auth");
        } else {
          console.warn("No user returned from ensureSignedIn");
          await useUserStore.getState().init();
        }
      } catch (err) {
        console.error("initAuth failed:", err);
        try {
          await useUserStore.getState().init();
        } catch (e) {
          console.error("Store init also failed:", e);
        }
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
      import("./pages/Login.jsx"),
    ]);
  }, []);

  // 🔙 GLOBAL BACK BUTTON HANDLER: Intercept physical phone back button
  useEffect(() => {
    const { showModal } = useModalStore.getState();

    // Push initial state when app loads (creates back history entry)
    window.history.pushState({ isAppEntry: true }, "", window.location.href);

    const handleBackButton = (event) => {
      // Prevent default browser back behavior
      event.preventDefault();

      // Push another state to prevent actual navigation
      window.history.pushState({ isAppEntry: true }, "", window.location.href);

      // Show custom exit confirmation modal
      showModal(MODAL_TYPES.EXIT_CONFIRMATION, {
        onConfirm: () => {
          // User confirmed - actually exit the app
          // For web apps, this will go back or close if opened as PWA
          window.history.go(-2); // Go back twice (past our dummy states)
        },
        // onCancel is handled by hideModal in ModalController (stays in app)
      });
    };

    // Listen for popstate (back button press)
    window.addEventListener("popstate", handleBackButton);

    // Cleanup
    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []);

  // ✅ Wait until Zustand store is rehydrated (prevents onboarding redirect)
  if (!isHydrated) {
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
    <ErrorBoundary>
      <OfflineConnectionBanner />
      <ModalProvider>
        <BrowserRouter>
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
              {!hasOnboarded ? (
                <>
                  {/* ✅ ONBOARDING FLOW */}
                  <Route
                    path="/onboarding/bismillah"
                    element={<BismillahScreen />}
                  />
                  <Route path="/onboarding/salaam" element={<SalaamScreen />} />
                  <Route path="/onboarding/name" element={<NameScreen />} />
                  <Route path="/onboarding/avatar" element={<AvatarScreen />} />
                  <Route
                    path="/onboarding/username"
                    element={<UsernameScreen />}
                  />
                  {/* Login route available during onboarding */}
                  <Route
                    path="/login"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <Login />
                      </Suspense>
                    }
                  />
                  {/* Fallback — always go to Bismillah if not onboarded */}
                  <Route path="*" element={<BismillahScreen />} />
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
                    path="/premium"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <Premium />
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
                  <Route
                    path="/login"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <Login />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/reset-premium"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <ResetPremium />
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
          {hasOnboarded && <BottomNav />}

          {/* 💎 Centralized Modal System */}
          <ModalController />

          {/* 🚪 Portal root for heavy modals */}
          <ModalRoot />
        </BrowserRouter>
      </ModalProvider>
    </ErrorBoundary>
  );
}
