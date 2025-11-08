import React from "react";

export default function LessonNode({
  lesson,
  onClick,
  isCompleted,
  isLocked,
  index,
}) {
  const stateColor = isCompleted
    ? "linear-gradient(145deg, #ffd85a, #ffb700)"
    : isLocked
    ? "linear-gradient(145deg, #555, #333)"
    : "linear-gradient(145deg, #ffe17b, #ffca3a)";

  return (
    <div
      onClick={onClick}
      style={{
        width: 70,
        height: 70,
        borderRadius: "50%",
        background: stateColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: isCompleted
          ? "0 0 18px rgba(255,215,0,0.7)"
          : "0 0 8px rgba(255,215,0,0.3)",
        cursor: "pointer",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        position: "relative",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.transform = "scale(1.08)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <span
        style={{
          fontWeight: 700,
          fontSize: "1rem",
          color: "#000",
          userSelect: "none",
        }}
      >
        {lesson.id}
      </span>

      {/* Lock icons */}
      {isLocked && (
        <span
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            fontSize: 16,
            color: lesson.requiresPurchase ? "#ffd85a" : "#ccc",
          }}
        >
          {lesson.requiresPurchase ? "💰" : "🔒"}
        </span>
      )}

      {isCompleted && (
        <span
          style={{
            position: "absolute",
            bottom: 6,
            right: 6,
            fontSize: 14,
          }}
        >
          ✅
        </span>
      )}
    </div>
  );
}
