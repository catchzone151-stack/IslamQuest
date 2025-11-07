// src/components/TitleDisplay.jsx
import React from "react";
import { useTitleStore } from "../store/useTitleStore";
import { titles } from "../data/titles";
import "../styles/titles.css";

export default function TitleDisplay({ onViewAll }) {
  const { currentTier } = useTitleStore();
  const currentTitle = titles.find((t) => t.id === currentTier);

  if (!currentTitle) return null;

  return (
    <div style={{ marginTop: 10 }}>
      <div className={`title-display ${currentTitle.cssClass}`}>
        {currentTitle.name}
      </div>
      <button
        onClick={onViewAll}
        style={{
          marginTop: 8,
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "white",
          borderRadius: 8,
          padding: "6px 14px",
          fontSize: "0.8rem",
          cursor: "pointer",
          opacity: 0.8,
        }}
      >
        View All Titles
      </button>
    </div>
  );
}
