import React, { useState } from "react";
import { useProgressStore } from "../store/progressStore";
import ModalBase from "./ModalBase";
import assets from "../assets/assets";
import "./PurchaseStreakFreezeModal.css";

export default function PurchaseStreakFreezeModal({ onClose, onSuccess }) {
  const { coins, shieldCount, purchaseShield } = useProgressStore();
  const [purchaseError, setPurchaseError] = useState(null);
  const SHIELD_COST = 250;
  const MAX_SHIELDS = 2;

  const handlePurchase = () => {
    setPurchaseError(null);
    const result = purchaseShield();

    if (result.success) {
      onSuccess?.();
    } else if (result.reason === "max") {
      setPurchaseError("You already have the maximum streak protection equipped.");
    } else if (result.reason === "insufficient_coins") {
      setPurchaseError("Not enough coins! You need 250 coins to buy a Streak Freeze.");
    }
  };

  return (
    <ModalBase 
      title="Buy Streak Freeze" 
      onClose={onClose}
      showMascot={assets.mascots.mascot_streak_freeze}
      mascotAnimation="float"
    >
      <div className="streak-freeze-content">
        <div className="info-card">
          <div className="shield-info">
            <span className="shield-emoji">🛡️</span>
            <div className="shield-text">
              <div className="shield-title">Streak Freeze Shield</div>
              <div className="shield-count">{shieldCount} / {MAX_SHIELDS} equipped</div>
            </div>
          </div>
        </div>

        <p className="description">
          Protect your streak for up to <strong>3 days</strong> if you miss a day!
        </p>
        <p className="description">
          A shield automatically activates when you miss a day, preserving your streak without breaking it.
        </p>

        <div className="cost-display">
          <span>💰</span>
          <span className="cost-amount">250 coins</span>
        </div>

        <div className="balance-text">
          Your balance: {coins} coins
        </div>

        {purchaseError && (
          <div style={{
            background: "rgba(220, 53, 69, 0.15)",
            border: "1px solid rgba(220, 53, 69, 0.4)",
            borderRadius: "8px",
            padding: "10px 14px",
            color: "#ff6b7a",
            fontSize: "0.85rem",
            textAlign: "center",
          }}>
            {purchaseError}
          </div>
        )}

        <div className="modal-actions">
          <button 
            className="btn-secondary" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="btn-primary" 
            onClick={handlePurchase}
            disabled={shieldCount >= MAX_SHIELDS || coins < SHIELD_COST}
          >
            {shieldCount >= MAX_SHIELDS ? "Max Shields" : `Buy for ${SHIELD_COST} 🪙`}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
