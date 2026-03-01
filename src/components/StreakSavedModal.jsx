import React from "react";
import { useProgressStore } from "../store/progressStore";
import assets from "../assets/assets";
import "./events/EventModals.css";

export default function StreakSavedModal({ onClose }) {
  const { streak, shieldCount } = useProgressStore();

  return (
    <div className="event-modal-overlay" onClick={(e) => e.stopPropagation()}>
      <div className="event-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-mascot-header">
          <img
            src={assets.mascots.mascot_streak_freeze}
            alt="Mascot"
            className="modal-zayd"
            style={{ animation: "float 3s ease-in-out infinite" }}
          />
        </div>

        <h2 className="modal-title" style={{
          background: "linear-gradient(90deg, #10b981 0%, #3b82f6 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Streak Saved! 🛡️
        </h2>

        <div style={{
          background: "rgba(16, 185, 129, 0.15)",
          borderRadius: "12px",
          padding: "12px 16px",
          marginBottom: "14px",
          border: "2px solid rgba(16, 185, 129, 0.4)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "1.4rem", fontWeight: "700", color: "#10b981" }}>
            🔥 {streak} day streak
          </div>
          <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "4px" }}>
            Protected by your Streak Freeze
          </div>
        </div>

        <p style={{
          color: "#e2e8f0",
          fontSize: "0.9rem",
          textAlign: "center",
          marginBottom: "14px",
          lineHeight: 1.5
        }}>
          A Streak Freeze shield was automatically used to protect your streak while you were away.
        </p>

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "12px",
          background: "rgba(59, 130, 246, 0.1)",
          border: "1px solid rgba(59, 130, 246, 0.25)",
          borderRadius: "12px",
          fontSize: "0.9rem",
          color: "#94a3b8"
        }}>
          <span>🛡️</span>
          <span>{shieldCount} shield{shieldCount !== 1 ? "s" : ""} remaining</span>
        </div>

        <div className="modal-actions" style={{ marginTop: "16px" }}>
          <button
            className="modal-btn-primary"
            onClick={onClose}
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
              width: "100%"
            }}
          >
            Keep Going! 💪
          </button>
        </div>
      </div>
    </div>
  );
}
