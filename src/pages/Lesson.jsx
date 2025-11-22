import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "../hooks/useNavigate";
import { getLessonsForPath } from "../data/lessonLoader";
import { useProgressStore } from "../store/progressStore";
import zaydTeachingMascot from "../assets/mascots/mascot_sitting.webp";

export default function Lesson() {
  const { pathId, lessonId } = useParams();
  const navigate = useNavigate();
  const { getLessonLockState } = useProgressStore();

  // Get lessons for the current path
  const pathLessons = getLessonsForPath(pathId);
  
  // Find the lesson by ID
  const lesson = pathLessons.find(
    (l) => l.id === parseInt(lessonId, 10)
  );

  // 🔒 PREMIUM GUARD: Block direct URL access to premium-locked lessons
  useEffect(() => {
    if (!pathId || !lessonId) return;
    
    const numericPathId = parseInt(pathId, 10);
    const numericLessonId = parseInt(lessonId, 10);
    
    // Check the specific lock state
    const lockState = getLessonLockState(numericPathId, numericLessonId);
    
    // Only redirect to premium for actual premium locks
    // For progress locks, let the normal flow handle it (user stays on path view)
    if (lockState === "premiumLocked") {
      navigate("/premium", { replace: true });
    } else if (lockState === "progressLocked") {
      // Redirect back to path view for normal progression locks
      navigate(`/path/${numericPathId}`, { replace: true });
    }
  }, [pathId, lessonId, getLessonLockState, navigate]);

  function handleBack() {
    if (pathId) navigate(`/path/${pathId}`);
    else navigate(-1);
  }

  // Wire exit confirmation when navigating away from lesson
  function handleExit() {
    const { showModal, MODAL_TYPES } = require("../store/modalStore");
    const { useModalStore } = require("../store/modalStore");
    const store = useModalStore.getState();
    store.showModal("EXIT_CONFIRMATION", {
      onConfirm: () => handleBack()
    });
  }

  if (!lesson) {
    return (
      <div
        className="screen no-extra-space"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, #1a2337 0%, #000814 70%)",
          color: "white",
          paddingLeft: "24px",
          paddingRight: "24px",
          paddingTop: "24px",
          textAlign: "center",
        }}
      >
        <button
          onClick={handleBack}
          style={{
            appearance: "none",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "white",
            fontSize: "0.8rem",
            borderRadius: "10px",
            padding: "8px 10px",
            marginBottom: "20px",
          }}
        >
          ← Back
        </button>
        <div
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            background:
              "linear-gradient(90deg,#fff 0%,#fff6d2 40%,#ffd88a 100%)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          Lesson not found
        </div>
      </div>
    );
  }

  return (
    <div
      className="screen no-extra-space"
      style={{
        background:
          "radial-gradient(circle at 20% 20%, #1a2337 0%, #000814 70%)",
        color: "white",
        paddingLeft: "20px",
        paddingRight: "20px",
        paddingTop: "20px",
        maxWidth: "480px",
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* Mascot top-right */}
      <img
        src={zaydTeachingMascot}
        alt="Zayd teaching"
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          width: "72px",
          height: "72px",
          objectFit: "contain",
          borderRadius: "50%",
          boxShadow: "0 0 20px rgba(255, 216, 138, 0.5)",
          background: "rgba(255,255,255,0.05)",
        }}
      />

      {/* Arabic name */}
      <div
        style={{
          fontSize: "clamp(1.4rem, 5vw, 1.9rem)",
          fontWeight: 700,
          color: "#ffe99a",
          textAlign: "center",
          textShadow: "0 0 12px rgba(255,215,0,0.4)",
          marginTop: "100px",
          marginBottom: "8px",
        }}
      >
        {lesson.arabic}
      </div>

      {/* English title */}
      <div
        style={{
          fontSize: "clamp(1rem, 3vw, 1.2rem)",
          fontWeight: 600,
          textAlign: "center",
          color: "white",
          marginBottom: "4px",
        }}
      >
        {lesson.title}
      </div>

      {/* Meaning - Only show for Names of Allah (pathId 1) */}
      {pathId === "1" && lesson.meaning && (
        <div
          style={{
            fontSize: "0.9rem",
            color: "#ffd85a",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          {lesson.meaning}
        </div>
      )}

      {/* Description */}
      <div
        style={{
          fontSize: "0.9rem",
          color: "#d0d4e4",
          lineHeight: 1.6,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "14px",
          padding: "16px",
          marginBottom: "16px",
          wordWrap: "break-word",
          overflowWrap: "break-word",
          wordBreak: "break-word",
        }}
      >
        {lesson.description?.map((para, i) => (
          <p key={i} style={{ 
            marginBottom: "12px",
            wordWrap: "break-word",
            overflowWrap: "break-word",
            wordBreak: "break-word",
            hyphens: "auto",
            overflow: "hidden",
          }}>
            {para}
          </p>
        ))}
        
        {/* Content fallback for any lessons using old format */}
        {!lesson.description && lesson.content && (
          <div style={{ whiteSpace: "pre-line" }}>{lesson.content}</div>
        )}
      </div>

      {/* Evidence Block - For Foundations path */}
      {lesson.evidence && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(16,185,129,0.05) 100%)",
            border: "1px solid rgba(212,175,55,0.3)",
            borderRadius: "14px",
            padding: "16px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              fontSize: "1.1rem",
              fontWeight: 600,
              color: "#D4AF37",
              textAlign: "center",
              marginBottom: "12px",
              fontFamily: "serif",
            }}
          >
            {lesson.evidence.arabic}
          </div>
          <div
            style={{
              fontSize: "0.85rem",
              color: "#d0d4e4",
              textAlign: "center",
              fontStyle: "italic",
              marginBottom: "6px",
            }}
          >
            {lesson.evidence.translation}
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "#ffd85a",
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            — {lesson.evidence.source}
          </div>
        </div>
      )}

      {/* Reflection */}
      <div
        style={{
          fontWeight: 700,
          color: "#ffd85a",
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        {lesson.reflection}
      </div>

      {/* Back + Quiz buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
          marginTop: "8px",
        }}
      >
        <button
          onClick={handleBack}
          style={{
            flex: 1,
            background:
              "linear-gradient(135deg,rgba(255,255,255,0.12) 0%,rgba(255,255,255,0) 60%)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "white",
            borderRadius: "12px",
            padding: "12px",
            fontSize: "0.8rem",
            fontWeight: 500,
          }}
        >
          ← Back
        </button>

        <button
          onClick={() => navigate(`/path/${pathId}/quiz/${lessonId}`)}
          style={{
            flex: 1,
            backgroundColor: "#ffd88a",
            color: "#000814",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "12px",
            padding: "12px",
            fontSize: "0.8rem",
            fontWeight: 600,
            boxShadow:
              "0 12px 25px rgba(0,0,0,0.7), 0 0 30px rgba(255,235,167,0.4) inset",
          }}
        >
          Test My Knowledge 🌟
        </button>
      </div>
    </div>
  );
}
