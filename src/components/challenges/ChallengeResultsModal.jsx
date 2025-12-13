import { useRef, useEffect } from "react";
import { useRewards } from "../../hooks/useRewards";
import { useVibration } from "../../hooks/useVibration";
import mascotCongrats from "../../assets/mascots/mascot_congratulation.webp";
import mascotSittingV2 from "../../assets/mascots/mascot_sitting_v2.webp";
import mascotDefeated from "../../assets/mascots/mascot_defeated.webp";
import mascotBoss from "../../assets/mascots/mascot_boss.webp";
import avatarManLantern from "../../assets/avatars/avatar_man_lantern.webp";
import "./ChallengeModals.css";

export default function ChallengeResultsModal({ 
  mode, 
  score, 
  totalQuestions,
  result, // "win", "lose", "draw"
  rewards,
  xpEarned,
  coinsEarned,
  opponentName,
  opponentScore,
  answeredCount, // Number of questions answered by user (for Speed Run)
  opponentAnsweredCount, // Number of questions answered by opponent (for Speed Run)
  userChain, // Longest chain for Sudden Death
  opponentChain, // Opponent's longest chain for Sudden Death
  onApplyRewards,
  onClose 
}) {
  const { addRewards } = useRewards();
  const { vibrate } = useVibration();
  const hasAppliedRewards = useRef(false);
  
  // Trigger haptic feedback when modal appears
  useEffect(() => {
    if (result === "win") {
      vibrate([100, 50, 100, 50, 100]); // Victory pattern
    } else if (result === "lose") {
      vibrate([200, 100, 200]); // Failure pattern
    } else {
      // Draw - use selection pattern (neutral outcome)
      vibrate(50);
    }
  }, [result, vibrate]);
  
  const handleClose = () => {
    // Apply rewards exactly once when closing
    if (!hasAppliedRewards.current) {
      hasAppliedRewards.current = true;
      const rewardData = { xp: xpEarned || rewards?.xp || 0, coins: coinsEarned || rewards?.coins || 0 };
      addRewards(rewardData);
      if (onApplyRewards) {
        onApplyRewards(rewardData);
      }
    }
    if (onClose) {
      onClose();
    }
  };
  // Determine mode types
  const isSpeedRun = mode === "speed_run" || mode?.id === "speed_run";
  const isSuddenDeath = mode === "sudden_death" || mode?.id === "sudden_death";
  const isBossLevel = mode === "boss_level" || mode?.id === "boss_level" || mode?.name?.includes("Boss");
  
  // For Speed Run, use answered count; otherwise use total questions
  const userTotal = isSpeedRun && answeredCount ? answeredCount : totalQuestions;
  const opponentTotal = isSpeedRun && opponentAnsweredCount ? opponentAnsweredCount : totalQuestions;
  
  // Guard against division by zero (if user answered no questions)
  const percentage = userTotal > 0 ? Math.round((score / userTotal) * 100) : 0;
  
  // Handle mode as either string or object
  const modeGradient = typeof mode === "object" ? mode.gradient : "linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)";
  const modeGlow = typeof mode === "object" ? mode.glow : "0 0 20px rgba(212, 175, 55, 0.5)";
  
  const getMessage = () => {
    if (result === "win") return "You Won! 🎉";
    if (result === "lose") {
      if (isBossLevel) {
        return "Keep going! You're improving every time!";
      }
      return "Better luck next time! 💪";
    }
    if (result === "draw") return "It's a Draw! 🤝";
    return "Challenge Complete!";
  };

  const getZaydMessage = () => {
    if (result === "win") return "masha'Allah! You dominated that challenge!";
    if (result === "lose") return "Don't give up! Learn from your mistakes!";
    if (result === "draw") return "Evenly matched! Both of you are strong!";
    return "Great effort!";
  };

  const getMascot = () => {
    // Boss level shows appropriate mascot based on result
    if (isBossLevel) {
      if (result === "win") return mascotCongrats;
      if (result === "lose") return avatarManLantern;
      return mascotBoss;
    }
    
    // Regular challenges show result-based mascots
    if (result === "win") return mascotCongrats;
    if (result === "lose") return mascotDefeated;
    if (result === "draw") return mascotSittingV2;
    
    // Default fallback
    return mascotCongrats;
  };

  return (
    <div className="challenge-modal-overlay">
      <div className="challenge-modal challenge-results-modal">
        {/* Zayd with Speech */}
        <div className="challenge-zayd-container">
          <img 
            src={getMascot()} 
            alt="Zayd" 
            className="challenge-zayd-bounce"
            style={{ width: 100, height: "auto" }}
          />
          <div className="zayd-speech-bubble">{getZaydMessage()}</div>
        </div>

        {/* Result Title */}
        <h2 
          className="challenge-modal-title"
          style={{
            color: result === "win" ? "#10b981" : result === "lose" ? "#ef4444" : "#f59e0b"
          }}
        >
          {getMessage()}
        </h2>

        {/* Score Display */}
        <div className="challenge-score-display" style={{ minHeight: "100px" }}>
          <div className="score-section">
            <span className="score-label">You</span>
            {isSuddenDeath ? (
              <>
                <span className="score-value" style={{ wordBreak: "break-word" }}>Chain: {userChain ?? 0}</span>
              </>
            ) : (
              <>
                <span className="score-value" style={{ wordBreak: "break-word" }}>{score ?? 0}/{userTotal}</span>
                <span className="score-percentage">{percentage ?? 0}%</span>
              </>
            )}
          </div>
          
          <div className="score-vs">VS</div>
          
          <div className="score-section">
            <span className="score-label" style={{ 
              wordBreak: "break-word",
              maxWidth: "120px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "normal",
              lineHeight: "1.2"
            }}>{isBossLevel ? "The Boss 👑" : (opponentName || "Opponent")}</span>
            {isSuddenDeath ? (
              <span className="score-value" style={{ wordBreak: "break-word" }}>
                {opponentChain !== null && opponentChain !== undefined ? `Chain: ${opponentChain}` : "Pending"}
              </span>
            ) : isBossLevel ? (
              <>
                <span className="score-value" style={{ wordBreak: "break-word" }}>11/{totalQuestions}</span>
                <span className="score-percentage">{Math.round((11 / totalQuestions) * 100)}%</span>
              </>
            ) : (
              <>
                <span className="score-value" style={{ wordBreak: "break-word" }}>
                  {opponentScore !== null && opponentScore !== undefined ? `${opponentScore}/${opponentTotal}` : "—"}
                </span>
                {opponentScore !== null && opponentScore !== undefined && (
                  <span className="score-percentage">
                    {opponentTotal > 0 ? Math.round((opponentScore / opponentTotal) * 100) : 0}%
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Rewards Earned */}
        <div className="challenge-rewards-earned">
          <h4 style={{ color: "#d4af37", marginBottom: 8 }}>Rewards Earned</h4>
          <div className="rewards-display">
            <div className="reward-badge">
              <span className="reward-icon">⭐</span>
              <span className="reward-text">+{rewards.xp} XP</span>
            </div>
            {rewards.coins > 0 && (
              <div className="reward-badge">
                <span className="reward-icon">💰</span>
                <span className="reward-text">+{rewards.coins} Coins</span>
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button 
          className="challenge-btn-primary"
          onClick={() => {
            vibrate(50);
            handleClose();
          }}
          style={{
            background: modeGradient,
            boxShadow: modeGlow,
            marginTop: 12
          }}
        >
          Awesome! 🎯
        </button>
      </div>
    </div>
  );
}
