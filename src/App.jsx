import React from "react";
import { Routes, Route } from "react-router-dom";

// ✅ Safe imports – comment out if page not yet built
import Home from "./pages/Home";
import Revise from "./pages/Revise";
import Challenge from "./pages/Challenge";
import Friends from "./pages/Friends";
import Profile from "./pages/Profile";

// 🆕 Added: import for Pathway page
import Pathway from "./pages/Pathway";

import BottomNav from "./components/BottomNav";
import ScreenWrapper from "./components/ScreenWrapper";

export default function App() {
  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Routes>
        <Route
          path="/"
          element={
            <ScreenWrapper>
              <Home />
            </ScreenWrapper>
          }
        />
        <Route
          path="/revise"
          element={
            <ScreenWrapper>
              <Revise />
            </ScreenWrapper>
          }
        />
        <Route
          path="/challenge"
          element={
            <ScreenWrapper>
              <Challenge />
            </ScreenWrapper>
          }
        />
        <Route
          path="/friends"
          element={
            <ScreenWrapper>
              <Friends />
            </ScreenWrapper>
          }
        />
        <Route
          path="/profile"
          element={
            <ScreenWrapper>
              <Profile />
            </ScreenWrapper>
          }
        />

        {/* 🆕 NEW PATHWAY ROUTE */}
        <Route
          path="/pathway/:id"
          element={
            <ScreenWrapper>
              <Pathway />
            </ScreenWrapper>
          }
        />

        {/* fallback if unknown path */}
        <Route
          path="*"
          element={
            <ScreenWrapper>
              <Home />
            </ScreenWrapper>
          }
        />
      </Routes>

      <BottomNav />
    </div>
  );
}
