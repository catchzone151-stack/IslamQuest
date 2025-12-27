// src/components/ZaydLevelUpPopup.jsx
import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { DiamondIcon } from "./DiamondIcon";
import { DIAMOND_LEVELS } from "../utils/diamondLevels";
import mascot from "../assets/mascots/mascot_congratulation.webp";

export function ZaydLevelUpPopup({ levelUpData, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 100);

    // Auto-close after 4 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade-out animation
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!levelUpData) return null;

  const newLevelData = DIAMOND_LEVELS.find(l => l.level === levelUpData.newLevel);

  return (
    <div
      onClick={() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.7)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: isVisible ? "fadeIn 0.3s ease-out" : "fadeOut 0.3s ease-out",
      }}
    >
      <div style={{
        background: "linear-gradient(180deg, #0B1E2D 0%, #162C3D 100%)",
        borderRadius: 24,
        maxWidth: 400,
        width: "100%",
        padding: 32,
        border: "3px solid #D4AF37",
        boxShadow: "0 0 60px rgba(212, 175, 55, 0.6)",
        textAlign: "center",
        position: "relative",
        animation: isVisible ? "bounceIn 0.5s ease-out" : "bounceOut 0.3s ease-in",
      }}>
        {/* Sparkles Background Effect */}
        <div style={{
          position: "absolute",
          top: -10,
          right: -10,
          animation: "sparkle 2s ease-in-out infinite",
        }}>
          <Sparkles size={32} color="#D4AF37" />
        </div>
        <div style={{
          position: "absolute",
          bottom: -10,
          left: -10,
          animation: "sparkle 2s ease-in-out infinite 0.5s",
        }}>
          <Sparkles size={24} color="#F4D03F" />
        </div>

        {/* Zayd Mascot */}
        <div style={{
          width: 80,
          height: 80,
          margin: "0 auto 16px",
          animation: "bounce 0.6s ease-out",
        }}>
          <img 
            src={mascot} 
            alt="Zayd" 
            style={{ 
              width: "100%", 
              height: "100%", 
              objectFit: "contain",
            }} 
          />
        </div>

        {/* Level Up Message */}
        <h2 style={{
          color: "#D4AF37",
          fontSize: "1.5rem",
          fontWeight: "bold",
          marginBottom: 8,
        }}>
          🌙 masha'Allah!
        </h2>

        <p style={{
          color: "rgba(212, 175, 55, 0.9)",
          fontSize: "1.1rem",
          marginBottom: 12,
        }}>
          You've reached Level {levelUpData.newLevel}!
        </p>

        <div style={{
          color: "#D4AF37",
          fontSize: "1.2rem",
          fontWeight: "bold",
          marginBottom: 24,
        }}>
          {newLevelData?.name}
        </div>

        <p style={{
          color: "rgba(212, 175, 55, 0.7)",
          fontSize: "0.9rem",
          lineHeight: 1.5,
        }}>
          Keep up the amazing work! 🌟
        </p>

        {/* Tap to Continue */}
        <div style={{
          marginTop: 24,
          color: "rgba(212, 175, 55, 0.5)",
          fontSize: "0.75rem",
        }}>
          Tap anywhere to continue
        </div>
      </div>
    </div>
  );
}

// CSS Animations (add to global CSS)
export const levelUpAnimations = `
  @keyframes bounceIn {
    0% {
      transform: scale(0.3);
      opacity: 0;
    }
    50% {
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes bounceOut {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(0.3);
      opacity: 0;
    }
  }

  @keyframes scaleIn {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
`;
