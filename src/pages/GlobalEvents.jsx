import React, { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import { useNavigate } from "../hooks/useNavigate";
import { useEventsStore } from "../store/eventsStore";
import { useProgressStore } from "../store/progressStore";
import { useModalStore, MODAL_TYPES } from "../store/modalStore";
import { useUserStore } from "../store/useUserStore";
import { getAvatarImage } from "../utils/avatarUtils";
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
  
  const { coins } = useProgressStore();
  const { showModal } = useModalStore();
  const events = getEvents();
  const resultsUnlocked = areResultsUnlocked();
  
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
    // Show Ramadan coming soon modal
    showModal(MODAL_TYPES.RAMADAN_COMING_SOON);
  };

  return (
    <div className="screen no-extra-space global-events-container" style={{ position: "relative" }}>
      {/* Header */}
      <div className="events-header">
        <button className="back-btn" onClick={() => navigate("/challenge")}>
          ← Back
        </button>
        <h1 className="events-title">
          <span style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            marginRight: '8px',
            color: '#D4AF37'
          }}>
            <Globe size={24} />
          </span>
          Global Events
        </h1>
        <p className="events-subtitle">Compete with Muslims worldwide</p>
      </div>

      {/* Info Card */}
      <div className="events-info-card">
        <p className="info-text">
          <span className="info-highlight">Entry fee:</span> 25 coins per event • 
          <span className="info-highlight"> Weekly reset:</span> Friday 00:00 GMT •
          <span className="info-highlight"> Rewards:</span> Based on your rank
        </p>
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
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
