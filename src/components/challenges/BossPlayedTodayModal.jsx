import ZaydChallenge from "../../assets/mascots/mascot_boss.webp";
import "./ChallengeModals.css";

export default function BossPlayedTodayModal({ onClose }) {
  return (
    <div className="challenge-modal-overlay">
      <div className="challenge-modal">
        <div className="challenge-zayd-container">
          <img 
            src={ZaydChallenge} 
            alt="Zayd" 
            className="challenge-zayd-bounce"
            style={{ width: 100, height: "auto" }}
          />
          <div className="zayd-speech-bubble">
            You've already conquered the Boss Level today! Rest up and come back tomorrow!
          </div>
        </div>

        <h2 className="challenge-modal-title" style={{ color: "#d4af37" }}>
          Already Played Today
        </h2>

        <p style={{ color: "#cbd5e1", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: 20 }}>
          The Boss Level challenge can only be attempted <strong style={{ color: "#10b981" }}>once per day</strong>. 
          This keeps the challenge special and gives you time to study!
        </p>

        <button 
          className="challenge-btn-primary"
          onClick={onClose}
          style={{
            background: "linear-gradient(135deg, #1e3a5f, #0f1c2e)",
            boxShadow: "0 4px 15px rgba(30, 58, 95, 0.4)"
          }}
        >
          Got it! 👍
        </button>
      </div>
    </div>
  );
}
