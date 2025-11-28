import { create } from "zustand";
import { supabase } from "../lib/supabaseClient";
import { useProgressStore } from "./progressStore";
import { useFriendsStore } from "./friendsStore";
import { CHALLENGE_MODES } from "./challengeStore";
import { isDevMode } from "../config/dev";

const CHALLENGE_EXPIRY_HOURS = 48;

export const useFriendChallengesStore = create((set, get) => ({
  pendingIncoming: [],
  pendingOutgoing: [],
  activeChallenges: [],
  completedChallenges: [],
  resultsToView: [],
  unreadCount: 0,
  loading: false,
  error: null,
  currentUserId: null,
  realtimeChannel: null,
  initialized: false,
  initializingPromise: null,

  initialize: async () => {
    if (get().initialized) return;
    
    if (get().initializingPromise) {
      console.log("[FriendChallenges] Already initializing, waiting...");
      return get().initializingPromise;
    }
    
    const initPromise = (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) {
        console.log("[FriendChallenges] No user logged in");
        set({ initializingPromise: null });
        return;
      }
      
      const userId = userData.user.id;
      set({ currentUserId: userId });
      
      await get().loadChallenges();
      get().setupRealtimeSubscription(userId);
      set({ initialized: true, initializingPromise: null });
      
      console.log("[FriendChallenges] Initialized for user:", userId);
    })();
    
    set({ initializingPromise: initPromise });
    return initPromise;
  },

  cleanup: () => {
    const { realtimeChannel } = get();
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
    }
    set({
      pendingIncoming: [],
      pendingOutgoing: [],
      activeChallenges: [],
      completedChallenges: [],
      resultsToView: [],
      unreadCount: 0,
      currentUserId: null,
      realtimeChannel: null,
      initialized: false,
      initializingPromise: null,
    });
  },

  loadChallenges: async () => {
    const { currentUserId } = get();
    if (!currentUserId) return;
    
    set({ loading: true, error: null });
    
    try {
      console.log("[FriendChallenges] Loading challenges for user:", currentUserId);
      
      const { data, error } = await supabase
        .from("friend_challenges")
        .select("*")
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("[FriendChallenges] Load query error:", error);
        throw error;
      }
      
      console.log("[FriendChallenges] Raw data from DB:", data?.length || 0, "rows");
      if (data?.length > 0) {
        console.log("[FriendChallenges] Challenge details:", data.map(c => ({
          id: c.id?.slice(0,8),
          sender: c.sender_id?.slice(0,8),
          receiver: c.receiver_id?.slice(0,8),
          status: c.status,
          iAmSender: c.sender_id === currentUserId,
          iAmReceiver: c.receiver_id === currentUserId
        })));
      }
      
      const now = new Date();
      const challenges = (data || []).filter(c => {
        if (c.status === "cancelled" || c.status === "declined") return false;
        if (c.status === "pending") {
          const createdAt = new Date(c.created_at);
          const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);
          return hoursSinceCreation < CHALLENGE_EXPIRY_HOURS;
        }
        return true;
      });
      
      const pendingIncoming = challenges.filter(
        c => c.receiver_id === currentUserId && c.status === "pending"
      );
      const pendingOutgoing = challenges.filter(
        c => c.sender_id === currentUserId && c.status === "pending"
      );
      const activeChallenges = challenges.filter(
        c => c.status === "accepted" || c.status === "sender_done" || c.status === "receiver_done"
      );
      const completedChallenges = challenges.filter(c => c.status === "finished");
      
      const resultsToView = completedChallenges.filter(c => {
        if (c.sender_id === currentUserId && !c.sender_viewed_results) return true;
        if (c.receiver_id === currentUserId && !c.receiver_viewed_results) return true;
        return false;
      });
      
      const unreadCount = pendingIncoming.length + resultsToView.length;
      
      set({
        pendingIncoming,
        pendingOutgoing,
        activeChallenges,
        completedChallenges,
        resultsToView,
        unreadCount,
        loading: false,
      });
      
      console.log("[FriendChallenges] Loaded:", {
        incoming: pendingIncoming.length,
        outgoing: pendingOutgoing.length,
        active: activeChallenges.length,
        results: resultsToView.length,
      });
    } catch (error) {
      console.error("[FriendChallenges] Load error:", error);
      set({ error: error.message, loading: false });
    }
  },

  setupRealtimeSubscription: (userId) => {
    const channel = supabase
      .channel(`friend_challenges_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friend_challenges",
          filter: `sender_id=eq.${userId}`,
        },
        (payload) => {
          console.log("[FriendChallenges] Realtime update (sender):", payload);
          get().handleRealtimeUpdate(payload);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friend_challenges",
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          console.log("[FriendChallenges] Realtime update (receiver):", payload);
          get().handleRealtimeUpdate(payload);
        }
      )
      .subscribe((status) => {
        console.log("[FriendChallenges] Realtime subscription:", status);
      });
    
    set({ realtimeChannel: channel });
  },

  handleRealtimeUpdate: (payload) => {
    get().loadChallenges();
  },

  refreshChallenge: async (challengeId) => {
    if (!challengeId) return null;
    
    try {
      console.log("[FriendChallenges] Refreshing single challenge:", challengeId);
      
      const { data, error } = await supabase
        .from("friend_challenges")
        .select("*")
        .eq("id", challengeId)
        .single();
      
      if (error) {
        console.error("[FriendChallenges] Refresh error:", error);
        return null;
      }
      
      console.log("[FriendChallenges] Refreshed challenge:", {
        id: challengeId,
        status: data?.status,
        senderScore: data?.sender_score,
        receiverScore: data?.receiver_score
      });
      
      return data;
    } catch (error) {
      console.error("[FriendChallenges] Refresh exception:", error);
      return null;
    }
  },

  clearPendingIncomingCount: () => {
    const { resultsToView } = get();
    set({ unreadCount: resultsToView.length });
  },

  createChallenge: async (friendId, modeId, questions) => {
    const { currentUserId, pendingOutgoing, activeChallenges } = get();
    if (!currentUserId) {
      return { success: false, error: "Not logged in" };
    }
    
    if (friendId === currentUserId) {
      return { success: false, error: "Cannot challenge yourself" };
    }
    
    const isDevFriend = typeof friendId === 'string' && friendId.startsWith('dev_friend_');
    if (isDevFriend) {
      return { 
        success: false, 
        error: "Friend challenges are not available with test friends. Add real friends to challenge them!" 
      };
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(friendId)) {
      return { 
        success: false, 
        error: "Invalid friend ID. Please try again." 
      };
    }
    
    const existingWithFriend = [...pendingOutgoing, ...activeChallenges].find(
      c => (c.sender_id === currentUserId && c.receiver_id === friendId) ||
           (c.receiver_id === currentUserId && c.sender_id === friendId)
    );
    
    if (existingWithFriend) {
      return { success: false, error: "Active challenge already exists with this friend" };
    }
    
    const modeConfig = Object.values(CHALLENGE_MODES).find(m => m.id === modeId);
    if (!modeConfig) {
      return { success: false, error: "Invalid challenge mode" };
    }
    
    try {
      console.log("[FriendChallenges] Creating challenge:", {
        sender: currentUserId,
        receiver: friendId,
        mode: modeId,
        questionCount: questions?.length
      });
      
      const { data, error } = await supabase
        .from("friend_challenges")
        .insert({
          sender_id: currentUserId,
          receiver_id: friendId,
          challenge_type: modeId,
          status: "pending",
          questions: questions,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) {
        console.error("[FriendChallenges] Insert error:", error);
        throw error;
      }
      
      await get().loadChallenges();
      
      console.log("[FriendChallenges] Challenge created successfully:", data.id);
      return { success: true, challenge: data };
    } catch (error) {
      console.error("[FriendChallenges] Create error:", error);
      return { success: false, error: error.message };
    }
  },

  acceptChallenge: async (challengeId) => {
    const { currentUserId } = get();
    console.log("[FriendChallenges] Accept challenge called:", { challengeId, currentUserId });
    
    if (!currentUserId) return { success: false, error: "Not logged in" };
    
    try {
      console.log("[FriendChallenges] Updating challenge status to accepted...");
      
      const { data, error } = await supabase
        .from("friend_challenges")
        .update({ status: "accepted" })
        .eq("id", challengeId)
        .eq("receiver_id", currentUserId)
        .eq("status", "pending")
        .select()
        .single();
      
      if (error) {
        console.error("[FriendChallenges] Accept update error:", error);
        throw error;
      }
      
      if (!data) {
        console.error("[FriendChallenges] No rows updated for challenge:", challengeId);
        return { success: false, error: "Challenge not found or already accepted" };
      }
      
      await get().loadChallenges();
      
      console.log("[FriendChallenges] Challenge accepted successfully:", challengeId, "Status:", data.status);
      return { success: true, challenge: data };
    } catch (error) {
      console.error("[FriendChallenges] Accept error:", error);
      return { success: false, error: error.message };
    }
  },

  declineChallenge: async (challengeId) => {
    const { currentUserId } = get();
    if (!currentUserId) return { success: false, error: "Not logged in" };
    
    try {
      const { error } = await supabase
        .from("friend_challenges")
        .update({ status: "declined" })
        .eq("id", challengeId)
        .eq("receiver_id", currentUserId)
        .eq("status", "pending");
      
      if (error) throw error;
      
      await get().loadChallenges();
      
      console.log("[FriendChallenges] Challenge declined:", challengeId);
      return { success: true };
    } catch (error) {
      console.error("[FriendChallenges] Decline error:", error);
      return { success: false, error: error.message };
    }
  },

  cancelChallenge: async (challengeId) => {
    const { currentUserId } = get();
    if (!currentUserId) return { success: false, error: "Not logged in" };
    
    try {
      const { error } = await supabase
        .from("friend_challenges")
        .update({ status: "cancelled" })
        .eq("id", challengeId)
        .eq("sender_id", currentUserId)
        .eq("status", "pending");
      
      if (error) throw error;
      
      await get().loadChallenges();
      
      console.log("[FriendChallenges] Challenge cancelled:", challengeId);
      return { success: true };
    } catch (error) {
      console.error("[FriendChallenges] Cancel error:", error);
      return { success: false, error: error.message };
    }
  },

  submitResult: async (challengeId, score, answers, completionTime = null, chain = null) => {
    const { currentUserId, activeChallenges, pendingIncoming } = get();
    if (!currentUserId) return { success: false, error: "Not logged in" };
    
    let challenge = activeChallenges.find(c => c.id === challengeId);
    
    if (!challenge) {
      const { data: fetchedChallenge, error: fetchError } = await supabase
        .from("friend_challenges")
        .select("*")
        .eq("id", challengeId)
        .single();
      
      if (fetchError || !fetchedChallenge) {
        console.error("[FriendChallenges] Could not find challenge:", challengeId);
        return { success: false, error: "Challenge not found" };
      }
      challenge = fetchedChallenge;
    }
    
    const isSender = challenge.sender_id === currentUserId;
    const updateData = {};
    
    if (isSender) {
      updateData.sender_score = score;
      updateData.sender_time = completionTime;
      updateData.sender_chain = chain;
      updateData.sender_answers = answers;
      
      if (challenge.status === "receiver_done") {
        updateData.status = "finished";
        updateData.finished_at = new Date().toISOString();
      } else {
        updateData.status = "sender_done";
      }
    } else {
      updateData.receiver_score = score;
      updateData.receiver_time = completionTime;
      updateData.receiver_chain = chain;
      updateData.receiver_answers = answers;
      
      if (challenge.status === "sender_done") {
        updateData.status = "finished";
        updateData.finished_at = new Date().toISOString();
      } else {
        updateData.status = "receiver_done";
      }
    }
    
    try {
      const normalizedTime = completionTime != null ? Math.round(Number(completionTime)) : null;
      
      const coreUpdate = isSender 
        ? { 
            sender_score: score, 
            sender_time: normalizedTime,
            status: updateData.status,
            ...(updateData.finished_at && { finished_at: updateData.finished_at })
          }
        : { 
            receiver_score: score, 
            receiver_time: normalizedTime,
            status: updateData.status,
            ...(updateData.finished_at && { finished_at: updateData.finished_at })
          };
      
      console.log("[FriendChallenges] Submitting:", coreUpdate);
      
      const { data, error } = await supabase
        .from("friend_challenges")
        .update(coreUpdate)
        .eq("id", challengeId)
        .select()
        .single();
      
      if (error) {
        console.error("[FriendChallenges] Submit error:", error);
        throw error;
      }
      
      await get().loadChallenges();
      
      console.log("[FriendChallenges] Result submitted:", challengeId, coreUpdate.status);
      return { success: true, challenge: data };
    } catch (error) {
      console.error("[FriendChallenges] Submit error:", error);
      return { success: false, error: error.message };
    }
  },

  markResultViewed: async (challengeId) => {
    const { currentUserId } = get();
    if (!currentUserId) return;
    
    const challenge = get().completedChallenges.find(c => c.id === challengeId);
    if (!challenge) return;
    
    const isSender = challenge.sender_id === currentUserId;
    const updateData = isSender 
      ? { sender_viewed_results: true }
      : { receiver_viewed_results: true };
    
    try {
      await supabase
        .from("friend_challenges")
        .update(updateData)
        .eq("id", challengeId);
      
      await get().loadChallenges();
    } catch (error) {
      console.error("[FriendChallenges] Mark viewed error:", error);
    }
  },

  getChallengeById: (challengeId) => {
    const { pendingIncoming, pendingOutgoing, activeChallenges, completedChallenges } = get();
    return [...pendingIncoming, ...pendingOutgoing, ...activeChallenges, ...completedChallenges]
      .find(c => c.id === challengeId);
  },

  fetchChallengeById: async (challengeId) => {
    try {
      const { data, error } = await supabase
        .from("friend_challenges")
        .select("*")
        .eq("id", challengeId)
        .single();
      
      if (error) {
        console.error("[FriendChallenges] fetchChallengeById error:", error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("[FriendChallenges] fetchChallengeById error:", error);
      return null;
    }
  },

  ensureChallengeLoaded: async (challengeId) => {
    console.log("[FriendChallenges] ensureChallengeLoaded start:", challengeId);
    
    await get().initialize();
    console.log("[FriendChallenges] ensureChallengeLoaded: initialized");
    
    let challenge = get().getChallengeById(challengeId);
    if (challenge) {
      console.log("[FriendChallenges] ensureChallengeLoaded: found in local state");
      return challenge;
    }
    
    console.log("[FriendChallenges] ensureChallengeLoaded: fetching from DB");
    challenge = await get().fetchChallengeById(challengeId);
    console.log("[FriendChallenges] ensureChallengeLoaded: fetched:", challenge ? "found" : "not found");
    
    if (challenge) {
      await get().loadChallenges();
    }
    
    return challenge;
  },

  getActiveWithFriend: (friendId) => {
    const { currentUserId, pendingOutgoing, pendingIncoming, activeChallenges } = get();
    return [...pendingOutgoing, ...pendingIncoming, ...activeChallenges].find(
      c => (c.sender_id === currentUserId && c.receiver_id === friendId) ||
           (c.receiver_id === currentUserId && c.sender_id === friendId)
    );
  },

  getChallengeStateForFriend: (friendId) => {
    const { currentUserId, pendingOutgoing, pendingIncoming, activeChallenges, resultsToView } = get();
    
    const pending = pendingOutgoing.find(
      c => c.receiver_id === friendId
    );
    if (pending) return { type: "pending_sent", challenge: pending };
    
    const received = pendingIncoming.find(
      c => c.sender_id === friendId
    );
    if (received) return { type: "pending_received", challenge: received };
    
    const active = activeChallenges.find(
      c => (c.sender_id === currentUserId && c.receiver_id === friendId) ||
           (c.receiver_id === currentUserId && c.sender_id === friendId)
    );
    if (active) {
      const isSender = active.sender_id === currentUserId;
      const myTurnDone = isSender 
        ? (active.sender_score !== null)
        : (active.receiver_score !== null);
      
      if (myTurnDone && active.status !== "finished") {
        return { type: "waiting_for_friend", challenge: active };
      }
      
      if (!myTurnDone) {
        return { type: "ready_to_play", challenge: active };
      }
    }
    
    const result = resultsToView.find(
      c => (c.sender_id === currentUserId && c.receiver_id === friendId) ||
           (c.receiver_id === currentUserId && c.sender_id === friendId)
    );
    if (result) return { type: "results_ready", challenge: result };
    
    return null;
  },

  determineWinner: (challenge) => {
    const modeConfig = Object.values(CHALLENGE_MODES).find(m => m.id === challenge.challenge_type);
    
    if (modeConfig?.id === "sudden_death") {
      const senderChain = challenge.sender_chain || 0;
      const receiverChain = challenge.receiver_chain || 0;
      
      if (senderChain > receiverChain) return challenge.sender_id;
      if (receiverChain > senderChain) return challenge.receiver_id;
      return "draw";
    }
    
    const senderScore = challenge.sender_score || 0;
    const receiverScore = challenge.receiver_score || 0;
    
    if (senderScore > receiverScore) return challenge.sender_id;
    if (receiverScore > senderScore) return challenge.receiver_id;
    
    if (modeConfig?.trackTime) {
      const senderTime = challenge.sender_time || Infinity;
      const receiverTime = challenge.receiver_time || Infinity;
      if (senderTime < receiverTime) return challenge.sender_id;
      if (receiverTime < senderTime) return challenge.receiver_id;
    }
    
    return "draw";
  },

  getRewards: (challenge, winnerId) => {
    const { currentUserId } = get();
    const modeConfig = Object.values(CHALLENGE_MODES).find(m => m.id === challenge.challenge_type);
    if (!modeConfig) return { xp: 0, coins: 0 };
    
    if (winnerId === "draw") {
      return modeConfig.rewards.draw || { xp: 0, coins: 0 };
    }
    
    const isWinner = winnerId === currentUserId;
    return isWinner ? modeConfig.rewards.win : modeConfig.rewards.lose;
  },
}));
