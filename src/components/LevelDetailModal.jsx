import React from "react";

export default function LevelDetailModal({ xp, level, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#0a0a1a",
          borderRadius: "16px",
          padding: "30px",
          border: "1px solid rgba(255,215,0,0.3)",
          textAlign: "center",
          width: "280px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ color: "#FFD700" }}>Level {level}</h3>
        <p>{xp} XP earned!</p>
        <button
          onClick={onClose}
          style={{
            background: "#FFD700",
            border: "none",
            borderRadius: "8px",
            padding: "10px 20px",
            marginTop: "15px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
