import ZaydChallenge from "../../assets/mascots/mascot_zayd_challenge.webp";
import { DiamondIcon } from "../DiamondIcon";
import "./ChallengeModals.css";

export default function BossLockedModal({ currentLevel, onClose }) {
  return (
    <div className="challenge-modal-overlay">
      <div className="challenge-modal">
        {/* Zayd Mascot */}
        <div className="challenge-zayd-container">
          <img 
            src={ZaydChallenge} 
            alt="Zayd" 
            className="challenge-zayd-bounce"
            style={{ width: 100, height: "auto" }}
          />
          <div className="zayd-speech-bubble">
            Boss Level is only for the most advanced students! Keep learning to unlock it!
          </div>
        </div>

        {/* Lock Icon */}
        <div 
          className="challenge-mode-icon"
          style={{
            background: "linear-gradient(135deg, #6b7280, #4b5563)",
            boxShadow: "0 0 20px rgba(107, 114, 128, 0.5)"
          }}
        >
          🔒
        </div>

        {/* Title */}
        <h2 className="challenge-modal-title" style={{ color: "#94a3b8" }}>
          Boss Level Locked
        </h2>

        <p style={{ color: "#cbd5e1", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: 16 }}>
          You need to reach <strong style={{ color: "#d4af37" }}>Level 8</strong> to unlock the Boss Level challenge.
        </p>

        {/* Current Level Display */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: 16,
          background: "rgba(255, 255, 255, 0.03)",
          borderRadius: 12,
          marginBottom: 20
        }}>
          <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Your Level:</span>
          <DiamondIcon level={currentLevel} size={40} />
          <span style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700 }}>Level {currentLevel}</span>
        </div>

        <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: 20 }}>
          Complete more lessons and challenges to level up!
        </p>

        {/* Close Button */}
        <button 
          className="challenge-btn-primary"
          onClick={onClose}
          style={{
            background: "linear-gradient(135deg, #6b7280, #4b5563)",
            boxShadow: "0 4px 15px rgba(107, 114, 128, 0.3)"
          }}
        >
          Keep Learning 📚
        </button>
      </div>
    </div>
  );
}
