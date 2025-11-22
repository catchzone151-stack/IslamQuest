import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "../hooks/useNavigate";
import { useProgressStore } from "../store/progressStore";
import { FREE_LESSON_LIMITS } from "../store/premiumConfig";
import PurchaseModal from "../components/PurchaseModal";
import PathMascot from "../assets/mascots/mascot_tasbih.webp";
import { getLessonsForPath } from "../data/lessonLoader";

// Map pathId to section names for each path
const SECTION_NAMES = {
  2: ["The Five Pillars of Islam", "The Six Pillars of Belief (Īmān)", "Living Islam"],
  3: ["The Messenger's Early Life", "The Struggle in Makkah", "The Migration & Medina Years", "The Final Years"],
  4: ["Fundamentals", "The Signs of the Hour", "The Grave & Resurrection"],
  // Add section names for other paths as needed
};

// Helper to determine section index for a lesson
const getSectionIndex = (pathId, lessonId) => {
  const sections = SECTION_NAMES[pathId];
  if (!sections) return 0;
  
  // For Foundations (pathId 2): Lessons 1-5 (section 0), 6-11 (section 1), 12-17 (section 2)
  if (pathId === 2) {
    if (lessonId <= 5) return 0;
    if (lessonId <= 11) return 1;
    return 2;
  }
  
  // For Prophet's Life (pathId 3): Lessons 1-6 (section 0), 7-12 (section 1), 13-18 (section 2), 19-22 (section 3)
  if (pathId === 3) {
    if (lessonId <= 6) return 0;
    if (lessonId <= 12) return 1;
    if (lessonId <= 18) return 2;
    return 3;
  }
  
  // For Grave & Afterlife (pathId 4): Lessons 1-6 (section 0), 7-12 (section 1), 13-17 (section 2)
  if (pathId === 4) {
    if (lessonId <= 6) return 0;
    if (lessonId <= 12) return 1;
    return 2;
  }
  
  return 0;
};

export default function PathPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pathId = parseInt(id, 10);

  const { 
    paths, 
    isLessonUnlocked, 
    premiumStatus, 
    purchaseIndividual,
    purchaseFamily,
    lessonStates, 
  } = useProgressStore();

  const [showModal, setShowModal] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMsg, setPopupMsg] = useState("");

  const path = paths.find((p) => p.id === pathId);
  const lessons = getLessonsForPath(pathId);

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
      const freeLimit = FREE_LESSON_LIMITS[pathId] || 0;
      const isPremiumLocked = premiumStatus === "free" && lesson.id > freeLimit;
      
      if (isPremiumLocked) {
        setShowModal(true);
        return;
      } else {
        setPopupMsg("Complete the previous lesson to unlock this one!");
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 2500);
        return;
      }
    }
    
    navigate(`/lesson/${pathId}/${lesson.id}`);
  };

  // Group lessons by section
  const sections = SECTION_NAMES[pathId] || ["Learning Path"];
  const groupedLessons = sections.map((sectionName, sectionIdx) => {
    return {
      name: sectionName,
      lessons: lessons.filter(lesson => getSectionIndex(pathId, lesson.id) === sectionIdx)
    };
  });
  
  // Calculate section heights for LEFT column alignment
  const sectionHeights = groupedLessons.map(section => {
    const lessonCount = section.lessons.length;
    // Each lesson: 64px circle + 48px gap (except last lesson in section)
    return lessonCount * 64 + (lessonCount - 1) * 48;
  });

  return (
    <div
      className="screen no-extra-space"
      style={{
        background: "radial-gradient(circle at 20% 20%, #1a2337 0%, #000814 70%)",
        color: "white",
        paddingLeft: "16px",
        paddingRight: "16px",
        paddingTop: "32px",
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
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
        <img
          src={PathMascot}
          alt="Learning guide"
          style={{ width: "90px", height: "90px", animation: "bounce 2s infinite" }}
        />
      </div>

      {/* 3-Column Layout Container */}
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          display: "flex",
          gap: "24px",
          position: "relative",
        }}
      >
        {/* LEFT COLUMN: Section Headings */}
        <div style={{ 
          flex: "0 0 200px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-start"
        }}>
          {groupedLessons.map((section, sectionIdx) => {
            // Calculate spacer height: height of all previous section's lessons + gap
            const spacerHeight = sectionIdx === 0 
              ? 0 
              : sectionHeights[sectionIdx - 1] + 120; // previous section's lessons + inter-section gap

            return (
              <React.Fragment key={`section-${sectionIdx}`}>
                {/* Spacer to push heading down to align with first circle of this section */}
                {sectionIdx > 0 && (
                  <div style={{ height: `${spacerHeight}px` }} />
                )}
                
                {/* Section Heading */}
                <div
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "#D4AF37",
                    textAlign: "left",
                    lineHeight: 1.4,
                    wordWrap: "break-word",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    hyphens: "auto",
                    letterSpacing: "0.6px",
                    textTransform: "uppercase",
                    paddingRight: "12px",
                    width: "100%",
                  }}
                >
                  {section.name}
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* MIDDLE COLUMN: Timeline + Lesson Circles */}
        <div
          style={{
            flex: "0 0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* Vertical Timeline Line */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "0",
              bottom: "0",
              width: "3px",
              background: "linear-gradient(180deg, #D4AF37 0%, #b89600 100%)",
              transform: "translateX(-50%)",
              zIndex: 0,
            }}
          />

          {/* Lesson Circles */}
          {groupedLessons.map((section, sectionIdx) =>
            section.lessons.map((lesson, lessonIdx) => {
              const unlocked = isLessonUnlocked(pathId, lesson.id);
              const isCurrent = lesson.id === currentLessonId;

              return (
                <div
                  key={lesson.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginBottom: lessonIdx < section.lessons.length - 1 ? "48px" : "120px",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <div
                    onClick={() => handleLessonClick(lesson)}
                    style={{
                      position: "relative",
                      background: unlocked
                        ? "linear-gradient(180deg, #FFD700 0%, #b89600 100%)"
                        : "rgba(255,255,255,0.05)",
                      color: unlocked ? "#000814" : "rgba(255,255,255,0.4)",
                      borderRadius: "50%",
                      width: "64px",
                      height: "64px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                      cursor: "pointer",
                      border: unlocked ? "3px solid #FFD700" : "2px solid #555",
                      transition: "all 0.3s ease",
                      animation: unlocked
                        ? isCurrent
                          ? "currentLessonPulse 2s ease-in-out infinite"
                          : "goldPulse 2s ease-in-out infinite"
                        : "none",
                      boxShadow: isCurrent
                        ? "0 0 30px rgba(255, 215, 0, 0.6), inset 0 0 20px rgba(255, 215, 0, 0.2)"
                        : "none",
                    }}
                  >
                    {!unlocked && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.8) 100%)",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span style={{ color: "#FFD700", fontSize: "1.4rem" }}>🔒</span>
                      </div>
                    )}
                    <span style={{ position: "relative", zIndex: 2 }}>
                      {lesson.id}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN: Lesson Titles */}
        <div style={{ flex: "1", minWidth: 0 }}>
          {groupedLessons.map((section, sectionIdx) =>
            section.lessons.map((lesson, lessonIdx) => (
              <div
                key={lesson.id}
                style={{
                  marginBottom: lessonIdx < section.lessons.length - 1 ? "48px" : "120px",
                  paddingTop: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "white",
                    textAlign: "left",
                    lineHeight: 1.3,
                    wordWrap: "break-word",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  {lesson.title}
                </div>
              </div>
            ))
          )}
        </div>
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
            const result = planType === "individual" 
              ? purchaseIndividual()
              : purchaseFamily();
            
            if (result.success) {
              setShowModal(false);
              setPopupMsg("Alhamdulillah! Full access unlocked 🎉");
              setShowPopup(true);
              setTimeout(() => setShowPopup(false), 2500);
            }
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
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.6), inset 0 0 15px rgba(255, 215, 0, 0.2);
          }
          50% { 
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.5), inset 0 0 20px rgba(255, 215, 0, 0.3);
          }
        }
      `}</style>
    </div>
  );
}
