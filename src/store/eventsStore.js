import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useProgressStore } from "./progressStore";
import { supabase } from "../lib/supabaseClient";
import { avatarIndexToKey } from "../utils/avatarUtils";
import { logXpEvent } from "../backend/xpLogs";

export const EMPTY_LEADERBOARD = Object.freeze([]);

function getCurrentWeekId() {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const currentDate = new Date(now);
  const daysToFriday = dayOfWeek >= 5 ? dayOfWeek - 5 : dayOfWeek + 2;
  currentDate.setUTCDate(currentDate.getUTCDate() - daysToFriday);
  currentDate.setUTCHours(0, 0, 0, 0);
  return currentDate.toISOString().split('T')[0];
}

function areResultsUnlocked() {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const hour = now.getUTCHours();
  if (dayOfWeek === 4 && hour >= 22) return true;
  if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) return true;
  return false;
}

function getTimeUntilResults() {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const nextThursday = new Date(now);
  if (dayOfWeek === 4 && now.getUTCHours() >= 22) {
    nextThursday.setUTCDate(nextThursday.getUTCDate() + 7);
  } else if (dayOfWeek < 4) {
    nextThursday.setUTCDate(nextThursday.getUTCDate() + (4 - dayOfWeek));
  } else {
    nextThursday.setUTCDate(nextThursday.getUTCDate() + (4 + 7 - dayOfWeek));
  }
  nextThursday.setUTCHours(22, 0, 0, 0);
  return nextThursday - now;
}

const EVENTS = [
  {
    id: "pillar_clash",
    name: "Pillar Clash",
    description: "Master the Foundations of Islam",
    pathIds: [2],
    theme: {
      gradient: "linear-gradient(135deg, #10b981 0%, #d4af37 100%)",
      glow: "0 0 20px rgba(16, 185, 129, 0.4)"
    },
    icon: "🕌"
  },
  {
    id: "names_mastery",
    name: "Names of Allah ﷾ Mastery",
    description: "Learn the Beautiful Names",
    pathIds: [1],
    theme: {
      gradient: "linear-gradient(135deg, #3b82f6 0%, #d4af37 100%)",
      glow: "0 0 20px rgba(59, 130, 246, 0.4)"
    },
    icon: "✨"
  },
  {
    id: "faith_test",
    name: "Faith Test",
    description: "Explore the Akhirah",
    pathIds: [10, 11, 12, 13, 14],
    theme: {
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #d4af37 100%)",
      glow: "0 0 20px rgba(139, 92, 246, 0.4)"
    },
    icon: "🌙"
  },
  {
    id: "seerah_challenge",
    name: "Seerah Challenge",
    description: "Journey through the Sealed Nectar",
    pathIds: [4],
    theme: {
      gradient: "linear-gradient(135deg, #ef4444 0%, #d4af37 100%)",
      glow: "0 0 20px rgba(239, 68, 68, 0.4)"
    },
    icon: "📖"
  }
];

export const useEventsStore = create(
  persist(
    (set, get) => ({
      currentWeekId: getCurrentWeekId(),
      weeklyEntries: {},
      leaderboards: {},
      resultsViewed: {},
      loading: false,
      error: null,

      checkWeekReset: () => {
        const newWeekId = getCurrentWeekId();
        const { currentWeekId, weeklyEntries } = get();
        if (newWeekId !== currentWeekId) {
          set({
            currentWeekId: newWeekId,
            weeklyEntries: {},
            leaderboards: {},
            resultsViewed: {}
          });
        }
      },

      enterEventCloud: async (eventId, score, answers, completionTime = null) => {
        try {
          set({ loading: true, error: null });
          
          const { data: auth } = await supabase.auth.getUser();
          if (!auth?.user) {
            set({ loading: false, error: "Not authenticated" });
            return { success: false, error: "NOT_AUTHENTICATED" };
          }
          
          const userId = auth.user.id;
          const weekId = getCurrentWeekId();
          
          const { data: existing, error: checkError } = await supabase
            .from('event_entries')
            .select('id')
            .eq('user_id', userId)
            .eq('event_id', eventId)
            .eq('week_id', weekId)
            .maybeSingle();
          
          if (existing) {
            set({ loading: false });
            return { success: false, error: "ALREADY_ENTERED" };
          }
          
          const { count: higherScoreCount, error: countError1 } = await supabase
            .from('event_entries')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', eventId)
            .eq('week_id', weekId)
            .gt('score', score);
          
          let sameScoreFasterCount = 0;
          if (completionTime !== null) {
            const { count: fasterCount, error: countError2 } = await supabase
              .from('event_entries')
              .select('*', { count: 'exact', head: true })
              .eq('event_id', eventId)
              .eq('week_id', weekId)
              .eq('score', score)
              .lt('completion_time', completionTime);
            
            if (!countError2) {
              sameScoreFasterCount = fasterCount || 0;
            }
          }
          
          const provisionalRank = (countError1 ? 0 : (higherScoreCount || 0)) + sameScoreFasterCount + 1;
          
          const { data, error } = await supabase
            .from('event_entries')
            .insert({
              user_id: userId,
              event_id: eventId,
              week_id: weekId,
              score: score,
              answers: answers,
              completion_time: completionTime,
              provisional_rank: provisionalRank
            })
            .select()
            .maybeSingle();
          
          if (error) {
            if (error.code === '23505') {
              set({ loading: false });
              return { success: false, error: "ALREADY_ENTERED" };
            }
            console.error('Enter event error:', error);
            set({ loading: false, error: error.message });
            return { success: false, error: error.message };
          }
          
          set(state => ({
            weeklyEntries: {
              ...state.weeklyEntries,
              [eventId]: {
                score,
                answers,
                completedAt: data.created_at,
                provisionalRank,
                cloudId: data.id
              }
            },
            loading: false
          }));
          
          useProgressStore.getState().markDayComplete();
          
          return { success: true, entry: data, provisionalRank };
        } catch (err) {
          console.error('Enter event error:', err);
          set({ loading: false, error: err.message });
          return { success: false, error: err.message };
        }
      },

      hasEnteredCloud: async (eventId) => {
        try {
          const { data: auth } = await supabase.auth.getUser();
          if (!auth?.user) return false;
          
          const userId = auth.user.id;
          const weekId = getCurrentWeekId();
          
          const { data, error } = await supabase
            .from('event_entries')
            .select('id')
            .eq('user_id', userId)
            .eq('event_id', eventId)
            .eq('week_id', weekId)
            .maybeSingle();
          
          return !!data;
        } catch (err) {
          console.error('Check entered error:', err);
          return false;
        }
      },

      loadMyEntries: async () => {
        try {
          set({ loading: true, error: null });
          
          const { data: auth } = await supabase.auth.getUser();
          if (!auth?.user) {
            set({ loading: false });
            return {};
          }
          
          const userId = auth.user.id;
          const weekId = getCurrentWeekId();
          
          const { data, error } = await supabase
            .from('event_entries')
            .select('*')
            .eq('user_id', userId)
            .eq('week_id', weekId);
          
          if (error) {
            console.error('Load my entries error:', error);
            set({ loading: false });
            return {};
          }
          
          const entries = {};
          (data || []).forEach(entry => {
            entries[entry.event_id] = {
              score: entry.score,
              answers: entry.answers,
              completedAt: entry.created_at,
              provisionalRank: entry.provisional_rank,
              finalRank: entry.final_rank,
              rewardsClaimed: entry.rewards_claimed,
              cloudId: entry.id
            };
          });
          
          set({ weeklyEntries: entries, loading: false });
          return entries;
        } catch (err) {
          console.error('Load entries error:', err);
          set({ loading: false });
          return {};
        }
      },

      loadLeaderboard: async (eventId, limit = 50) => {
        try {
          const weekId = getCurrentWeekId();
          
          const { data, error } = await supabase
            .from('event_entries')
            .select(`
              id,
              user_id,
              score,
              completion_time,
              created_at
            `)
            .eq('event_id', eventId)
            .eq('week_id', weekId)
            .order('score', { ascending: false })
            .order('completion_time', { ascending: true, nullsFirst: false })
            .order('created_at', { ascending: true })
            .limit(limit);
          
          if (error) {
            console.error('Load leaderboard error:', error);
            return [];
          }
          
          const userIds = (data || []).map(e => e.user_id);
          let profiles = {};
          
          if (userIds.length > 0) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('user_id, username, handle, avatar, premium')
              .in('user_id', userIds);
            
            (profileData || []).forEach(p => {
              profiles[p.user_id] = p;
            });
          }
          
          const leaderboard = (data || []).map((entry, index) => {
            const profile = profiles[entry.user_id] || {};
            return {
              rank: index + 1,
              userId: entry.user_id,
              nickname: profile.username || profile.handle || 'User',
              avatar: typeof profile.avatar === 'number' 
                ? avatarIndexToKey(profile.avatar)
                : profile.avatar || 'avatar_man_lantern',
              score: entry.score,
              completionTime: entry.completion_time,
              completedAt: entry.created_at,
              premium: profile.premium || false
            };
          });
          
          set(state => ({
            leaderboards: {
              ...state.leaderboards,
              [weekId]: {
                ...(state.leaderboards[weekId] || {}),
                [eventId]: leaderboard
              }
            }
          }));
          
          return leaderboard;
        } catch (err) {
          console.error('Load leaderboard error:', err);
          return [];
        }
      },

      getMyRank: async (eventId) => {
        try {
          const { data: auth } = await supabase.auth.getUser();
          if (!auth?.user) return null;
          
          const userId = auth.user.id;
          const weekId = getCurrentWeekId();
          
          const { data: myEntry, error: entryError } = await supabase
            .from('event_entries')
            .select('score, completion_time, created_at')
            .eq('user_id', userId)
            .eq('event_id', eventId)
            .eq('week_id', weekId)
            .maybeSingle();
          
          if (entryError || !myEntry) return null;
          
          const { count, error: countError } = await supabase
            .from('event_entries')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', eventId)
            .eq('week_id', weekId)
            .or(`score.gt.${myEntry.score},and(score.eq.${myEntry.score},completion_time.lt.${myEntry.completion_time || 9999})`);
          
          if (countError) {
            console.error('Get rank error:', countError);
            return null;
          }
          
          return (count || 0) + 1;
        } catch (err) {
          console.error('Get rank error:', err);
          return null;
        }
      },

      claimEventRewards: async (eventId) => {
        try {
          const { data: auth } = await supabase.auth.getUser();
          if (!auth?.user) {
            return { success: false, error: "NOT_AUTHENTICATED" };
          }
          
          const userId = auth.user.id;
          const weekId = getCurrentWeekId();
          
          const { data: entry, error: fetchError } = await supabase
            .from('event_entries')
            .select('*')
            .eq('user_id', userId)
            .eq('event_id', eventId)
            .eq('week_id', weekId)
            .maybeSingle();
          
          if (fetchError || !entry) {
            return { success: false, error: "ENTRY_NOT_FOUND" };
          }
          
          if (entry.rewards_claimed) {
            return { success: false, error: "ALREADY_CLAIMED" };
          }
          
          const rank = await get().getMyRank(eventId);
          if (!rank) {
            return { success: false, error: "RANK_NOT_FOUND" };
          }
          
          const rewards = get().computeRewardsForRank(rank);
          
          const { error: updateError } = await supabase
            .from('event_entries')
            .update({
              rewards_claimed: true,
              final_rank: rank,
              xp_earned: rewards.xpReward,
              coins_earned: rewards.coinReward
            })
            .eq('id', entry.id);
          
          if (updateError) {
            console.error('Claim rewards error:', updateError);
            return { success: false, error: updateError.message };
          }
          
          const { addXPAndCoins } = useProgressStore.getState();
          addXPAndCoins(rewards.xpReward, rewards.coinReward);
          
          // Log XP event for global event
          if (rewards.xpReward > 0) {
            logXpEvent(userId, rewards.xpReward, "event");
          }
          
          set(state => ({
            resultsViewed: {
              ...state.resultsViewed,
              [eventId]: true
            },
            weeklyEntries: {
              ...state.weeklyEntries,
              [eventId]: {
                ...state.weeklyEntries[eventId],
                rewardsClaimed: true,
                finalRank: rank
              }
            }
          }));
          
          return { success: true, rank, rewards };
        } catch (err) {
          console.error('Claim rewards error:', err);
          return { success: false, error: err.message };
        }
      },

      enterEvent: (eventId, score, answers, completionTime = null) => {
        const { currentWeekId, weeklyEntries } = get();
        const provisionalRank = Math.floor(Math.random() * 50) + 1;
        useProgressStore.getState().markDayComplete();
        set({
          weeklyEntries: {
            ...weeklyEntries,
            [eventId]: {
              score,
              answers,
              completedAt: new Date().toISOString(),
              provisionalRank
            }
          }
        });
        get().enterEventCloud(eventId, score, answers, completionTime);
      },

      hasEntered: (eventId) => {
        const { weeklyEntries } = get();
        return !!weeklyEntries[eventId];
      },

      getEntry: (eventId) => {
        const { weeklyEntries } = get();
        return weeklyEntries[eventId] || null;
      },

      markResultsViewed: (eventId) => {
        const { resultsViewed } = get();
        set({
          resultsViewed: {
            ...resultsViewed,
            [eventId]: true
          }
        });
      },

      areResultsViewed: (eventId) => {
        const { resultsViewed } = get();
        return !!resultsViewed[eventId];
      },

      computeRewardsForRank: (rank) => {
        if (rank === 1) return { xpReward: 1000, coinReward: 300 };
        if (rank <= 3) return { xpReward: 750, coinReward: 200 };
        if (rank <= 10) return { xpReward: 500, coinReward: 100 };
        return { xpReward: 100, coinReward: 10 };
      },

      grantRewardsForEvent: (eventId, userRank) => {
        if (get().resultsViewed[eventId]) {
          return null;
        }
        const computedRewards = get().computeRewardsForRank(userRank);
        let rewards = null;
        set((state) => {
          if (state.resultsViewed[eventId]) {
            return;
          }
          rewards = computedRewards;
          return {
            resultsViewed: {
              ...state.resultsViewed,
              [eventId]: true,
            },
          };
        });
        const { addXPAndCoins } = useProgressStore.getState();
        if (rewards) {
          addXPAndCoins(rewards.xpReward, rewards.coinReward);
        }
        return rewards;
      },

      generateMockLeaderboard: (eventId, userEntry) => {
        const { currentWeekId, leaderboards } = get();
        const mockPlayers = [
          { nickname: "Abdullah", avatar: "avatar1", score: 10 },
          { nickname: "Fatimah", avatar: "avatar2", score: 9 },
          { nickname: "Yusuf", avatar: "avatar3", score: 9 },
          { nickname: "Maryam", avatar: "avatar4", score: 8 },
          { nickname: "Ibrahim", avatar: "avatar5", score: 8 },
          { nickname: "Khadijah", avatar: "avatar6", score: 8 },
          { nickname: "Zakariya", avatar: "avatar7", score: 7 },
          { nickname: "Aisha", avatar: "avatar8", score: 7 },
          { nickname: "Bilal", avatar: "avatar9", score: 7 },
          { nickname: "Hafsa", avatar: "avatar10", score: 6 }
        ].map((p, i) => ({
          ...p,
          userId: `mock_${i}`,
          completedAt: new Date(Date.now() - Math.random() * 86400000).toISOString()
        }));
        mockPlayers.push({
          userId: "current_user",
          nickname: "You",
          avatar: "avatar1",
          score: userEntry.score,
          completedAt: userEntry.completedAt
        });
        mockPlayers.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return new Date(a.completedAt) - new Date(b.completedAt);
        });
        const weekLeaderboards = leaderboards[currentWeekId] || {};
        set({
          leaderboards: {
            ...leaderboards,
            [currentWeekId]: {
              ...weekLeaderboards,
              [eventId]: mockPlayers
            }
          }
        });
        return mockPlayers;
      },

      getLeaderboard: (eventId) => {
        const { currentWeekId, leaderboards } = get();
        return leaderboards[currentWeekId]?.[eventId] || [];
      },

      getUserRank: (eventId) => {
        const leaderboard = get().getLeaderboard(eventId);
        const { data: auth } = supabase.auth.getUser();
        const userIndex = leaderboard.findIndex(p => 
          p.userId === "current_user" || p.userId === auth?.user?.id
        );
        return userIndex >= 0 ? userIndex + 1 : null;
      },

      areResultsUnlocked,
      getTimeUntilResults,
      getEvents: () => EVENTS,

      syncToSupabase: async () => {
        await get().loadMyEntries();
      },

      loadFromSupabase: async () => {
        await get().loadMyEntries();
      },
    }),
    {
      name: "islam-quest-events-v2",
      partialize: (state) => ({
        currentWeekId: state.currentWeekId,
        weeklyEntries: state.weeklyEntries,
        leaderboards: state.leaderboards,
        resultsViewed: state.resultsViewed
      })
    }
  )
);
