import { useModalStore } from "../../store/modalStore";
import { useFriendChallengesStore } from "../../store/friendChallengesStore";
import { useProgressStore } from "../../store/progressStore";
import { getModeIcon, getModeName } from "../../utils/challengeQuestions";
import { getAvatarImage } from "../../utils/avatarUtils";
import { CHALLENGE_MODES } from "../../store/challengeStore";
import assets from "../../assets/assets";
import "./ChallengeModals.css";

export default function FriendChallengeResultsModal({ 
  challenge,
  currentUserId,
  onChallengeAgain,
  onClose 
}) {
  const { hideModal } = useModalStore();
  const { markResultViewed, determineWinner, getRewards } = useFriendChallengesStore();
  const { addXP, addCoins } = useProgressStore();
  
  const isSender = challenge?.sender_id === currentUserId;
  const modeId = challenge?.challenge_type;
  const modeConfig = Object.values(CHALLENGE_MODES).find(m => m.id === modeId);
  
  const myScore = isSender ? challenge?.sender_score : challenge?.receiver_score;
  const opponentScore = isSender ? challenge?.receiver_score : challenge?.sender_score;
  const myTime = isSender ? challenge?.sender_time : challenge?.receiver_time;
  const opponentTime = isSender ? challenge?.receiver_time : challenge?.sender_time;
  const myChain = isSender ? challenge?.sender_chain : challenge?.receiver_chain;
  const opponentChain = isSender ? challenge?.receiver_chain : challenge?.sender_chain;
  
  const winnerId = determineWinner(challenge);
  const isWinner = winnerId === currentUserId;
  const isDraw = winnerId === "draw";
  
  const rewards = getRewards(challenge, winnerId);
  
  const handleClose = async () => {
    console.log("[ResultsModal] handleClose called");
    try {
      await markResultViewed(challenge.id);
      if (rewards.xp > 0) addXP(rewards.xp);
      if (rewards.coins > 0) addCoins(rewards.coins);
    } catch (err) {
      console.error("[ResultsModal] handleClose error:", err);
    }
    onClose?.();
  };
  
  const handleChallengeAgain = async () => {
    console.log("[ResultsModal] handleChallengeAgain called");
    try {
      await markResultViewed(challenge.id);
      if (rewards.xp > 0) addXP(rewards.xp);
      if (rewards.coins > 0) addCoins(rewards.coins);
    } catch (err) {
      console.error("[ResultsModal] handleChallengeAgain error:", err);
    }
    onChallengeAgain?.();
  };
  
  const resultColor = isDraw ? "#f59e0b" : (isWinner ? "#10b981" : "#ef4444");
  const resultText = isDraw ? "It's a Draw!" : (isWinner ? "You Won!" : "You Lost");
  const resultEmoji = isDraw ? "🤝" : (isWinner ? "🏆" : "😔");
  
  return (
    <div className="challenge-modal-overlay" onClick={handleClose}>
      <div className="challenge-modal" onClick={(e) => e.stopPropagation()}>
        <div className="challenge-zayd-container">
          <img 
            src={isWinner ? assets.mascots.mascot_celebrate : assets.mascots.mascot_sitting_v2} 
            alt="Zayd" 
            className={isWinner ? "challenge-zayd-bounce" : ""}
            style={{ width: 100, height: "auto" }}
          />
        </div>

        <div 
          style={{ 
            fontSize: "3rem",
            margin: "8px 0"
          }}
        >
          {resultEmoji}
        </div>

        <h2 className="challenge-modal-title" style={{ color: resultColor }}>
          {resultText}
        </h2>

        <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: 16 }}>
          {getModeIcon(modeId)} {getModeName(modeId)}
        </p>

        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: 24,
          margin: "16px 0",
          padding: "16px",
          background: "rgba(255,255,255,0.05)",
          borderRadius: 12,
        }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#94a3b8", fontSize: "0.8rem", margin: 0 }}>You</p>
            <p style={{ 
              color: isWinner || isDraw ? "#10b981" : "#fff", 
              fontSize: "1.8rem", 
              fontWeight: 700, 
              margin: "4px 0" 
            }}>
              {modeConfig?.id === "sudden_death" ? myChain : myScore}
            </p>
            {myTime && (
              <p style={{ color: "#64748b", fontSize: "0.75rem", margin: 0 }}>
                {Math.round(myTime)}s
              </p>
            )}
          </div>
          
          <div style={{ 
            display: "flex", 
            alignItems: "center",
            color: "#64748b",
            fontSize: "1.2rem"
          }}>
            vs
          </div>
          
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#94a3b8", fontSize: "0.8rem", margin: 0 }}>Opponent</p>
            <p style={{ 
              color: !isWinner && !isDraw ? "#ef4444" : "#fff", 
              fontSize: "1.8rem", 
              fontWeight: 700, 
              margin: "4px 0" 
            }}>
              {modeConfig?.id === "sudden_death" ? opponentChain : opponentScore}
            </p>
            {opponentTime && (
              <p style={{ color: "#64748b", fontSize: "0.75rem", margin: 0 }}>
                {Math.round(opponentTime)}s
              </p>
            )}
          </div>
        </div>

        {(rewards.xp > 0 || rewards.coins > 0) && (
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            margin: "16px 0",
          }}>
            {rewards.xp > 0 && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(212, 175, 55, 0.15)",
                padding: "8px 14px",
                borderRadius: 20,
                border: "1px solid rgba(212, 175, 55, 0.3)"
              }}>
                <span>⚡</span>
                <span style={{ color: "#d4af37", fontWeight: 600 }}>+{rewards.xp} XP</span>
              </div>
            )}
            {rewards.coins > 0 && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(212, 175, 55, 0.15)",
                padding: "8px 14px",
                borderRadius: 20,
                border: "1px solid rgba(212, 175, 55, 0.3)"
              }}>
                <span>🪙</span>
                <span style={{ color: "#d4af37", fontWeight: 600 }}>+{rewards.coins}</span>
              </div>
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <button 
            className="challenge-btn-secondary"
            onClick={handleClose}
            style={{
              flex: 1,
              background: "rgba(100, 116, 139, 0.2)",
              border: "1px solid rgba(100, 116, 139, 0.4)",
              color: "#94a3b8"
            }}
          >
            Close
          </button>
          <button 
            className="challenge-btn-primary"
            onClick={handleChallengeAgain}
            style={{
              flex: 2,
              background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
              boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)"
            }}
          >
            Challenge Again!
          </button>
        </div>
      </div>
    </div>
  );
}
