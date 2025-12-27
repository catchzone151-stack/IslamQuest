// src/components/LevelBadge.jsx
// Reusable component for displaying diamond level across the app
import React from "react";
import { DiamondIcon } from "./DiamondIcon";
import { getCurrentLevel, getXPProgress } from "../utils/diamondLevels";

export const LevelBadge = React.memo(function LevelBadge({ 
  xp, 
  size = "medium", 
  showXP = false, 
  showProgress = false,
  animated = false 
}) {
  const levelData = getCurrentLevel(xp);
  const progress = getXPProgress(xp);

  // Size presets
  const sizeMap = {
    small: { diamond: 20, text: "0.8rem", spacing: 6 },
    medium: { diamond: 28, text: "1rem", spacing: 8 },
    large: { diamond: 40, text: "1.2rem", spacing: 12 },
  };

  const s = sizeMap[size] || sizeMap.medium;

  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: s.spacing,
    }}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}>
        <div style={{
          color: levelData.color,
          fontSize: s.text,
          fontWeight: "bold",
          lineHeight: 1.2,
        }}>
          Level {levelData.level}
        </div>
        
        {showXP && (
          <div style={{
            color: "rgba(212, 175, 55, 0.7)",
            fontSize: `calc(${s.text} * 0.75)`,
            lineHeight: 1.2,
          }}>
            {xp.toLocaleString()} XP
          </div>
        )}
        
        {showProgress && progress.nextLevel && (
          <div style={{
            color: "rgba(212, 175, 55, 0.6)",
            fontSize: `calc(${s.text} * 0.7)`,
            lineHeight: 1.2,
          }}>
            {progress.currentLevelXP}/{progress.requiredDelta} to Level {progress.nextLevel.level}
          </div>
        )}
      </div>
    </div>
  );
});

// Simplified version for small spaces (just diamond + level number)
export const LevelBadgeCompact = React.memo(function LevelBadgeCompact({ xp, size = 24 }) {
  const levelData = getCurrentLevel(xp);

  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      background: "rgba(212, 175, 55, 0.1)",
      padding: "4px 8px",
      borderRadius: 8,
      border: "1px solid rgba(212, 175, 55, 0.3)",
    }}>
      <span style={{
        color: levelData.color,
        fontSize: "0.85rem",
        fontWeight: "600",
      }}>
        Level {levelData.level}
      </span>
    </div>
  );
});
