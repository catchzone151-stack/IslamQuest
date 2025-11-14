import ZaydChallenge from "../../assets/mascots/mascot_zayd_challenge.webp";
import "./ChallengeModals.css";

export default function NoSharedLessonsModal({ friendName, onClose }) {
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
            You both need to learn more lessons first before challenging each other!
          </div>
        </div>

        {/* Title */}
        <h2 className="challenge-modal-title" style={{ color: "#f59e0b" }}>
          Not Enough Learning Yet
        </h2>

        <p style={{ color: "#cbd5e1", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: 20 }}>
          You and {friendName || "your friend"} don't have any completed lessons in common yet. 
          Complete more lessons together to unlock challenges!
        </p>

        {/* Close Button */}
        <button 
          className="challenge-btn-primary"
          onClick={onClose}
          style={{
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            boxShadow: "0 4px 15px rgba(245, 158, 11, 0.3)"
          }}
        >
          Got it! 👍
        </button>
      </div>
    </div>
  );
}
