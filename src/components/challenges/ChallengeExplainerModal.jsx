import mascot_quiz from "../../assets/mascots/mascot_quiz.webp";
import mascot_power from "../../assets/mascots/mascot_power.webp";
import mascot_running from "../../assets/mascots/mascot_running.webp";
import mascot_locked from "../../assets/mascots/mascot_locked.webp";
import mascot_boss from "../../assets/mascots/mascot_boss.webp";
import "./ChallengeModals.css";

const getMascotForMode = (modeId) => {
  switch (modeId) {
    case "mind_battle":
      return mascot_quiz;
    case "lightning_round":
      return mascot_power;
    case "speed_run":
      return mascot_running;
    case "sudden_death":
      return mascot_locked;
    case "boss_level":
      return mascot_boss;
    default:
      return mascot_quiz;
  }
};

export default function ChallengeExplainerModal({ mode, onStart, onCancel }) {
  const mascot = getMascotForMode(mode?.id);

  return (
    <div className="challenge-modal-overlay">
      <div className="challenge-modal">
        <div className="challenge-zayd-container">
          <img 
            src={mascot} 
            alt={mode?.name || "Challenge"} 
            className="challenge-zayd-bounce"
            style={{ width: 100, height: "auto" }}
          />
        </div>

        <h2 className="challenge-modal-title">{mode.name}</h2>
        <p className="challenge-modal-subtitle">{mode.description}</p>

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
