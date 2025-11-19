import { useState, useEffect } from "react";
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
        {count > 0 ? (
          <div className="countdown-number">{count}</div>
        ) : (
          <div className="countdown-go">GO! 🚀</div>
        )}
      </div>
    </div>
  );
}
