// src/components/ViewAllLevelsModal.jsx
import React from "react";
import { X } from "lucide-react";
import { getAllLevelsWithProgress } from "../utils/diamondLevels";

export function ViewAllLevelsModal({ currentXP, onClose }) {
  const levelsWithProgress = getAllLevelsWithProgress(currentXP);

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
        borderRadius: 20,
        maxWidth: 400,
        width: "100%",
        maxHeight: "80vh",
        overflowY: "auto",
        padding: 20,
        border: "2px solid rgba(212, 175, 55, 0.3)",
        boxShadow: "0 0 40px rgba(212, 175, 55, 0.3)",
        position: "relative",
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "rgba(239, 68, 68, 0.2)",
            border: "1px solid rgba(239, 68, 68, 0.5)",
            borderRadius: "50%",
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#ef4444",
          }}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h2 style={{
            background: "linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: "1.5rem",
            fontWeight: "bold",
            margin: 0,
          }}>
            All Levels
          </h2>
        </div>

        {/* Levels Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 10,
        }}>
          {levelsWithProgress.map((levelData) => {
            const locked = !levelData.isUnlocked;

            return (
              <div
                key={levelData.level}
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
                  borderRadius: 12,
                  padding: "12px 10px",
                  textAlign: "center",
                  opacity: locked ? 0.5 : 1,
                }}
              >
                {/* Level Number */}
                <div style={{
                  color: locked ? "rgba(148, 163, 184, 0.7)" : "#D4AF37",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  marginBottom: 4,
                }}>
                  Level {levelData.level}
                </div>

                {/* XP Threshold */}
                <div style={{
                  fontSize: "0.8rem",
                  color: locked ? "rgba(148, 163, 184, 0.5)" : "rgba(212, 175, 55, 0.7)",
                }}>
                  {levelData.minXP.toLocaleString()} XP
                </div>

                {/* Current Level Badge */}
                {levelData.isCurrent && (
                  <div style={{
                    marginTop: 6,
                    background: "linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)",
                    color: "#0B1E2D",
                    fontSize: "0.6rem",
                    fontWeight: "bold",
                    padding: "3px 6px",
                    borderRadius: 6,
                    display: "inline-block",
                  }}>
                    CURRENT
                  </div>
                )}

                {/* Locked Icon */}
                {locked && (
                  <div style={{ marginTop: 4, fontSize: "0.9rem" }}>
                    🔒
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
