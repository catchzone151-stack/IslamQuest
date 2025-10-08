// Simple localStorage-backed state for XP, coins, streak, and progress
const KEY = "islamquest_store";

export const getStore = () => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw
      ? JSON.parse(raw)
      : {
          xp: 120,
          coins: 45,
          streak: 3,
          progress: {},
          lastUpdated: Date.now(),
        };
  } catch {
    return {
      xp: 0,
      coins: 0,
      streak: 0,
      progress: {},
      lastUpdated: Date.now(),
    };
  }
};

export const setStore = (data) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Store save error", e);
  }
};

// Utility to update XP or coins easily
export const addXP = (amount) => {
  const s = getStore();
  s.xp += amount;
  setStore(s);
  return s;
};

export const addCoins = (amount) => {
  const s = getStore();
  s.coins += amount;
  setStore(s);
  return s;
};

export const incrementStreak = () => {
  const s = getStore();
  s.streak += 1;
  setStore(s);
  return s;
};
