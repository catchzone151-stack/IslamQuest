import React, { useState, useEffect, useRef } from "react";
import { useEventsStore, EMPTY_LEADERBOARD } from "../../store/eventsStore";
import { useProgressStore } from "../../store/progressStore";
import { useUserStore } from "../../store/useUserStore";
import { shallow } from "zustand/shallow";
import assets from "../../assets/assets";
import { LevelBadge } from "../LevelBadge";
import "./EventModals.css";

export default function FinalResultsModal({ event, onClose }) {
  // Separate selectors to avoid shallow comparison issues
  const weekId = useEventsStore(state => state.currentWeekId);
  const entry = useEventsStore(state => state.weeklyEntries[event.id] ?? null);
  const leaderboard = useEventsStore(state => {
    const wid = state.currentWeekId;
    return wid ? (state.leaderboards[wid]?.[event.id] ?? EMPTY_LEADERBOARD) : EMPTY_LEADERBOARD;
  });
  
  const { addXP, addCoins, xp } = useProgressStore();
  const { nickname, avatar } = useUserStore();
  
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);
  const hasInitialized = useRef(false);
  
  // Derived state
  const hasLeaderboard = leaderboard !== EMPTY_LEADERBOARD && leaderboard.length > 0;
  const isLoading = entry && !hasLeaderboard;
  
  // Calculate userRank from leaderboard
  const userIndex = leaderboard.findIndex(p => p.userId === "current_user");
  const userRank = userIndex >= 0 ? userIndex + 1 : null;
  
  // Single initialization effect
  useEffect(() => {
    if (hasInitialized.current) return;
    if (!entry) return;
    
    // Generate leaderboard
    if (!hasLeaderboard) {
      const generateMockLeaderboard = useEventsStore.getState().generateMockLeaderboard;
      generateMockLeaderboard(event.id, entry);
    }
    
    // Grant rewards if we have a rank
    if (userRank) {
      const grantRewardsForEvent = useEventsStore.getState().grantRewardsForEvent;
      const rewards = grantRewardsForEvent(event.id, userRank);
      
      if (rewards) {
        addXP(rewards.xpReward);
        addCoins(rewards.coinReward);
      }
    }
    
    hasInitialized.current = true;
  }, [event.id, entry, hasLeaderboard, userRank, addXP, addCoins]);
  
  // Get Zayd message based on rank
  const getZaydMessage = () => {
    if (!userRank) return "Keep learning and growing! 🌙";
    
    if (userRank === 1) return "SubhanAllah! You conquered this week! 🏆";
    if (userRank <= 10) return "masha'Allah! You're a top achiever! 🌟";
    if (userRank <= 100) return "Great effort — keep climbing! 💪";
    return "Next week is yours, in shā' Allāh! 🌙";
  };
  
  const zaydImage = assets.mascots.mascot_congratulation;
  
  // Helper to get avatar image from avatar key
  const getAvatarImage = (avatarKey) => {
    return assets.avatars[avatarKey] || assets.avatars.avatar_dino;
  };
  
  // Handle missing entry (error state)
  if (!entry) {
    return (
      <div className="event-modal-overlay">
        <div className="event-modal">
          <p>Error: No entry found</p>
          <button onClick={onClose} className="modal-close-btn">Close</button>
        </div>
      </div>
    );
  }
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className="event-modal-overlay">
        <div className="event-modal">
          <p>Loading results...</p>
        </div>
      </div>
    );
  }
  
  const top10 = leaderboard.slice(0, 10);
  const userEntry = leaderboard.find(p => p.userId === "current_user");

  return (
    <div className="event-modal-overlay">
      <div className="event-modal final-results-modal">
        {/* Header */}
        <div className="modal-mascot-header">
          <img src={zaydImage} alt="Zayd" className="modal-zayd celebrate" />
        </div>
        
        <h2 className="modal-title">🏆 Global Event Results 🏆</h2>
        <p className="modal-subtitle">{event.icon} {event.name}</p>

        {/* Zayd Message */}
        <div className="zayd-message-card">
          <p className="zayd-message">{getZaydMessage()}</p>
        </div>

        {/* Your Rank */}
        {userRank && (
          <div className="your-rank-card">
            <p className="rank-label">Your Final Rank</p>
            <p className="rank-display">#{userRank}</p>
            <p className="rank-score">Score: {entry.score}/10</p>
          </div>
        )}

        {/* Top 10 Leaderboard */}
        <div className="leaderboard-section">
          <h3 className="leaderboard-title">🏅 Top 10 Champions</h3>
          <div className="leaderboard-list">
            {top10.map((player, index) => {
              const isUser = player.userId === "current_user";
              const rankClass = index === 0 ? 'gold' : index <= 2 ? 'silver' : 'bronze';
              
              return (
                <div
                  key={player.userId}
                  className={`leaderboard-item ${rankClass} ${isUser ? 'user-item' : ''}`}
                >
                  <div className="leaderboard-rank">#{index + 1}</div>
                  <img
                    src={getAvatarImage(isUser ? avatar : player.avatar)}
                    alt={player.nickname}
                    className="leaderboard-avatar"
                  />
                  <div className="leaderboard-info">
                    <p className="leaderboard-name">{isUser ? nickname : player.nickname}</p>
                    <LevelBadge xp={xp} size="small" />
                  </div>
                  <div className="leaderboard-score">{player.score}/10</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* User's Rank if outside top 10 */}
        {userEntry && userRank && userRank > 10 && (
          <div className="user-rank-highlight">
            <div className="leaderboard-item user-item">
              <div className="leaderboard-rank">#{userRank}</div>
              <img
                src={getAvatarImage(avatar)}
                alt={nickname}
                className="leaderboard-avatar"
              />
              <div className="leaderboard-info">
                <p className="leaderboard-name">{nickname}</p>
                <LevelBadge xp={xp} size="small" />
              </div>
              <div className="leaderboard-score">{entry.score}/10</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="modal-actions">
          {!showFullLeaderboard && (
            <>
              <button
                className="modal-btn-secondary"
                onClick={() => setShowFullLeaderboard(true)}
              >
                📊 View Full Leaderboard
              </button>
              <button className="modal-btn-primary" onClick={onClose}>
                🏡 Back to Events
              </button>
            </>
          )}
          
          {showFullLeaderboard && (
            <>
              <button
                className="modal-btn-secondary"
                onClick={() => setShowFullLeaderboard(false)}
              >
                ← Back to Top 10
              </button>
              <button className="modal-btn-primary" onClick={onClose}>
                🏡 Back to Events
              </button>
            </>
          )}
        </div>

        {/* Full Leaderboard View */}
        {showFullLeaderboard && (
          <div className="full-leaderboard-section">
            <h3 className="leaderboard-title">Complete Rankings</h3>
            <div className="full-leaderboard-list">
              {leaderboard.map((player, index) => {
                const isUser = player.userId === "current_user";
                
                return (
                  <div
                    key={`${player.userId}_${index}`}
                    className={`leaderboard-item-compact ${isUser ? 'user-item' : ''}`}
                  >
                    <span className="compact-rank">#{index + 1}</span>
                    <img
                      src={getAvatarImage(isUser ? avatar : player.avatar)}
                      alt={player.nickname}
                      className="compact-avatar"
                    />
                    <span className="compact-name">{isUser ? nickname : player.nickname}</span>
                    <span className="compact-score">{player.score}/10</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
