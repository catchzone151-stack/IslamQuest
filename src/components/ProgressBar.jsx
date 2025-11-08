// src/components/ProgressBar.jsx
import React from "react";

export default function ProgressBar({ progress = 0, total = 10, completed = 0 }) {
  const percent = Math.min(100, Math.round(progress * 100));
  const isFull = percent >= 100;

  return (
    <div style={{ width: "70%", marginTop: 6 }}>
      <div
        style={{
          height: 10,
          width: "100%",
          background: "#0a1a2f",
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: isFull
            ? "0 0 12px rgba(255, 215, 0, 0.6)"
            : "inset 0 0 6px rgba(255,255,255,0.2)",
          transition: "box-shadow 0.5s ease",
          animation: isFull ? "barPulse 3s ease-in-out infinite" : "none",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: "linear-gradient(90deg, #ffd85a, #ffb700)",
            transition: "width 0.4s ease",
          }}
        />
      </div>

      <div
        style={{
          fontSize: "0.75rem",
          color: "#e8e8e8",
          marginTop: 4,
          textAlign: "center",
          fontWeight: 600,
        }}
      >
        {completed} / {total} Lessons
      </div>

      <style>{`
        @keyframes barPulse {
          0% { box-shadow: 0 0 10px rgba(255,215,0,0.3); }
          50% { box-shadow: 0 0 22px rgba(255,215,0,0.8); }
          100% { box-shadow: 0 0 10px rgba(255,215,0,0.3); }
        }
      `}</style>
    </div>
  );
}
