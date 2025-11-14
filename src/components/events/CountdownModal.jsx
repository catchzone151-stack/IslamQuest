import React, { useState, useEffect } from "react";
import zaydHappy from "../../assets/zayd_happy.webp";
import "./EventModals.css";

export default function CountdownModal({ onComplete }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      setTimeout(onComplete, 500);
      return;
    }

    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className="event-modal-overlay">
      <div className="countdown-modal">
        {/* Zayd Animation */}
        <div className="countdown-mascot">
          <img src={zaydHappy} alt="Zayd" className="countdown-zayd" />
        </div>

        {/* Countdown Number */}
        <div className="countdown-number">
          {count > 0 ? count : "GO!"}
        </div>

        {/* Message */}
        <p className="countdown-message">
          {count > 0 ? "Get ready..." : "Bismillah!"}
        </p>
      </div>
    </div>
  );
}
