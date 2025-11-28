import { useState } from "react";
import { useModalStore } from "../../store/modalStore";
import { getModeIcon, getModeName } from "../../utils/challengeQuestions";
import { getAvatarImage } from "../../utils/avatarUtils";
import assets from "../../assets/assets";
import "./ChallengeModals.css";

export default function FriendChallengeReceivedModal({ 
  challenge, 
  senderName, 
  senderAvatar,
  onAccept, 
  onDecline, 
  onClose 
}) {
  const { hideModal } = useModalStore();
  const [loading, setLoading] = useState(false);
  
  const handleAccept = async () => {
    setLoading(true);
    await onAccept?.();
    hideModal();
  };
  
  const handleDecline = async () => {
    setLoading(true);
    await onDecline?.();
    hideModal();
    onClose?.();
  };
  
  const handleClose = () => {
    hideModal();
    onClose?.();
  };
  
  const modeId = challenge?.challenge_type;
  
  return (
    <div className="challenge-modal-overlay" onClick={handleClose}>
      <div className="challenge-modal" onClick={(e) => e.stopPropagation()}>
        <div className="challenge-zayd-container">
          <img 
            src={assets.mascots.mascot_boss} 
            alt="Zayd" 
            className="challenge-zayd-bounce"
            style={{ width: 100, height: "auto" }}
          />
          <div className="zayd-speech-bubble">
            You've been challenged!
          </div>
        </div>

        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          gap: 12,
          margin: "16px 0"
        }}>
          <img 
            src={getAvatarImage(senderAvatar)} 
            alt={senderName}
            style={{ 
              width: 50, 
              height: 50, 
              borderRadius: "50%",
              border: "2px solid rgba(212, 175, 55, 0.5)"
            }}
          />
          <div>
            <p style={{ color: "#d4af37", fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>
              {senderName}
            </p>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0 }}>
              wants to challenge you!
            </p>
          </div>
        </div>

        <div 
          className="challenge-mode-icon"
          style={{ 
            background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
            fontSize: "2rem",
            margin: "16px auto"
          }}
        >
          {getModeIcon(modeId)}
        </div>

        <h2 className="challenge-modal-title">
          {getModeName(modeId)}
        </h2>

        <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: 24 }}>
          Accept to start the challenge now!
        </p>

        <div style={{ display: "flex", gap: 12 }}>
          <button 
            className="challenge-btn-secondary"
            onClick={handleDecline}
            disabled={loading}
            style={{
              flex: 1,
              background: "rgba(239, 68, 68, 0.2)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              color: "#ef4444"
            }}
          >
            {loading ? "..." : "Decline"}
          </button>
          <button 
            className="challenge-btn-primary"
            onClick={handleAccept}
            disabled={loading}
            style={{
              flex: 2,
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)"
            }}
          >
            {loading ? "Loading..." : "Accept Challenge!"}
          </button>
        </div>
      </div>
    </div>
  );
}
