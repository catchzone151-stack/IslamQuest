import { useDeveloperStore } from "../store/developerStore";
import "./DeveloperModal.css";

export default function DeveloperModal() {
  const { 
    betaMode, 
    showDeveloperMenu, 
    closeDeveloperMenu, 
    toggleBetaMode,
    resetOnboarding,
    resetFullProgress,
    getDebugInfo
  } = useDeveloperStore();

  if (!showDeveloperMenu) return null;

  const debugInfo = getDebugInfo();

  return (
    <div className="dev-modal-overlay" onClick={closeDeveloperMenu}>
      <div className="dev-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dev-modal-header">
          <h2>🔧 Developer Tools</h2>
          <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>
            Private - For Testing Only
          </p>
        </div>

        <div className="dev-modal-content">
          {/* Beta Mode Toggle */}
          <div className="dev-section">
            <div className="dev-section-header">
              <span className="dev-icon">🧪</span>
              <h3>Beta Mode</h3>
            </div>
            <div className="dev-control">
              <div className="dev-control-info">
                <p className="dev-control-label">
                  {betaMode ? "✅ ENABLED" : "❌ DISABLED"}
                </p>
                <p className="dev-control-desc">
                  {betaMode 
                    ? "All content unlocked for testing" 
                    : "Normal production behavior"}
                </p>
              </div>
              <button 
                className={`dev-btn ${betaMode ? "dev-btn-danger" : "dev-btn-primary"}`}
                onClick={toggleBetaMode}
              >
                {betaMode ? "Disable Beta" : "Enable Beta"}
              </button>
            </div>
          </div>

          {/* Reset Actions */}
          <div className="dev-section">
            <div className="dev-section-header">
              <span className="dev-icon">🔄</span>
              <h3>Reset Actions</h3>
            </div>
            <div className="dev-actions">
              <button 
                className="dev-btn dev-btn-secondary"
                onClick={resetOnboarding}
              >
                Reset Onboarding
              </button>
              <button 
                className="dev-btn dev-btn-danger"
                onClick={resetFullProgress}
              >
                Reset All Progress
              </button>
            </div>
          </div>

          {/* Debug Info */}
          <div className="dev-section">
            <div className="dev-section-header">
              <span className="dev-icon">📊</span>
              <h3>Debug Information</h3>
            </div>
            <div className="dev-debug-grid">
              <div className="dev-debug-item">
                <span className="dev-debug-label">XP</span>
                <span className="dev-debug-value">{debugInfo.xp.toLocaleString()}</span>
              </div>
              <div className="dev-debug-item">
                <span className="dev-debug-label">Coins</span>
                <span className="dev-debug-value">{debugInfo.coins.toLocaleString()}</span>
              </div>
              <div className="dev-debug-item">
                <span className="dev-debug-label">Streak</span>
                <span className="dev-debug-value">{debugInfo.streak} days</span>
              </div>
              <div className="dev-debug-item">
                <span className="dev-debug-label">Level</span>
                <span 
                  className="dev-debug-value"
                  style={{ color: debugInfo.levelColor }}
                >
                  {debugInfo.level} {debugInfo.levelBadge}
                </span>
              </div>
              <div className="dev-debug-item">
                <span className="dev-debug-label">Completed Lessons</span>
                <span className="dev-debug-value">{debugInfo.completedLessons}</span>
              </div>
              <div className="dev-debug-item">
                <span className="dev-debug-label">App Version</span>
                <span className="dev-debug-value">{debugInfo.appVersion}</span>
              </div>
              <div className="dev-debug-item">
                <span className="dev-debug-label">Onboarding</span>
                <span className="dev-debug-value">
                  {debugInfo.hasCompletedOnboarding ? "✅ Done" : "❌ Pending"}
                </span>
              </div>
              <div className="dev-debug-item">
                <span className="dev-debug-label">Beta Mode</span>
                <span className="dev-debug-value">
                  {debugInfo.betaMode ? "🧪 Active" : "🔒 Off"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="dev-modal-footer">
          <button 
            className="dev-btn dev-btn-close"
            onClick={closeDeveloperMenu}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
