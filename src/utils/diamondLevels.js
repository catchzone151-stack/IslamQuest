// src/utils/diamondLevels.js
// 10-Level Diamond XP System for Islam Quest

// 🎨 Diamond Level Configuration
export const DIAMOND_LEVELS = [
  {
    level: 1,
    name: "Bronze",
    color: "#CD7F32",
    gradient: "linear-gradient(135deg, #CD7F32 0%, #B87333 100%)",
    glow: "0 0 20px rgba(205, 127, 50, 0.6)",
    minXP: 0,
  },
  {
    level: 2,
    name: "Silver",
    color: "#C0C0C0",
    gradient: "linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)",
    glow: "0 0 20px rgba(192, 192, 192, 0.6)",
    minXP: null, // calculated dynamically
  },
  {
    level: 3,
    name: "Gold",
    color: "#FFD700",
    gradient: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
    glow: "0 0 25px rgba(255, 215, 0, 0.7)",
    minXP: null,
  },
  {
    level: 4,
    name: "Emerald",
    color: "#10B981",
    gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    glow: "0 0 25px rgba(16, 185, 129, 0.7)",
    minXP: null,
  },
  {
    level: 5,
    name: "Ruby",
    color: "#E11D48",
    gradient: "linear-gradient(135deg, #E11D48 0%, #BE123C 100%)",
    glow: "0 0 25px rgba(225, 29, 72, 0.7)",
    minXP: null,
  },
  {
    level: 6,
    name: "Sapphire",
    color: "#3B82F6",
    gradient: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
    glow: "0 0 25px rgba(59, 130, 246, 0.7)",
    minXP: null,
  },
  {
    level: 7,
    name: "Amethyst",
    color: "#A855F7",
    gradient: "linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)",
    glow: "0 0 30px rgba(168, 85, 247, 0.8)",
    minXP: null,
  },
  {
    level: 8,
    name: "Crystal",
    color: "#E0E7FF",
    gradient: "linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)",
    glow: "0 0 35px rgba(224, 231, 255, 0.9)",
    minXP: null,
  },
  {
    level: 9,
    name: "Radiant",
    color: "#60A5FA",
    gradient: "linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #1D4ED8 100%)",
    glow: "0 0 40px rgba(96, 165, 250, 1)",
    minXP: null,
  },
  {
    level: 10,
    name: "Legendary",
    color: "#F4D03F",
    gradient: "linear-gradient(135deg, #D4AF37 0%, #F4D03F 50%, #FFD700 100%)",
    glow: "0 0 50px rgba(212, 175, 55, 1)",
    pulse: true, // special pulse animation for max level
    minXP: null,
  },
];

// 📊 Calculate Total Available XP Dynamically
// Import from central source to avoid hard-coding
export function getTotalAvailableLessons() {
  // These match DEFAULT_PATHS in progressStore - keep in sync
  const pathLessons = [104, 17, 47, 78, 13, 10, 12, 32, 11, 13, 12, 16, 19, 20];
  return pathLessons.reduce((sum, lessons) => sum + lessons, 0); // 404 total
}

const MAX_XP_PER_QUIZ = 140; // 4 questions × 20 + 40 bonus + 20 perfect = 140 XP
const TOTAL_AVAILABLE_XP = getTotalAvailableLessons() * MAX_XP_PER_QUIZ; // 56,560 XP

export function calculateLevelThresholds() {
  const thresholds = [0]; // Level 1 starts at 0

  // Distribution: Levels 1-3 quick (2-4 quizzes), 4-7 moderate, 8-10 slow grind
  // Designed for early engagement and long-term achievement
  const fixedXP = [
    0,      // Level 1: Start
    280,    // Level 2: 2 perfect quizzes (280 XP) - quick unlock
    700,    // Level 3: 5 quizzes (~140 each) - still quick
    1400,   // Level 4: 10 quizzes - starting moderate grind
    3500,   // Level 5: 25 quizzes
    7000,   // Level 6: 50 quizzes - mid-game milestone
    14000,  // Level 7: 100 quizzes - significant achievement
    25000,  // Level 8: 178 quizzes - late game
    40000,  // Level 9: 285 quizzes - near completion
    60000,  // Level 10: 428 quizzes - legendary (requires full mastery)
  ];

  return fixedXP;
}

// Update DIAMOND_LEVELS with calculated thresholds
const thresholds = calculateLevelThresholds();
DIAMOND_LEVELS.forEach((level, index) => {
  if (index > 0) {
    level.minXP = thresholds[index];
  }
});

// 🎯 Get Current Level from XP
export function getCurrentLevel(xp) {
  for (let i = DIAMOND_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= DIAMOND_LEVELS[i].minXP) {
      return DIAMOND_LEVELS[i];
    }
  }
  return DIAMOND_LEVELS[0]; // Default to Bronze
}

// 📈 Get XP Progress to Next Level
export function getXPProgress(xp) {
  const currentLevel = getCurrentLevel(xp);
  const currentLevelIndex = DIAMOND_LEVELS.findIndex(l => l.level === currentLevel.level);
  
  if (currentLevelIndex === DIAMOND_LEVELS.length - 1) {
    // Max level reached
    return {
      current: xp,
      required: DIAMOND_LEVELS[currentLevelIndex].minXP,
      percentage: 100,
      nextLevel: null,
    };
  }

  const nextLevel = DIAMOND_LEVELS[currentLevelIndex + 1];
  const current = xp - currentLevel.minXP;
  const required = nextLevel.minXP - currentLevel.minXP;
  const percentage = Math.min(100, Math.floor((current / required) * 100));

  return {
    current: xp,
    currentLevelXP: current,
    required: nextLevel.minXP,
    requiredDelta: required,
    percentage,
    nextLevel,
  };
}

// ✨ XP Multipliers
export const XP_MULTIPLIERS = {
  LESSON: 1.0,
  QUIZ: 1.0,
  DAILY_QUEST: 1.2,
  BOSS_LEVEL: 1.5,
};

// 🎁 Apply XP Multiplier
export function applyMultiplier(baseXP, multiplierType = 'LESSON') {
  const multiplier = XP_MULTIPLIERS[multiplierType] || 1.0;
  return Math.floor(baseXP * multiplier);
}

// 🏆 Check if Level Up Occurred
export function checkLevelUp(oldXP, newXP) {
  const oldLevel = getCurrentLevel(oldXP);
  const newLevel = getCurrentLevel(newXP);
  
  if (newLevel.level > oldLevel.level) {
    return {
      leveledUp: true,
      oldLevel: oldLevel.level,
      newLevel: newLevel.level,
      levelData: newLevel,
    };
  }
  
  return { leveledUp: false };
}

// 📊 Get All Levels with Progress Info
export function getAllLevelsWithProgress(currentXP) {
  return DIAMOND_LEVELS.map(level => {
    const isUnlocked = currentXP >= level.minXP;
    const isCurrent = getCurrentLevel(currentXP).level === level.level;
    
    return {
      ...level,
      isUnlocked,
      isCurrent,
    };
  });
}

// 🎨 Get Diamond Icon Style
export function getDiamondStyle(levelData, options = {}) {
  const { size = 24, animated = false, pulsing = false } = options;
  
  return {
    width: size,
    height: size,
    background: levelData.gradient,
    boxShadow: levelData.glow,
    borderRadius: "4px",
    transform: "rotate(45deg)",
    display: "inline-block",
    animation: animated ? "sparkle 2s ease-in-out infinite" : pulsing && levelData.pulse ? "pulse 2s ease-in-out infinite" : "none",
  };
}
