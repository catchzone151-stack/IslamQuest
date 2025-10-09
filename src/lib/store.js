import { useState, useEffect } from "react";

// Simple global store for XP, coins, and streak — will later sync with Supabase
export function useGameStore() {
  const [xp, setXp] = useState(0);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(1);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("islamQuestStore") || "{}");
    if (saved.xp) setXp(saved.xp);
    if (saved.coins) setCoins(saved.coins);
    if (saved.streak) setStreak(saved.streak);
  }, []);

  // Auto-save whenever values change
  useEffect(() => {
    localStorage.setItem(
      "islamQuestStore",
      JSON.stringify({ xp, coins, streak }),
    );
  }, [xp, coins, streak]);

  const addXp = (amount) => setXp((x) => Math.min(1000, x + amount));
  const addCoins = (amount) => setCoins((c) => c + amount);
  const incrementStreak = () => setStreak((s) => s + 1);
  const resetAll = () => {
    setXp(0);
    setCoins(0);
    setStreak(1);
    localStorage.removeItem("islamQuestStore");
  };

  return { xp, coins, streak, addXp, addCoins, incrementStreak, resetAll };
}
