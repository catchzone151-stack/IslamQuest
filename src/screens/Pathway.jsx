import React, { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProgressStore } from "../store/progressStore";
import { useUserStore } from "../store/useUserStore";
import LessonNode from "../components/LessonNode";

// ✅ Mascots & avatars
import ZaydDefault from "../assets/mascots/mascot_zayd_default.webp";
import ZaydCheer from "../assets/mascots/mascot_zayd_cheer.webp";

export default function Pathway() {
  const navigate = useNavigate();
  const { pathId } = useParams();
  const scrollRef = useRef(null);

  const { paths, lessonStates } = useProgressStore();
  const { avatar } = useUserStore();

  const path = paths.find((p) => String(p.id) === String(pathId));
  const lessonList = require(`../data/lessons/namesOfAllah.json`);

  // Scroll to bottom when entering
  useEffect(() => {
    const el = scrollRef.current;
    if (el) setTimeout(() => (el.scrollTop = el.scrollHeight), 200);
  }, []);

  const handleLessonClick = (lesson) => {
    if (lesson.requiresPurchase) {
      alert("💰 This lesson unlocks with Full Access (coming soon).");
      return;
    }
    if (lesson.lockedUntil && !lessonStates[pathId]?.[lesson.lockedUntil]?.passed) {
      alert("🗝️ Finish your previous lesson first!");
      return;
    }
    navigate(`/path/${pathId}/lesson/${lesson.id}`);
  };

  return (
    <div
      ref={scrollRef}
      style={{
        minHeight: "100vh",
        overflowY: "auto",
        background: "linear-gradient(to top, #0a1428, #0e2340)",
        padding: "80px 0 160px",
        position: "relative",
      }}
    >
      {/* Trail line */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          width: 4,
          height: "100%",
          background: "linear-gradient(to top, rgba(255,215,0,0.15), rgba(255,215,0,0.4))",
          transform: "translateX(-50%)",
        }}
      />

      {/* Lessons */}
      <div
        style={{
          display: "flex",
          flexDirection: "column-reverse",
          alignItems: "center",
          gap: 80,
          position: "relative",
          zIndex: 2,
        }}
      >
        {lessonList.map((lesson, idx) => (
          <LessonNode
            key={lesson.id}
            lesson={lesson}
            onClick={() => handleLessonClick(lesson)}
            isCompleted={lessonStates[pathId]?.[lesson.id]?.passed}
            isLocked={
              (lesson.lockedUntil &&
                !lessonStates[pathId]?.[lesson.lockedUntil]?.passed) ||
              lesson.requiresPurchase
            }
            index={idx}
          />
        ))}

        {/* Motivational mascot every ~5 lessons */}
        <div style={{ textAlign: "center" }}>
          <img
            src={ZaydCheer}
            alt="Mascot cheer"
            style={{ width: 100, height: "auto", marginBottom: 8 }}
          />
          <p style={{ color: "gold", fontWeight: 600 }}>Keep climbing! 🌙</p>
        </div>

        {/* Bottom mascot */}
        <div style={{ textAlign: "center" }}>
          <img
            src={ZaydDefault}
            alt="Zayd mascot"
            style={{ width: 120, height: "auto", marginBottom: 8 }}
          />
          <p style={{ color: "#fff", fontWeight: 600 }}>
            {path?.title || "Learning Path"}
          </p>
        </div>
      </div>

      {/* User avatar on current node */}
      <img
        src={`/src/assets/avatars/${avatar || "avatar_lion.png"}`}
        alt="User avatar"
        style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          position: "fixed",
          bottom: 100,
          left: "50%",
          transform: "translateX(-50%)",
          boxShadow: "0 0 16px rgba(255,215,0,0.7)",
          animation: "avatarIdle 3s ease-in-out infinite",
        }}
      />

      <style>{`
        @keyframes avatarIdle {
          0% { transform: translate(-50%, 0px); }
          50% { transform: translate(-50%, -8px); }
          100% { transform: translate(-50%, 0px); }
        }
      `}</style>
    </div>
  );
}
