import mascotCongrats from "../../assets/mascots/mascot_congratulation.webp";
import mascotDefeated from "../../assets/mascots/mascot_defeated.webp";
import mascotBoss from "../../assets/mascots/mascot_boss.webp";
import "./ChallengeModals.css";

export default function ChallengeResultsModal({ 
  mode, 
  score, 
  totalQuestions,
  result, // "win", "lose", "draw"
  rewards,
  opponentName,
  opponentScore,
  answeredCount, // Number of questions answered by user (for Speed Run)
  opponentAnsweredCount, // Number of questions answered by opponent (for Speed Run)
  onClose 
}) {
  // For Speed Run, use answered count; otherwise use total questions
  const isSpeedRun = mode === "speed_run" || mode?.id === "speed_run";
  const userTotal = isSpeedRun && answeredCount ? answeredCount : totalQuestions;
  const opponentTotal = isSpeedRun && opponentAnsweredCount ? opponentAnsweredCount : totalQuestions;
  
  // Guard against division by zero (if user answered no questions)
  const percentage = userTotal > 0 ? Math.round((score / userTotal) * 100) : 0;
  
  // Handle mode as either string or object
  const isBossLevel = mode === "boss_level" || mode?.id === "boss_level" || mode?.name?.includes("Boss");
  const modeGradient = typeof mode === "object" ? mode.gradient : "linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)";
  const modeGlow = typeof mode === "object" ? mode.glow : "0 0 20px rgba(212, 175, 55, 0.5)";
  
  const getMessage = () => {
    if (result === "win") return "You Won! 🎉";
    if (result === "lose") return "Better luck next time! 💪";
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
      if (result === "lose") return mascotDefeated;
      return mascotBoss;
    }
    
    // Regular challenges show result-based mascots
    if (result === "win") return mascotCongrats;
    if (result === "lose") return mascotDefeated;
    
    // For draws in regular challenges, show congratulation (friendly)
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
            <span className="score-value" style={{ wordBreak: "break-word" }}>{score ?? 0}/{userTotal}</span>
            <span className="score-percentage">{percentage ?? 0}%</span>
          </div>
          
          {!isBossLevel && (
            <>
              <div className="score-vs">VS</div>
              
              <div className="score-section">
                <span className="score-label" style={{ 
                  wordBreak: "break-word",
                  maxWidth: "120px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "normal",
                  lineHeight: "1.2"
                }}>{opponentName || "Opponent"}</span>
                <span className="score-value" style={{ wordBreak: "break-word" }}>
                  {opponentScore !== null && opponentScore !== undefined ? `${opponentScore}/${opponentTotal}` : "Pending"}
                </span>
                {opponentScore !== null && opponentScore !== undefined && (
                  <span className="score-percentage">
                    {opponentTotal > 0 ? Math.round((opponentScore / opponentTotal) * 100) : 0}%
                  </span>
                )}
              </div>
            </>
          )}
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
          onClick={onClose}
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
