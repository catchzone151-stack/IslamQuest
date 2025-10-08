console.log("✅ App loaded");
import { Routes, Route } from "react-router-dom";

// Pages (ensure these files exist; stubs are fine for now)
import Home from "./pages/Home";
import PathPage from "./pages/PathPage"; // shows a single learning path’s lessons
import Challenge from "./pages/Challenge"; // daily challenge page
import Friends from "./pages/Friends"; // friends list / leaderboards
import Profile from "./pages/Profile"; // profile + login entry point
import Revise from "./pages/Revise"; // NEW: rename old Learn.jsx -> Revise.jsx

// Global UI
import BottomNav from "./components/BottomNav";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Revise hub + specific path */}
        <Route path="/revise" element={<Revise />} />
        <Route path="/revise/:id" element={<PathPage />} />

        {/* Daily challenge */}
        <Route path="/challenge" element={<Challenge />} />

        {/* Social */}
        <Route path="/friends" element={<Friends />} />

        {/* Profile */}
        <Route path="/profile" element={<Profile />} />

        {/* Back-compat redirects (optional): if you had /learn or /daily-challenge before */}
        {/* You can remove these once you’ve updated old links */}
        {/* <Route path="/learn" element={<Revise />} />
        <Route path="/learn/:id" element={<PathPage />} />
        <Route path="/daily-challenge" element={<Challenge />} /> */}
      </Routes>

      {/* Persistent bottom navigation on all pages */}
      <BottomNav />
    </>
  );
}
