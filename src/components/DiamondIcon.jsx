// src/components/DiamondIcon.jsx
import React from "react";
import { getCurrentLevel, DIAMOND_LEVELS } from "../utils/diamondLevels";

export const DiamondIcon = React.memo(function DiamondIcon({ 
  xp = null, 
  level = null, 
  size = 24, 
  animated = false, 
  showGlow = true 
}) {
  // Get level data either from XP or direct level number
  let levelData;
  if (xp !== null) {
    levelData = getCurrentLevel(xp);
  } else if (level !== null) {
    levelData = DIAMOND_LEVELS.find(l => l.level === level) || DIAMOND_LEVELS[0];
  } else {
    levelData = DIAMOND_LEVELS[0]; // Default to Bronze
  }

  const diamondSize = size;
  const innerSize = diamondSize * 0.6;

  return (
    <div style={{
      position: "relative",
      width: diamondSize,
      height: diamondSize,
      display: "inline-block",
    }}>
      {/* Glow effect */}
      {showGlow && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: diamondSize * 1.5,
          height: diamondSize * 1.5,
          background: levelData.gradient,
          filter: "blur(8px)",
          opacity: 0.4,
          borderRadius: "50%",
          animation: levelData.pulse ? "pulse 2s ease-in-out infinite" : "none",
        }}/>
      )}
      
      {/* Outer diamond */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%) rotate(45deg)",
        width: diamondSize,
        height: diamondSize,
        background: levelData.gradient,
        boxShadow: showGlow ? levelData.glow : "none",
        animation: animated ? "sparkle 2s ease-in-out infinite" : levelData.pulse ? "pulse 2s ease-in-out infinite" : "none",
      }}/>
      
      {/* Inner diamond (for depth) */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%) rotate(45deg)",
        width: innerSize,
        height: innerSize,
        background: "rgba(255, 255, 255, 0.3)",
        backdropFilter: "blur(2px)",
      }}/>
    </div>
  );
});

// CSS animations (add to global CSS or include here as a style tag)
export const diamondAnimations = `
  @keyframes sparkle {
    0%, 100% {
      transform: translate(-50%, -50%) rotate(45deg) scale(1);
      opacity: 1;
    }
    50% {
      transform: translate(-50%, -50%) rotate(45deg) scale(1.1);
      opacity: 0.8;
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: translate(-50%, -50%) rotate(45deg) scale(1);
      filter: brightness(1);
    }
    50% {
      transform: translate(-50%, -50%) rotate(45deg) scale(1.05);
      filter: brightness(1.2);
    }
  }
`;
