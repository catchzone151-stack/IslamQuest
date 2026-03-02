import React, { useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "../hooks/useNavigate";
import { useProgressStore } from "../store/progressStore";
import { useUserStore } from "../store/useUserStore";
import { getAvatarImage } from "../utils/avatarUtils";
import { Lock, Crown } from "lucide-react";
import { isPremiumOnlyPath, FREE_LESSON_LIMITS } from "../store/premiumConfig";
import { useModalStore, MODAL_TYPES } from "../store/modalStore";
import { openAppStore } from "../utils/appStoreUtils";

// Lesson data loader
import { getLessonsForPath } from "../data/lessonLoader.js";

// Mascots
import mascot_sitting from "../assets/mascots/mascot_sitting.webp";

export default function Pathway() {
  const { pathId } = useParams();
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const activeNodeRef = useRef(null);
  const numericPathId = Number(pathId);

  const { paths, lessonStates, canAccessLesson, premium } = useProgressStore();
  const { id: userId, avatar } = useUserStore();
  const { showModal } = useModalStore();
  
  const isUserPremium = premium;
  const isPathPremiumOnly = isPremiumOnlyPath(numericPathId);

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
        className="screen no-extra-space"
        style={{
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
  // 🔒 Using NEW unified locking system via canAccessLesson()
  const pathLessonState = lessonStates?.[numericPathId] || {};
  const lessons = baseLessons.map((lesson) => {
    const isCompleted = !!pathLessonState[lesson.id]?.passed;
    // Use the NEW canAccessLesson function from unified locking system
    const unlocked = canAccessLesson(numericPathId, lesson.id);
    const isLocked = !unlocked;

    return { ...lesson, isCompleted, isLocked };
  });

  // Active node = first not completed & not locked
  // If all remaining lessons are premium-locked, stay at the last completed lesson
  let activeIndex = lessons.findIndex((l) => !l.isCompleted && !l.isLocked);
  if (activeIndex === -1) {
    // Find the last completed lesson
    const lastCompletedIndex = lessons.map((l, i) => l.isCompleted ? i : -1).filter(i => i !== -1).pop();
    activeIndex = lastCompletedIndex !== undefined ? lastCompletedIndex : 0;
  }

  const completedCount = lessons.filter((l) => l.isCompleted).length;
  const totalLessons = lessons.length;

  useEffect(() => {
    const scrollContainer = document.querySelector('.app-root-container');
    if (!scrollContainer) return;
    const handle = setTimeout(() => {
      scrollContainer.scrollTop = 0;
    }, 200);
    return () => clearTimeout(handle);
  }, [numericPathId, totalLessons]);

  useEffect(() => {
    if (activeIndex <= 0) return;
    const scrollContainer = document.querySelector('.app-root-container');
    if (!scrollContainer) return;
    const handle = setTimeout(() => {
      if (!activeNodeRef.current) return;
      const nodeRect = activeNodeRef.current.getBoundingClientRect();
      const containerRect = scrollContainer.getBoundingClientRect();
      const nodeTopInContainer = nodeRect.top - containerRect.top + scrollContainer.scrollTop;
      const targetScrollTop = nodeTopInContainer - scrollContainer.clientHeight / 3;
      console.log("[PATH_AUTO_SCROLL]", activeIndex);
      scrollContainer.scrollTo({ top: Math.max(0, targetScrollTop), behavior: "smooth" });
    }, 350);
    return () => clearTimeout(handle);
  }, [numericPathId, activeIndex]);

  const handleLessonClick = (lesson) => {
    console.log('🎯 Lesson clicked:', lesson.id, 'locked:', lesson.isLocked, 'completed:', lesson.isCompleted);
    
    // ✅ Completed lessons are always replayable — no paywall or lock checks
    if (lesson.isCompleted) {
      navigate(`/path/${numericPathId}/lesson/${lesson.id}`);
      return;
    }
    
    // FIRST: Check premium paywall (even for sequentially unlocked lessons)
    const freeLimit = FREE_LESSON_LIMITS[numericPathId] || 0;
    if (!isUserPremium && lesson.id > freeLimit) {
      console.log('🔒 Premium paywall triggered - showing modal');
      showModal(MODAL_TYPES.PURCHASE, { source: "lesson_limit" });
      return;
    }
    
    // Block access to premium-only paths for free users (lesson 1 of premium paths)
    if (isPathPremiumOnly && !isUserPremium) {
      console.log('🔒 Premium-only path - showing modal');
      showModal(MODAL_TYPES.PURCHASE, { source: "lesson_limit" });
      return;
    }
    
    // SECOND: Check sequential lock (must complete previous lesson)
    if (lesson.isLocked) {
      console.log('⏳ Sequential lock - must complete previous lesson');
      return;
    }
    
    // All checks passed - navigate
    console.log('✅ Navigating to lesson');
    navigate(`/path/${pathId}/lesson/${lesson.id}`);
  };

  // Get the correct avatar image from the stored key - always use the user's selected avatar
  const avatarSrc = getAvatarImage(avatar, { userId });

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
      className="screen no-extra-space"
      style={{
        background: "radial-gradient(circle at top, #0f2344 0%, #020815 70%)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingLeft: "16px",
        paddingRight: "16px",
        paddingTop: "0",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* Premium Overlay for paths 11-14 */}
      {isPathPremiumOnly && !isUserPremium && (
        <div
          onClick={() => openAppStore()}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            cursor: "pointer",
            padding: "32px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #D4AF37, #FFA500)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "24px",
              boxShadow: "0 8px 32px rgba(212, 175, 55, 0.4)",
            }}
          >
            <Lock size={40} color="white" />
          </div>
          
          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: 800,
              marginBottom: "12px",
              background: "linear-gradient(90deg, #D4AF37, #FFA500)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Premium Path 👑
          </h2>
          
          <p
            style={{
              fontSize: "1rem",
              color: "rgba(255, 255, 255, 0.85)",
              maxWidth: "350px",
              lineHeight: 1.6,
              marginBottom: "8px",
            }}
          >
            This path is part of Islam Quest Premium
          </p>
          
          <p
            style={{
              fontSize: "0.9rem",
              color: "rgba(255, 255, 255, 0.65)",
              maxWidth: "320px",
              marginBottom: "32px",
            }}
          >
            Unlock all 14 paths and compete in global events
          </p>
          
          <div
            style={{
              background: "linear-gradient(135deg, #D4AF37, #FFA500)",
              color: "white",
              padding: "16px 40px",
              borderRadius: "12px",
              fontSize: "1.1rem",
              fontWeight: 700,
              boxShadow: "0 6px 24px rgba(212, 175, 55, 0.5)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Crown size={24} />
            Unlock Premium
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/");
            }}
            style={{
              marginTop: "24px",
              background: "transparent",
              border: "2px solid rgba(255, 255, 255, 0.3)",
              color: "white",
              padding: "10px 24px",
              borderRadius: "8px",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Back to Home
          </button>
        </div>
      )}
      
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

      {/* User Avatar + message */}
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
          src={mascot_sitting}
          alt="Learning guide"
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
          {numericPathId === 1
            ? "Assalamu Alaikum wa Rahmatullah, We find the name... 🌙"
            : numericPathId === 2 
            ? "Let's strengthen your faith together 💪"
            : numericPathId === 3
            ? "Let's journey through the lives of the Prophets 🌙"
            : numericPathId === 4
            ? "Let's follow the footsteps of the Prophet ﷺ 🌙"
            : numericPathId === 5
            ? "Meet the noble Mothers of the Believers 🌸"
            : numericPathId === 6
            ? "Learn from the heroes promised Paradise 🕊️"
            : numericPathId === 7
            ? "Celebrate the four greatest women in Islam ✨"
            : numericPathId === 8
            ? "Discover the greatest Companions of the Prophet ﷺ ⭐"
            : numericPathId === 9
            ? "Meet the noble Angels of Allah ✨"
            : numericPathId === 10
            ? "Prepare for the Signs of the Hour ⏳"
            : numericPathId === 11
            ? "Understand the journey of the Grave 🕊️"
            : numericPathId === 12
            ? "Prepare for the Day of Reckoning ⚖️"
            : numericPathId === 13
            ? "Learn about the Fire and seek protection 🔥"
            : numericPathId === 14
            ? "Dream of eternal bliss in Paradise 🌺"
            : "Begin your journey of knowledge 📖"}
        </div>
      </div>

      {/* Lessons container */}
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          position: "relative",
          height: containerHeight,
          marginTop: 10,
        }}
      >
        {/* Lesson nodes + titles */}
        {lessons.map((lesson, i) => {
          const isActive = i === activeIndex;
          const top = FIRST_NODE_TOP + i * NODE_SPACING;

          // Section headers for Foundations of Islam (pathId 2), Stories of Prophets (pathId 3), and Prophet's Life (pathId 4)
          let sectionHeaders = {};
          if (numericPathId === 2) {
            sectionHeaders = {
              1: "The Five Pillars of Islam",
              6: "The Six Pillars of Belief (Īmān)",
              12: "Living Islam"
            };
          } else if (numericPathId === 3) {
            sectionHeaders = {
              1: "Early Prophets",
              18: "Prophets of Bani Isra'il",
              42: "Prophets Before 'Īsā"
            };
          } else if (numericPathId === 4) {
            sectionHeaders = {
              13: "Makkah Period",
              41: "Madinah Period",
              71: "Final Years"
            };
          }
          const showSectionHeader = (numericPathId === 2 || numericPathId === 3 || numericPathId === 4) && sectionHeaders[lesson.id];

          return (
            <React.Fragment key={lesson.id}>
              {/* Section Header (Foundations and Prophets paths) */}
              {showSectionHeader && (
                <div
                  style={{
                    position: "absolute",
                    top: top - 40,
                    left: "calc(50% - 80px)",
                    color: "#D4AF37",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    textAlign: "left",
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
                ref={isActive ? activeNodeRef : null}
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
                {isActive ? (
                  <img
                    src={avatarSrc}
                    alt="avatar"
                    style={{
                      width: "85%",
                      height: "85%",
                      borderRadius: "50%",
                      objectFit: "contain",
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
                      pointerEvents: "none",
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
                  whiteSpace: "normal",
                  maxWidth: "calc(50vw - 85px)",
                  wordWrap: "break-word",
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

                {/* NEW: English meaning line (hidden for paths 2-6) */}
                {numericPathId !== 2 && numericPathId !== 3 && numericPathId !== 4 && numericPathId !== 5 && numericPathId !== 6 && lesson.meaning && (
                  <div style={{ fontSize: "0.75rem", color: "#ccc" }}>
                    {lesson.meaning}
                  </div>
                )}

                {lesson.isCompleted && (
                  <div style={{ fontSize: "0.7rem", color: "#7cffc4" }}>
                    Completed ✅
                  </div>
                )}

                {isActive && !lesson.isLocked && !lesson.isCompleted && (
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
