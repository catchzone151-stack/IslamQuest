// src/components/ViewAllLevelsModal.jsx
import React, { useState } from "react";
import { X } from "lucide-react";
import { DIAMOND_LEVELS, getAllLevelsWithProgress } from "../utils/diamondLevels";
import { DiamondIcon } from "./DiamondIcon";

export function ViewAllLevelsModal({ currentXP, onClose }) {
  const levelsWithProgress = getAllLevelsWithProgress(currentXP);
  const [hoveredLevel, setHoveredLevel] = useState(null);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.85)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      animation: "fadeIn 0.3s ease-out",
    }}>
      <div style={{
        background: "linear-gradient(180deg, #0B1E2D 0%, #162C3D 100%)",
        borderRadius: 24,
        maxWidth: 500,
        width: "100%",
        maxHeight: "85vh",
        overflowY: "auto",
        padding: 24,
        border: "2px solid rgba(212, 175, 55, 0.3)",
        boxShadow: "0 0 40px rgba(212, 175, 55, 0.3)",
        position: "relative",
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "rgba(239, 68, 68, 0.2)",
            border: "1px solid rgba(239, 68, 68, 0.5)",
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#ef4444",
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{
            background: "linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: "1.8rem",
            fontWeight: "bold",
            marginBottom: 8,
          }}>
            💎 Diamond Levels
          </h2>
          <p style={{
            color: "rgba(212, 175, 55, 0.7)",
            fontSize: "0.9rem",
          }}>
            Collect all 10 gems of knowledge!
          </p>
        </div>

        {/* Levels Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 16,
        }}>
          {levelsWithProgress.map((levelData) => {
            const isHovered = hoveredLevel === levelData.level;
            const locked = !levelData.isUnlocked;

            return (
              <div
                key={levelData.level}
                onMouseEnter={() => setHoveredLevel(levelData.level)}
                onMouseLeave={() => setHoveredLevel(null)}
                style={{
                  background: levelData.isCurrent
                    ? "linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(244, 208, 63, 0.1) 100%)"
                    : locked
                    ? "rgba(30, 41, 59, 0.5)"
                    : "rgba(212, 175, 55, 0.05)",
                  border: levelData.isCurrent
                    ? "2px solid #D4AF37"
                    : locked
                    ? "1px solid rgba(100, 116, 139, 0.3)"
                    : "1px solid rgba(212, 175, 55, 0.2)",
                  borderRadius: 16,
                  padding: 16,
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  transform: isHovered ? "scale(1.05)" : "scale(1)",
                  opacity: locked ? 0.5 : 1,
                  filter: locked ? "grayscale(80%)" : "none",
                }}
              >
                {/* Diamond Icon */}
                <div style={{ marginBottom: 12 }}>
                  <DiamondIcon
                    level={levelData.level}
                    size={isHovered ? 56 : 48}
                    animated={isHovered && !locked}
                    showGlow={!locked}
                  />
                </div>

                {/* Level Info */}
                <div style={{
                  color: locked ? "rgba(148, 163, 184, 0.7)" : "#D4AF37",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  marginBottom: 4,
                }}>
                  Level {levelData.level}
                </div>

                <div style={{
                  color: locked ? "rgba(148, 163, 184, 0.5)" : "rgba(212, 175, 55, 0.7)",
                  fontSize: "0.75rem",
                }}>
                  {levelData.name}
                </div>

                {/* XP Range */}
                {isHovered && (
                  <div style={{
                    marginTop: 8,
                    fontSize: "0.7rem",
                    color: locked ? "rgba(148, 163, 184, 0.6)" : "rgba(212, 175, 55, 0.6)",
                    animation: "fadeIn 0.3s ease-out",
                  }}>
                    {levelData.minXP.toLocaleString()} XP
                  </div>
                )}

                {/* Current Level Badge */}
                {levelData.isCurrent && (
                  <div style={{
                    marginTop: 8,
                    background: "linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)",
                    color: "#0B1E2D",
                    fontSize: "0.65rem",
                    fontWeight: "bold",
                    padding: "4px 8px",
                    borderRadius: 8,
                    display: "inline-block",
                  }}>
                    CURRENT
                  </div>
                )}

                {/* Locked Icon */}
                {locked && (
                  <div style={{
                    marginTop: 8,
                    fontSize: "1.2rem",
                  }}>
                    🔒
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Message */}
        <div style={{
          marginTop: 24,
          padding: 16,
          background: "rgba(212, 175, 55, 0.1)",
          borderRadius: 12,
          border: "1px solid rgba(212, 175, 55, 0.2)",
          textAlign: "center",
        }}>
          <p style={{
            color: "rgba(212, 175, 55, 0.8)",
            fontSize: "0.85rem",
            margin: 0,
          }}>
            🌙 Keep learning to unlock higher diamond levels!
          </p>
        </div>
      </div>
    </div>
  );
}
