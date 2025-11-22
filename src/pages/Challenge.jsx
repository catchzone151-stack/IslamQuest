import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Globe } from "lucide-react";
import { useNavigate } from "../hooks/useNavigate";
import { useChallengeStore, CHALLENGE_MODES, BOSS_LEVEL } from "../store/challengeStore";
import { useProgressStore } from "../store/progressStore";
import { useFriendsStore } from "../store/friendsStore";
import { useModalStore, MODAL_TYPES } from "../store/modalStore";
import { useDeveloperStore } from "../store/developerStore";
import { getCurrentLevel } from "../utils/diamondLevels";
import BossLevelMascot from "../assets/mascots/mascot_boss.webp";
import mascot_running from "../assets/mascots/mascot_running.webp";
import mascot_quiz from "../assets/mascots/mascot_quiz.webp";
import mascot_power from "../assets/mascots/mascot_power.webp";
import mascot_locked from "../assets/mascots/mascot_locked.webp";

export default function Challenge() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { xp } = useProgressStore();
  const level = getCurrentLevel(xp).level;
  const { friends } = useFriendsStore();
  const { loadFromStorage } = useChallengeStore();
  const { showModal } = useModalStore();

  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showFriendSelector, setShowFriendSelector] = useState(false);
  
  // Use ref to ensure we always have the latest friend value
  const friendRef = useRef(null);

  useEffect(() => {
    loadFromStorage();
    
    // Check if friend was pre-selected from Friends page
    if (location.state?.preselectedFriend) {
      console.log('👥 Pre-selected friend detected:', location.state.preselectedFriend);
      const friend = location.state.preselectedFriend;
      setSelectedFriend(friend);
      friendRef.current = friend;
    }
  }, [location.state]);

  const handleModeClick = (modeKey) => {
    const mode = CHALLENGE_MODES[modeKey];
    setSelectedMode(mode);
    
    console.log('🎯 handleModeClick', { modeKey, mode, selectedFriend });
    
    // If friend is already pre-selected (from Friends page), skip friend selector
    if (selectedFriend) {
      console.log('✅ Friend already selected, going to explainer');
      // Check beta mode for shared lessons requirement
      const betaMode = useDeveloperStore.getState().betaMode;
      
      if (!betaMode) {
        const shared = useChallengeStore.getState().getSharedLessons("current_user", selectedFriend.id);
        if (shared.length === 0) {
          showModal(MODAL_TYPES.NO_SHARED_LESSONS, {
            friendName: selectedFriend.name
          });
          return;
        }
      }
      
      // Go straight to explainer
      showModal(MODAL_TYPES.CHALLENGE_EXPLAINER, {
        mode: mode,
        onStart: () => handleStartChallenge(mode),
        onCancel: handleCancelExplainer
      });
    } else {
      // No pre-selected friend, show friend selector
      setShowFriendSelector(true);
    }
  };

  const handleFriendSelect = (friend) => {
    setSelectedFriend(friend);
    friendRef.current = friend;
    setShowFriendSelector(false);
    
    // 🤖 BETA MODE: Skip shared lessons check for testing
    const betaMode = useDeveloperStore.getState().betaMode;
    
    if (!betaMode) {
      // Check if they have shared lessons (only in production mode)
      const shared = useChallengeStore.getState().getSharedLessons("current_user", friend.id);
      if (shared.length === 0) {
        showModal(MODAL_TYPES.NO_SHARED_LESSONS, {
          friendName: friend.name
        });
        return;
      }
    }
    
    showModal(MODAL_TYPES.CHALLENGE_EXPLAINER, {
      mode: selectedMode,
      onStart: () => handleStartChallenge(selectedMode),
      onCancel: handleCancelExplainer
    });
  };

  const handleBossClick = () => {
    // 🧪 BETA MODE: Allow Boss Level access below Level 8 for testing
    const betaMode = useDeveloperStore.getState().betaMode;
    
    if (level < BOSS_LEVEL.minLevel && !betaMode) {
      showModal(MODAL_TYPES.BOSS_LOCKED, {
        currentLevel: level,
        requiredLevel: BOSS_LEVEL.minLevel
      });
      return;
    }

    const canPlay = useChallengeStore.getState().canPlayBossToday();
    if (!canPlay) {
      alert("You've already completed the Boss Level today! Come back tomorrow.");
      return;
    }

    setSelectedMode(BOSS_LEVEL);
    showModal(MODAL_TYPES.CHALLENGE_EXPLAINER, {
      mode: BOSS_LEVEL,
      onStart: () => handleStartChallenge(BOSS_LEVEL),
      onCancel: handleCancelExplainer
    });
  };

  const handleStartChallenge = (modeOverride = null) => {
    // Use the passed mode or fall back to selectedMode
    const currentMode = modeOverride || selectedMode;
    
    // Use ref for friend to get latest value immediately
    const currentFriend = friendRef.current || selectedFriend;
    
    console.log('🎮 handleStartChallenge called', { 
      modeOverride, 
      selectedMode, 
      currentMode,
      selectedFriend,
      friendRef: friendRef.current,
      currentFriend
    });
    
    // Check if this is boss level (use both checks for reliability)
    const isBossLevel = currentMode?.id === "boss_level" || currentMode?.name === "Boss Level";
    
    if (isBossLevel) {
      // Start boss level immediately - capture mode in closure
      showModal(MODAL_TYPES.CHALLENGE_COUNTDOWN, {
        onComplete: () => {
          navigate(`/challenge/boss`);
        }
      });
      return; // Exit early for boss level
    }
    
    // Create friend challenge (requires currentFriend)
    if (!currentFriend) {
      console.error('❌ No currentFriend!', { currentFriend, selectedFriend, friendRef: friendRef.current });
      alert("Please select a friend to challenge.");
      return;
    }
    
    console.log('✅ Creating challenge', { friendId: currentFriend.id, modeId: currentMode.id });
    
    const result = useChallengeStore.getState().createChallenge(
      currentFriend.id,
      currentMode.id
    );
      
    if (result.success) {
      showModal(MODAL_TYPES.CHALLENGE_COUNTDOWN, {
        onComplete: () => {
          // Get the latest challenge ID
          const challenges = useChallengeStore.getState().challenges;
          const latestChallenge = challenges[challenges.length - 1];
          if (latestChallenge) {
            navigate(`/challenge/${latestChallenge.id}`);
          }
        }
      });
    } else {
      alert("Failed to create challenge. Please try again.");
    }
  };

  const handleCancelExplainer = () => {
    setSelectedMode(null);
    setSelectedFriend(null);
  };

  return (
    <div className="screen no-extra-space" style={{
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 16,
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
            <Globe size={28} style={{ color: "#D4AF37" }} />
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
          gap: 14,
          marginBottom: 20
        }}>
          {Object.keys(CHALLENGE_MODES).map((modeKey) => {
            const mode = CHALLENGE_MODES[modeKey];
            let mascotImage = null;
            
            if (mode.id === "speed_run") {
              mascotImage = mascot_running;
            } else if (mode.id === "mind_battle") {
              mascotImage = mascot_quiz;
            } else if (mode.id === "lightning_round") {
              mascotImage = mascot_power;
            } else if (mode.id === "sudden_death") {
              mascotImage = mascot_locked;
            }
            
            return (
              <div
                key={mode.id}
                onClick={() => handleModeClick(modeKey)}
                style={{
                  background: mode.gradient,
                  borderRadius: 16,
                  padding: "18px 12px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: mode.glow,
                  minHeight: 220,
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
                <div style={{ fontSize: "2.5rem", marginBottom: 8, height: "100px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {mascotImage ? (
                    <img 
                      src={mascotImage} 
                      alt={mode.name} 
                      style={{ 
                        width: "auto", 
                        height: mode.id === "mind_battle" ? "60px" : mode.id === "lightning_round" ? "78px" : "70px", 
                        objectFit: "contain" 
                      }}
                    />
                  ) : (
                    mode.icon
                  )}
                </div>
                <h4 style={{ color: "#fff", margin: "0 0 6px", fontSize: "1.05rem", fontWeight: 700, lineHeight: 1.2 }}>
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
            padding: "24px 20px 20px 20px",
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
            <>
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "linear-gradient(135deg, rgba(55, 65, 81, 0.85), rgba(31, 41, 55, 0.85))",
                borderRadius: 18,
                pointerEvents: "none"
              }} />
              <div style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "rgba(0,0,0,0.7)",
                borderRadius: 20,
                padding: "4px 12px",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#94a3b8",
                zIndex: 2
              }}>
                🔒 Level {BOSS_LEVEL.minLevel}+ Only
              </div>
            </>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, marginTop: 8, position: "relative", zIndex: 1 }}>
            <img 
              src={BossLevelMascot} 
              alt="Boss Level Mascot" 
              style={{ 
                width: "85px", 
                height: "85px",
                filter: "drop-shadow(0 0 20px rgba(59, 130, 246, 0.8)) drop-shadow(0 0 40px rgba(59, 130, 246, 0.5))",
                animation: "bossAura 2s ease-in-out infinite"
              }} 
            />
            <div>
              <h2 style={{ color: level >= BOSS_LEVEL.minLevel ? "#d4af37" : "#94a3b8", margin: "0 0 4px", fontSize: "1.4rem", fontWeight: 700 }}>
                Boss Level Challenge the Dev
              </h2>
              <p style={{ color: level >= BOSS_LEVEL.minLevel ? "#10b981" : "#6b7280", margin: 0, fontSize: "0.85rem", fontWeight: 600 }}>
                {useChallengeStore.getState().canPlayBossToday() ? "✓ Available Today" : "⏰ Played Today"}
              </p>
            </div>
          </div>

          <p style={{ opacity: 0.95, lineHeight: 1.5, fontSize: "0.9rem", marginBottom: 12, position: "relative", zIndex: 1 }}>
            {BOSS_LEVEL.description}
          </p>

          <div style={{ 
            background: "rgba(0,0,0,0.3)", 
            borderRadius: 10, 
            padding: "10px 14px",
            fontSize: "0.85rem",
            color: level >= BOSS_LEVEL.minLevel ? "#10b981" : "#6b7280",
            fontWeight: 600,
            position: "relative",
            zIndex: 1
          }}>
            Rewards: +{BOSS_LEVEL.rewards.win.xp} XP • +{BOSS_LEVEL.rewards.win.coins} coins
          </div>
        </div>
      </div>

      {/* Friend Selector Modal (UI-only, not in central modal system) */}
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
        
        @keyframes bossAura {
          0%, 100% {
            filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.8)) drop-shadow(0 0 40px rgba(59, 130, 246, 0.5));
          }
          50% {
            filter: drop-shadow(0 0 30px rgba(59, 130, 246, 1)) drop-shadow(0 0 50px rgba(59, 130, 246, 0.7));
          }
        }
      `}</style>
    </div>
  );
}
