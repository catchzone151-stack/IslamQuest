import React from "react";
import { useProgressStore } from "../store/progressStore";
import ModalBase from "./ModalBase";
import assets from "../assets/assets";
import "./PurchaseStreakFreezeModal.css";

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
    <ModalBase 
      title="Buy Streak Freeze" 
      onClose={onClose}
      showMascot={assets.mascots.mascot_waving}
      mascotAnimation="float"
    >
      <div className="streak-freeze-content">
        {/* Shield Info Card */}
        <div className="info-card">
          <div className="shield-info">
            <span className="shield-emoji">🛡️</span>
            <div className="shield-text">
              <div className="shield-title">Streak Freeze Shield</div>
              <div className="shield-count">{shieldCount} / {MAX_SHIELDS} equipped</div>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="description">
          Protect your streak for up to <strong>3 days</strong> if you miss a day!
        </p>
        <p className="description">
          A shield automatically activates when you miss a day, preserving your streak without breaking it.
        </p>

        {/* Cost Display */}
        <div className="cost-display">
          <span>💰</span>
          <span className="cost-amount">100 coins</span>
        </div>

        {/* Balance */}
        <div className="balance-text">
          Your balance: {coins} coins
        </div>

        {/* Action Buttons */}
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
