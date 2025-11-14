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
      // Show success state briefly before closing
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
      <div className="event-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="event-modal-header">
          <img
            src={assets.mascots.mascot_zayd_sad}
            alt="Zayd"
            className="modal-mascot-large"
            style={{
              animation: "float 3s ease-in-out infinite"
            }}
          />
        </div>

        <div className="event-modal-content">
          <h2 className="modal-title" style={{ color: "#ef4444" }}>
            Your Streak Broke! 💔
          </h2>
          
          <div style={{
            background: "rgba(239, 68, 68, 0.1)",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "16px",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🔥</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "#ef4444" }}>
              {brokenStreakValue} day streak
            </div>
            <div style={{ fontSize: "0.9rem", opacity: 0.8, marginTop: "4px" }}>
              Lost due to missed day
            </div>
          </div>

          <p className="modal-text">
            Don't worry! You can repair your streak and get it back to where it was.
          </p>
          <p className="modal-text">
            <strong>Bonus:</strong> Repairing gifts you 1 Streak Freeze Shield to protect your streak in the future!
          </p>

          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginTop: "20px",
            padding: "12px",
            background: "rgba(212, 175, 55, 0.1)",
            borderRadius: "8px",
            fontSize: "1.1rem",
            fontWeight: "600"
          }}>
            <span>💰</span>
            <span style={{ color: "#d4af37" }}>200 coins</span>
          </div>

          <div style={{
            marginTop: "12px",
            fontSize: "0.85rem",
            opacity: 0.7,
            textAlign: "center"
          }}>
            Your balance: {coins} coins
          </div>

          <div style={{
            marginTop: "16px",
            padding: "12px",
            background: "rgba(16, 185, 129, 0.1)",
            borderRadius: "8px",
            fontSize: "0.9rem",
            textAlign: "center"
          }}>
            🛡️ Includes 1 free Streak Freeze Shield!
          </div>
        </div>

        <div className="event-modal-actions">
          <button 
            className="modal-btn-secondary" 
            onClick={handleSkip}
            style={{ flex: 1 }}
          >
            Skip
          </button>
          <button 
            className="modal-btn-primary" 
            onClick={handleRepair}
            disabled={coins < REPAIR_COST}
            style={{ 
              flex: 1,
              background: coins >= REPAIR_COST 
                ? "linear-gradient(135deg, #10b981 0%, #d4af37 100%)"
                : undefined,
              opacity: coins < REPAIR_COST ? 0.5 : 1,
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
