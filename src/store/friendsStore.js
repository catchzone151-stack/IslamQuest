import { create } from "zustand";
import { persist } from "zustand/middleware";

const STORAGE_KEY = "islamQuestFriends_v3";

// Generate unique ID (will be replaced by Supabase UUID later)
const generateId = () => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Validate username format
const isValidUsername = (username) => {
  if (!username || username.length < 3 || username.length > 20) return false;
  return /^[a-z0-9_]+$/.test(username);
};

// Generate username suggestions
const generateUsernameSuggestions = (baseUsername) => {
  const clean = baseUsername.toLowerCase().replace(/[^a-z0-9_]/g, '');
  const base = clean || 'user';
  return [
    `${base}_${Math.floor(Math.random() * 100)}`,
    `${base}_${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`,
    `${base}_${Math.random().toString(36).substr(2, 3)}`
  ];
};

export const useFriendsStore = create(
  persist(
    (set, get) => ({
      // Core data
      currentUserId: null,
      users: [], // All registered users in the system
      friendships: [], // Single source of truth for all friendships
      
      // Initialize current user
      initializeUser: (userData) => {
        const { id, username, nickname, avatar, xp, streak } = userData;
        const existingUser = get().users.find(u => u.id === id);
        
        if (!existingUser) {
          set(state => ({
            currentUserId: id,
            users: [...state.users, {
              id,
              username: username.toLowerCase(),
              nickname,
              avatar,
              xp: xp || 0,
              streak: streak || 0,
              lastActive: Date.now()
            }]
          }));
        } else {
          // Update existing user
          set(state => ({
            currentUserId: id,
            users: state.users.map(u => 
              u.id === id 
                ? { ...u, nickname, avatar, xp: xp || u.xp, streak: streak || u.streak, lastActive: Date.now() }
                : u
            )
          }));
        }
      },
      
      // Check if username is available
      isUsernameAvailable: (username) => {
        const normalized = username.toLowerCase();
        return !get().users.some(u => u.username === normalized);
      },
      
      // Get username suggestions
      getUsernameSuggestions: (baseUsername) => {
        return generateUsernameSuggestions(baseUsername);
      },
      
      // Validate username
      validateUsername: (username) => {
        if (!isValidUsername(username)) {
          return { valid: false, error: "Username must be 3-20 characters (letters, numbers, underscore only)" };
        }
        if (!get().isUsernameAvailable(username)) {
          return { valid: false, error: "Username already taken" };
        }
        return { valid: true };
      },
      
      // Search users by username
      searchUsers: (query) => {
        if (!query || query.length < 3) return [];
        const normalized = query.toLowerCase();
        const currentUserId = get().currentUserId;
        
        return get().users
          .filter(u => 
            u.id !== currentUserId && 
            (u.username.includes(normalized) || u.nickname.toLowerCase().includes(normalized))
          )
          .slice(0, 20); // Limit results
      },
      
      // Get friendship between two users
      getFriendship: (userId) => {
        const currentUserId = get().currentUserId;
        if (!currentUserId) return null;
        
        return get().friendships.find(f => 
          (f.userId === currentUserId && f.friendId === userId) ||
          (f.userId === userId && f.friendId === currentUserId)
        );
      },
      
      // Check if users are connected (any relationship exists)
      areWeConnected: (userId) => {
        return !!get().getFriendship(userId);
      },
      
      // Check if user is a friend
      isFriend: (userId) => {
        const friendship = get().getFriendship(userId);
        return friendship?.status === 'accepted';
      },
      
      // Check if can send request
      canSendRequest: (userId) => {
        const currentUserId = get().currentUserId;
        if (!currentUserId || userId === currentUserId) return false;
        
        const friendship = get().getFriendship(userId);
        
        // No existing relationship or already friends - can send
        if (!friendship) return true;
        
        // Already friends or pending - cannot send
        if (friendship.status === 'accepted' || friendship.status === 'pending') return false;
        
        return false;
      },
      
      // Get sent requests
      getSentRequests: () => {
        const currentUserId = get().currentUserId;
        if (!currentUserId) return [];
        
        return get().friendships
          .filter(f => f.userId === currentUserId && f.status === 'pending')
          .map(f => {
            const user = get().users.find(u => u.id === f.friendId);
            return user ? { ...user, requestId: f.id, createdAt: f.createdAt } : null;
          })
          .filter(Boolean);
      },
      
      // Get received requests
      getReceivedRequests: () => {
        const currentUserId = get().currentUserId;
        if (!currentUserId) return [];
        
        return get().friendships
          .filter(f => f.friendId === currentUserId && f.status === 'pending')
          .map(f => {
            const user = get().users.find(u => u.id === f.userId);
            return user ? { ...user, requestId: f.id, createdAt: f.createdAt } : null;
          })
          .filter(Boolean);
      },
      
      // Get all friends
      getAllFriends: () => {
        const currentUserId = get().currentUserId;
        if (!currentUserId) return [];
        
        return get().friendships
          .filter(f => f.status === 'accepted' && (f.userId === currentUserId || f.friendId === currentUserId))
          .map(f => {
            const friendId = f.userId === currentUserId ? f.friendId : f.userId;
            const user = get().users.find(u => u.id === friendId);
            return user ? { ...user, friendshipId: f.id, since: f.createdAt } : null;
          })
          .filter(Boolean)
          .sort((a, b) => b.xp - a.xp); // Sort by XP
      },
      
      // Send friend request
      sendFriendRequest: (userId) => {
        const currentUserId = get().currentUserId;
        if (!currentUserId) {
          return { success: false, error: "You must be logged in" };
        }
        
        if (userId === currentUserId) {
          return { success: false, error: "You cannot add yourself" };
        }
        
        const targetUser = get().users.find(u => u.id === userId);
        if (!targetUser) {
          return { success: false, error: "User not found" };
        }
        
        if (!get().canSendRequest(userId)) {
          const friendship = get().getFriendship(userId);
          if (friendship?.status === 'accepted') {
            return { success: false, error: "Already friends" };
          }
          if (friendship?.status === 'pending') {
            return { success: false, error: "Request already sent" };
          }
        }
        
        // Create new request (declined requests are already deleted)
        const newFriendship = {
          id: generateId(),
          userId: currentUserId,
          friendId: userId,
          status: 'pending',
          createdAt: Date.now()
        };
        
        set(state => ({
          friendships: [...state.friendships, newFriendship]
        }));
        
        return { success: true, message: "Friend request sent!" };
      },
      
      // Accept friend request
      acceptFriendRequest: (requestId) => {
        const friendship = get().friendships.find(f => f.id === requestId);
        if (!friendship || friendship.status !== 'pending') {
          return { success: false, error: "Request not found" };
        }
        
        const currentUserId = get().currentUserId;
        if (friendship.friendId !== currentUserId) {
          return { success: false, error: "Cannot accept this request" };
        }
        
        set(state => ({
          friendships: state.friendships.map(f => 
            f.id === requestId 
              ? { ...f, status: 'accepted' }
              : f
          )
        }));
        
        return { success: true, message: "Friend request accepted!" };
      },
      
      // Decline friend request (deletes the request to allow future requests)
      declineFriendRequest: (requestId) => {
        const friendship = get().friendships.find(f => f.id === requestId);
        if (!friendship || friendship.status !== 'pending') {
          return { success: false, error: "Request not found" };
        }
        
        const currentUserId = get().currentUserId;
        if (friendship.friendId !== currentUserId) {
          return { success: false, error: "Cannot decline this request" };
        }
        
        // Delete the request to allow future requests
        set(state => ({
          friendships: state.friendships.filter(f => f.id !== requestId)
        }));
        
        return { success: true, message: "Friend request declined" };
      },
      
      // Cancel sent request
      cancelSentRequest: (requestId) => {
        const friendship = get().friendships.find(f => f.id === requestId);
        if (!friendship || friendship.status !== 'pending') {
          return { success: false, error: "Request not found" };
        }
        
        const currentUserId = get().currentUserId;
        if (friendship.userId !== currentUserId) {
          return { success: false, error: "Cannot cancel this request" };
        }
        
        set(state => ({
          friendships: state.friendships.filter(f => f.id !== requestId)
        }));
        
        return { success: true, message: "Request cancelled" };
      },
      
      // Remove friend
      removeFriend: (userId) => {
        const friendship = get().getFriendship(userId);
        if (!friendship || friendship.status !== 'accepted') {
          return { success: false, error: "Not friends with this user" };
        }
        
        set(state => ({
          friendships: state.friendships.filter(f => f.id !== friendship.id)
        }));
        
        return { success: true, message: "Friend removed" };
      },
      
      // Get user by ID
      getUserById: (userId) => {
        return get().users.find(u => u.id === userId);
      },
      
      // Get user by username
      getUserByUsername: (username) => {
        const normalized = username.toLowerCase();
        return get().users.find(u => u.username === normalized);
      },
      
      // Update current user data (when XP/streak changes)
      updateCurrentUserData: (data) => {
        const currentUserId = get().currentUserId;
        if (!currentUserId) return;
        
        set(state => ({
          users: state.users.map(u => 
            u.id === currentUserId 
              ? { ...u, ...data, lastActive: Date.now() }
              : u
          )
        }));
      },
      
      // Clear all data (for testing)
      clearAllData: () => {
        set({
          currentUserId: null,
          users: [],
          friendships: []
        });
      }
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        currentUserId: state.currentUserId,
        users: state.users,
        friendships: state.friendships
      })
    }
  )
);
