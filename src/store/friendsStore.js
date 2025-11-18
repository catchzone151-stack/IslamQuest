import { create } from "zustand";

const STORAGE_KEY = "islamQuestFriends_v1";

const QUICK_MESSAGES = [
  "MashaAllah you're flying 🚀",
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

export const useFriendsStore = create((set, get) => ({
  friends: [],
  incomingRequests: [],
  outgoingRequests: [],
  activityFeed: [],
  friendOfWeek: null,
  hasUnseenRequests: false,
  quickMessages: QUICK_MESSAGES,

  saveToStorage: () => {
    const data = {
      friends: get().friends,
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
    // Global leaderboard disabled - will be implemented with Supabase
    return [];
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
