import ZaydChallenge from "../../assets/mascots/mascot_boss.webp";
import mascot_running from "../../assets/mascots/mascot_running.webp";
import "./ChallengeModals.css";

export default function ChallengeExplainerModal({ mode, onStart, onCancel }) {
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
        </div>

        {/* Mode Icon */}
        <div 
          className="challenge-mode-icon"
          style={{
            background: mode.gradient,
            boxShadow: mode.glow
          }}
        >
          {mode.id === "speed_run" ? (
            <img 
              src={mascot_running} 
              alt="Speed Run" 
              style={{ width: "50px", height: "auto" }}
            />
          ) : (
            mode.icon
          )}
        </div>

        {/* Title */}
        <h2 className="challenge-modal-title">{mode.name}</h2>
        <p className="challenge-modal-subtitle">{mode.description}</p>

        {/* Details */}
        <div className="challenge-details">
          {mode.questionCount && (
            <div className="challenge-detail-item">
              <span className="detail-icon">📋</span>
              <span>{mode.questionCount} Questions</span>
            </div>
          )}
          
          {mode.timePerQuestion && (
            <div className="challenge-detail-item">
              <span className="detail-icon">⏱️</span>
              <span>{mode.timePerQuestion}s per question</span>
            </div>
          )}
          
          {mode.totalTime && (
            <div className="challenge-detail-item">
              <span className="detail-icon">⚡</span>
              <span>{mode.totalTime}s total time</span>
            </div>
          )}
        </div>

        {/* Rewards */}
        <div className="challenge-rewards">
          <h4 style={{ color: "#d4af37", marginBottom: 8 }}>Rewards</h4>
          <div className="reward-grid">
            {mode.rewards.win && (
              <div className="reward-item">
                <span className="reward-label">Win</span>
                <span className="reward-value">
                  +{mode.rewards.win.xp} XP • +{mode.rewards.win.coins} coins
                </span>
              </div>
            )}
            {mode.rewards.lose && (
              <div className="reward-item">
                <span className="reward-label">Lose</span>
                <span className="reward-value">+{mode.rewards.lose.xp} XP</span>
              </div>
            )}
            {mode.rewards.draw && (
              <div className="reward-item">
                <span className="reward-label">Draw</span>
                <span className="reward-value">+{mode.rewards.draw.xp} XP each</span>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="challenge-modal-actions">
          <button 
            className="challenge-btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="challenge-btn-primary"
            style={{
              background: mode.gradient,
              boxShadow: mode.glow
            }}
            onClick={onStart}
          >
            Let's Go! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
