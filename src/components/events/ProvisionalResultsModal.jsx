import React from "react";
import { useEventsStore } from "../../store/eventsStore";
import assets from "../../assets/assets";
import "./EventModals.css";

export default function ProvisionalResultsModal({ event, score, totalQuestions, onClose }) {
  const { getEntry } = useEventsStore();
  const entry = getEntry(event.id);
  const provisionalRank = entry?.provisionalRank || "?";

  return (
    <div className="event-modal-overlay">
      <div className="event-modal provisional-modal">
        {/* Zayd Header */}
        <div className="modal-mascot-header">
          <img src={assets.mascots.mascot_zayd_default} alt="Zayd" className="modal-zayd bounce" />
        </div>

        {/* Title */}
        <h2 className="modal-title">Quiz Complete! 🎯</h2>
        <p className="modal-subtitle">Provisional Results</p>

        {/* Score Card */}
        <div className="results-score-card">
          <div className="score-display">
            <span className="score-number">{score}</span>
            <span className="score-total">/ {totalQuestions}</span>
          </div>
          <p className="score-label">Correct Answers</p>
        </div>

        {/* Provisional Rank */}
        <div className="provisional-rank-card">
          <div className="rank-icon">📊</div>
          <div className="rank-info">
            <p className="rank-label">Provisional Rank Estimate</p>
            <p className="rank-number">~#{provisionalRank}</p>
          </div>
        </div>

        {/* Info Message */}
        <div className="modal-info-message">
          <p className="info-icon">⏰</p>
          <p className="info-text">
            <strong>Official results</strong> will be released on<br />
            <span className="highlight">Thursday at 10:00 PM GMT</span>
          </p>
        </div>

        {/* XP Info */}
        <div className="modal-note">
          <p>💰 Entry fee: -25 coins (already deducted)</p>
          <p>✨ Rewards will be given based on your final rank</p>
        </div>

        {/* Action Button */}
        <button className="modal-btn-primary" onClick={onClose}>
          Back to Events
        </button>
      </div>
    </div>
  );
}
