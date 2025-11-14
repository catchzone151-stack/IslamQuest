import { create } from "zustand";
import { persist } from "zustand/middleware";

// Get current GMT week boundaries (Friday 00:00 to Thursday 23:59)
function getCurrentWeekId() {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0=Sunday, 4=Thursday, 5=Friday
  const currentDate = new Date(now);
  
  // If before Friday, go back to previous Friday
  // If Friday or later, use current Friday
  const daysToFriday = dayOfWeek >= 5 ? dayOfWeek - 5 : dayOfWeek + 2;
  currentDate.setUTCDate(currentDate.getUTCDate() - daysToFriday);
  currentDate.setUTCHours(0, 0, 0, 0);
  
  return currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
}

// Check if results are unlocked (Thursday 22:00 GMT)
function areResultsUnlocked() {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const hour = now.getUTCHours();
  
  // Thursday (4) at or after 22:00 GMT
  return dayOfWeek === 4 && hour >= 22;
}

// Get time until next results unlock
function getTimeUntilResults() {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const nextThursday = new Date(now);
  
  if (dayOfWeek === 4 && now.getUTCHours() >= 22) {
    // After results unlock, show time to next week's results
    nextThursday.setUTCDate(nextThursday.getUTCDate() + 7);
  } else if (dayOfWeek < 4) {
    // Before Thursday, count to this week's Thursday
    nextThursday.setUTCDate(nextThursday.getUTCDate() + (4 - dayOfWeek));
  } else {
    // Friday/Saturday/Sunday, count to next Thursday
    nextThursday.setUTCDate(nextThursday.getUTCDate() + (4 + 7 - dayOfWeek));
  }
  
  nextThursday.setUTCHours(22, 0, 0, 0);
  return nextThursday - now;
}

// Event definitions
const EVENTS = [
  {
    id: "pillar_clash",
    name: "Pillar Clash",
    description: "Master the Foundations of Islam",
    pathIds: [2], // Foundations of Islam
    theme: {
      gradient: "linear-gradient(135deg, #10b981 0%, #d4af37 100%)",
      glow: "0 0 20px rgba(16, 185, 129, 0.4)"
    },
    icon: "🕌"
  },
  {
    id: "names_mastery",
    name: "Names of Allah Mastery",
    description: "Learn the Beautiful Names",
    pathIds: [1], // Names of Allah
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
    pathIds: [10, 11, 12, 13, 14], // Angels, Grave, Day of Judgement, Hellfire, Paradise
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
    pathIds: [4], // Life of Muhammad ﷺ (Sealed Nectar)
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
      // Current week tracking
      currentWeekId: getCurrentWeekId(),
      
      // User's event entries for current week
      // { eventId: { score, answers, completedAt, provisionalRank } }
      weeklyEntries: {},
      
      // Mock leaderboard data (will be replaced with Supabase)
      // { weekId: { eventId: [{ userId, nickname, avatar, score, completedAt }] } }
      leaderboards: {},
      
      // Results viewed status
      resultsViewed: {},
      
      // Check and reset if new week
      checkWeekReset: () => {
        const newWeekId = getCurrentWeekId();
        const { currentWeekId, weeklyEntries } = get();
        
        if (newWeekId !== currentWeekId) {
          // Archive previous week's data (for Supabase migration)
          const archived = {
            weekId: currentWeekId,
            entries: weeklyEntries,
            archivedAt: new Date().toISOString()
          };
          
          // Reset for new week
          set({
            currentWeekId: newWeekId,
            weeklyEntries: {},
            resultsViewed: {}
          });
        }
      },
      
      // Enter an event
      enterEvent: (eventId, score, answers) => {
        const { currentWeekId, weeklyEntries } = get();
        
        // Generate provisional rank (mock for now, will use real leaderboard)
        const provisionalRank = Math.floor(Math.random() * 50) + 1;
        
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
      },
      
      // Check if user has entered an event this week
      hasEntered: (eventId) => {
        const { weeklyEntries } = get();
        return !!weeklyEntries[eventId];
      },
      
      // Get user's entry for an event
      getEntry: (eventId) => {
        const { weeklyEntries } = get();
        return weeklyEntries[eventId] || null;
      },
      
      // Mark results as viewed
      markResultsViewed: (eventId) => {
        const { resultsViewed } = get();
        set({
          resultsViewed: {
            ...resultsViewed,
            [eventId]: true
          }
        });
      },
      
      // Check if results are viewed
      areResultsViewed: (eventId) => {
        const { resultsViewed } = get();
        return !!resultsViewed[eventId];
      },
      
      // Generate mock leaderboard (temporary until Supabase)
      generateMockLeaderboard: (eventId, userEntry) => {
        const { currentWeekId, leaderboards } = get();
        
        // Mock top players
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
        
        // Add user if they scored well enough
        const userScore = userEntry.score;
        if (userScore >= 6) {
          mockPlayers.push({
            userId: "current_user",
            nickname: "You",
            avatar: "avatar1",
            score: userScore,
            completedAt: userEntry.completedAt
          });
        }
        
        // Sort by score (desc), then by time (asc)
        mockPlayers.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return new Date(a.completedAt) - new Date(b.completedAt);
        });
        
        // Store leaderboard
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
      
      // Get leaderboard for event
      getLeaderboard: (eventId) => {
        const { currentWeekId, leaderboards } = get();
        return leaderboards[currentWeekId]?.[eventId] || [];
      },
      
      // Get user's rank in leaderboard
      getUserRank: (eventId) => {
        const leaderboard = get().getLeaderboard(eventId);
        const userIndex = leaderboard.findIndex(p => p.userId === "current_user");
        return userIndex >= 0 ? userIndex + 1 : null;
      },
      
      // Utility functions
      areResultsUnlocked,
      getTimeUntilResults,
      getEvents: () => EVENTS
    }),
    {
      name: "islam-quest-events",
      partialize: (state) => ({
        currentWeekId: state.currentWeekId,
        weeklyEntries: state.weeklyEntries,
        leaderboards: state.leaderboards,
        resultsViewed: state.resultsViewed
      })
    }
  )
);
