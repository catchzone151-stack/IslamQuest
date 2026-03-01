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
import img_pillar_clash from "../assets/challenge_pillar_clash.png";
import img_seerah from "../assets/challenge_seerah.png";
import img_names_allah from "../assets/challenge_names_allah.png";
import img_faith_test from "../assets/challenge_faith_test.png";

const EVENT_IMAGES = {
  "Pillar Clash": img_pillar_clash,
  "Seerah Challenge": img_seerah,
  "Names of Allah Mastery": img_names_allah,
  "Faith Test": img_faith_test,
};

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
      showModal(MODAL_TYPES.PURCHASE);
      return;
    }
    // Show Eid coming soon modal
    showModal(MODAL_TYPES.EID_COMING_SOON);
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
        
        {/* Launch Date Banner */}
        <div style={{
          background: "linear-gradient(135deg, #1a3a7a 0%, #2563eb 60%, #1d4ed8 100%)",
          border: "1.5px solid rgba(255,215,0,0.55)",
          borderRadius: 16,
          padding: "16px 20px",
          textAlign: "center",
          marginBottom: 12,
        }}>
          <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>🚀</div>
          <div style={{ color: "#FFD700", fontWeight: 800, fontSize: "1rem", marginBottom: 4 }}>
            Launching 1 Muharram 1448
          </div>
          <div style={{ color: "rgba(212,175,55,0.8)", fontSize: "0.82rem", fontWeight: 600, marginBottom: 10 }}>
            16 June 2026 · Islamic New Year
          </div>
          <div style={{ color: "#ffffff", fontSize: "0.8rem", lineHeight: 1.5 }}>
            Get ready to compete with Muslims worldwide, in shā' Allāh
          </div>
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
              {/* Event Image */}
              {EVENT_IMAGES[event.name] && (
                <img
                  src={EVENT_IMAGES[event.name]}
                  alt={event.name}
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                    borderRadius: 18,
                    display: "block",
                  }}
                />
              )}

              {/* Entered Badge - Bottom Center */}
              {entered && (
                <div className="event-entered-badge">
                  ✅ Entered
                </div>
              )}


              {/* Premium Lock Overlay */}
              {!isUserPremium && (
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(30, 30, 30, 0.85)",
                  borderRadius: 18,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                  gap: 8,
                }}>
                  <Lock 
                    size={32} 
                    color="#D4AF37" 
                    strokeWidth={2.5}
                    style={{ filter: "drop-shadow(0 0 4px rgba(212,175,55,0.5))" }}
                  />
                  <span style={{ 
                    fontSize: "0.75rem",
                    color: "#D4AF37", 
                    fontWeight: 700, 
                    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
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
