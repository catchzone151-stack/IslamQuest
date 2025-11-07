import React from "react";
import { useTitleStore } from "../store/useTitleStore";
import { titles } from "../data/titles";
import "../styles/titles.css";

export default function TitleDisplay({ onViewAll }) {
  const { currentTier } = useTitleStore();
  const currentTitle = titles.find((t) => t.id === currentTier);

  return (
    <div
      style={{
        marginTop: 12,
        padding: "12px 16px",
        background: "rgba(255, 215, 0, 0.1)",
        borderRadius: 12,
        border: "1px solid rgba(255, 215, 0, 0.3)",
      }}
    >
      <div
        style={{
          fontSize: "0.85rem",
          color: "#ccc",
          marginBottom: 4,
        }}
      >
        Current Title
      </div>
      <div
        className={currentTitle?.cssClass}
        style={{
          fontSize: "1.1rem",
          fontWeight: 700,
          color: currentTitle?.color || "#FFD700",
          textShadow: "0 0 8px rgba(255, 215, 0, 0.4)",
        }}
      >
        {currentTitle?.name || "Seeker"}
      </div>
      <button
        onClick={onViewAll}
        style={{
          marginTop: 10,
          background: "linear-gradient(90deg, #0074D9, #00BFFF)",
          border: "none",
          color: "white",
          fontWeight: 600,
          borderRadius: 8,
          padding: "8px 16px",
          fontSize: "0.85rem",
          cursor: "pointer",
          boxShadow: "0 0 10px rgba(0, 191, 255, 0.4)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = "0 0 14px rgba(0, 191, 255, 0.7)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 0 10px rgba(0, 191, 255, 0.4)";
        }}
      >
        📜 View Titles
      </button>
    </div>
  );
}
