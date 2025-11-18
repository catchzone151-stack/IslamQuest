import React from "react";
import assets from "../../assets/assets";
import "./EventModals.css";

export default function InsufficientCoinsModal({ onClose }) {
  return (
    <div className="event-modal-overlay" onClick={onClose}>
      <div className="event-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="event-modal-header">
          <img
            src={assets.mascots.mascot_defeated}
            alt="Mascot"
            className="modal-mascot-large"
          />
        </div>

        <div className="event-modal-content">
          <h2 className="modal-title">Not Enough Coins!</h2>
          <p className="modal-text">
            You need <strong>25 coins</strong> to enter this Global Event.
          </p>
          <p className="modal-text">
            Complete lessons and quizzes to earn more coins and join the competition!
          </p>

          <div className="coins-display">
            <span className="coin-icon">🪙</span>
            <span className="coin-text">Earn coins from lessons</span>
          </div>
        </div>

        <div className="event-modal-actions">
          <button className="modal-btn-primary" onClick={onClose}>
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
}
