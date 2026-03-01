import { useState, useEffect } from "react";
import mascotCountdown from "../../assets/mascots/mascot_countdown.webp";

export default function DailyQuestCountdown({ onComplete }) {
  const [count, setCount] = useState(3);
  const [fadeOut, setFadeOut] = useState(false);

  // Lock underlying scroll for the duration of the countdown
  useEffect(() => {
    const el = document.querySelector(".app-root-container");
    if (el) el.style.overflowY = "hidden";
    return () => {
      if (el) el.style.overflowY = "";
    };
  }, []);

  useEffect(() => {
    if (count > 0) {
      const t = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(t);
    } else {
      const fadeT = setTimeout(() => setFadeOut(true), 300);
      const doneT = setTimeout(onComplete, 500);
      return () => {
        clearTimeout(fadeT);
        clearTimeout(doneT);
      };
    }
  }, [count, onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        height: "100dvh",
        background: "rgba(0,0,0,0.95)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        overflow: "hidden",
        overscrollBehavior: "none",
        touchAction: "none",
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.2s ease-out",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div
          style={{
            width: 160,
            height: 160,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        >
          <img
            src={mascotCountdown}
            alt="Countdown"
            style={{
              width: 120,
              height: "auto",
              filter: "drop-shadow(0 10px 25px rgba(212,175,55,0.5))",
            }}
          />
        </div>
        <div
          style={{
            fontSize: "8rem",
            fontWeight: 900,
            color: "#d4af37",
            textShadow: "0 0 50px rgba(212,175,55,0.9)",
            lineHeight: 1,
          }}
        >
          {count > 0 ? count : "GO!"}
        </div>
      </div>
    </div>
  );
}
