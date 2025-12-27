import React, { useState, useEffect } from "react";
import { Globe, Lock } from "lucide-react";
import { useNavigate } from "../hooks/useNavigate";
import { useEventsStore } from "../store/eventsStore";
import { useProgressStore } from "../store/progressStore";
import { useModalStore, MODAL_TYPES } from "../store/modalStore";
import { useUserStore } from "../store/useUserStore";
import { getAvatarImage } from "../utils/avatarUtils";
import { openAppStore } from "../utils/appStoreUtils";
import "./GlobalEvents.css";

export default function GlobalEvents() {
  const navigate = useNavigate();
  const {
    getEvents,
    hasEntered,
    areResultsUnlocked,
    getTimeUntilResults,
    checkWeekReset,
    areResultsViewed,
    getEntry,
    loadMyEntries,
    loadLeaderboard,
    getMyRank,
    claimEventRewards
  } = useEventsStore();
  
  const { coins, premium, premiumStatus } = useProgressStore();
  const { showModal } = useModalStore();
  const events = getEvents();
  const resultsUnlocked = areResultsUnlocked();
  
  const isUserPremium = premium || premiumStatus !== "free";
  
  const [timeLeft, setTimeLeft] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // Check for week reset on mount, load cloud entries
  useEffect(() => {
    const initEvents = async () => {
      setIsLoadingEvents(true);
      checkWeekReset();
      
      // Load cloud entries for the current week
      try {
        await loadMyEntries();
      } catch (err) {
        console.log('Cloud entries not available:', err.message);
      }
      
      setIsLoadingEvents(false);
    };
    
    initEvents();
  }, [checkWeekReset, loadMyEntries]);

  // Update countdown timer
  useEffect(() => {
    const updateTimer = () => {
      const ms = getTimeUntilResults();
      const days = Math.floor(ms / (1000 * 60 * 60 * 24));
      const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h until results`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m until results`);
      } else {
        setTimeLeft(`${minutes}m until results`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [getTimeUntilResults]);

  const handleEventClick = (event) => {
    if (!isUserPremium) {
      openAppStore();
      return;
    }
    // Show Ramadan coming soon modal
    showModal(MODAL_TYPES.RAMADAN_COMING_SOON);
  };

  return (
    <div className="screen no-extra-space global-events-container" style={{ position: "relative" }}>
      {/* Back Button */}
      <div style={{ padding: "16px 16px 0" }}>
        <button className="back-btn" onClick={() => navigate("/challenge")}>
          ← Back
        </button>
      </div>

      {/* Header */}
      <div className="events-header" style={{ textAlign: "center", padding: "16px 20px" }}>
        <h1 className="events-title" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: 0 }}>
          <Globe size={24} style={{ color: '#D4AF37' }} />
          Global Events
        </h1>
        <p className="events-subtitle" style={{ textAlign: "center", margin: "8px 0 16px", color: "#94a3b8" }}>Compete with Muslims worldwide</p>
        
        {/* Info Section */}
        <div style={{ 
          background: "rgba(212, 175, 55, 0.1)", 
          borderRadius: 12, 
          padding: "12px 16px",
          border: "1px solid rgba(212, 175, 55, 0.2)",
          display: "inline-block",
          textAlign: "center"
        }}>
          <p style={{ color: "#cbd5e1", fontSize: "0.85rem", margin: "0 0 4px" }}>
            <span style={{ color: "#D4AF37" }}>Entry fee:</span> 25 coins per event
          </p>
          <p style={{ color: "#cbd5e1", fontSize: "0.85rem", margin: "0 0 4px" }}>
            <span style={{ color: "#D4AF37" }}>Weekly reset:</span> Friday 00:00 GMT
          </p>
          <p style={{ color: "#cbd5e1", fontSize: "0.85rem", margin: 0 }}>
            <span style={{ color: "#D4AF37" }}>Rewards:</span> Based on your rank
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoadingEvents && (
        <div style={{
          padding: "40px 20px",
          textAlign: "center",
          color: "#D4AF37"
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "12px" }}>⏳</div>
          <p>Loading events...</p>
        </div>
      )}

      {/* Event Cards Grid */}
      {!isLoadingEvents && (
      <div className="events-grid">
        {events.map((event) => {
          const entered = hasEntered(event.id);
          const hasResults = resultsUnlocked && entered;
          const viewed = areResultsViewed(event.id);
          
          return (
            <div
              key={event.id}
              className={`event-card ${hasResults && !viewed ? 'pulsing' : ''}`}
              style={{
                background: event.theme.gradient,
                boxShadow: `${event.theme.glow}, 0 4px 20px rgba(0,0,0,0.3)`
              }}
              onClick={() => handleEventClick(event)}
            >
              {/* Event Icon */}
              <div className="event-icon">{event.icon}</div>
              
              {/* Event Name */}
              <h3 className="event-name">{event.name}</h3>
              
              {/* Event Description */}
              <p className="event-description">{event.description}</p>
              
              {/* Entry Info */}
              <div className="event-footer">
                <span className="event-entry-fee">💰 25 coins</span>
                <span className="event-leaderboard-icon">📊</span>
              </div>

              {/* Entered Badge - Bottom Center */}
              {entered && (
                <div className="event-entered-badge">
                  ✅ Entered
                </div>
              )}

              {/* New Event Badge (for un-entered events) */}
              {!entered && (
                <div className="new-event-badge">Coming soon</div>
              )}

              {/* Premium Lock Overlay */}
              {!isUserPremium && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0, 0, 0, 0.6)",
                  backdropFilter: "blur(2px)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                  borderRadius: "inherit",
                }}>
                  <div style={{
                    width: "44px",
                    height: "44px",
                    background: "rgba(0,0,0,0.5)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "8px",
                    border: "2px solid #FFD700"
                  }}>
                    <Lock size={20} color="#FFD700" />
                  </div>
                  <span style={{ 
                    color: "#FFD700", 
                    fontWeight: 700, 
                    fontSize: "0.85rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    Premium Only
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
