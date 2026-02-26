import { create } from "zustand";
import { supabase } from "../lib/supabaseClient";
import { useProgressStore } from "./progressStore";
import { useFriendsStore } from "./friendsStore";
import { CHALLENGE_MODES } from "./challengeStore";
import { setIqState } from "../services/pushTags";

const CHALLENGE_EXPIRY_HOURS = 48; // fallback only — DB expires_at takes precedence
const CHALLENGE_EXPIRY_DAYS = 7;   // set on insert
const VIEWED_RESULTS_KEY = "iq_viewed_challenge_results";

const getViewedResultIds = () => {
  try {
    const stored = localStorage.getItem(VIEWED_RESULTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error("[FriendChallenges] Failed to parse viewed result IDs:", err);
    return [];
  }
};

const addViewedResultId = (challengeId) => {
  const viewed = getViewedResultIds();
  if (!viewed.includes(challengeId)) {
    viewed.push(challengeId);
    localStorage.setItem(VIEWED_RESULTS_KEY, JSON.stringify(viewed));
  }
};

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
      return get().initializingPromise;
    }
    
    const initPromise = (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) {
        set({ initializingPromise: null });
        return;
      }
      
      const userId = userData.user.id;
      set({ currentUserId: userId });
      
      await get().loadChallenges();
      get().setupRealtimeSubscription(userId);
      set({ initialized: true, initializingPromise: null });
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
      const now = new Date();
      
      // PARALLEL fetch: challenges (server-side filtered) and friends list
      const [challengesResult, friendsResult] = await Promise.all([
        supabase
          .from("friend_challenges")
          .select("*")
          .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
          .not("status", "in", "(cancelled,declined)")
          .order("created_at", { ascending: false }),
        supabase
          .from("friends")
          .select("user_id, friend_id")
          .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`)
          .eq("status", "accepted"),
      ]);
      
      if (challengesResult.error) throw challengesResult.error;
      
      const data = challengesResult.data || [];
      
      // Build friend set — only used for display filtering, NEVER for deletion
      // If friends query failed, skip filtering and show all challenges
      let friendIds = null;
      if (!friendsResult.error) {
        const friendsData = friendsResult.data || [];
        friendIds = new Set(friendsData.map(f => f.user_id === currentUserId ? f.friend_id : f.user_id));
      } else {
        console.warn("[FriendChallenges] Friends query failed — skipping friend filter:", friendsResult.error.message);
      }
      
      // Filter orphaned challenges out of local display only — NEVER delete from DB
      const validChallenges = (friendIds !== null && friendIds.size > 0)
        ? data.filter(c => {
            const otherUserId = c.sender_id === currentUserId ? c.receiver_id : c.sender_id;
            return friendIds.has(otherUserId);
          })
        : data;
      
      // Expiry: use DB expires_at if present; fall back to created_at + 48h for old rows
      const challenges = validChallenges.filter(c => {
        if (c.status === "pending") {
          if (c.expires_at) {
            return new Date(c.expires_at) > now;
          }
          const hoursSinceCreation = (now - new Date(c.created_at)) / (1000 * 60 * 60);
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
      
      const viewedIds = getViewedResultIds();
      const resultsToView = completedChallenges.filter(c => !viewedIds.includes(c.id));
      
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
      
      try {
        if (pendingIncoming.length > 0) {
          const firstPending = pendingIncoming[0];
          setIqState({ challengePending: true, challengeFrom: firstPending.sender_id });
        }
      } catch (err) {
        // Silent fail for OneSignal tag updates
      }
      
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  setupRealtimeSubscription: (userId) => {
    const channel = supabase
      .channel(`friend_challenges_${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "friend_challenges", filter: `sender_id=eq.${userId}` }, () => get().loadChallenges())
      .on("postgres_changes", { event: "*", schema: "public", table: "friend_challenges", filter: `receiver_id=eq.${userId}` }, () => get().loadChallenges())
      .subscribe();
    
    set({ realtimeChannel: channel });
  },

  handleRealtimeUpdate: () => {
    get().loadChallenges();
  },

  refreshChallenge: async (challengeId) => {
    if (!challengeId) return null;
    
    try {
      const { data, error } = await supabase
        .from("friend_challenges")
        .select("*")
        .eq("id", challengeId)
        .single();
      
      if (error) return null;
      
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
      const now = new Date();
      const { data, error } = await supabase
        .from("friend_challenges")
        .insert({
          sender_id: currentUserId,
          receiver_id: friendId,
          challenge_type: modeId,
          status: "pending",
          questions: questions,
          created_at: now.toISOString(),
          expires_at: new Date(now.getTime() + CHALLENGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();
      
      if (error) {
        console.error("[FriendChallenges] Insert error:", error);
        throw error;
      }
      
      await get().loadChallenges();
      return { success: true, challenge: data };
    } catch (error) {
      console.error("[FriendChallenges] Create error:", error);
      // Duplicate constraint means there's an existing challenge the local store
      // didn't know about (stale state). Reload from DB so the UI shows it.
      const isDuplicate = error.message?.includes('friend_challenges_active_unique') || 
                          error.message?.includes('duplicate key');
      if (isDuplicate) {
        try { await get().loadChallenges(); } catch (reloadErr) { console.error("[FriendChallenges] Reload after duplicate error:", reloadErr); }
        return { success: false, error: "DUPLICATE_CHALLENGE" };
      }
      return { success: false, error: error.message };
    }
  },

  acceptChallenge: async (challengeId) => {
    const { currentUserId } = get();
    if (!currentUserId) return { success: false, error: "Not logged in" };
    
    try {
      
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
      
      // Clear challenge pending only if no more pending incoming challenges
      const { pendingIncoming } = get();
      if (pendingIncoming.length === 0) {
        setIqState({ challengePending: false, challengeFrom: null });
      }
      
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
        .update({ status: "cancelled" })
        .eq("id", challengeId)
        .eq("receiver_id", currentUserId)
        .eq("status", "pending");
      
      if (error) throw error;
      
      await get().loadChallenges();
      
      // Clear challenge pending only if no more pending incoming challenges
      const { pendingIncoming } = get();
      if (pendingIncoming.length === 0) {
        setIqState({ challengePending: false, challengeFrom: null });
      }
      
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
      
      // Clear challenge pending only if no more pending incoming challenges (for receiver)
      const { pendingIncoming } = get();
      if (pendingIncoming.length === 0) {
        setIqState({ challengePending: false, challengeFrom: null });
      }
      
      return { success: true };
    } catch (error) {
      console.error("[FriendChallenges] Cancel error:", error);
      return { success: false, error: error.message };
    }
  },

  submitResult: async (challengeId, score, answers, completionTime = null, chain = null) => {
    const { data: userData } = await supabase.auth.getUser();
    const currentUserId = userData?.user?.id;
    
    if (!currentUserId) {
      console.error("[FriendChallenges] submitResult: No user ID");
      return { success: false, error: "Not logged in" };
    }
    
    const { data: challenge, error: fetchError } = await supabase
      .from("friend_challenges")
      .select("*")
      .eq("id", challengeId)
      .single();
    
    if (fetchError || !challenge) {
      console.error("[FriendChallenges] Could not find challenge:", challengeId, fetchError);
      return { success: false, error: "Challenge not found" };
    }
    
    const isSender = challenge.sender_id === currentUserId;
    const updateData = {};
    
    if (isSender) {
      updateData.sender_score = score;
      updateData.sender_time = completionTime;
      updateData.sender_chain = chain;
      updateData.sender_answers = answers;
      
      if (challenge.receiver_score !== null || challenge.status === "receiver_done") {
        updateData.status = "finished";
      } else {
        updateData.status = "sender_done";
      }
    } else {
      updateData.receiver_score = score;
      updateData.receiver_time = completionTime;
      updateData.receiver_chain = chain;
      updateData.receiver_answers = answers;
      
      if (challenge.sender_score !== null || challenge.status === "sender_done") {
        updateData.status = "finished";
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
            status: updateData.status
          }
        : { 
            receiver_score: score, 
            receiver_time: normalizedTime,
            status: updateData.status
          };
      
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
      return { success: true, challenge: data };
    } catch (error) {
      console.error("[FriendChallenges] Submit error:", error);
      return { success: false, error: error.message };
    }
  },

  markResultViewed: async (challengeId) => {
    addViewedResultId(challengeId);
    
    const { resultsToView } = get();
    const updatedResults = resultsToView.filter(c => c.id !== challengeId);
    
    set({ 
      resultsToView: updatedResults,
      unreadCount: updatedResults.length + get().pendingIncoming.length
    });
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
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("ensureChallengeLoaded timeout")), 8000)
    );
    
    try {
      const loadPromise = (async () => {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        
        if (!userId) {
          console.error("[FriendChallenges] ensureChallengeLoaded: No user ID");
          throw new Error("Not authenticated");
        }
        
        if (!get().initialized || get().currentUserId !== userId) {
          set({ currentUserId: userId });
          await get().loadChallenges();
          set({ initialized: true });
        }
        
        let challenge = get().getChallengeById(challengeId);
        if (challenge) {
          return challenge;
        }
        const { data, error } = await supabase
          .from("friend_challenges")
          .select("*")
          .eq("id", challengeId)
          .single();
        
        if (error) {
          console.error("[FriendChallenges] ensureChallengeLoaded DB error:", error);
          throw new Error("Challenge not found in database");
        }
        
        if (!data) {
          console.error("[FriendChallenges] ensureChallengeLoaded: No data returned");
          throw new Error("Challenge not found");
        }
        
        await get().loadChallenges();
        
        return data;
      })();
      
      return await Promise.race([loadPromise, timeoutPromise]);
    } catch (error) {
      console.error("[FriendChallenges] ensureChallengeLoaded error:", error.message);
      throw error;
    }
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
    
    const senderScore = challenge.sender_score || 0;
    const receiverScore = challenge.receiver_score || 0;
    
    if (senderScore > receiverScore) return challenge.sender_id;
    if (receiverScore > senderScore) return challenge.receiver_id;
    
    if (modeConfig?.trackTime || modeConfig?.id === "sudden_death") {
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
