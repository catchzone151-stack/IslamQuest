import { useModalStore } from "../../store/modalStore";
import { getModeIcon, getModeName } from "../../utils/challengeQuestions";
import assets from "../../assets/assets";
import "./ChallengeModals.css";

export default function FriendChallengeSentModal({ friendName, modeId, onClose }) {
  const { hideModal } = useModalStore();
  
  const handleClose = () => {
    hideModal();
    onClose?.();
  };
  
  return (
    <div className="challenge-modal-overlay" onClick={handleClose}>
      <div className="challenge-modal" onClick={(e) => e.stopPropagation()}>
        <div className="challenge-zayd-container">
          <img 
            src={assets.mascots.mascot_sitting_v2} 
            alt="Zayd" 
            className="challenge-zayd-bounce"
            style={{ width: 100, height: "auto" }}
          />
          <div className="zayd-speech-bubble">
            Challenge sent! Now we wait...
          </div>
        </div>

        <div 
          className="challenge-mode-icon"
          style={{ 
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            fontSize: "2rem",
            margin: "16px auto"
          }}
        >
          {getModeIcon(modeId)}
        </div>

        <h2 className="challenge-modal-title" style={{ color: "#10b981" }}>
          Challenge Sent!
        </h2>

        <p style={{ color: "#cbd5e1", fontSize: "1rem", lineHeight: 1.6, marginBottom: 8 }}>
          <strong>{getModeName(modeId)}</strong> challenge sent to
        </p>
        <p style={{ color: "#d4af37", fontSize: "1.1rem", fontWeight: 600, marginBottom: 20 }}>
          {friendName}
        </p>

        <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: 24 }}>
          You'll be notified when they accept!
        </p>

        <button 
          className="challenge-btn-primary"
          onClick={handleClose}
          style={{
            background: "linear-gradient(135deg, #10b981, #059669)",
            boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)"
          }}
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
