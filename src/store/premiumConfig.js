// Premium lesson limits configuration
// Defines how many lessons are free per learning path
// Supabase-ready: This config will eventually be synced from backend

export const FREE_LESSON_LIMITS = {
  1: 3,   // Names of Allah
  2: 3,   // Foundations of Islam
  3: 3,   // Stories of Prophets
  4: 3,   // Life of Muhammad ﷺ (Seerah)
  5: 2,   // Wives of the Prophet ﷺ
  6: 2,   // Ten Promised Jannah
  7: 2,   // Four Greatest Women
  8: 3,   // Stories of the Companions
  9: 3,   // Angels
  10: 3,  // The End Times
  11: 0,  // The Grave (PREMIUM ONLY)
  12: 0,  // Day of Judgement (PREMIUM ONLY)
  13: 0,  // Hellfire (PREMIUM ONLY)
  14: 0,  // Paradise (PREMIUM ONLY)
};

// Premium-only paths (paths 11-14)
export const PREMIUM_ONLY_PATHS = [11, 12, 13, 14];

// Check if a path is premium-only
export const isPremiumOnlyPath = (pathId) => {
  return PREMIUM_ONLY_PATHS.includes(pathId);
};
