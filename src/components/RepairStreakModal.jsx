import React from "react";
import { useProgressStore } from "../store/progressStore";
import assets from "../assets/assets";
import "./events/EventModals.css";

export default function RepairStreakModal({ onClose }) {
  const { coins, brokenStreakValue, repairStreak, skipRepair } = useProgressStore();
  const REPAIR_COST = 200;

  const handleRepair = () => {
    const result = repairStreak();

    if (result.success) {
      setTimeout(() => {
        onClose?.();
      }, 1500);
    } else if (result.reason === "insufficient_coins") {
      alert("Not enough coins! You need 200 coins to repair your streak.");
    }
  };

  const handleSkip = () => {
    skipRepair();
    onClose?.();
  };

  return (
    <div className="event-modal-overlay" onClick={(e) => e.stopPropagation()}>
      <div className="event-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-mascot-header">
          <img
            src={assets.mascots.mascot_sitting_v2}
            alt="Mascot"
            className="modal-zayd"
            style={{ animation: "float 3s ease-in-out infinite" }}
          />
        </div>

        <h2 className="modal-title" style={{ 
          background: "linear-gradient(90deg, #ef4444 0%, #f97316 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Your Streak Broke! 💔
        </h2>
        
        <div style={{
          background: "rgba(239, 68, 68, 0.15)",
          borderRadius: "12px",
          padding: "12px 16px",
          marginBottom: "14px",
          border: "2px solid rgba(239, 68, 68, 0.4)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "1.4rem", fontWeight: "700", color: "#ef4444" }}>
            {brokenStreakValue} day streak
          </div>
          <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "4px" }}>
            Lost due to missed day
          </div>
        </div>

        <p style={{ 
          color: "#e2e8f0", 
          fontSize: "0.9rem", 
          textAlign: "center",
          marginBottom: "14px",
          lineHeight: 1.5
        }}>
          Don't worry! You can repair your streak and get it back to where it was.
        </p>

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          padding: "14px",
          background: "rgba(212, 175, 55, 0.15)",
          border: "1px solid rgba(212, 175, 55, 0.3)",
          borderRadius: "12px",
          fontSize: "1.2rem",
          fontWeight: "700"
        }}>
          <span>💰</span>
          <span style={{ color: "#d4af37" }}>200 coins</span>
        </div>

        <div style={{
          marginTop: "10px",
          fontSize: "0.85rem",
          color: "#94a3b8",
          textAlign: "center"
        }}>
          Your balance: {coins} coins
        </div>

        <div className="modal-note" style={{ marginTop: "16px" }}>
          <p>🛡️ Includes 1 free Streak Freeze Shield!</p>
        </div>

        <div className="modal-actions">
          <button 
            className="modal-btn-secondary" 
            onClick={handleSkip}
          >
            Skip
          </button>
          <button 
            className="modal-btn-primary" 
            onClick={handleRepair}
            disabled={coins < REPAIR_COST}
            style={{ 
              background: coins >= REPAIR_COST 
                ? "linear-gradient(135deg, #10b981 0%, #d4af37 100%)"
                : "rgba(100, 100, 100, 0.5)",
              opacity: coins < REPAIR_COST ? 0.6 : 1,
              cursor: coins < REPAIR_COST ? "not-allowed" : "pointer"
            }}
          >
            {coins >= REPAIR_COST ? `Repair for ${REPAIR_COST} 🪙` : "Not Enough Coins"}
          </button>
        </div>
      </div>
    </div>
  );
}
