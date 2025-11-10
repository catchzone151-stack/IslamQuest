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

const MOCK_GLOBAL_LEADERBOARD = [
  { id: "global_1", name: "Fatima A.", avatar: "avatar2", xp: 3250, rank: 1 },
  { id: "global_2", name: "Omar K.", avatar: "avatar1", xp: 3100, rank: 2 },
  { id: "global_3", name: "Aisha M.", avatar: "avatar3", xp: 2980, rank: 3 },
  { id: "global_4", name: "Ibrahim S.", avatar: "avatar4", xp: 2750, rank: 4 },
  { id: "global_5", name: "Maryam Z.", avatar: "avatar2", xp: 2650, rank: 5 },
  { id: "global_6", name: "Yusuf H.", avatar: "avatar1", xp: 2500, rank: 6 },
  { id: "global_7", name: "Khadija L.", avatar: "avatar3", xp: 2350, rank: 7 },
  { id: "global_8", name: "Ali R.", avatar: "avatar4", xp: 2200, rank: 8 },
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
    return MOCK_GLOBAL_LEADERBOARD;
  },

  clearRequestsBadge: () => {
    set({ hasUnseenRequests: false });
    get().saveToStorage();
  },

  addMockIncomingRequest: () => {
    const mockNames = ["Bilal", "Aisha", "Umar", "Zaynab", "Hassan", "Hafsa"];
    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
    
    const mockRequest = {
      id: `request_${Date.now()}`,
      name: randomName,
      avatar: `avatar${Math.floor(Math.random() * 4) + 1}`,
      xp: Math.floor(Math.random() * 2000) + 500,
      streak: Math.floor(Math.random() * 30),
    };

    set((state) => ({
      incomingRequests: [...state.incomingRequests, mockRequest],
      hasUnseenRequests: true,
    }));

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
