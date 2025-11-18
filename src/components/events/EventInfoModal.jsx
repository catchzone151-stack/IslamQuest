import React from "react";
import assets from "../../assets/assets";
import "./EventModals.css";

export default function EventInfoModal({ event, onStart, onCancel }) {
  return (
    <div className="event-modal-overlay">
      <div className="event-modal">
        {/* Zayd Header */}
        <div className="modal-mascot-header">
          <img src={assets.mascots.mascot_waving} alt="Mascot" className="modal-zayd" />
        </div>

        {/* Event Info */}
        <h2 className="modal-title">{event.icon} {event.name}</h2>
        <p className="modal-subtitle">{event.description}</p>

        {/* Rules Card */}
        <div className="modal-info-card">
          <h3 className="info-card-title">Event Rules</h3>
          <ul className="info-card-list">
            <li>📝 Answer 10 challenging questions</li>
            <li>⏱ 60 seconds total time limit</li>
            <li>💰 Entry fee: 25 coins (non-refundable)</li>
            <li>🏆 Rewards based on your final rank</li>
            <li>✨ Only your first attempt counts</li>
          </ul>
        </div>

        {/* Rewards Card */}
        <div className="modal-info-card">
          <h3 className="info-card-title">Rewards (Final Results)</h3>
          <ul className="info-card-list">
            <li>🥇 1st Place: +1000 XP, +300 coins</li>
            <li>🥈 2nd-3rd: +750 XP, +200 coins</li>
            <li>🥉 4th-10th: +500 XP, +100 coins</li>
            <li>🎯 All participants: +100 XP, +10 coins</li>
          </ul>
        </div>

        {/* Important Note */}
        <div className="modal-note">
          <p>💡 Results unlock Thursday 22:00 GMT</p>
        </div>

        {/* Action Buttons */}
        <div className="modal-actions">
          <button className="modal-btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="modal-btn-primary" onClick={onStart}>
            Bismillah - Start Now!
          </button>
        </div>
      </div>
    </div>
  );
}
