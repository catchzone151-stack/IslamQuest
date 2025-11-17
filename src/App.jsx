// src/App.jsx
import React, { useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ✅ Critical imports (loaded immediately)
import Home from "./pages/Home";
import BottomNav from "./components/BottomNav.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import ModalController from "./components/ModalController.jsx";
import { useUserStore } from "./store/useUserStore";
import { useProgressStore } from "./store/progressStore";

// ✅ Onboarding screens (loaded immediately for first-time users)
import BismillahScreen from "./onboarding/BismillahScreen.jsx";
import SalaamScreen from "./onboarding/SalaamScreen.jsx";
import NameScreen from "./onboarding/NameScreen.jsx";
import AvatarScreen from "./onboarding/AvatarScreen.jsx";

// 🚀 LAZY LOADED ROUTES - Split bundle for faster initial load
const Pathway = lazy(() => import("./screens/Pathway.jsx"));
const Lesson = lazy(() => import("./pages/Lesson.jsx"));
const Challenge = lazy(() => import("./pages/Challenge.jsx"));
const ChallengeGame = lazy(() => import("./pages/challenges/ChallengeGame.jsx"));
const DailyQuestGame = lazy(() => import("./pages/DailyQuestGame.jsx"));
const Friends = lazy(() => import("./pages/Friends.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const Revise = lazy(() => import("./pages/Revise.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const QuizScreen = lazy(() => import("./screens/QuizScreen.jsx"));
const GlobalEvents = lazy(() => import("./pages/GlobalEvents.jsx"));
const EventQuiz = lazy(() => import("./pages/EventQuiz.jsx"));
const LockDiagnostics = lazy(() => import("./pages/LockDiagnostics.jsx"));

// 🌙 Loading Component for lazy routes
function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 20% 20%, rgba(10,15,30,1) 0%, rgba(3,6,20,1) 70%)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <div
        style={{
          width: "50px",
          height: "50px",
          border: "4px solid rgba(212, 175, 55, 0.3)",
          borderTop: "4px solid #D4AF37",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <p style={{ color: "#D4AF37", fontSize: "1.1rem", fontWeight: 500 }}>Loading…</p>
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
      style={{
        minHeight: "100vh",
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

export default function App() {
  const { hasOnboarded, isHydrated } = useUserStore();
  const { grantCoins, coins } = useProgressStore();

  // 🛠️ DEV: Grant 5000 coins on first load (only in dev mode and after hydration)
  useEffect(() => {
    const isDev = import.meta.env.DEV;
    if (!isDev || !isHydrated) return;
    
    const hasGrantedDevCoins = localStorage.getItem('dev_coins_granted_v2');
    if (!hasGrantedDevCoins && coins < 100) {
      grantCoins(5000);
      localStorage.setItem('dev_coins_granted_v2', 'true');
    }
  }, [isHydrated, coins, grantCoins]);

  // ✅ Wait until Zustand store is rehydrated (prevents onboarding redirect)
  if (!isHydrated) {
    return (
      <div
        style={{
          minHeight: "100vh",
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
    <BrowserRouter>
      <ScrollToTop />
      <div
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(10,15,30,1) 0%, rgba(3,6,20,1) 70%)",
          minHeight: "100vh",
          color: "white",
          paddingBottom: "90px", // space for BottomNav
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
              {/* Fallback — always go to Bismillah if not onboarded */}
              <Route path="*" element={<BismillahScreen />} />
            </>
          ) : (
            <Suspense fallback={<LoadingScreen />}>
              {/* ✅ MAIN APP ROUTES - Lazy loaded for performance */}
              <Route path="/" element={<Home />} />
              <Route path="/path/:pathId" element={<Pathway />} />
              <Route path="/path/:pathId/lesson/:lessonId" element={<Lesson />} />
              <Route path="/path/:pathId/quiz/:lessonId" element={<QuizScreen />} />

              <Route path="/challenge" element={<Challenge />} />
              <Route path="/challenge/:challengeId" element={<ChallengeGame />} />
              <Route path="/daily-quest" element={<DailyQuestGame />} />
              <Route path="/events" element={<GlobalEvents />} />
              <Route path="/events/:eventId" element={<EventQuiz />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/revise" element={<Revise />} />
              <Route path="/login" element={<Login />} />
              <Route path="/diagnostics" element={<LockDiagnostics />} />

              {/* fallback */}
              <Route path="*" element={<Home />} />
            </Suspense>
          )}
        </Routes>
      </div>

      {/* ✅ Persistent bottom navigation */}
      {hasOnboarded && <BottomNav />}
      
      {/* 💎 Centralized Modal System */}
      <ModalController />
    </BrowserRouter>
  );
}
