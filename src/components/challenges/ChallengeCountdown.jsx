import { useState, useEffect } from "react";
import mascotCountdown from "../../assets/mascots/mascot_countdown.webp";
import "./ChallengeModals.css";

export default function ChallengeCountdown({ onComplete }) {
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
        <div className="countdown-mascot" style={{ border: '2px solid red' }}>
          <img 
            src={mascotCountdown}
            alt="Countdown Rocket" 
            className="countdown-rocket"
            style={{ border: '2px solid blue', maxWidth: '100%', maxHeight: '100%' }}
            onLoad={() => console.log('✅ ROCKET LOADED!')}
            onError={(e) => console.error('❌ ROCKET FAILED:', e.target.src)}
          />
        </div>
        <div className="countdown-number">
          {count > 0 ? count : "GO!"}
        </div>
      </div>
    </div>
  );
}
