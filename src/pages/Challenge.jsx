import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChallengeStore, CHALLENGE_MODES, BOSS_LEVEL } from "../store/challengeStore";
import { useProgressStore } from "../store/progressStore";
import { useFriendsStore } from "../store/friendsStore";
import ChallengeExplainerModal from "../components/challenges/ChallengeExplainerModal";
import ChallengeCountdown from "../components/challenges/ChallengeCountdown";
import NoSharedLessonsModal from "../components/challenges/NoSharedLessonsModal";
import BossLockedModal from "../components/challenges/BossLockedModal";
import ZaydDefault from "../assets/mascots/mascot_zayd_default.webp";

export default function Challenge() {
  const navigate = useNavigate();
  
  const { level } = useProgressStore();
  const { friends } = useFriendsStore();
  const { loadFromStorage } = useChallengeStore();

  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showExplainer, setShowExplainer] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [showNoSharedLessons, setShowNoSharedLessons] = useState(false);
  const [showBossLocked, setShowBossLocked] = useState(false);
  const [showFriendSelector, setShowFriendSelector] = useState(false);

  useEffect(() => {
    loadFromStorage();
  }, []);

  const handleModeClick = (modeKey) => {
    const mode = CHALLENGE_MODES[modeKey];
    setSelectedMode(mode);
    setShowFriendSelector(true);
  };

  const handleFriendSelect = (friend) => {
    setSelectedFriend(friend);
    setShowFriendSelector(false);
    
    // Check if they have shared lessons
    const shared = useChallengeStore.getState().getSharedLessons("current_user", friend.id);
    if (shared.length === 0) {
      setShowNoSharedLessons(true);
      return;
    }
    
    setShowExplainer(true);
  };

  const handleBossClick = () => {
    if (level < BOSS_LEVEL.minLevel) {
      setShowBossLocked(true);
      return;
    }

    const canPlay = useChallengeStore.getState().canPlayBossToday();
    if (!canPlay) {
      alert("You've already completed the Boss Level today! Come back tomorrow.");
      return;
    }

    setSelectedMode(BOSS_LEVEL);
    setShowExplainer(true);
  };

  const handleStartChallenge = () => {
    setShowExplainer(false);
    
    if (selectedMode.id === "boss_level") {
      // Start boss level immediately
      setShowCountdown(true);
    } else {
      // Create friend challenge
      const result = useChallengeStore.getState().createChallenge(
        selectedFriend.id,
        selectedMode.id
      );
      
      if (result.success) {
        setShowCountdown(true);
      } else {
        alert("Failed to create challenge. Please try again.");
      }
    }
  };

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    
    if (selectedMode.id === "boss_level") {
      navigate(`/challenge/boss`);
    } else {
      // Get the latest challenge ID
      const challenges = useChallengeStore.getState().challenges;
      const latestChallenge = challenges[challenges.length - 1];
      if (latestChallenge) {
        navigate(`/challenge/${latestChallenge.id}`);
      }
    }
  };

  const handleCancelExplainer = () => {
    setShowExplainer(false);
    setSelectedMode(null);
    setSelectedFriend(null);
  };

  return (
    <div style={{
      minHeight: "100vh",
      padding: 16,
      paddingBottom: 90,
      background: "linear-gradient(to bottom, #081426, #0e2340)",
      color: "white",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginTop: 10, marginBottom: 20 }}>
        <h1 style={{
          fontSize: "clamp(1.3rem, 5vw, 1.8rem)",
          fontWeight: 800,
          margin: 0,
          background: "linear-gradient(90deg, #FFD700, #FFA500, #FFD700)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundSize: "200%",
          animation: "shimmer 8s linear infinite",
        }}>
          Challenges Hub
        </h1>
        <p style={{ opacity: 0.9, marginTop: 6 }}>
          Test your knowledge and compete 🏆
        </p>
      </div>

      {/* Global Events Card */}
      <div onClick={() => navigate("/events")} style={{
        maxWidth: 520,
        margin: "0 auto 24px",
        background: "linear-gradient(135deg, rgba(212,175,55,0.25), rgba(16,185,129,0.2))",
        border: "2px solid rgba(212,175,55,0.5)",
        borderRadius: 18,
        padding: 16,
        boxShadow: "0 0 30px rgba(212,175,55,0.4)",
        cursor: "pointer",
        transition: "all 0.3s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: "2rem" }}>🌍</span>
            <h2 style={{ color: "#d4af37", margin: 0, fontSize: "1.3rem", fontWeight: 700 }}>
              Global Events
            </h2>
          </div>
          <p style={{ color: "#10b981", margin: 0, fontSize: "0.85rem", fontWeight: 600 }}>
            🔴 LIVE NOW
          </p>
        </div>
        <button style={{
          width: "100%",
          background: "linear-gradient(135deg, #10b981, #059669)",
          border: "none",
          padding: "12px 18px",
          borderRadius: 12,
          fontWeight: 700,
          fontSize: "1rem",
          cursor: "pointer",
          color: "white",
          boxShadow: "0 4px 15px rgba(16,185,129,0.3)",
        }} onClick={(e) => { e.stopPropagation(); navigate("/events"); }}>
          Enter Global Events →
        </button>
      </div>

      {/* Friend Challenges Section */}
      <div style={{ maxWidth: 600, margin: "0 auto 24px" }}>
        <h3 style={{ color: "#d4af37", fontSize: "1.2rem", marginBottom: 12, textAlign: "center" }}>
          👥 Friend Challenges
        </h3>
        <p style={{ color: "#cbd5e1", fontSize: "0.85rem", textAlign: "center", marginBottom: 16, opacity: 0.9 }}>
          Challenge your friends in 4 exciting game modes!
        </p>

        {/* Challenge Mode Cards - 2x2 Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
          marginBottom: 20
        }}>
          {Object.keys(CHALLENGE_MODES).map((modeKey) => {
            const mode = CHALLENGE_MODES[modeKey];
            return (
              <div
                key={mode.id}
                onClick={() => handleModeClick(modeKey)}
                style={{
                  background: mode.gradient,
                  borderRadius: 16,
                  padding: "16px 12px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: mode.glow,
                  minHeight: 140,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  textAlign: "center"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>{mode.icon}</div>
                <h4 style={{ color: "#fff", margin: "0 0 6px", fontSize: "1.05rem", fontWeight: 700 }}>
                  {mode.name}
                </h4>
                <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.75rem", margin: 0, lineHeight: 1.3 }}>
                  {mode.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Boss Level Card */}
      <div style={{ maxWidth: 520, margin: "0 auto 24px" }}>
        <div
          onClick={handleBossClick}
          style={{
            background: level >= BOSS_LEVEL.minLevel 
              ? BOSS_LEVEL.gradient 
              : "linear-gradient(135deg, #374151, #1f2937)",
            border: level >= BOSS_LEVEL.minLevel 
              ? "2px solid rgba(212,175,55,0.5)"
              : "2px solid rgba(107,114,128,0.3)",
            borderRadius: 18,
            padding: 20,
            boxShadow: level >= BOSS_LEVEL.minLevel 
              ? BOSS_LEVEL.glow 
              : "0 0 20px rgba(107,114,128,0.3)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            position: "relative",
            animation: level >= BOSS_LEVEL.minLevel ? "bossGlow 2s ease-in-out infinite" : "none"
          }}
        >
          {level < BOSS_LEVEL.minLevel && (
            <div style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "rgba(0,0,0,0.7)",
              borderRadius: 20,
              padding: "4px 12px",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#94a3b8"
            }}>
              🔒 Level {BOSS_LEVEL.minLevel}+ Only
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <img src={ZaydDefault} alt="Zayd" style={{ width: "60px", height: "60px" }} />
            <div>
              <h2 style={{ color: level >= BOSS_LEVEL.minLevel ? "#d4af37" : "#94a3b8", margin: "0 0 4px", fontSize: "1.4rem", fontWeight: 700 }}>
                {BOSS_LEVEL.name}
              </h2>
              <p style={{ color: level >= BOSS_LEVEL.minLevel ? "#10b981" : "#6b7280", margin: 0, fontSize: "0.85rem", fontWeight: 600 }}>
                {useChallengeStore.getState().canPlayBossToday() ? "✓ Available Today" : "⏰ Played Today"}
              </p>
            </div>
          </div>

          <p style={{ opacity: 0.95, lineHeight: 1.5, fontSize: "0.9rem", marginBottom: 12 }}>
            {BOSS_LEVEL.description} • {BOSS_LEVEL.questionCount} ultra-hard questions • {BOSS_LEVEL.totalTime}s total
          </p>

          <div style={{ 
            background: "rgba(0,0,0,0.3)", 
            borderRadius: 10, 
            padding: "10px 14px",
            fontSize: "0.85rem",
            color: level >= BOSS_LEVEL.minLevel ? "#10b981" : "#6b7280",
            fontWeight: 600
          }}>
            Rewards: +{BOSS_LEVEL.rewards.win.xp} XP • +{BOSS_LEVEL.rewards.win.coins} coins
          </div>
        </div>
      </div>

      {/* Challenge the Dev Card */}
      <div style={{ maxWidth: 520, margin: "0 auto 24px" }}>
        <div
          onClick={() => alert("Coming soon! The developer challenge will be available in the next update. 🚀")}
          style={{
            background: "linear-gradient(135deg, #1e3a5f 0%, #0f1c2e 100%)",
            border: "2px solid rgba(212,175,55,0.5)",
            borderRadius: 18,
            padding: 20,
            boxShadow: "0 0 30px rgba(30, 58, 95, 0.7)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            position: "relative",
          }}
        >
          <div style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "rgba(212,175,55,0.2)",
            borderRadius: 20,
            padding: "4px 12px",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#d4af37"
          }}>
            🔥 Coming Soon
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <img src={ZaydDefault} alt="Zayd" style={{ width: "60px", height: "60px" }} />
            <div>
              <h2 style={{ color: "#d4af37", margin: "0 0 4px", fontSize: "1.4rem", fontWeight: 700 }}>
                Challenge the Dev!
              </h2>
              <p style={{ color: "#10b981", margin: 0, fontSize: "0.85rem", fontWeight: 600 }}>
                ⚡ Ultimate Challenge
              </p>
            </div>
          </div>

          <p style={{ opacity: 0.95, lineHeight: 1.5, fontSize: "0.9rem", marginBottom: 12 }}>
            Think you can beat the developer? Test your Islamic knowledge against handpicked questions!
          </p>

          <div style={{ 
            background: "rgba(0,0,0,0.3)", 
            borderRadius: 10, 
            padding: "10px 14px",
            fontSize: "0.85rem",
            color: "#10b981",
            fontWeight: 600
          }}>
            Rewards: +500 XP • +100 coins
          </div>
        </div>
      </div>

      {/* Modals */}
      {showExplainer && selectedMode && (
        <ChallengeExplainerModal
          mode={selectedMode}
          onStart={handleStartChallenge}
          onCancel={handleCancelExplainer}
        />
      )}

      {showCountdown && (
        <ChallengeCountdown onComplete={handleCountdownComplete} />
      )}

      {showNoSharedLessons && (
        <NoSharedLessonsModal
          friendName={selectedFriend?.name}
          onClose={() => {
            setShowNoSharedLessons(false);
            setSelectedMode(null);
            setSelectedFriend(null);
          }}
        />
      )}

      {showBossLocked && (
        <BossLockedModal
          currentLevel={level}
          onClose={() => setShowBossLocked(false)}
        />
      )}

      {/* Friend Selector Modal */}
      {showFriendSelector && (
        <div className="challenge-modal-overlay" onClick={() => setShowFriendSelector(false)}>
          <div className="challenge-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="challenge-modal-title">Select Friend</h2>
            <p className="challenge-modal-subtitle">Who do you want to challenge?</p>
            
            {friends.length === 0 ? (
              <p style={{ color: "#cbd5e1", textAlign: "center", padding: "20px 0" }}>
                You don't have any friends yet. Add friends from the Friends tab!
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 300, overflowY: "auto" }}>
                {friends.map(friend => (
                  <div
                    key={friend.id}
                    onClick={() => handleFriendSelect(friend)}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      padding: 12,
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "#d4af37",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.2rem"
                      }}>
                        👤
                      </div>
                      <div>
                        <div style={{ color: "#fff", fontWeight: 600 }}>{friend.name}</div>
                        <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                          Level {friend.level || 1} • {friend.xp} XP
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button 
              className="challenge-btn-secondary"
              onClick={() => setShowFriendSelector(false)}
              style={{ marginTop: 16 }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        
        @keyframes bossGlow {
          0%, 100% {
            box-shadow: 0 0 30px rgba(212, 175, 55, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(212, 175, 55, 0.8);
          }
        }
      `}</style>
    </div>
  );
}
