import { useState, useEffect } from "react";
import assets from "../../assets/assets";
import "./ChallengeModals.css";

export default function ChallengeCountdown({ onComplete }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    console.log('🚀 Countdown component loaded, rocket image:', assets.mascots.mascot_countdown);
  }, []);

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
            src={assets.mascots.mascot_countdown} 
            alt="Countdown Rocket" 
            className="countdown-rocket"
            onError={(e) => console.error('❌ Failed to load rocket image:', e)}
            onLoad={() => console.log('✅ Rocket image loaded successfully')}
          />
        </div>
        <div className="countdown-number">
          {count > 0 ? count : "GO!"}
        </div>
      </div>
    </div>
  );
}
