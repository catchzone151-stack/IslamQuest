import { useState, useEffect } from "react";
import mascotCountdown from "../../assets/mascots/mascot_countdown.webp";
import "../challenges/ChallengeModals.css";

export default function DailyQuestCountdown({ onComplete }) {
  const [count, setCount] = useState(3);
  const [fadeOut, setFadeOut] = useState(false);

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
      className="challenge-modal-overlay"
      style={{
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.2s ease-out"
      }}
    >
      <div className="challenge-countdown-modal">
        <div className="countdown-mascot">
          <img 
            src={mascotCountdown}
            alt="Countdown Rocket" 
            className="countdown-rocket"
          />
        </div>
        <div className="countdown-number">
          {count > 0 ? count : "GO!"}
        </div>
      </div>
    </div>
  );
}
