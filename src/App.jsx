// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ✅ Import main pages
import Home from "./pages/Home";
import Pathway from "./screens/Pathway.jsx";
import Lesson from "./pages/Lesson.jsx";
import Challenge from "./pages/Challenge.jsx";
import DailyChallenge from "./pages/DailyChallenge.jsx";
import Friends from "./pages/Friends.jsx";
import Profile from "./pages/Profile.jsx";
import Revise from "./pages/Revise.jsx";
import Login from "./pages/Login.jsx";
import QuizScreen from "./screens/QuizScreen.jsx";
import GlobalEvents from "./pages/GlobalEvents.jsx";
import EventQuiz from "./pages/EventQuiz.jsx";

// ✅ Components & stores
import BottomNav from "./components/BottomNav.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import { useUserStore } from "./store/useUserStore";
import { useProgressStore } from "./store/progressStore";
import { ZaydLevelUpPopup } from "./components/ZaydLevelUpPopup";

// ✅ Onboarding screens
import BismillahScreen from "./onboarding/BismillahScreen.jsx";
import SalaamScreen from "./onboarding/SalaamScreen.jsx";
import NameScreen from "./onboarding/NameScreen.jsx";
import AvatarScreen from "./onboarding/AvatarScreen.jsx";

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
  const { showLevelUpModal, levelUpData, closeLevelUpModal } = useProgressStore();

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
            <>
              {/* ✅ MAIN APP ROUTES */}
              <Route path="/" element={<Home />} />
              <Route path="/path/:pathId" element={<Pathway />} />
              <Route path="/path/:pathId/lesson/:lessonId" element={<Lesson />} />
              <Route path="/path/:pathId/quiz/:lessonId" element={<QuizScreen />} />

              <Route path="/challenge" element={<Challenge />} />
              <Route path="/daily" element={<DailyChallenge />} />
              <Route path="/events" element={<GlobalEvents />} />
              <Route path="/events/:eventId" element={<EventQuiz />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/revise" element={<Revise />} />
              <Route path="/login" element={<Login />} />

              {/* fallback */}
              <Route path="*" element={<Home />} />
            </>
          )}
        </Routes>
      </div>

      {/* ✅ Persistent bottom navigation */}
      {hasOnboarded && <BottomNav />}
      
      {/* 💎 Global Level-Up Modal */}
      {showLevelUpModal && levelUpData && (
        <ZaydLevelUpPopup
          levelUpData={levelUpData}
          onClose={closeLevelUpModal}
        />
      )}
    </BrowserRouter>
  );
}
