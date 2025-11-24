// src/store/friendsStore.js
import { create } from "zustand";
import { supabase } from "../lib/supabaseClient";

export const useFriendsStore = create((set, get) => ({
  friends: [],                 // confirmed friends
  sentRequests: [],            // requests you sent (pending)
  receivedRequests: [],        // requests you received (pending)
  users: [],                   // cached searchable users
  loading: false,
  error: null,

  // ----------------------------------------------------------
  // LOAD FRIENDS + REQUESTS
  // ----------------------------------------------------------
  loadAll: async () => {
    try {
      set({ loading: true, error: null });

      const { data: auth } = await supabase.auth.getUser();
      if (!auth || !auth.user) {
        set({
          friends: [],
          sentRequests: [],
          receivedRequests: [],
          users: [],
          loading: false
        });
        return;
      }

      const userId = auth.user.id;

      // 1️⃣ Load accepted friendships (two-way)
      const { data: friendsData, error: friendsErr } = await supabase
        .from("friends")
        .select("friend_id, profiles:friend_id (id, username, display_name, avatar, xp)")
        .eq("user_id", userId)
        .eq("status", "accepted");

      // Handle case where tables don't exist yet
      if (friendsErr) {
        console.warn("Friends table not ready:", friendsErr.message);
        set({
          friends: [],
          sentRequests: [],
          receivedRequests: [],
          users: [],
          loading: false,
          error: null
        });
        return;
      }

      const formattedFriends = (friendsData || []).map((row) => ({
        id: row.profiles?.id || "",
        username: row.profiles?.username || "",
        nickname: row.profiles?.display_name || "User",
        avatar: row.profiles?.avatar || "default",
        xp: row.profiles?.xp || 0,
        streak: row.profiles?.streak ?? 0,
      }));

      // 2️⃣ Load sent (pending)
      const { data: sent, error: sentErr } = await supabase
        .from("friends")
        .select("id, friend_id, profiles:friend_id (id, username, display_name, avatar, xp)")
        .eq("user_id", userId)
        .eq("status", "pending");

      const formattedSent = (sent || []).map((row) => ({
        requestId: row.id,
        id: row.profiles?.id || "",
        username: row.profiles?.username || "",
        nickname: row.profiles?.display_name || "User",
        avatar: row.profiles?.avatar || "default",
        xp: row.profiles?.xp || 0,
      }));

      // 3️⃣ Load received (pending)
      const { data: received, error: receivedErr } = await supabase
        .from("friends")
        .select("id, user_id, profiles:user_id (id, username, display_name, avatar, xp)")
        .eq("friend_id", userId)
        .eq("status", "pending");

      const formattedReceived = (received || []).map((row) => ({
        requestId: row.id,
        id: row.profiles?.id || "",
        username: row.profiles?.username || "",
        nickname: row.profiles?.display_name || "User",
        avatar: row.profiles?.avatar || "default",
        xp: row.profiles?.xp || 0,
      }));

      // 4️⃣ Load all users (for search)
      const { data: userRows } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar, xp");

      set({
        friends: formattedFriends,
        sentRequests: formattedSent,
        receivedRequests: formattedReceived,
        users: userRows || [],
        loading: false
      });
    } catch (err) {
      console.warn("loadAll error:", err);
      // Set empty state instead of crashing the page
      set({
        friends: [],
        sentRequests: [],
        receivedRequests: [],
        users: [],
        loading: false,
        error: null
      });
    }
  },

  // ----------------------------------------------------------
  // SEARCH USERS
  // ----------------------------------------------------------
  searchUsers: (query) => {
    const { users } = get();
    const q = query.toLowerCase();
    return users.filter((u) => u.username.toLowerCase().includes(q));
  },

  // ----------------------------------------------------------
  // SEND A FRIEND REQUEST
  // ----------------------------------------------------------
  sendFriendRequest: async (targetUserId) => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth || !auth.user)
        return { success: false, error: "Not logged in" };

      const userId = auth.user.id;

      if (userId === targetUserId) {
        return { success: false, error: "You cannot add yourself" };
      }

      // Insert pending request
      const { error } = await supabase.from("friends").insert({
        user_id: userId,
        friend_id: targetUserId,
        status: "pending",
      });

      if (error) {
        if (error.code === "23505") {
          return { success: false, error: "Already friends or request pending" };
        }
        throw error;
      }

      await get().loadAll();
      return { success: true, message: "Friend request sent" };
    } catch (err) {
      console.error("sendFriendRequest error:", err);
      return { success: false, error: "Failed to send friend request" };
    }
  },

  // ----------------------------------------------------------
  // ACCEPT FRIEND REQUEST
  // ----------------------------------------------------------
  acceptFriendRequest: async (requestId) => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth || !auth.user)
        return { success: false, error: "Not logged in" };

      const userId = auth.user.id;

      // Get original request
      const { data: req } = await supabase
        .from("friends")
        .select("*")
        .eq("id", requestId)
        .single();

      if (!req) return { success: false, error: "Request not found" };

      // Mark the original request as accepted
      await supabase
        .from("friends")
        .update({ status: "accepted" })
        .eq("id", requestId);

      // Create reverse friendship row
      await supabase.from("friends").insert({
        user_id: userId,
        friend_id: req.user_id,
        status: "accepted",
      });

      await get().loadAll();
      return { success: true, message: "Friend added!" };
    } catch (err) {
      console.error("acceptFriendRequest error:", err);
      return { success: false, error: "Failed to accept request" };
    }
  },

  // ----------------------------------------------------------
  // DECLINE REQUEST
  // ----------------------------------------------------------
  declineFriendRequest: async (requestId) => {
    try {
      await supabase.from("friends").delete().eq("id", requestId);
      await get().loadAll();
      return { success: true };
    } catch (err) {
      return { success: false, error: "Failed to decline request" };
    }
  },

  // ----------------------------------------------------------
  // CANCEL SENT REQUEST
  // ----------------------------------------------------------
  cancelSentRequest: async (requestId) => {
    try {
      await supabase.from("friends").delete().eq("id", requestId);
      await get().loadAll();
      return { success: true, message: "Request cancelled" };
    } catch (err) {
      return { success: false, error: "Failed to cancel request" };
    }
  },

  // ----------------------------------------------------------
  // REMOVE FRIEND (removes both sides)
  // ----------------------------------------------------------
  removeFriend: async (friendId) => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth || !auth.user) return;

      const userId = auth.user.id;

      await supabase
        .from("friends")
        .delete()
        .or(`and(user_id.eq.${userId}, friend_id.eq.${friendId}), and(user_id.eq.${friendId}, friend_id.eq.${userId})`);

      await get().loadAll();
    } catch (err) {
      console.error("removeFriend error:", err);
    }
  },

  // ----------------------------------------------------------
  // UTILS
  // ----------------------------------------------------------
  isFriend: (userId) => {
    const { friends } = get();
    return friends.some((f) => f.id === userId);
  },

  canSendRequest: (userId) => {
    const { friends, sentRequests, receivedRequests } = get();
    // Can't send if already friends
    if (friends.some((f) => f.id === userId)) return false;
    // Can't send if already sent
    if (sentRequests.some((r) => r.id === userId)) return false;
    // Can't send if they already sent you one
    if (receivedRequests.some((r) => r.id === userId)) return false;
    return true;
  },

  getFriendship: (userId) => {
    const { friends, sentRequests, receivedRequests } = get();
    if (friends.some((f) => f.id === userId)) return { status: "accepted" };
    if (sentRequests.some((r) => r.id === userId)) return { status: "sent" };
    if (receivedRequests.some((r) => r.id === userId)) return { status: "received" };
    return { status: "none" };
  },

  updateCurrentUserData: async (userData) => {
    // This function updates the current user's data in the users array
    // Called when XP/streak changes to keep leaderboard accurate
    const { users } = get();
    const { data: auth } = await supabase.auth.getUser();
    
    if (!auth || !auth.user) return;
    
    const userId = auth.user.id;
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, ...userData } : u
    );
    
    set({ users: updatedUsers });
  },

  initializeUser: async (userId, userData) => {
    // Initialize user in the system (if needed for first-time setup)
    // For now, this is a no-op since loadAll handles everything
    return;
  },

  getAllFriends: () => get().friends,
  getSentRequests: () => get().sentRequests,
  getReceivedRequests: () => get().receivedRequests,

}));
