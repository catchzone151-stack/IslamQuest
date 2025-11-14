import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProgressStore } from "../store/progressStore";
import { FREE_LESSON_LIMITS } from "../store/premiumConfig";
import PurchaseModal from "../components/PurchaseModal";
import lionDefault from "../assets/mascots/mascot_zayd_default.webp";
import { getLessonsForPath } from "../data/lessonLoader";

export default function PathPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pathId = parseInt(id, 10);

  const { 
    paths, 
    isLessonUnlocked, 
    premiumStatus, 
    unlockPremium, 
    lessonStates, 
    lockedLessons 
  } = useProgressStore();

  const [showModal, setShowModal] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMsg, setPopupMsg] = useState("");

  const path = paths.find((p) => p.id === pathId);
  const lessons = getLessonsForPath(pathId);
  const totalLessons = lessons.length;

  const currentLessonId = (() => {
    const pathProgress = lessonStates[pathId] || {};
    const completed = Object.keys(pathProgress).filter(
      (k) => pathProgress[k]?.passed
    ).length;
    return completed + 1;
  })();

  const handleLessonClick = (lesson) => {
    const unlocked = isLessonUnlocked(pathId, lesson.id);
    
    if (!unlocked) {
      // Check if it's premium-locked or sequentially-locked
      const freeLimit = FREE_LESSON_LIMITS[pathId] || 0;
      const isPremiumLocked = premiumStatus === "free" && lesson.id > freeLimit;
      
      if (isPremiumLocked) {
        // Show premium purchase modal
        setShowModal(true);
        return;
      } else {
        // Show sequential unlock message
        setPopupMsg("Complete the previous lesson to unlock this one!");
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 2500);
        return;
      }
    }
    
    navigate(`/lesson/${pathId}/${lesson.id}`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 20% 20%, #1a2337 0%, #000814 70%)",
        color: "white",
        padding: "32px 16px",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontSize: "1.8rem",
          marginBottom: "1rem",
          color: "#FFD700",
        }}
      >
        {path?.title || "Learning Path"}
      </h2>

      {/* Avatar */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <img
          src={lionDefault}
          alt="Mascot"
          style={{ width: "90px", height: "90px", animation: "bounce 2s infinite" }}
        />
      </div>

      {/* Lessons Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
          gap: "16px",
          maxWidth: "600px",
          margin: "24px auto",
        }}
      >
        {lessons.map((lesson) => {
          const unlocked = isLessonUnlocked(pathId, lesson.id);
          const isCurrent = lesson.id === currentLessonId;
          return (
            <div
              key={lesson.id}
              onClick={() => handleLessonClick(lesson)}
              style={{
                position: "relative",
                background: unlocked
                  ? "linear-gradient(180deg, #FFD700 0%, #b89600 100%)"
                  : "rgba(255,255,255,0.05)",
                color: unlocked ? "#000814" : "rgba(255,255,255,0.4)",
                borderRadius: "16px",
                height: "100px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "1.1rem",
                cursor: "pointer",
                border: unlocked ? "2px solid #FFD700" : "2px solid #222",
                transition: "all 0.3s ease",
                animation: unlocked 
                  ? (isCurrent ? "currentLessonPulse 2s ease-in-out infinite" : "goldPulse 2s ease-in-out infinite")
                  : "none",
              }}
            >
              <span
                style={{
                  opacity: unlocked ? 1 : 0.3,
                  zIndex: 1,
                  position: "relative",
                }}
              >
                Lesson {lesson.id}
              </span>

              {!unlocked && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.8) 100%)",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ color: "#FFD700", fontSize: "1.8rem" }}>🔒</span>
                </div>
              )}

              {isCurrent && (
                <img
                  src={lionDefault}
                  alt="Avatar"
                  style={{
                    position: "absolute",
                    top: "-40px",
                    width: "60px",
                    height: "60px",
                    animation: "bounce 2s infinite",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#111827",
            border: "2px solid #FFD700",
            borderRadius: "16px",
            padding: "20px 30px",
            color: "white",
            textAlign: "center",
            boxShadow: "0 0 20px rgba(255, 215, 0, 0.3)",
            zIndex: 1000,
          }}
        >
          {popupMsg}
        </div>
      )}

      {showModal && (
        <PurchaseModal
          onClose={() => setShowModal(false)}
          onPurchase={(planType) => {
            unlockPremium(planType); // Pass "individual" or "family"
            setShowModal(false);
            setPopupMsg("Alhamdulillah! Full access unlocked 🎉");
            setShowPopup(true);
            setTimeout(() => setShowPopup(false), 2500);
          }}
        />
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes goldPulse {
          0%, 100% { 
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.3); 
          }
          50% { 
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.5); 
          }
        }
        
        @keyframes currentLessonPulse {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.6); 
          }
          50% { 
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.5); 
          }
        }
      `}</style>
    </div>
  );
}
