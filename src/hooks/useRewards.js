// src/hooks/useRewards.js
// Centralized rewards management - single source of truth for XP and coin updates
import { useProgressStore } from '../store/progressStore';
import { useAnalytics } from './useAnalytics';

export const useRewards = () => {
  const analytics = useAnalytics();

  /**
   * Add XP with automatic level-up checking
   * @param {number} amount - XP to add
   * @param {string} source - Where the XP came from (quiz, challenge, daily_quest, etc)
   */
  const addXP = (amount, source = 'unknown') => {
    if (!amount || amount <= 0) return;
    useProgressStore.getState().addXP(amount);
    analytics('xp_earned', { amount, source });
  };

  /**
   * Add coins
   * @param {number} amount - Coins to add
   * @param {string} source - Where the coins came from
   */
  const addCoins = (amount, source = 'unknown') => {
    if (!amount || amount <= 0) return;
    useProgressStore.getState().addCoins(amount);
    analytics('coins_earned', { amount, source });
  };

  /**
   * Add both XP and coins together (common reward pattern)
   * @param {Object} rewards - { xp, coins }
   * @param {string} source - Where the rewards came from
   */
  const addRewards = ({ xp, coins }, source = 'unknown') => {
    if (xp) addXP(xp, source);
    if (coins) addCoins(coins, source);
  };

  return {
    addXP,
    addCoins,
    addRewards,
  };
};
