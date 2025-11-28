import { useModalStore } from "../../store/modalStore";
import { getModeIcon, getModeName } from "../../utils/challengeQuestions";
import assets from "../../assets/assets";
import "./ChallengeModals.css";
import { useEffect, useState, useRef } from "react";
import { useFriendChallengesStore } from "../../store/friendChallengesStore";

export default function FriendChallengeWaitingModal({ friendName, modeId, score, totalQuestions, onClose, challengeId }) {
  const { hideModal } = useModalStore();
  const [receiverAccepted, setReceiverAccepted] = useState(false);
  const [receiverFinished, setReceiverFinished] = useState(false);
  const pollIntervalRef = useRef(null);
  
  useEffect(() => {
    if (!challengeId) {
      console.log('[WaitingModal] No challengeId provided');
      return;
    }
    
    console.log('[WaitingModal] Starting to monitor challenge:', challengeId);
    
    const checkChallengeStatus = async () => {
      try {
        // Get the store instance
        const store = useFriendChallengesStore.getState();
        
        // Load fresh data from database
        await store.loadChallenges();
        
        // Get updated store state after loading
        const updatedStore = useFriendChallengesStore.getState();
        const allChalls = [
          ...updatedStore.pendingOutgoing,
          ...updatedStore.activeChallenges,
          ...updatedStore.completedChallenges
        ];
        
        const challenge = allChalls.find(c => c.id === challengeId);
        console.log('[WaitingModal] Poll check:', {
          challengeId,
          found: !!challenge,
          status: challenge?.status,
          receiverScore: challenge?.receiver_score,
          accepted: receiverAccepted,
          finished: receiverFinished
        });
        
        if (challenge) {
          // Check if receiver has started (status accepted)
          if (challenge.status === 'accepted' && !receiverAccepted) {
            console.log('[WaitingModal] 🎉 Receiver ACCEPTED!');
            setReceiverAccepted(true);
          }
          
          // Check if receiver has finished
          if (challenge.receiver_score !== null && !receiverFinished) {
            console.log('[WaitingModal] ✨ Receiver FINISHED!');
            setReceiverFinished(true);
          }
        }
      } catch (error) {
        console.error('[WaitingModal] Error checking challenge status:', error);
      }
    };
    
    // Check immediately
    checkChallengeStatus();
    
    // Set up polling every 2 seconds
    pollIntervalRef.current = setInterval(checkChallengeStatus, 2000);
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [challengeId]);
  
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
            {receiverFinished 
              ? "Your friend finished! Time to see the results!" 
              : receiverAccepted 
              ? "Your friend accepted! They're taking the challenge now..."
              : "You finished! Now we wait for your friend..."}
          </div>
        </div>

        <div 
          className="challenge-mode-icon"
          style={{ 
            background: receiverFinished 
              ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" 
              : receiverAccepted
              ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
              : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            fontSize: "2rem",
            margin: "16px auto",
            transition: "all 0.3s ease"
          }}
        >
          {receiverFinished ? "✨" : receiverAccepted ? "⚡" : "⏳"}
        </div>

        <h2 className="challenge-modal-title" style={{ 
          color: receiverFinished ? "#22c55e" : receiverAccepted ? "#3b82f6" : "#f59e0b",
          transition: "color 0.3s ease"
        }}>
          {receiverFinished ? "Time for Results!" : receiverAccepted ? "Challenge Accepted!" : `Waiting for ${friendName}`}
        </h2>

        <p style={{ color: "#cbd5e1", fontSize: "1rem", lineHeight: 1.6, marginBottom: 8 }}>
          You've completed the <strong>{getModeName(modeId)}</strong> challenge!
        </p>

        {score !== undefined && totalQuestions !== undefined && (
          <div style={{
            background: "rgba(212, 175, 55, 0.15)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            borderRadius: "12px",
            padding: "12px 20px",
            margin: "16px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}>
            <span style={{ fontSize: "1.5rem" }}>🎯</span>
            <span style={{ color: "#D4AF37", fontWeight: "700", fontSize: "1.2rem" }}>
              Your Score: {score}/{totalQuestions}
            </span>
          </div>
        )}
        
        <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: 24 }}>
          {receiverFinished 
            ? "Your friend completed the challenge. Tap Got it! to see your results."
            : receiverAccepted
            ? "Your friend is now taking the quiz..."
            : "You'll see the results when your friend finishes."}
        </p>

        <button 
          className="challenge-btn-primary"
          onClick={handleClose}
          style={{
            background: receiverFinished 
              ? "linear-gradient(135deg, #22c55e, #16a34a)"
              : receiverAccepted
              ? "linear-gradient(135deg, #3b82f6, #2563eb)"
              : "linear-gradient(135deg, #f59e0b, #d97706)",
            boxShadow: receiverFinished 
              ? "0 4px 15px rgba(34, 197, 94, 0.3)"
              : receiverAccepted
              ? "0 4px 15px rgba(59, 130, 246, 0.3)"
              : "0 4px 15px rgba(245, 158, 11, 0.3)",
            transition: "all 0.3s ease"
          }}
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
