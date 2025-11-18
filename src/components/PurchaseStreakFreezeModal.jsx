import React from "react";
import { useProgressStore } from "../store/progressStore";
import assets from "../assets/assets";
import "./events/EventModals.css";

export default function PurchaseStreakFreezeModal({ onClose, onSuccess }) {
  const { coins, shieldCount, purchaseShield } = useProgressStore();
  const SHIELD_COST = 100;
  const MAX_SHIELDS = 3;

  const handlePurchase = () => {
    const result = purchaseShield();

    if (result.success) {
      onSuccess?.();
    } else if (result.reason === "max") {
      alert("You already have the maximum streak protection equipped.");
    } else if (result.reason === "insufficient_coins") {
      alert("Not enough coins! You need 100 coins to buy a Streak Freeze.");
    }
  };

  return (
    <div className="event-modal-overlay" onClick={onClose}>
      <div className="event-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="event-modal-header">
          <img
            src={assets.mascots.mascot_waving}
            alt="Mascot"
            className="modal-mascot-large"
            style={{
              animation: "float 3s ease-in-out infinite"
            }}
          />
        </div>

        <div className="event-modal-content">
          <h2 className="modal-title">Buy Streak Freeze</h2>
          
          <div style={{
            background: "rgba(212, 175, 55, 0.1)",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "16px",
            border: "1px solid rgba(212, 175, 55, 0.3)"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              marginBottom: "12px"
            }}>
              <span style={{ fontSize: "2.5rem" }}>🛡️</span>
              <div>
                <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "#d4af37" }}>
                  Streak Freeze Shield
                </div>
                <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>
                  {shieldCount} / {MAX_SHIELDS} equipped
                </div>
              </div>
            </div>
          </div>

          <p className="modal-text">
            Protect your streak for up to <strong>3 days</strong> if you miss a day!
          </p>
          <p className="modal-text">
            A shield automatically activates when you miss a day, preserving your streak without breaking it.
          </p>

          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginTop: "20px",
            padding: "12px",
            background: "rgba(16, 185, 129, 0.1)",
            borderRadius: "8px",
            fontSize: "1.1rem",
            fontWeight: "600"
          }}>
            <span>💰</span>
            <span style={{ color: "#d4af37" }}>100 coins</span>
          </div>

          <div style={{
            marginTop: "12px",
            fontSize: "0.85rem",
            opacity: 0.7,
            textAlign: "center"
          }}>
            Your balance: {coins} coins
          </div>
        </div>

        <div className="event-modal-actions">
          <button 
            className="modal-btn-secondary" 
            onClick={onClose}
            style={{ flex: 1 }}
          >
            Cancel
          </button>
          <button 
            className="modal-btn-primary" 
            onClick={handlePurchase}
            disabled={shieldCount >= MAX_SHIELDS || coins < SHIELD_COST}
            style={{ 
              flex: 1,
              opacity: (shieldCount >= MAX_SHIELDS || coins < SHIELD_COST) ? 0.5 : 1,
              cursor: (shieldCount >= MAX_SHIELDS || coins < SHIELD_COST) ? "not-allowed" : "pointer"
            }}
          >
            {shieldCount >= MAX_SHIELDS ? "Max Shields" : `Buy for ${SHIELD_COST} 🪙`}
          </button>
        </div>
      </div>
    </div>
  );
}
