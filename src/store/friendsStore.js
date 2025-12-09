// src/store/friendsStore.js
// Cloud-backed Friends Engine with Supabase
import { create } from "zustand";
import { supabase } from "../lib/supabaseClient";
import { avatarIndexToKey } from "../utils/avatarUtils";
import { useFriendChallengesStore } from "./friendChallengesStore";

export const useFriendsStore = create((set, get) => ({
  friends: [],
  sentRequests: [],
  receivedRequests: [],
  users: [],
  globalLeaderboard: [],
  loading: false,
  error: null,
  currentUserId: null,
  realtimeChannel: null,
  initialized: false,

  // Initialize with real-time subscription
  initialize: async () => {
    if (get().initialized) return;
    
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user?.id) return;
    
    const userId = auth.user.id;
    set({ currentUserId: userId });
    
    await get().loadAll();
    get().setupRealtimeSubscription(userId);
    set({ initialized: true });
  },

  // Setup real-time subscription for instant friend updates
  setupRealtimeSubscription: (userId) => {
    const existingChannel = get().realtimeChannel;
    if (existingChannel) {
      supabase.removeChannel(existingChannel);
    }

    const channel = supabase
      .channel(`friends_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friends",
          filter: `user_id=eq.${userId}`,
        },
        () => get().loadAll()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friends",
          filter: `friend_id=eq.${userId}`,
        },
        () => get().loadAll()
      )
      .subscribe();

    set({ realtimeChannel: channel });
  },

  cleanup: () => {
    const { realtimeChannel } = get();
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
    }
    set({
      friends: [],
      sentRequests: [],
      receivedRequests: [],
      users: [],
      currentUserId: null,
      realtimeChannel: null,
      initialized: false,
    });
  },

  loadAll: async () => {
    try {
      set({ loading: true, error: null });

      let userId = get().currentUserId;
      if (!userId) {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) {
          set({ friends: [], sentRequests: [], receivedRequests: [], users: [], loading: false });
          return;
        }
        userId = auth.user.id;
        set({ currentUserId: userId });
      }

      // PARALLEL fetch: friends, sent requests, received requests
      const [friendsResult, sentResult, receivedResult] = await Promise.all([
        supabase.from("friends").select("*").or(`user_id.eq.${userId},friend_id.eq.${userId}`).eq("status", "accepted"),
        supabase.from("friends").select("*").eq("user_id", userId).eq("status", "pending"),
        supabase.from("friends").select("*").eq("friend_id", userId).eq("status", "pending"),
      ]);

      if (friendsResult.error) {
        set({ friends: [], sentRequests: [], receivedRequests: [], users: [], loading: false, error: null });
        return;
      }

      const friendsData = friendsResult.data || [];
      const sent = sentResult.data || [];
      const received = receivedResult.data || [];

      // Collect all profile IDs needed
      const friendIds = friendsData.map(f => f.user_id === userId ? f.friend_id : f.user_id);
      const sentIds = sent.map(s => s.friend_id);
      const receivedIds = received.map(r => r.user_id);
      const allProfileIds = [...new Set([...friendIds, ...sentIds, ...receivedIds])];

      // Single batch profile fetch
      let allProfiles = [];
      if (allProfileIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, username, handle, avatar, xp, streak, coins, shield_count")
          .in("user_id", allProfileIds);
        allProfiles = profiles || [];
      }

      const profileMap = new Map(allProfiles.map(p => [p.user_id, p]));

      const formatProfile = (profile, includeExtras = false) => ({
        user_id: profile.user_id,
        id: profile.user_id,
        username: profile.username,
        handle: profile.handle,
        nickname: profile.username || profile.handle || "User",
        avatar: typeof profile.avatar === "number" ? avatarIndexToKey(profile.avatar) : profile.avatar || "avatar_man_lantern",
        xp: profile.xp || 0,
        ...(includeExtras && { streak: profile.streak || 0, coins: profile.coins || 0, shield_count: profile.shield_count || 0 }),
      });

      const formattedFriends = friendIds.map(id => profileMap.get(id)).filter(Boolean).map(p => formatProfile(p, true));
      
      const formattedSent = sent.map(row => {
        const profile = profileMap.get(row.friend_id) || {};
        return { id: row.id, requestId: row.id, senderId: row.user_id, receiverId: row.friend_id, user_id: row.friend_id, ...formatProfile(profile) };
      });

      const formattedReceived = received.map(row => {
        const profile = profileMap.get(row.user_id) || {};
        return { id: row.id, requestId: row.id, senderId: row.user_id, receiverId: row.friend_id, user_id: row.user_id, ...formatProfile(profile) };
      });

      set({ friends: formattedFriends, sentRequests: formattedSent, receivedRequests: formattedReceived, loading: false });
    } catch (err) {
      set({ friends: [], sentRequests: [], receivedRequests: [], users: [], loading: false, error: null });
    }
  },

  loadFriends: async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return [];

    const userId = auth.user.id;
    
    const { data, error } = await supabase
      .from("friends")
      .select("*")
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .eq("status", "accepted");

    if (error) {
      console.warn("loadFriends error:", error.message);
      return [];
    }

    const friendIds = (data || []).map((f) => 
      f.user_id === userId ? f.friend_id : f.user_id
    );
    if (friendIds.length === 0) {
      set({ friends: [] });
      return [];
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, username, handle, avatar, xp, streak, coins, shield_count")
      .in("user_id", friendIds);

    const friends = (profiles || []).map((profile) => ({
      user_id: profile.user_id,
      id: profile.user_id,
      username: profile.username,
      handle: profile.handle,
      nickname: profile.username || profile.handle || "User",
      avatar: typeof profile.avatar === "number"
        ? avatarIndexToKey(profile.avatar)
        : profile.avatar || "avatar_man_lantern",
      xp: profile.xp || 0,
      streak: profile.streak || 0,
      coins: profile.coins || 0,
      shield_count: profile.shield_count || 0,
    }));

    set({ friends });
    return friends;
  },

  loadPendingRequests: async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return [];

    const userId = auth.user.id;

    const { data, error } = await supabase
      .from("friends")
      .select("*")
      .eq("friend_id", userId)
      .eq("status", "pending");

    if (error) {
      console.warn("loadPendingRequests error:", error.message);
      return [];
    }

    const senderIds = (data || []).map((r) => r.user_id);
    let senderProfiles = [];
    if (senderIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, handle, avatar, xp")
        .in("user_id", senderIds);
      senderProfiles = profiles || [];
    }

    const formattedReceived = (data || []).map((row) => {
      const profile = senderProfiles.find((p) => p.user_id === row.user_id) || {};
      return {
        id: row.id,
        requestId: row.id,
        senderId: row.user_id,
        receiverId: row.friend_id,
        user_id: row.user_id,
        username: profile.username,
        handle: profile.handle,
        nickname: profile.username || profile.handle || "User",
        avatar: typeof profile.avatar === "number"
          ? avatarIndexToKey(profile.avatar)
          : profile.avatar || "avatar_man_lantern",
        xp: profile.xp || 0,
      };
    });

    set({ receivedRequests: formattedReceived });
    return formattedReceived;
  },

  loadRequests: async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return { sent: [], received: [] };

    const userId = auth.user.id;

    const { data: sent } = await supabase
      .from("friends")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "pending");

    const { data: received } = await supabase
      .from("friends")
      .select("*")
      .eq("friend_id", userId)
      .eq("status", "pending");

    const sentIds = (sent || []).map((s) => s.friend_id);
    const receivedIds = (received || []).map((r) => r.user_id);

    let sentProfiles = [];
    let receivedProfiles = [];

    if (sentIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, handle, avatar, xp")
        .in("user_id", sentIds);
      sentProfiles = profiles || [];
    }

    if (receivedIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, handle, avatar, xp")
        .in("user_id", receivedIds);
      receivedProfiles = profiles || [];
    }

    const formattedSent = (sent || []).map((row) => {
      const p = sentProfiles.find((pr) => pr.user_id === row.friend_id) || {};
      return {
        id: row.id,
        requestId: row.id,
        senderId: row.user_id,
        receiverId: row.friend_id,
        user_id: row.friend_id,
        username: p.username,
        handle: p.handle,
        nickname: p.username || p.handle || "User",
        avatar: typeof p.avatar === "number" ? avatarIndexToKey(p.avatar) : p.avatar || "avatar_man_lantern",
        xp: p.xp || 0,
      };
    });

    const formattedReceived = (received || []).map((row) => {
      const p = receivedProfiles.find((pr) => pr.user_id === row.user_id) || {};
      return {
        id: row.id,
        requestId: row.id,
        senderId: row.user_id,
        receiverId: row.friend_id,
        user_id: row.user_id,
        username: p.username,
        handle: p.handle,
        nickname: p.username || p.handle || "User",
        avatar: typeof p.avatar === "number" ? avatarIndexToKey(p.avatar) : p.avatar || "avatar_man_lantern",
        xp: p.xp || 0,
      };
    });

    set({ sentRequests: formattedSent, receivedRequests: formattedReceived });
    return { sent: formattedSent, received: formattedReceived };
  },

  loadLeaderboard: async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, username, handle, avatar, xp, streak")
        .order("xp", { ascending: false })
        .limit(100);

      if (error) {
        console.warn("loadLeaderboard error:", error.message);
        return [];
      }

      const formatted = (data || []).map((p) => ({
        user_id: p.user_id,
        username: p.username,
        handle: p.handle,
        avatar: typeof p.avatar === "number" ? avatarIndexToKey(p.avatar) : p.avatar,
        xp: p.xp || 0,
        streak: p.streak || 0,
      }));

      set({ globalLeaderboard: formatted });
      return formatted;
    } catch (err) {
      console.warn("loadLeaderboard error:", err);
      return [];
    }
  },

  searchUsers: async (query) => {
    if (!query || query.trim().length < 2) return [];

    const searchTerm = query.trim().toLowerCase();

    try {
      const { data: handleResults } = await supabase
        .from("profiles")
        .select("user_id, username, handle, avatar, xp, streak")
        .ilike("handle", `%${searchTerm}%`)
        .limit(20);

      const { data: usernameResults } = await supabase
        .from("profiles")
        .select("user_id, username, handle, avatar, xp, streak")
        .ilike("username", `%${searchTerm}%`)
        .limit(20);

      const combined = [...(handleResults || []), ...(usernameResults || [])];
      const unique = Array.from(
        new Map(combined.map((u) => [u.user_id, u])).values()
      );

      const { data: auth } = await supabase.auth.getUser();
      const currentUserId = auth?.user?.id;

      const filtered = unique
        .filter((u) => u.user_id !== currentUserId)
        .map((p) => ({
          user_id: p.user_id,
          id: p.user_id,
          username: p.username,
          handle: p.handle,
          nickname: p.username || p.handle || "User",
          avatar: typeof p.avatar === "number" ? avatarIndexToKey(p.avatar) : p.avatar,
          xp: p.xp || 0,
          streak: p.streak || 0,
        }));

      return filtered;
    } catch (err) {
      console.warn("searchUsers error:", err);
      return [];
    }
  },

  sendFriendRequest: async (targetUserId) => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return { success: false, error: "Not logged in" };

      const myUserId = auth.user.id;
      console.log("📤 sendFriendRequest - myUserId:", myUserId, "targetUserId:", targetUserId);

      if (myUserId === targetUserId) {
        return { success: false, error: "You cannot add yourself" };
      }

      // Check database directly for any existing relationship
      const { data: existingRow, error: checkErr } = await supabase
        .from("friends")
        .select("user_id, friend_id, status")
        .or(`and(user_id.eq.${myUserId},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${myUserId})`)
        .maybeSingle();

      console.log("📤 sendFriendRequest - existing check:", existingRow, checkErr);

      if (existingRow) {
        if (existingRow.status === "accepted") {
          return { success: false, error: "Already friends" };
        }
        if (existingRow.user_id === myUserId && existingRow.status === "pending") {
          return { success: false, error: "Request already sent" };
        }
        if (existingRow.friend_id === myUserId && existingRow.status === "pending") {
          return { success: false, error: "They already sent you a request - check your requests!" };
        }
      }

      // Insert new friend request: user_id = sender, friend_id = receiver
      const { error: insertErr } = await supabase.from("friends").insert({
        user_id: myUserId,
        friend_id: targetUserId,
        status: "pending",
      });

      console.log("📤 sendFriendRequest - insert result:", insertErr);

      if (insertErr) {
        if (insertErr.code === "23505") {
          return { success: false, error: "Request already exists" };
        }
        console.error("sendFriendRequest insert error:", insertErr);
        return { success: false, error: "Failed to send request" };
      }

      // Refresh friends, sent requests, and pending requests
      await get().loadFriends();
      await get().loadRequests();
      await get().loadPendingRequests();
      return { success: true, message: "Friend request sent!" };
    } catch (err) {
      console.error("sendFriendRequest error:", err);
      return { success: false, error: "Failed to send request" };
    }
  },

  acceptFriendRequest: async (requestId) => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return { success: false, error: "Not logged in" };

      const myUserId = auth.user.id;
      console.log("🤝 acceptFriendRequest - myUserId:", myUserId, "requestId:", requestId);

      // Update status to accepted using the row id
      const { data: updateData, error: updateErr } = await supabase
        .from("friends")
        .update({ status: "accepted" })
        .eq("id", requestId)
        .select();

      console.log("🤝 acceptFriendRequest - update result:", updateData, "error:", updateErr);

      if (updateErr) {
        console.error("Accept friend request error:", updateErr);
        return { success: false, error: "Failed to accept request" };
      }

      if (!updateData || updateData.length === 0) {
        console.warn("🤝 acceptFriendRequest - No request found with id:", requestId);
        return { success: false, error: "Request not found or already accepted" };
      }

      // Refresh friends, sent requests, and pending requests
      await get().loadFriends();
      await get().loadRequests();
      await get().loadPendingRequests();
      
      const { friends } = get();
      console.log("🤝 acceptFriendRequest - friends after refresh:", friends);
      
      return { success: true, message: "Friend added!" };
    } catch (err) {
      console.error("acceptFriendRequest error:", err);
      return { success: false, error: "Failed to accept request" };
    }
  },

  declineFriendRequest: async (requestId) => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return { success: false, error: "Not logged in" };

      console.log("❌ declineFriendRequest - requestId:", requestId);

      // Delete the request by id
      const { error: deleteErr } = await supabase
        .from("friends")
        .delete()
        .eq("id", requestId);

      console.log("❌ declineFriendRequest - delete error:", deleteErr);

      // Refresh friends, sent requests, and pending requests
      await get().loadFriends();
      await get().loadRequests();
      await get().loadPendingRequests();
      return { success: true };
    } catch (err) {
      console.error("declineFriendRequest error:", err);
      return { success: false, error: "Failed to decline request" };
    }
  },

  cancelSentRequest: async (receiverId) => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return { success: false, error: "Not logged in" };

      const myUserId = auth.user.id;
      console.log("🚫 cancelSentRequest - myUserId:", myUserId, "receiverId:", receiverId);

      // Delete where I am user_id (sender), target is friend_id (receiver)
      const { error: deleteErr } = await supabase
        .from("friends")
        .delete()
        .eq("user_id", myUserId)
        .eq("friend_id", receiverId)
        .eq("status", "pending");

      console.log("🚫 cancelSentRequest - delete error:", deleteErr);

      // Refresh friends, sent requests, and pending requests
      await get().loadFriends();
      await get().loadRequests();
      await get().loadPendingRequests();
      return { success: true, message: "Request cancelled" };
    } catch (err) {
      console.error("cancelSentRequest error:", err);
      return { success: false, error: "Failed to cancel request" };
    }
  },

  removeFriend: async (friendId) => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return { success: false, error: "Not logged in" };

      const myUserId = auth.user.id;
      console.log("🗑️ removeFriend - myUserId:", myUserId, "friendId:", friendId);

      // Delete row where either direction matches (both must be accepted to be friends)
      const { error: deleteErr } = await supabase
        .from("friends")
        .delete()
        .or(
          `and(user_id.eq.${myUserId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${myUserId})`
        );

      console.log("🗑️ removeFriend - delete error:", deleteErr);

      // Also delete any friend challenges between these users
      const { error: challengeErr } = await supabase
        .from("friend_challenges")
        .delete()
        .or(
          `and(sender_id.eq.${myUserId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${myUserId})`
        );

      console.log("🗑️ removeFriend - challenge delete error:", challengeErr);

      // Refresh friends and requests
      await get().loadFriends();
      await get().loadRequests();
      await get().loadPendingRequests();
      
      // Refresh friend challenges store
      await useFriendChallengesStore.getState().loadChallenges();
      
      return { success: true, message: "Friend removed" };
    } catch (err) {
      console.error("removeFriend error:", err);
      return { success: false, error: "Failed to remove friend" };
    }
  },

  getUserById: (userId) => {
    const { friends, sentRequests, receivedRequests } = get();

    const friend = friends.find((f) => f.user_id === userId || f.id === userId);
    if (friend) return friend;

    const sent = sentRequests.find((r) => r.user_id === userId || r.id === userId);
    if (sent) return sent;

    const received = receivedRequests.find((r) => r.user_id === userId || r.id === userId);
    if (received) return received;

    return null;
  },

  getProfileById: async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, username, handle, avatar, xp, streak, coins, shield_count")
        .eq("user_id", userId)
        .maybeSingle();

      if (error || !data) return null;

      return {
        user_id: data.user_id,
        id: data.user_id,
        username: data.username,
        handle: data.handle,
        nickname: data.username || data.handle || "User",
        avatar: typeof data.avatar === "number" ? avatarIndexToKey(data.avatar) : data.avatar,
        xp: data.xp || 0,
        streak: data.streak || 0,
        coins: data.coins || 0,
        shield_count: data.shield_count || 0,
      };
    } catch (err) {
      console.warn("getProfileById error:", err);
      return null;
    }
  },

  isFriend: (userId) => {
    const { friends } = get();
    return friends.some((f) => f.user_id === userId || f.id === userId);
  },

  canSendRequest: (userId) => {
    const { friends, sentRequests, receivedRequests } = get();
    if (friends.some((f) => f.user_id === userId || f.id === userId)) return false;
    if (sentRequests.some((r) => r.user_id === userId || r.id === userId)) return false;
    if (receivedRequests.some((r) => r.user_id === userId || r.id === userId)) return false;
    return true;
  },

  getFriendship: (userId) => {
    const { friends, sentRequests, receivedRequests } = get();
    if (friends.some((f) => f.user_id === userId || f.id === userId)) return { status: "accepted" };
    if (sentRequests.some((r) => r.user_id === userId || r.id === userId)) return { status: "sent" };
    if (receivedRequests.some((r) => r.user_id === userId || r.id === userId)) return { status: "received" };
    return { status: "none" };
  },

  updateCurrentUserData: async (userData) => {
    const { globalLeaderboard } = get();
    const { data: auth } = await supabase.auth.getUser();

    if (!auth?.user) return;

    const userId = auth.user.id;
    const updatedLeaderboard = globalLeaderboard.map((u) =>
      u.user_id === userId ? { ...u, ...userData } : u
    );

    set({ globalLeaderboard: updatedLeaderboard });
  },

  initializeUser: async () => {
    return;
  },

  getAllFriends: () => {
    return get().friends;
  },
  getSentRequests: () => get().sentRequests,
  getReceivedRequests: () => get().receivedRequests,
  getGlobalLeaderboard: () => get().globalLeaderboard,
}));
