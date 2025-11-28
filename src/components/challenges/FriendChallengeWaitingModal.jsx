import { useModalStore } from "../../store/modalStore";
import { getModeIcon, getModeName } from "../../utils/challengeQuestions";
import assets from "../../assets/assets";
import "./ChallengeModals.css";

export default function FriendChallengeWaitingModal({ friendName, modeId, onClose }) {
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
            You finished! Now we wait for your friend...
          </div>
        </div>

        <div 
          className="challenge-mode-icon"
          style={{ 
            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            fontSize: "2rem",
            margin: "16px auto"
          }}
        >
          ⏳
        </div>

        <h2 className="challenge-modal-title" style={{ color: "#f59e0b" }}>
          Waiting for {friendName}
        </h2>

        <p style={{ color: "#cbd5e1", fontSize: "1rem", lineHeight: 1.6, marginBottom: 8 }}>
          You've completed the <strong>{getModeName(modeId)}</strong> challenge!
        </p>
        
        <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: 24 }}>
          You'll see the results when your friend finishes.
        </p>

        <button 
          className="challenge-btn-primary"
          onClick={handleClose}
          style={{
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            boxShadow: "0 4px 15px rgba(245, 158, 11, 0.3)"
          }}
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
