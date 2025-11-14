import { useState, useEffect } from "react";
import ZaydChallenge from "../../assets/mascots/mascot_zayd_challenge.webp";

export default function DailyQuestCountdown({ onComplete }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        flexDirection: "column",
      }}
    >
      {/* Zayd Mascot */}
      <img
        src={ZaydChallenge}
        alt="Zayd"
        style={{
          width: "120px",
          height: "auto",
          marginBottom: "30px",
          animation: "bounce 0.5s ease-in-out infinite",
        }}
      />

      {/* Countdown number */}
      <div
        style={{
          fontSize: "5rem",
          fontWeight: 900,
          color: "#D4AF37",
          textShadow: "0 4px 20px rgba(212, 175, 55, 0.8)",
          animation: "pulse 1s ease-in-out",
        }}
      >
        {count === 0 ? "GO!" : count}
      </div>
    </div>
  );
}
