import { useState, useEffect } from "react";
import mascotCountdown from "../../assets/mascots/mascot_countdown.webp";
import "../challenges/ChallengeModals.css";

export default function DailyQuestCountdown({ onComplete }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }
  }, [count, onComplete]);

  return (
    <div className="challenge-modal-overlay">
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
