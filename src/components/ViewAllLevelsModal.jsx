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
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h2 style={{
            background: "linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: 4,
          }}>
            All Levels
          </h2>
          <p style={{
            color: "rgba(212, 175, 55, 0.7)",
            fontSize: "0.85rem",
          }}>
            Earn XP to unlock higher levels
          </p>
        </div>

        {/* Levels List */}
        <div style={{
          display: "flex",
          flexDirection: "column",
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
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  opacity: locked ? 0.6 : 1,
                }}
              >
                {/* Left: Level number */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}>
                  <div style={{
                    color: locked ? "rgba(148, 163, 184, 0.7)" : levelData.color || "#D4AF37",
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}>
                    Level {levelData.level}
                  </div>
                  {levelData.isCurrent && (
                    <div style={{
                      background: "linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)",
                      color: "#0B1E2D",
                      fontSize: "0.6rem",
                      fontWeight: "bold",
                      padding: "3px 6px",
                      borderRadius: 6,
                    }}>
                      CURRENT
                    </div>
                  )}
                </div>

                {/* Right: XP threshold or lock */}
                <div style={{
                  fontSize: "0.8rem",
                  color: locked ? "rgba(148, 163, 184, 0.6)" : "rgba(212, 175, 55, 0.8)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}>
                  {locked ? (
                    <>
                      <span>{levelData.minXP.toLocaleString()} XP to unlock</span>
                      <span>🔒</span>
                    </>
                  ) : (
                    <span>{levelData.minXP.toLocaleString()} XP</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Message */}
        <div style={{
          marginTop: 20,
          padding: 12,
          background: "rgba(212, 175, 55, 0.1)",
          borderRadius: 10,
          border: "1px solid rgba(212, 175, 55, 0.2)",
          textAlign: "center",
        }}>
          <p style={{
            color: "rgba(212, 175, 55, 0.8)",
            fontSize: "0.8rem",
            margin: 0,
          }}>
            Keep learning to unlock higher levels!
          </p>
        </div>
      </div>
    </div>
  );
}
