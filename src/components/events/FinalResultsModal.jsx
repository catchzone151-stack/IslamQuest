import React, { useState, useEffect } from "react";
import { useEventsStore } from "../../store/eventsStore";
import { useProgressStore } from "../../store/progressStore";
import { useUserStore } from "../../store/useUserStore";
import zaydHappy from "../../assets/zayd_happy.webp";
import zaydDefault from "../../assets/zayd_default.webp";
import LevelBadge from "../LevelBadge";
import { getAvatarImage } from "../../assets/assets";
import "./EventModals.css";

export default function FinalResultsModal({ event, onClose }) {
  const {
    getEntry,
    getLeaderboard,
    getUserRank,
    generateMockLeaderboard,
    markResultsViewed
  } = useEventsStore();
  
  const { addXP, addCoins, xp } = useProgressStore();
  const { nickname, avatar } = useUserStore();
  
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);
  const [rewardsApplied, setRewardsApplied] = useState(false);
  
  const entry = getEntry(event.id);
  let leaderboard = getLeaderboard(event.id);
  
  // Generate leaderboard if not exists
  useEffect(() => {
    if (leaderboard.length === 0 && entry) {
      generateMockLeaderboard(event.id, entry);
    }
  }, [event.id, entry, leaderboard.length, generateMockLeaderboard]);
  
  // Refresh leaderboard after generation
  useEffect(() => {
    if (leaderboard.length === 0) {
      leaderboard = getLeaderboard(event.id);
    }
  }, [event.id, getLeaderboard]);
  
  const userRank = getUserRank(event.id);
  
  // Apply rewards on mount (once)
  useEffect(() => {
    if (!entry || rewardsApplied || !userRank) return;
    
    let xpReward = 100;
    let coinReward = 10;
    
    if (userRank === 1) {
      xpReward = 1000;
      coinReward = 300;
    } else if (userRank <= 3) {
      xpReward = 750;
      coinReward = 200;
    } else if (userRank <= 10) {
      xpReward = 500;
      coinReward = 100;
    }
    
    addXP(xpReward);
    addCoins(coinReward);
    markResultsViewed(event.id);
    setRewardsApplied(true);
  }, [entry, userRank, rewardsApplied, addXP, addCoins, markResultsViewed, event.id]);
  
  // Get Zayd message based on rank
  const getZaydMessage = () => {
    if (!userRank) return "Keep learning and growing! 🌙";
    
    if (userRank === 1) return "SubhanAllah! You conquered this week! 🏆";
    if (userRank <= 10) return "MashaAllah! You're a top achiever! 🌟";
    if (userRank <= 100) return "Great effort — keep climbing! 💪";
    return "Next week is yours, in shā' Allāh! 🌙";
  };
  
  const zaydImage = userRank && userRank <= 10 ? zaydHappy : zaydDefault;
  
  if (!entry || leaderboard.length === 0) {
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
