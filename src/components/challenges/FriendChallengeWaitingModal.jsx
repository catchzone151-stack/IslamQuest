import { useModalStore } from "../../store/modalStore";
import { getModeIcon, getModeName } from "../../utils/challengeQuestions";
import assets from "../../assets/assets";
import "./ChallengeModals.css";
import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useFriendChallengesStore } from "../../store/friendChallengesStore";

export default function FriendChallengeWaitingModal({ friendName, modeId, score, totalQuestions, onClose, challengeId }) {
  const { hideModal } = useModalStore();
  const loadChallenges = useFriendChallengesStore(state => state.loadChallenges);
  const [challengeData, setChallengeData] = useState(null);
  const pollIntervalRef = useRef(null);
  const mountedRef = useRef(true);
  
  const receiverAccepted = challengeData && (
    challengeData.status === 'accepted' || 
    challengeData.status === 'sender_done' || 
    challengeData.status === 'receiver_done' || 
    challengeData.status === 'finished'
  );
  
  const receiverFinished = challengeData && 
    challengeData.receiver_score !== null && 
    challengeData.receiver_score !== undefined;
  
  const fetchChallenge = useCallback(async () => {
    if (!mountedRef.current || !challengeId) return;
    
    try {
      const { data, error } = await supabase
        .from("friend_challenges")
        .select("status, receiver_score")
        .eq("id", challengeId)
        .single();
      
      if (error || !data || !mountedRef.current) return;
      
      console.log('[WaitingModal] Fetched:', data.status, 'receiver_score:', data.receiver_score);
      setChallengeData(data);
      
      await loadChallenges();
    } catch (err) {
      console.error('[WaitingModal] Fetch error:', err);
    }
  }, [challengeId, loadChallenges]);
  
  useEffect(() => {
    mountedRef.current = true;
    
    if (!challengeId) {
      console.log('[WaitingModal] No challengeId');
      return;
    }
    
    console.log('[WaitingModal] Starting poll for:', challengeId);
    
    fetchChallenge();
    pollIntervalRef.current = setInterval(fetchChallenge, 2500);
    
    return () => {
      mountedRef.current = false;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [challengeId, fetchChallenge]);
  
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
