import { useState, useEffect } from "react";
import mascotCountdown from "../../assets/mascots/mascot_countdown.webp";
import "../challenges/ChallengeModals.css";

export default function DailyQuestCountdown({ onComplete }) {
  const [count, setCount] = useState(3);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      const fadeTimer = setTimeout(() => setFadeOut(true), 300);
      const completeTimer = setTimeout(onComplete, 500);
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [count, onComplete]);

  return (
    <div 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.95)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.2s ease-out",
        touchAction: "none",
        overscrollBehavior: "none",
      }}
    >
      <div 
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        <div 
          style={{
            width: "160px",
            height: "160px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        >
          <img 
            src={mascotCountdown}
            alt="Countdown" 
            style={{
              width: "120px",
              height: "auto",
              filter: "drop-shadow(0 10px 25px rgba(212, 175, 55, 0.5))",
            }}
          />
        </div>
        <div 
          style={{
            fontSize: "8rem",
            fontWeight: 900,
            color: "#d4af37",
            textShadow: "0 0 50px rgba(212, 175, 55, 0.9)",
            lineHeight: 1,
          }}
        >
          {count > 0 ? count : "GO!"}
        </div>
      </div>
    </div>
  );
}
