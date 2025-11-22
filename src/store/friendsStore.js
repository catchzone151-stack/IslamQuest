import { create } from "zustand";
import { useDeveloperStore } from "./developerStore";
import { useProgressStore } from "./progressStore";
import { useUserStore } from "./useUserStore";

const STORAGE_KEY = "islamQuestFriends_v1";
const SIMULATED_FRIENDS_KEY = "islamQuestSimulatedFriends_v2";

const QUICK_MESSAGES = [
  "masha'Allah you're flying 🚀",
  "I'm catching up 👀",
  "Keep pushing 💪",
  "You can't beat my streak 🔥",
  "Let's race to the top 🏆",
  "Your progress is inspiring 🌟",
  "Challenge accepted ⚔️",
  "May Allah bless your efforts 🤲",
  "See you at the finish line 🎯",
  "Your dedication is amazing 💎"
];

// Simulated Friends for Beta Mode Testing
const SIMULATED_FRIENDS_TEMPLATE = [
  // 2 Smart Opponents (high accuracy, fast response)
  {
    nickname: "BarelviBeliever",
    difficulty: "smart",
    accuracy: 0.85,
    responseDelay: { min: 3000, max: 7000 },
    avatar: "avatar_man_cup",
    level: 8,
    xp: 6200,
    coins: 850,
    streak: 42,
    wins: 28,
    losses: 7,
    completedLessons: 45
  },
  {
    nickname: "SufiSeeker",
    difficulty: "smart",
    accuracy: 0.88,
    responseDelay: { min: 3000, max: 8000 },
    avatar: "avatar_woman_hijab_pen",
    level: 9,
    xp: 7800,
    coins: 1050,
    streak: 38,
    wins: 32,
    losses: 6,
    completedLessons: 52
  },
  // 2 Medium Opponents
  {
    nickname: "DeobandiDummy",
    difficulty: "medium",
    accuracy: 0.65,
    responseDelay: { min: 6000, max: 12000 },
    avatar: "avatar_fox",
    level: 5,
    xp: 3100,
    coins: 420,
    streak: 18,
    wins: 15,
    losses: 12,
    completedLessons: 28
  },
  {
    nickname: "SalafiTalafi",
    difficulty: "medium",
    accuracy: 0.68,
    responseDelay: { min: 5000, max: 11000 },
    avatar: "avatar_woman_hijab_studying",
    level: 6,
    xp: 4200,
    coins: 580,
    streak: 25,
    wins: 18,
    losses: 14,
    completedLessons: 35
  },
  // 2 Weak Opponents (lower accuracy, slower response)
  {
    nickname: "HanafiHero",
    difficulty: "weak",
    accuracy: 0.45,
    responseDelay: { min: 8000, max: 15000 },
    avatar: "avatar_robot",
    level: 3,
    xp: 1200,
    coins: 180,
    streak: 7,
    wins: 5,
    losses: 18,
    completedLessons: 15
  },
  {
    nickname: "QadianiQueen",
    difficulty: "weak",
    accuracy: 0.48,
    responseDelay: { min: 9000, max: 18000 },
    avatar: "avatar_woman_hijab_tasbih",
    level: 4,
    xp: 1800,
    coins: 250,
    streak: 12,
    wins: 8,
    losses: 20,
    completedLessons: 22
  }
];

export const useFriendsStore = create((set, get) => ({
  friends: [],
  incomingRequests: [],
  outgoingRequests: [],
  activityFeed: [],
  friendOfWeek: null,
  hasUnseenRequests: false,
  quickMessages: QUICK_MESSAGES,

  // 🤖 SIMULATED FRIENDS SYSTEM (Beta Mode Only)
  generateSimulatedFriends: () => {
    return SIMULATED_FRIENDS_TEMPLATE.map((template, index) => ({
      id: `simulated_${template.nickname.toLowerCase()}`,
      name: template.nickname,
      avatar: template.avatar,
      xp: template.xp,
      coins: template.coins,
      streak: template.streak,
      level: template.level,
      wins: template.wins,
      losses: template.losses,
      isSimulated: true,
      difficulty: template.difficulty,
      accuracy: template.accuracy,
      responseDelay: template.responseDelay,
      completedLessons: Array.from({ length: template.completedLessons }, (_, i) => `lesson_${i + 1}`),
      addedAt: new Date().toISOString(),
    }));
  },

  initializeSimulatedFriends: () => {
    const betaMode = useDeveloperStore.getState().betaMode;
    if (!betaMode) return;

    const saved = localStorage.getItem(SIMULATED_FRIENDS_KEY);
    let simulatedFriends;

    if (saved) {
      simulatedFriends = JSON.parse(saved);
    } else {
      simulatedFriends = get().generateSimulatedFriends();
      localStorage.setItem(SIMULATED_FRIENDS_KEY, JSON.stringify(simulatedFriends));
    }

    const currentFriends = get().friends.filter(f => !f.isSimulated);
    const allFriends = [...currentFriends, ...simulatedFriends];

    set({ friends: allFriends });
    get().setFriendOfWeek();
  },

  cleanupSimulatedFriends: () => {
    const realFriends = get().friends.filter(f => !f.isSimulated);
    set({ friends: realFriends });
    localStorage.removeItem(SIMULATED_FRIENDS_KEY);
    get().setFriendOfWeek();
    get().saveToStorage();
  },

  isSimulatedFriend: (friendId) => {
    const friend = get().friends.find(f => f.id === friendId);
    return friend?.isSimulated === true;
  },

  saveToStorage: () => {
    // Filter out simulated friends before saving (they're stored separately)
    const realFriends = get().friends.filter(f => !f.isSimulated);
    
    const data = {
      friends: realFriends,
      incomingRequests: get().incomingRequests,
      outgoingRequests: get().outgoingRequests,
      activityFeed: get().activityFeed,
      friendOfWeek: get().friendOfWeek,
      hasUnseenRequests: get().hasUnseenRequests,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  loadFromStorage: () => {
    // 🧹 ONE-TIME CLEANUP: Clear all old friends data (remove after beta)
    // This ensures no fake/test friends persist from development
    const cleanupFlag = localStorage.getItem("islamQuestFriends_cleaned_v1");
    if (!cleanupFlag) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem("islamQuestFriends_cleaned_v1", "true");
      // Start fresh - no need to load old data
      return;
    }
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      set({
        friends: data.friends || [],
        incomingRequests: data.incomingRequests || [],
        outgoingRequests: data.outgoingRequests || [],
        activityFeed: data.activityFeed || [],
        friendOfWeek: data.friendOfWeek || null,
        hasUnseenRequests: data.hasUnseenRequests || false,
      });
      get().setFriendOfWeek();
    }

    // 🤖 Initialize simulated friends if beta mode is active
    const betaMode = useDeveloperStore.getState()?.betaMode;
    if (betaMode) {
      get().initializeSimulatedFriends();
    }
  },

  sendFriendRequest: (nickname) => {
    const mockUser = {
      id: `user_${Date.now()}`,
      name: nickname,
      avatar: `avatar${Math.floor(Math.random() * 4) + 1}`,
      xp: Math.floor(Math.random() * 2000) + 500,
      streak: Math.floor(Math.random() * 30),
    };

    set((state) => ({
      outgoingRequests: [...state.outgoingRequests, mockUser],
    }));

    get().addActivity(`You sent a friend request to ${nickname} 🤝`);
    get().saveToStorage();
  },

  acceptFriendRequest: (userId) => {
    const request = get().incomingRequests.find((r) => r.id === userId);
    if (!request) return;

    const newFriend = {
      ...request,
      addedAt: new Date().toISOString(),
    };

    set((state) => ({
      friends: [...state.friends, newFriend],
      incomingRequests: state.incomingRequests.filter((r) => r.id !== userId),
    }));

    get().addActivity(`${request.name} is now your friend 🎉`);
    get().setFriendOfWeek();
    get().saveToStorage();
  },

  declineFriendRequest: (userId) => {
    set((state) => ({
      incomingRequests: state.incomingRequests.filter((r) => r.id !== userId),
    }));
    get().saveToStorage();
  },

  cancelOutgoingRequest: (userId) => {
    set((state) => ({
      outgoingRequests: state.outgoingRequests.filter((r) => r.id !== userId),
    }));
    get().saveToStorage();
  },

  removeFriend: (userId) => {
    set((state) => ({
      friends: state.friends.filter((f) => f.id !== userId),
    }));
    get().setFriendOfWeek();
    get().saveToStorage();
  },

  sendMessage: (friendId, message) => {
    const friend = get().friends.find((f) => f.id === friendId);
    if (friend) {
      get().addActivity(`You sent a message to ${friend.name} 💬`);
    }
    get().saveToStorage();
  },

  sendChallenge: (friendId) => {
    const friend = get().friends.find((f) => f.id === friendId);
    if (friend) {
      get().addActivity(`You challenged ${friend.name} ⚔️`);
    }
    get().saveToStorage();
  },

  addActivity: (message) => {
    const newActivity = {
      id: `activity_${Date.now()}`,
      message,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      activityFeed: [newActivity, ...state.activityFeed].slice(0, 50),
    }));
  },

  getFriendsLeaderboard: () => {
    const friends = get().friends;
    return friends
      .map((f, index) => ({
        ...f,
        rank: index + 1,
      }))
      .sort((a, b) => b.xp - a.xp)
      .map((f, index) => ({
        ...f,
        rank: index + 1,
      }));
  },

  getGlobalLeaderboard: () => {
    const betaMode = useDeveloperStore.getState()?.betaMode;
    
    if (!betaMode) {
      // Global leaderboard disabled in production - will be implemented with Supabase
      return [];
    }

    // 🤖 Beta Mode: Show simulated friends + current user + The Dev
    const friends = get().friends;
    
    // Get current user data from progressStore
    const { xp, coins, level, streak } = useProgressStore.getState();
    const { name, avatar, id: currentUserId } = useUserStore();
    
    const currentUser = {
      id: currentUserId,
      name: name || 'You',
      avatar: avatar || 'avatar1',
      xp: xp || 0,
      coins: coins || 0,
      level: level || 1,
      streak: streak || 0,
      isCurrentUser: true
    };

    // Add "The Dev" NPC with exactly 168350 XP (appears only in global, not friends)
    const theDev = {
      id: 'the_dev_npc',
      name: 'The Dev',
      avatar: 'avatar_ninja_male',
      xp: 168350,
      coins: 50000,
      level: 10,
      streak: 365,
      isNPC: true
    };

    // Combine current user + The Dev + all friends (real + simulated)
    const allPlayers = [currentUser, theDev, ...friends];

    // Sort by XP → Level → Coins
    return allPlayers
      .sort((a, b) => {
        if (b.xp !== a.xp) return b.xp - a.xp;
        if (b.level !== a.level) return b.level - a.level;
        return b.coins - a.coins;
      })
      .map((player, index) => ({
        ...player,
        rank: index + 1,
      }));
  },

  clearRequestsBadge: () => {
    set({ hasUnseenRequests: false });
    get().saveToStorage();
  },

  setFriendOfWeek: () => {
    const friends = get().friends;
    if (friends.length > 0) {
      const topFriend = [...friends].sort((a, b) => b.xp - a.xp)[0];
      set({ friendOfWeek: topFriend });
    } else {
      set({ friendOfWeek: null });
    }
  },
}));

useFriendsStore.getState().loadFromStorage();
