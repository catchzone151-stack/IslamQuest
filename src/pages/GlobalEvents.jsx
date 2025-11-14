import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEventsStore } from "../store/eventsStore";
import { useProgressStore } from "../store/progressStore";
import FinalResultsModal from "../components/events/FinalResultsModal";
import InsufficientCoinsModal from "../components/events/InsufficientCoinsModal";
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
    getEntry
  } = useEventsStore();
  
  const { coins } = useProgressStore();
  const events = getEvents();
  const resultsUnlocked = areResultsUnlocked();
  
  const [timeLeft, setTimeLeft] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showInsufficientCoinsModal, setShowInsufficientCoinsModal] = useState(false);

  // Check for week reset on mount
  useEffect(() => {
    checkWeekReset();
  }, [checkWeekReset]);

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
    const entered = hasEntered(event.id);
    
    // If results unlocked and user entered, show results modal
    if (resultsUnlocked && entered) {
      setSelectedEvent(event);
      setShowResultsModal(true);
      return;
    }
    
    // Check if user has enough coins
    if (coins < 25) {
      setShowInsufficientCoinsModal(true);
      return;
    }
    
    // Check if already entered
    if (entered) {
      alert("You've already entered this event this week! Results unlock Thursday 22:00 GMT.");
      return;
    }
    
    // Navigate to event quiz
    navigate(`/events/${event.id}`);
  };

  return (
    <div className="global-events-container">
      {/* Header */}
      <div className="events-header">
        <button className="back-btn" onClick={() => navigate("/challenge")}>
          ← Back
        </button>
        <h1 className="events-title">🌍 Global Events</h1>
        <p className="events-subtitle">Compete with Muslims worldwide</p>
      </div>

      {/* Timer Banner */}
      <div className="events-timer-banner">
        <div className="timer-icon">⏰</div>
        <div className="timer-text">
          {resultsUnlocked ? (
            <>
              <span className="timer-label">Results Available!</span>
              <span className="timer-value">Tap events you entered to see rankings</span>
            </>
          ) : (
            <>
              <span className="timer-label">Results Unlock</span>
              <span className="timer-value">{timeLeft}</span>
            </>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="events-info-card">
        <p className="info-text">
          <span className="info-highlight">Entry fee:</span> 25 coins per event • 
          <span className="info-highlight"> Weekly reset:</span> Friday 00:00 GMT •
          <span className="info-highlight"> Rewards:</span> Based on your rank
        </p>
      </div>

      {/* Event Cards Grid */}
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
              {/* Status Badge */}
              {entered && (
                <div className="event-status-badge">
                  {hasResults ? '🏆 View Results' : '✅ Entered'}
                </div>
              )}
              
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

              {/* New Results Indicator */}
              {hasResults && !viewed && (
                <div className="new-results-badge">NEW!</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Final Results Modal */}
      {showResultsModal && selectedEvent && (
        <FinalResultsModal
          event={selectedEvent}
          onClose={() => {
            setShowResultsModal(false);
            setSelectedEvent(null);
          }}
        />
      )}

      {/* Insufficient Coins Modal */}
      {showInsufficientCoinsModal && (
        <InsufficientCoinsModal
          onClose={() => setShowInsufficientCoinsModal(false)}
        />
      )}
    </div>
  );
}
