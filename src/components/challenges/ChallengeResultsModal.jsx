import ZaydChallenge from "../../assets/mascots/mascot_zayd_challenge.webp";
import "./ChallengeModals.css";

export default function ChallengeResultsModal({ 
  mode, 
  score, 
  totalQuestions,
  result, // "win", "lose", "draw"
  rewards,
  opponentName,
  opponentScore,
  onClose 
}) {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  const getMessage = () => {
    if (result === "win") return "You Won! 🎉";
    if (result === "lose") return "Better luck next time! 💪";
    if (result === "draw") return "It's a Draw! 🤝";
    return "Challenge Complete!";
  };

  const getZaydMessage = () => {
    if (result === "win") return "MashaAllah! You dominated that challenge!";
    if (result === "lose") return "Don't give up! Learn from your mistakes!";
    if (result === "draw") return "Evenly matched! Both of you are strong!";
    return "Great effort!";
  };

  return (
    <div className="challenge-modal-overlay">
      <div className="challenge-modal challenge-results-modal">
        {/* Zayd with Speech */}
        <div className="challenge-zayd-container">
          <img 
            src={ZaydChallenge} 
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
        <div className="challenge-score-display">
          <div className="score-section">
            <span className="score-label">You</span>
            <span className="score-value">{score}/{totalQuestions}</span>
            <span className="score-percentage">{percentage}%</span>
          </div>
          
          <div className="score-vs">VS</div>
          
          <div className="score-section">
            <span className="score-label">{opponentName || "Opponent"}</span>
            <span className="score-value">
              {opponentScore !== null ? `${opponentScore}/${totalQuestions}` : "Pending"}
            </span>
            {opponentScore !== null && (
              <span className="score-percentage">
                {Math.round((opponentScore / totalQuestions) * 100)}%
              </span>
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
          onClick={onClose}
          style={{
            background: mode.gradient,
            boxShadow: mode.glow,
            marginTop: 12
          }}
        >
          Awesome! 🎯
        </button>
      </div>
    </div>
  );
}
