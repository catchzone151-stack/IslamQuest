// src/store/friendsStore.js
// Cloud-backed Friends Engine with Supabase
import { create } from "zustand";
import { supabase } from "../lib/supabaseClient";
import { avatarIndexToKey } from "../utils/avatarUtils";
import { useFriendChallengesStore } from "./friendChallengesStore";
import { useUserStore } from "./useUserStore";
import { useModalStore, MODAL_TYPES } from "./modalStore";
import { useProgressStore } from "./progressStore";

// Debounce timer for realtime-triggered loadAll calls — prevents fetch storms
// when multiple postgres_changes events fire in rapid succession
let _realtimeLoadAllTimer = null;
const debouncedLoadAll = (get) => {
  clearTimeout(_realtimeLoadAllTimer);
  _realtimeLoadAllTimer = setTimeout(() => get().loadAll(), 300);
};

const requireVerified = () => {
  const { user } = useUserStore.getState();
  const isVerified = !!user?.email_confirmed_at;
  if (!isVerified) {
    useModalStore.getState().showModal(MODAL_TYPES.VERIFY_EMAIL);
    return false;
  }
  return true;
};

export const useFriendsStore = create((set, get) => ({
  friends: [],
  sentRequests: [],
  receivedRequests: [],
  users: [],
  globalLeaderboard: [],
  userGlobalRank: null,
  userAboveXP: null,
  userAboveRank: null,
  loading: false,
  leaderboardLoading: false,
  leaderboardError: null,
  error: null,
  currentUserId: null,
  realtimeChannel: null,
  initialized: false,
  busyRequestIds: [],

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
          filter: `or(user_id.eq.${userId},friend_id.eq.${userId})`,
        },
        () => debouncedLoadAll(get),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friends",
          filter: `friend_id=eq.${userId}`,
        },
        () => debouncedLoadAll(get),
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
          set({
            friends: [],
            sentRequests: [],
            receivedRequests: [],
            users: [],
            loading: false,
          });
          return;
        }
        userId = auth.user.id;
        set({ currentUserId: userId });
      }

      // PARALLEL fetch: friends, sent requests, received requests
      const [friendsResult, sentResult, receivedResult] = await Promise.all([
        supabase
          .from("friends")
          .select("*")
          .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
          .eq("status", "accepted"),
        supabase
          .from("friends")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "pending"),
        supabase
          .from("friends")
          .select("*")
          .eq("friend_id", userId)
          .eq("status", "pending"),
      ]);

      if (friendsResult.error) {
        set({
          friends: [],
          sentRequests: [],
          receivedRequests: [],
          users: [],
          loading: false,
          error: friendsResult.error.message,
        });
        return;
      }

      if (sentResult.error || receivedResult.error) {
        set({
          friends: [],
          sentRequests: [],
          receivedRequests: [],
          users: [],
          loading: false,
          error: sentResult.error?.message || receivedResult.error?.message,
        });
        return;
      }

      const friendsData = friendsResult.data || [];
      const sent = sentResult.data || [];
      const received = receivedResult.data || [];

      // Collect all profile IDs needed
      const friendIds = friendsData.map((f) =>
        f.user_id === userId ? f.friend_id : f.user_id,
      );

      const sentIds = sent.map((s) => s.friend_id);
      const receivedIds = received.map((r) => r.user_id);

      const allProfileIds = [
        ...new Set(
          [...friendIds, ...sentIds, ...receivedIds].filter(
            (id) => id !== userId,
          ),
        ),
      ];

      let allProfiles = [];
      if (allProfileIds.length > 0) {
        const { data: profileRows, error: profileError } = await supabase.rpc(
          "get_profiles_by_ids",
          {
            ids: allProfileIds,
          },
        );
        allProfiles = profileRows || [];
      }

      const profileMap = new Map(allProfiles.map((p) => [p.user_id, p]));

      const formatProfile = (profile, includeExtras = false) => ({
        user_id: profile.user_id,
        id: profile.user_id,
        username: profile.username,
        handle: profile.handle,
        nickname: profile.username || profile.handle || "User",
        avatar: (() => {
          const a = profile.avatar;
          if (typeof a === "number") return avatarIndexToKey(a);
          if (typeof a === "string" && a !== "" && !isNaN(+a))
            return avatarIndexToKey(+a);
          return a || "avatar_man_lantern";
        })(),
        xp: profile.xp || 0,
        ...(includeExtras && {
          streak: profile.streak || 0,
          coins: profile.coins || 0,
          shield_count: profile.shield_count || 0,
        }),
      });

      const formattedFriends = friendsData.map((row) => {
        const friendId = row.user_id === userId ? row.friend_id : row.user_id;
        const profile = profileMap.get(friendId);

        if (!profile) {
          return {
            user_id: friendId,
            id: friendId,
            username: "User",
            handle: null,
            nickname: "User",
            avatar: "avatar_man_lantern",
            xp: 0,
            streak: 0,
            coins: 0,
            shield_count: 0,
          };
        }

        return formatProfile(profile, true);
      });

      const formattedSent = sent.map((row) => {
        const profile = profileMap.get(row.friend_id) || {};
        return {
          id: row.id,
          requestId: row.id,
          senderId: row.user_id,
          receiverId: row.friend_id,
          user_id: row.friend_id,
          ...formatProfile(profile),
        };
      });

      const formattedReceived = received.map((row) => {
        const profile = profileMap.get(row.user_id) || {};
        return {
          id: row.id,
          requestId: row.id,
          senderId: row.user_id,
          receiverId: row.friend_id,
          user_id: row.user_id,
          ...formatProfile(profile),
        };
      });

      set({
        friends: formattedFriends,
        sentRequests: formattedSent,
        receivedRequests: formattedReceived,
        loading: false,
      });
    } catch (err) {
      set({
        friends: [],
        sentRequests: [],
        receivedRequests: [],
        users: [],
        loading: false,
        error: err.message,
      });
    }
  },

  loadLeaderboard: async () => {
    set({ leaderboardLoading: true, leaderboardError: null });
    try {
      const { data, error } = await supabase.rpc("get_leaderboard");

      if (error) throw error;

      const rows = data || [];
      const DEV_ID = "the_dev_permanent";
      const devExists = rows.some((r) => r.user_id === DEV_ID);
      const withDev = devExists
        ? rows
        : [
            {
              user_id: DEV_ID,
              username: "The Dev",
              handle: "thedev",
              avatar: "avatar_ninja_male",
              xp: 168542,
              streak: 82,
              isPermanent: true,
            },
            ...rows,
          ];
      const sorted = withDev.sort((a, b) => b.xp - a.xp);

      // Compute user rank from the full sorted list
      const { userId } = useUserStore.getState();
      const userRankIndex = userId
        ? sorted.findIndex((u) => u.user_id === userId)
        : -1;
      const userRank = userRankIndex !== -1 ? userRankIndex + 1 : null;
      const aboveUserXP =
        userRank && userRank > 1 ? sorted[userRankIndex - 1].xp : null;
      const aboveUserRank = userRank && userRank > 1 ? userRank - 1 : null;

      // Store only top 30 for display
      set({
        globalLeaderboard: sorted.slice(0, 30),
        userGlobalRank: userRank,
        userAboveXP: aboveUserXP,
        userAboveRank: aboveUserRank,
        leaderboardLoading: false,
      });
    } catch (err) {
      console.error(
        "[FriendsStore] loadLeaderboard error:",
        err?.message || err,
      );
      set({
        leaderboardLoading: false,
        leaderboardError: err?.message || "Failed to load leaderboard",
      });
    }

    // Patch the current user's row with live store data AFTER the main fetch/catch,
    // so any error here never touches leaderboardError or hides the leaderboard.
    try {
      const { userId } = useUserStore.getState();
      if (userId) {
        const { username, avatar, name } = useUserStore.getState();
        const { xp, streak } = useProgressStore.getState();
        await get().updateCurrentUserData({
          username: username || name,
          avatar,
          xp,
          streak,
        });
      }
    } catch (patchErr) {
      console.warn(
        "[FriendsStore] updateCurrentUserData patch failed (non-fatal):",
        patchErr?.message,
      );
    }
  },

  searchUsers: async (query) => {
    if (!query || query.trim().length < 2) return [];

    const searchTerm = query.trim().toLowerCase();

    try {
      const { data, error } = await supabase.rpc("search_profiles", {
        search_query: searchTerm,
      });
      if (error) throw error;

      const { data: auth } = await supabase.auth.getUser();
      const currentUserId = auth?.user?.id;
      const afterFilter = (data || []).filter(
        (u) => u.user_id !== currentUserId,
      );

      return afterFilter.map((p) => ({
        user_id: p.user_id,
        id: p.user_id,
        username: p.username,
        handle: p.handle,
        nickname: p.username || p.handle || "User",
        avatar: (() => {
          const a = p.avatar;
          if (typeof a === "number") return avatarIndexToKey(a);
          if (typeof a === "string" && a !== "" && !isNaN(+a))
            return avatarIndexToKey(+a);
          return a;
        })(),
        xp: p.xp || 0,
        streak: p.streak || 0,
      }));
    } catch (err) {
      console.error("[FriendsStore] searchUsers error:", err?.message || err);
      return [];
    }
  },

  sendFriendRequest: async (targetUserId) => {
    if (!requireVerified())
      return { success: false, error: "EMAIL_NOT_VERIFIED" };
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return { success: false, error: "Not logged in" };

      const myUserId = auth.user.id;

      if (myUserId === targetUserId) {
        return { success: false, error: "You cannot add yourself" };
      }

      const UUID_RE =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (
        !targetUserId ||
        typeof targetUserId !== "string" ||
        !UUID_RE.test(targetUserId)
      ) {
        console.error(
          "[sendFriendRequest] Invalid target_user_id — aborting RPC:",
          targetUserId,
        );
        return { success: false, error: "Invalid user ID" };
      }

      const { data, error: rpcErr } = await supabase.rpc(
        "send_friend_request",
        { target_user_id: targetUserId },
      );

      if (rpcErr) {
        console.error("sendFriendRequest error:", rpcErr);
        return {
          success: false,
          error: rpcErr.message || "Failed to send request",
        };
      }

      const status = data?.status;
      if (status === "already_friends")
        return { success: false, error: "Already friends" };
      if (status === "pending_sent")
        return { success: false, error: "Request already sent" };
      if (status === "self")
        return { success: false, error: "You cannot add yourself" };

      await get().loadAll();
      return {
        success: true,
        message:
          status === "accepted" ? "Friend added!" : "Friend request sent!",
      };
    } catch (err) {
      console.error("sendFriendRequest error:", err);
      return { success: false, error: "Failed to send request" };
    }
  },

  acceptFriendRequest: async (requestId) => {
    if (!requireVerified())
      return { success: false, error: "EMAIL_NOT_VERIFIED" };
    if (get().busyRequestIds.includes(requestId))
      return { success: false, error: "Already processing" };
    set((state) => ({ busyRequestIds: [...state.busyRequestIds, requestId] }));
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return { success: false, error: "Not logged in" };

      console.log("ACCEPTING REQUEST ID:", requestId);
      
      const { error: rpcErr } = await supabase.rpc("accept_friend_request", {
        request_id: requestId,
      });

      if (rpcErr) {
        console.error("Accept friend request error:", rpcErr);
        return { success: false, error: "Failed to accept request" };
      }

      await get().loadAll();
      return { success: true, message: "Friend added!" };
    } catch (err) {
      console.error("acceptFriendRequest error:", err);
      return { success: false, error: "Failed to accept request" };
    } finally {
      set((state) => ({
        busyRequestIds: state.busyRequestIds.filter((id) => id !== requestId),
      }));
    }
  },

  declineFriendRequest: async (requestId) => {
    if (get().busyRequestIds.includes(requestId))
      return { success: false, error: "Already processing" };
    set((state) => ({ busyRequestIds: [...state.busyRequestIds, requestId] }));
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return { success: false, error: "Not logged in" };

      const { error: rpcErr } = await supabase.rpc("delete_friend_request", {
        p_request_id: requestId,
      });

      if (rpcErr) {
        console.error("declineFriendRequest error:", rpcErr);
        return { success: false, error: "Failed to decline request" };
      }

      await get().loadAll();
      return { success: true };
    } catch (err) {
      console.error("declineFriendRequest error:", err);
      return { success: false, error: "Failed to decline request" };
    } finally {
      set((state) => ({
        busyRequestIds: state.busyRequestIds.filter((id) => id !== requestId),
      }));
    }
  },

  cancelSentRequest: async (receiverId) => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return { success: false, error: "Not logged in" };

      const myUserId = auth.user.id;

      // Delete where I am user_id (sender), target is friend_id (receiver)
      const { error: deleteErr } = await supabase
        .from("friends")
        .delete()
        .eq("user_id", myUserId)
        .eq("friend_id", receiverId)
        .eq("status", "pending");

      await get().loadAll();
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

      // Delete row where either direction matches (both must be accepted to be friends)
      const { error: deleteErr } = await supabase
        .from("friends")
        .delete()
        .or(
          `and(user_id.eq.${myUserId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${myUserId})`,
        );

      if (deleteErr) console.error("removeFriend delete error:", deleteErr);

      // Also delete any friend challenges between these users
      const { error: challengeErr } = await supabase
        .from("friend_challenges")
        .delete()
        .or(
          `and(sender_id.eq.${myUserId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${myUserId})`,
        );

      if (challengeErr)
        console.error("removeFriend challenge delete error:", challengeErr);

      await get().loadAll();

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

    const sent = sentRequests.find(
      (r) => r.user_id === userId || r.id === userId,
    );
    if (sent) return sent;

    const received = receivedRequests.find(
      (r) => r.user_id === userId || r.id === userId,
    );
    if (received) return received;

    return null;
  },

  getProfileById: async (userId) => {
    try {
      const { data, error } = await supabase.rpc("get_profiles_by_ids", {
        ids: [userId],
      });

      if (error || !data || data.length === 0) return null;

      const p = data[0];
      return {
        user_id: p.user_id,
        id: p.user_id,
        username: p.username,
        handle: p.handle,
        nickname: p.username || p.handle || "User",
        avatar: (() => {
          const a = p.avatar;
          if (typeof a === "number") return avatarIndexToKey(a);
          if (typeof a === "string" && a !== "" && !isNaN(+a))
            return avatarIndexToKey(+a);
          return a;
        })(),
        xp: p.xp || 0,
        streak: p.streak || 0,
        coins: p.coins || 0,
        shield_count: p.shield_count || 0,
      };
    } catch (err) {
      console.error("getProfileById error:", err);
      return null;
    }
  },

  isFriend: (userId) => {
    const { friends } = get();
    return friends.some((f) => f.user_id === userId || f.id === userId);
  },

  canSendRequest: (userId) => {
    const { friends, sentRequests, receivedRequests } = get();
    if (friends.some((f) => f.user_id === userId || f.id === userId))
      return false;
    if (sentRequests.some((r) => r.user_id === userId || r.id === userId))
      return false;
    if (receivedRequests.some((r) => r.user_id === userId || r.id === userId))
      return false;
    return true;
  },

  getFriendship: (userId) => {
    const { friends, sentRequests, receivedRequests } = get();
    if (friends.some((f) => f.user_id === userId || f.id === userId))
      return { status: "accepted" };
    if (sentRequests.some((r) => r.user_id === userId || r.id === userId))
      return { status: "sent" };
    if (receivedRequests.some((r) => r.user_id === userId || r.id === userId))
      return { status: "received" };
    return { status: "none" };
  },

  updateCurrentUserData: async (userData) => {
    const { globalLeaderboard } = get();
    const { data: auth } = await supabase.auth.getUser();

    if (!auth?.user) return;

    const userId = auth.user.id;
    const updatedLeaderboard = globalLeaderboard.map((u) =>
      u.user_id === userId ? { ...u, ...userData } : u,
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
