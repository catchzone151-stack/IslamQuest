import React, { useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProgressStore } from "../store/progressStore";
import { useUserStore } from "../store/useUserStore";

// Lesson data loader
import { getLessonsForPath } from "../data/lessonLoader.js";

// Mascot (book / study)
import ZaydStudy from "../assets/mascots/mascot_zayd_reading.webp";

export default function Pathway() {
  const { pathId } = useParams();
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const numericPathId = Number(pathId);

  const { paths, lessonStates } = useProgressStore();
  const { avatar } = useUserStore();

  const pathMeta = useMemo(
    () => paths.find((p) => p.id === numericPathId),
    [paths, numericPathId]
  );

  const baseLessons = useMemo(() => {
    return getLessonsForPath(numericPathId);
  }, [numericPathId]);

  // Fallback if path/lessons not wired yet
  if (!pathMeta || baseLessons.length === 0) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(to bottom, #061326, #000814 80%)",
          color: "white",
          padding: "32px 20px",
          textAlign: "center",
        }}
      >
        <button onClick={() => navigate("/")} style={backButtonStyle}>
          ← Back
        </button>
        <h2 style={{ marginTop: 24, fontSize: "1.2rem", color: "#ffd85a" }}>
          Path not ready yet
        </h2>
      </div>
    );
  }

  // Build lesson states (completed / locked)
  const pathLessonState = lessonStates?.[numericPathId] || {};
  const lessons = baseLessons.map((lesson) => {
    const isCompleted = !!pathLessonState[lesson.id]?.passed;
    const needs = lesson.lockedUntil;
    const isLockedSequential =
      needs !== null && needs !== undefined && !pathLessonState[needs]?.passed;
    const isLockedPurchase = !!lesson.requiresPurchase;
    const isLocked = isLockedSequential || isLockedPurchase;

    return { ...lesson, isCompleted, isLocked };
  });

  // Active node = first not completed & not locked
  let activeIndex = lessons.findIndex((l) => !l.isCompleted && !l.isLocked);
  if (activeIndex === -1) activeIndex = lessons.length - 1;

  const completedCount = lessons.filter((l) => l.isCompleted).length;
  const totalLessons = lessons.length;

  // Always start view at top when entering
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handle = setTimeout(() => {
      el.scrollTop = 0;
    }, 200);
    return () => clearTimeout(handle);
  }, [numericPathId, totalLessons]);

  const handleLessonClick = (lesson) => {
    if (lesson.isLocked) return;
    navigate(`/path/${pathId}/lesson/${lesson.id}`);
  };

  const avatarSrc = avatar && avatar !== "default" ? avatar : null;

  // --- Layout constants for perfect alignment ---
  const NODE_SIZE = 70;
  const FIRST_NODE_TOP = 20;
  const NODE_SPACING = 120;

  const lineTop = FIRST_NODE_TOP + NODE_SIZE / 2;
  const lineBottom =
    FIRST_NODE_TOP + NODE_SPACING * Math.max(lessons.length - 1, 0) + NODE_SIZE / 2;
  const lineHeight = Math.max(lineBottom - lineTop, 0);
  const containerHeight =
    FIRST_NODE_TOP + NODE_SPACING * Math.max(lessons.length - 1, 0) + NODE_SIZE + 80;

  return (
    <div
      ref={scrollRef}
      style={{
        minHeight: "100vh",
        maxHeight: "100vh",
        overflowY: "auto",
        background: "radial-gradient(circle at top, #0f2344 0%, #020815 70%)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 16px 120px",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          marginTop: 20,
          marginBottom: 16,
          lineHeight: 1.3,
        }}
      >
        <h2
          style={{
            fontSize: "1.45rem",
            fontWeight: 700,
            background:
              "linear-gradient(90deg,#fff6d2 0%,#ffd85a 50%,#ffe99a 100%)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            marginBottom: 6,
          }}
        >
          {pathMeta.title}
        </h2>
        <div style={{ fontSize: "0.85rem", color: "#d0d4e4" }}>
          {completedCount} of {totalLessons} lessons completed
        </div>
      </div>

      {/* Mascot + message */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: "max(5%, calc(50% - 210px))",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        <img
          src={ZaydStudy}
          alt="Zayd studying"
          style={{
            width: 70,
            height: "auto",
            filter: "drop-shadow(0 0 8px rgba(255,215,0,0.6))",
          }}
        />
        <div
          style={{
            maxWidth: 120,
            fontSize: "0.7rem",
            color: "#fff8d6",
            textAlign: "center",
            background: "rgba(0,0,0,0.6)",
            padding: "4px 8px",
            borderRadius: 8,
            border: "1px solid rgba(255,215,0,0.25)",
            wordWrap: "break-word",
            whiteSpace: "normal",
          }}
        >
          As Salaam Alikum Wa Rahmatullah, We find the name... 🌙
        </div>
      </div>

      {/* Lessons container + golden line */}
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          position: "relative",
          height: containerHeight,
          marginTop: 10,
        }}
      >
        {/* Golden trail */}
        {lineHeight > 0 && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: lineTop,
              transform: "translateX(-50%)",
              width: 4,
              height: lineHeight,
              background:
                "linear-gradient(to bottom, rgba(255,215,0,0.85), rgba(255,215,0,0.1))",
              borderRadius: 999,
              boxShadow: "0 0 12px rgba(255,215,0,0.4)",
              zIndex: 0,
            }}
          />
        )}

        {/* Lesson nodes + titles */}
        {lessons.map((lesson, i) => {
          const isActive = i === activeIndex;
          const top = FIRST_NODE_TOP + i * NODE_SPACING;

          // Section headers for Foundations of Islam path (pathId 2)
          const sectionHeaders = {
            1: "The Five Pillars of Islam",
            6: "The Six Pillars of Belief (Īmān)",
            12: "Living Islam"
          };
          const showSectionHeader = numericPathId === 2 && sectionHeaders[lesson.id];

          return (
            <React.Fragment key={lesson.id}>
              {/* Section Header (Foundations path only) */}
              {showSectionHeader && (
                <div
                  style={{
                    position: "absolute",
                    top: top - 40,
                    left: "50%",
                    transform: "translateX(-50%)",
                    color: "#D4AF37",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    textAlign: "center",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    textShadow: "0 0 10px rgba(212,175,55,0.5)",
                    pointerEvents: "none",
                    zIndex: 3,
                  }}
                >
                  {sectionHeaders[lesson.id]}
                </div>
              )}

              <div>
              {/* Node */}
              <div
                onClick={() => handleLessonClick(lesson)}
                style={{
                  position: "absolute",
                  top,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: NODE_SIZE,
                  height: NODE_SIZE,
                  borderRadius: "50%",
                  background: getNodeBackground(lesson, isActive),
                  boxShadow: getNodeShadow(lesson, isActive),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: lesson.isLocked ? "default" : "pointer",
                  border: isActive
                    ? "2px solid rgba(255,215,0,0.85)"
                    : "1px solid rgba(255,255,255,0.15)",
                  animation: isActive ? "pulseGlow 2s infinite ease-in-out" : "none",
                  zIndex: 2,
                }}
              >
                {isActive && avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="avatar"
                    style={{
                      width: "85%",
                      height: "85%",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontWeight: 700,
                      color: lesson.isLocked ? "#666" : "#fff",
                      fontSize: "1rem",
                    }}
                  >
                    {lesson.id}
                  </span>
                )}

                {lesson.isLocked && (
                  <span
                    style={{
                      position: "absolute",
                      fontSize: "1.4rem",
                      color: "rgba(255,255,255,0.85)",
                    }}
                  >
                    🔒
                  </span>
                )}
              </div>

              {/* Title + meaning */}
              <div
                style={{
                  position: "absolute",
                  top: top + NODE_SIZE / 2 - 10,
                  left: "calc(50% + 55px)",
                  transform: "translateY(-50%)",
                  textAlign: "left",
                  color: "#fff",
                  fontSize: "0.9rem",
                  lineHeight: 1.4,
                  whiteSpace: "nowrap",
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    color: lesson.isCompleted
                      ? "#9bf6ff"
                      : isActive
                      ? "#ffe99a"
                      : "#e2e2e2",
                  }}
                >
                  {shortenTitleEnglish(lesson.title)}
                </div>

                {/* NEW: English meaning line */}
                <div style={{ fontSize: "0.75rem", color: "#ccc" }}>
                  {lesson.meaning}
                </div>

                {lesson.isCompleted && (
                  <div style={{ fontSize: "0.7rem", color: "#7cffc4" }}>
                    Completed ✅
                  </div>
                )}

                {isActive && !lesson.isLocked && (
                  <div style={{ fontSize: "0.7rem", color: "#ffd85a" }}>
                    This is your next step ⭐
                  </div>
                )}
              </div>
            </div>
            </React.Fragment>
          );
        })}
      </div>

      <style>{`
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 10px rgba(255, 232, 150, 0.3); }
          50% { box-shadow: 0 0 25px rgba(255, 232, 150, 0.8); }
          100% { box-shadow: 0 0 10px rgba(255, 232, 150, 0.3); }
        }
      `}</style>
    </div>
  );
}

// Helpers
const backButtonStyle = {
  padding: "6px 10px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(0,0,0,0.5)",
  color: "white",
  fontSize: "0.75rem",
  cursor: "pointer",
};

function getNodeBackground(lesson, isActive) {
  if (lesson.isCompleted) return "linear-gradient(145deg, #ffe99a, #f6d96b)";
  if (lesson.isLocked) return "linear-gradient(145deg, #1b1f2b, #0c0f18)";
  if (isActive) return "linear-gradient(145deg, #f6d96b, #ffe99a)";
  return "linear-gradient(145deg, #2a2f3e, #10131b)";
}

function getNodeShadow(lesson, isActive) {
  if (lesson.isCompleted) return "0 0 14px rgba(255,232,150,0.4)";
  if (lesson.isLocked) return "0 0 6px rgba(0,0,0,0.7)";
  if (isActive) return "0 0 16px rgba(255,232,150,0.7)";
  return "0 0 8px rgba(255,215,0,0.3)";
}

function shortenTitleEnglish(title) {
  return title.split("(")[0].replace("The Name", "").trim();
}
