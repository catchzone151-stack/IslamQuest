import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "../hooks/useNavigate";
import { useFriendsStore } from "../store/friendsStore";
import { useUserStore } from "../store/useUserStore";
import { useProgressStore } from "../store/progressStore";
import { useModalStore, MODAL_TYPES } from "../store/modalStore";
import { supabase } from "../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  UserPlus,
  Users,
  Send,
  X,
  Check,
  Clock,
  Trophy,
  Flame,
  MessageCircle,
  Swords,
  Globe,
} from "lucide-react";
import { LevelBadgeCompact } from "../components/LevelBadge";
import { getAvatarImage } from "../utils/avatarUtils";
import { getCurrentLevel } from "../utils/diamondLevels";
import QuickMessageModal from "../components/QuickMessageModal";
import assets from "../assets/assets";

const highlightStyle = `
.highlight-user {
  border: 2px solid gold !important;
  background: rgba(255, 215, 0, 0.15) !important;
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.3) !important;
}
`;

export default function Friends() {
  const navigate = useNavigate();
  const { id: currentUserId, name, avatar, username } = useUserStore();
  const { xp: currentUserXP, streak: currentUserStreak } = useProgressStore();
  const { showModal } = useModalStore();

  const {
    loadAll,
    getAllFriends,
    getSentRequests,
    getReceivedRequests,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    cancelSentRequest,
    isFriend,
    canSendRequest,
    getFriendship,
    loadLeaderboard,
    getGlobalLeaderboard,
  } = useFriendsStore();

  const [activeTab, setActiveTab] = useState("friends");
  const [leaderboardTab, setLeaderboardTab] = useState("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [quickMessageFriend, setQuickMessageFriend] = useState(null);
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [loadingGlobal, setLoadingGlobal] = useState(true);

  useEffect(() => {
    if (!currentUserId) return;
    loadAll(currentUserId);
  }, [currentUserId, loadAll]);

  const loadGlobalLeaderboard = useCallback(async () => {
    setLoadingGlobal(true);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, username, handle, avatar, xp, streak")
        .order("xp", { ascending: false })
        .limit(100);

      if (error) {
        console.log("Global leaderboard fetch error:", error.message);
      }

      const THE_DEV_ENTRY = {
        user_id: "the_dev_permanent",
        username: "The Dev",
        handle: "thedev",
        avatar: "avatar_ninja_male",
        xp: 168542,
        streak: 82,
        isPermanent: true,
      };

      const userState = useUserStore.getState();
      const progressState = useProgressStore.getState();
      const CURRENT_USER_ENTRY = {
        user_id: currentUserId || userState.id || "current_user",
        username: name || userState.name || userState.username || "You",
        handle: userState.handle || username || "you",
        avatar: avatar || userState.avatar || "avatar_man_lantern",
        xp: currentUserXP || progressState.xp || 0,
        streak: currentUserStreak || progressState.streak || 0,
        isCurrentUser: true,
      };

      const dbUsers = (data || []).filter(
        (u) =>
          u.user_id !== currentUserId &&
          u.user_id !== CURRENT_USER_ENTRY.user_id
      );

      const combined = [THE_DEV_ENTRY, CURRENT_USER_ENTRY, ...dbUsers].sort(
        (a, b) => b.xp - a.xp
      );

      setGlobalLeaderboard(combined);
    } catch (err) {
      console.log("Global leaderboard error:", err);
    } finally {
      setLoadingGlobal(false);
    }
  }, [currentUserId, name, avatar, username, currentUserXP, currentUserStreak]);

  useEffect(() => {
    loadGlobalLeaderboard();
  }, [loadGlobalLeaderboard]);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const results = await searchUsers(searchQuery.trim());
          setSearchResults(results);
        } catch (err) {
          console.warn("Search error:", err);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    };

    const debounce = setTimeout(performSearch, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, searchUsers]);

  const friends = getAllFriends();
  const sentRequests = getSentRequests();
  const receivedRequests = getReceivedRequests();

  const friendsLeaderboard = friends
    .map((f) => ({
      user_id: f.user_id || f.id,
      username: f.username || f.handle || f.nickname,
      handle: f.handle || f.username,
      avatar: f.avatar,
      xp: f.xp || 0,
      streak: f.streak || 0,
    }))
    .sort((a, b) => b.xp - a.xp);

  const currentUserIdForHighlight =
    currentUserId || useUserStore.getState().user?.id || useUserStore.getState().id;

  const handleSendRequest = async (userId) => {
    const result = await sendFriendRequest(userId);
    if (result.success) {
      showModal(MODAL_TYPES.SUCCESS, { message: result.message });
    } else {
      showModal(MODAL_TYPES.ERROR, { message: result.error });
    }
  };

  const handleAcceptRequest = async (requestId) => {
    const result = await acceptFriendRequest(requestId);
    if (result.success) {
      showModal(MODAL_TYPES.SUCCESS, { message: result.message });
    } else {
      showModal(MODAL_TYPES.ERROR, { message: result.error });
    }
  };

  const handleDeclineRequest = async (requestId) => {
    const result = await declineFriendRequest(requestId);
    if (!result.success) {
      showModal(MODAL_TYPES.ERROR, { message: result.error });
    }
  };

  const handleCancelRequest = async (requestId) => {
    const result = await cancelSentRequest(requestId);
    if (result.success) {
      showModal(MODAL_TYPES.SUCCESS, { message: result.message });
    } else {
      showModal(MODAL_TYPES.ERROR, { message: result.error });
    }
  };

  const handleUserClick = (userId) => {
    if (isFriend(userId)) {
      navigate(`/friend/${userId}`);
    }
  };

  const getButtonState = (userId) => {
    if (isFriend(userId)) return "friends";
    const friendship = getFriendship(userId);
    if (friendship?.status === "sent") return "sent";
    if (friendship?.status === "received") return "received";
    return "add";
  };

  const handleChallengeFriend = (friend) => {
    const friendLevel = getCurrentLevel(friend.xp);
    navigate("/challenge", {
      state: {
        preselectedFriend: {
          id: friend.user_id || friend.id,
          name: friend.nickname || friend.username,
          nickname: friend.nickname || friend.username,
          username: friend.username,
          avatar: friend.avatar,
          xp: friend.xp,
          streak: friend.streak,
          level: friendLevel.level,
        },
      },
    });
  };

  const handleQuickMessage = (friend) => {
    setQuickMessageFriend(friend);
  };

  const totalRequests = sentRequests.length + receivedRequests.length;

  return (
    <div
      className="screen no-extra-space"
      style={{
        background: "#0B1E2D",
        minHeight: "100vh",
        paddingBottom: "80px",
      }}
    >
      <style>{highlightStyle}</style>

      <div
        style={{
          background: "linear-gradient(135deg, #0B1E2D 0%, #1a3a52 100%)",
          padding: "20px 20px 0",
          borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
        }}
      >
        <h1
          style={{
            color: "#D4AF37",
            fontSize: "1.8rem",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          Friends
        </h1>

        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "center",
          }}
        >
          <TabButton
            active={activeTab === "friends"}
            onClick={() => setActiveTab("friends")}
            icon={<Users size={18} />}
            label="Friends"
            count={friends.length}
          />
          <TabButton
            active={activeTab === "leaderboard"}
            onClick={() => setActiveTab("leaderboard")}
            icon={<Trophy size={18} />}
            label="Leaderboard"
          />
          <TabButton
            active={activeTab === "requests"}
            onClick={() => setActiveTab("requests")}
            icon={<Send size={18} />}
            label="Requests"
            count={totalRequests}
            badge={receivedRequests.length > 0}
          />
          <TabButton
            active={activeTab === "search"}
            onClick={() => setActiveTab("search")}
            icon={<Search size={18} />}
            label="Search"
          />
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        <AnimatePresence mode="wait">
          {activeTab === "friends" && (
            <motion.div
              key="friends"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {friends.length === 0 ? (
                <EmptyState
                  icon={<Users size={48} />}
                  title="No friends yet"
                  message="Search for users to add friends"
                  action={{
                    label: "Search Users",
                    onClick: () => setActiveTab("search"),
                  }}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {friends
                    .sort((a, b) =>
                      (a.nickname || a.username || "").localeCompare(
                        b.nickname || b.username || ""
                      )
                    )
                    .map((friend) => (
                      <UserCard
                        key={friend.user_id || friend.id}
                        user={friend}
                        onClick={() => handleUserClick(friend.user_id || friend.id)}
                        badge="Friends"
                        badgeColor="#10b981"
                      />
                    ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "leaderboard" && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "20px",
                  background: "rgba(14, 22, 37, 0.6)",
                  padding: "8px",
                  borderRadius: "12px",
                }}
              >
                <SubTabButton
                  active={leaderboardTab === "friends"}
                  onClick={() => setLeaderboardTab("friends")}
                  label="Friends"
                  icon={<Users size={16} />}
                />
                <SubTabButton
                  active={leaderboardTab === "global"}
                  onClick={() => setLeaderboardTab("global")}
                  label="Global"
                  icon={<Globe size={16} />}
                />
              </div>

              {leaderboardTab === "friends" && (
                <div>
                  {friendsLeaderboard.length === 0 ? (
                    <EmptyState
                      icon={<Trophy size={48} />}
                      title="No friends to rank"
                      message="Add friends to see their rankings"
                      action={{
                        label: "Add Friends",
                        onClick: () => setActiveTab("search"),
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      {friendsLeaderboard.map((friend, index) => (
                        <LeaderboardCard
                          key={friend.user_id}
                          user={friend}
                          rank={index + 1}
                          isCurrentUser={friend.user_id === currentUserIdForHighlight}
                          onChallenge={() => handleChallengeFriend(friend)}
                          onQuickMessage={() => handleQuickMessage(friend)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {leaderboardTab === "global" && (
                <div>
                  {loadingGlobal ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#888",
                      }}
                    >
                      Loading leaderboard...
                    </div>
                  ) : globalLeaderboard.length === 0 ? (
                    <EmptyState
                      icon={<Globe size={48} />}
                      title="No users to rank"
                      message="Global leaderboard is empty"
                    />
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      {globalLeaderboard.map((user, index) => (
                        <GlobalLeaderboardCard
                          key={user.user_id}
                          user={user}
                          rank={index + 1}
                          isCurrentUser={
                            user.isCurrentUser ||
                            user.user_id === currentUserIdForHighlight
                          }
                          isFriend={isFriend(user.user_id)}
                          onUserClick={() => handleUserClick(user.user_id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "requests" && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {receivedRequests.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <h3
                    style={{
                      color: "#D4AF37",
                      fontSize: "1rem",
                      fontWeight: "600",
                      marginBottom: "12px",
                    }}
                  >
                    Received ({receivedRequests.length})
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {receivedRequests.map((request) => (
                      <RequestCard
                        key={request.requestId || request.id}
                        user={request}
                        type="received"
                        onAccept={() => handleAcceptRequest(request.requestId)}
                        onDecline={() => handleDeclineRequest(request.requestId)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {sentRequests.length > 0 && (
                <div>
                  <h3
                    style={{
                      color: "#D4AF37",
                      fontSize: "1rem",
                      fontWeight: "600",
                      marginBottom: "12px",
                    }}
                  >
                    Sent ({sentRequests.length})
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {sentRequests.map((request) => (
                      <RequestCard
                        key={request.requestId || request.id}
                        user={request}
                        type="sent"
                        onCancel={() => handleCancelRequest(request.requestId)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {totalRequests === 0 && (
                <EmptyState
                  icon={<Send size={48} />}
                  title="No pending requests"
                  message="Friend requests will appear here"
                />
              )}
            </motion.div>
          )}

          {activeTab === "search" && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div
                style={{
                  position: "relative",
                  marginBottom: "20px",
                }}
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by @handle or username..."
                  style={{
                    width: "100%",
                    padding: "14px 44px 14px 16px",
                    borderRadius: "12px",
                    border: "2px solid rgba(212, 175, 55, 0.3)",
                    background: "rgba(14, 22, 37, 0.6)",
                    color: "white",
                    fontSize: "1rem",
                    outline: "none",
                  }}
                />
                <Search
                  size={20}
                  color="#888"
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
              </div>

              {searchQuery.trim().length < 2 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#888",
                    padding: "40px 20px",
                  }}
                >
                  <Search
                    size={48}
                    color="#555"
                    style={{ marginBottom: "16px" }}
                  />
                  <p>Enter at least 2 characters to search</p>
                </div>
              ) : isSearching ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#888",
                    padding: "40px 20px",
                  }}
                >
                  Searching...
                </div>
              ) : searchResults.length === 0 ? (
                <EmptyState
                  icon={<Search size={48} />}
                  title="No users found"
                  message={`No results for "${searchQuery}"`}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {searchResults.map((user) => {
                    const buttonState = getButtonState(user.user_id || user.id);
                    return (
                      <UserCard
                        key={user.user_id || user.id}
                        user={user}
                        onClick={
                          buttonState === "friends"
                            ? () => handleUserClick(user.user_id || user.id)
                            : undefined
                        }
                        action={
                          buttonState === "add" ? (
                            <ActionButton
                              onClick={() => handleSendRequest(user.user_id || user.id)}
                              icon={<UserPlus size={16} />}
                              label="Add"
                              color="#10b981"
                            />
                          ) : buttonState === "sent" ? (
                            <StatusBadge
                              icon={<Clock size={14} />}
                              label="Pending"
                              color="#f59e0b"
                            />
                          ) : buttonState === "friends" ? (
                            <StatusBadge
                              icon={<Check size={14} />}
                              label="Friends"
                              color="#10b981"
                            />
                          ) : null
                        }
                      />
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {quickMessageFriend && (
        <QuickMessageModal
          friend={quickMessageFriend}
          onClose={() => setQuickMessageFriend(null)}
        />
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon, label, count, badge }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        padding: "10px 16px",
        background: active
          ? "rgba(212, 175, 55, 0.2)"
          : "rgba(14, 22, 37, 0.6)",
        border: active
          ? "1px solid #D4AF37"
          : "1px solid rgba(212, 175, 55, 0.2)",
        borderRadius: "12px 12px 0 0",
        color: active ? "#D4AF37" : "#888",
        cursor: "pointer",
        position: "relative",
        minWidth: "70px",
      }}
    >
      <div style={{ position: "relative" }}>
        {icon}
        {badge && (
          <div
            style={{
              position: "absolute",
              top: "-4px",
              right: "-8px",
              width: "10px",
              height: "10px",
              background: "#ef4444",
              borderRadius: "50%",
            }}
          />
        )}
      </div>
      <span style={{ fontSize: "0.7rem", fontWeight: "600" }}>
        {label}
        {count !== undefined && count > 0 && ` (${count})`}
      </span>
    </motion.button>
  );
}

function SubTabButton({ active, onClick, label, icon }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        padding: "10px",
        background: active ? "rgba(212, 175, 55, 0.2)" : "transparent",
        border: active ? "1px solid #D4AF37" : "1px solid transparent",
        borderRadius: "8px",
        color: active ? "#D4AF37" : "#888",
        cursor: "pointer",
        fontSize: "0.9rem",
        fontWeight: "600",
      }}
    >
      {icon}
      {label}
    </motion.button>
  );
}

function LeaderboardCard({ user, rank, isCurrentUser, onChallenge, onQuickMessage }) {
  const avatarSrc =
    assets.avatars[user.avatar] ||
    assets.avatars.avatar_man_lantern ||
    getAvatarImage(user.avatar, {
      userId: user.user_id,
      nickname: user.username || user.handle,
    });
  const displayName = user.username || user.handle || "Unknown";
  const userLevel = getCurrentLevel(user.xp);

  const getRankClass = () => {
    if (rank === 1) return "gold";
    if (rank === 2) return "silver";
    if (rank === 3) return "bronze";
    return "";
  };

  const rankClass = getRankClass();
  const borderColor =
    rankClass === "gold"
      ? "#d4af37"
      : rankClass === "silver"
        ? "#c0c0c0"
        : rankClass === "bronze"
          ? "#cd7f32"
          : "rgba(212, 175, 55, 0.3)";

  return (
    <motion.div
      className={isCurrentUser ? "highlight-user" : ""}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(rank * 0.03, 0.5) }}
      style={{
        background:
          rankClass === "gold"
            ? "linear-gradient(135deg, rgba(212, 175, 55, 0.3) 0%, rgba(255, 215, 0, 0.2) 100%)"
            : rankClass === "silver"
              ? "linear-gradient(135deg, rgba(192, 192, 192, 0.2) 0%, rgba(169, 169, 169, 0.1) 100%)"
              : rankClass === "bronze"
                ? "linear-gradient(135deg, rgba(205, 127, 50, 0.2) 0%, rgba(184, 115, 51, 0.1) 100%)"
                : "rgba(14, 22, 37, 0.6)",
        border: `1px solid ${borderColor}`,
        borderRadius: "12px",
        padding: "12px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        boxShadow:
          rankClass === "gold"
            ? "0 0 20px rgba(212, 175, 55, 0.4)"
            : rankClass === "silver"
              ? "0 0 15px rgba(192, 192, 192, 0.3)"
              : "none",
      }}
    >
      <div
        style={{
          minWidth: "35px",
          color: rankClass ? borderColor : "#94a3b8",
          fontSize: "1rem",
          fontWeight: "700",
          textAlign: "center",
        }}
      >
        #{rank}
      </div>

      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          border: `2px solid ${borderColor}`,
          overflow: "hidden",
          flexShrink: 0,
          background: "#0E1625",
        }}
      >
        <img
          src={avatarSrc}
          alt={displayName}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "4px",
          }}
        >
          <p
            style={{
              color: "#e2e8f0",
              fontWeight: "600",
              fontSize: "0.95rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              margin: 0,
            }}
          >
            {displayName}
          </p>
          <LevelBadgeCompact level={userLevel} size="small" />
        </div>
        {user.handle && (
          <p
            style={{
              color: "#aaa",
              fontSize: "0.75rem",
              margin: 0,
              marginBottom: "4px",
            }}
          >
            @{user.handle}
          </p>
        )}
        <div
          style={{
            display: "flex",
            gap: "12px",
            fontSize: "0.75rem",
            color: "#888",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Trophy size={12} color="#D4AF37" />
            {user.xp.toLocaleString()}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Flame size={12} color="#ef4444" />
            {user.streak}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "6px" }}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onQuickMessage}
          style={{
            padding: "8px",
            background: "rgba(59, 130, 246, 0.2)",
            border: "1px solid #3b82f6",
            borderRadius: "8px",
            color: "#3b82f6",
            cursor: "pointer",
          }}
        >
          <MessageCircle size={16} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onChallenge}
          style={{
            padding: "8px",
            background: "rgba(239, 68, 68, 0.2)",
            border: "1px solid #ef4444",
            borderRadius: "8px",
            color: "#ef4444",
            cursor: "pointer",
          }}
        >
          <Swords size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
}

function GlobalLeaderboardCard({
  user,
  rank,
  isCurrentUser,
  isFriend,
  onUserClick,
}) {
  const avatarSrc =
    assets.avatars[user.avatar] ||
    assets.avatars.avatar_man_lantern ||
    getAvatarImage(user.avatar, {
      userId: user.user_id,
      nickname: user.username || user.handle,
    });
  const displayName = user.username || user.handle || "Unknown";
  const userLevel = getCurrentLevel(user.xp);
  const isPermanentEntry = user.isPermanent === true;

  const getRankClass = () => {
    if (rank === 1) return "gold";
    if (rank === 2) return "silver";
    if (rank === 3) return "bronze";
    return "";
  };

  const rankClass = getRankClass();
  const borderColor =
    rankClass === "gold"
      ? "#d4af37"
      : rankClass === "silver"
        ? "#c0c0c0"
        : rankClass === "bronze"
          ? "#cd7f32"
          : "rgba(212, 175, 55, 0.3)";

  return (
    <motion.div
      className={isCurrentUser ? "highlight-user" : ""}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(rank * 0.03, 0.5) }}
      onClick={!isPermanentEntry && isFriend ? onUserClick : undefined}
      style={{
        background:
          rankClass === "gold"
            ? "linear-gradient(135deg, rgba(212, 175, 55, 0.3) 0%, rgba(255, 215, 0, 0.2) 100%)"
            : rankClass === "silver"
              ? "linear-gradient(135deg, rgba(192, 192, 192, 0.2) 0%, rgba(169, 169, 169, 0.1) 100%)"
              : rankClass === "bronze"
                ? "linear-gradient(135deg, rgba(205, 127, 50, 0.2) 0%, rgba(184, 115, 51, 0.1) 100%)"
                : "rgba(14, 22, 37, 0.6)",
        border: `1px solid ${borderColor}`,
        borderRadius: "10px",
        padding: "10px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        cursor: !isPermanentEntry && isFriend ? "pointer" : "default",
        boxShadow:
          rankClass === "gold"
            ? "0 0 20px rgba(212, 175, 55, 0.4)"
            : rankClass === "silver"
              ? "0 0 15px rgba(192, 192, 192, 0.3)"
              : "none",
        opacity: isPermanentEntry ? 0.95 : 1,
      }}
    >
      <div
        style={{
          minWidth: "35px",
          color: rankClass ? borderColor : "#94a3b8",
          fontSize: "0.9rem",
          fontWeight: "600",
          textAlign: "center",
        }}
      >
        #{rank}
      </div>

      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          border: `2px solid ${borderColor}`,
          overflow: "hidden",
          flexShrink: 0,
          background: "#0E1625",
        }}
      >
        <img
          src={avatarSrc}
          alt={displayName}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          className="name"
          style={{
            color: "#e2e8f0",
            fontWeight: "600",
            fontSize: "0.9rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            margin: 0,
            marginBottom: "2px",
          }}
        >
          {displayName}
        </p>
        <p
          className="handle"
          style={{
            color: "#aaa",
            fontSize: "0.75rem",
            margin: 0,
            marginBottom: "2px",
          }}
        >
          @{user.handle}
        </p>
        <div
          style={{
            display: "flex",
            gap: "8px",
            fontSize: "0.7rem",
            color: "#888",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            <Trophy size={10} color="#D4AF37" />
            {user.xp.toLocaleString()}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            <Flame size={10} color="#ef4444" />
            {user.streak}
          </span>
        </div>
      </div>

      {isPermanentEntry ? (
        <div
          style={{
            padding: "4px 8px",
            background: "rgba(139, 92, 246, 0.2)",
            border: "1px solid #8b5cf6",
            borderRadius: "6px",
            color: "#a78bfa",
            fontSize: "0.7rem",
            fontWeight: "600",
          }}
        >
          Dev
        </div>
      ) : isFriend ? (
        <div
          style={{
            padding: "4px 8px",
            background: "rgba(16, 185, 129, 0.2)",
            border: "1px solid #10b981",
            borderRadius: "6px",
            color: "#10b981",
            fontSize: "0.7rem",
            fontWeight: "600",
          }}
        >
          Friend
        </div>
      ) : null}
    </motion.div>
  );
}

function UserCard({ user, onClick, action, badge, badgeColor }) {
  const avatarSrc = getAvatarImage(user.avatar, {
    userId: user.user_id || user.id,
    nickname: user.nickname || user.username,
  });
  const userLevel = getCurrentLevel(user.xp);
  const displayName = user.nickname || user.username || user.handle || "User";

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      style={{
        background: "rgba(14, 22, 37, 0.6)",
        border: "1px solid rgba(212, 175, 55, 0.3)",
        borderRadius: "12px",
        padding: "14px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          border: "2px solid #D4AF37",
          overflow: "hidden",
          flexShrink: 0,
          background: "#0E1625",
        }}
      >
        <img
          src={avatarSrc}
          alt={displayName}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "4px",
          }}
        >
          <p
            style={{
              color: "white",
              fontWeight: "600",
              fontSize: "1rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {displayName}
          </p>
          <LevelBadgeCompact level={userLevel} size="small" />
        </div>
        {(user.handle || user.username) && (
          <p
            style={{
              color: "#aaa",
              fontSize: "0.85rem",
              marginBottom: "6px",
            }}
          >
            @{user.handle || user.username}
          </p>
        )}
        <div
          style={{
            display: "flex",
            gap: "12px",
            fontSize: "0.8rem",
            color: "#888",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Trophy size={12} color="#D4AF37" />
            {(user.xp || 0).toLocaleString()}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Flame size={12} color="#ef4444" />
            {user.streak || 0}
          </span>
        </div>
      </div>

      {badge ? (
        <div
          style={{
            padding: "6px 12px",
            background: `${badgeColor}22`,
            border: `1px solid ${badgeColor}`,
            borderRadius: "8px",
            color: badgeColor,
            fontSize: "0.8rem",
            fontWeight: "600",
          }}
        >
          {badge}
        </div>
      ) : (
        action
      )}
    </motion.div>
  );
}

function RequestCard({ user, type, onAccept, onDecline, onCancel }) {
  const avatarSrc = getAvatarImage(user.avatar, {
    userId: user.user_id || user.id,
    nickname: user.nickname || user.username,
  });
  const userLevel = getCurrentLevel(user.xp);
  const displayName = user.nickname || user.username || user.handle || "User";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        background: "rgba(14, 22, 37, 0.6)",
        border: "1px solid rgba(212, 175, 55, 0.3)",
        borderRadius: "12px",
        padding: "14px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          border: "2px solid #D4AF37",
          overflow: "hidden",
          flexShrink: 0,
          background: "#0E1625",
        }}
      >
        <img
          src={avatarSrc}
          alt={displayName}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "4px",
          }}
        >
          <p
            style={{
              color: "white",
              fontWeight: "600",
              fontSize: "1rem",
            }}
          >
            {displayName}
          </p>
          <LevelBadgeCompact level={userLevel} size="small" />
        </div>
        {(user.handle || user.username) && (
          <p
            style={{
              color: "#aaa",
              fontSize: "0.85rem",
            }}
          >
            @{user.handle || user.username}
          </p>
        )}
      </div>

      {type === "received" ? (
        <div style={{ display: "flex", gap: "8px" }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAccept}
            style={{
              padding: "8px 12px",
              background: "rgba(16, 185, 129, 0.2)",
              border: "1px solid #10b981",
              borderRadius: "8px",
              color: "#10b981",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.85rem",
            }}
          >
            <Check size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDecline}
            style={{
              padding: "8px 12px",
              background: "rgba(239, 68, 68, 0.2)",
              border: "1px solid #ef4444",
              borderRadius: "8px",
              color: "#ef4444",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.85rem",
            }}
          >
            <X size={16} />
          </motion.button>
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCancel}
          style={{
            padding: "8px 16px",
            background: "rgba(239, 68, 68, 0.2)",
            border: "1px solid #ef4444",
            borderRadius: "8px",
            color: "#ef4444",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "0.85rem",
          }}
        >
          Cancel
        </motion.button>
      )}
    </motion.div>
  );
}

function ActionButton({ onClick, icon, label, color }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 16px",
        background: `${color}22`,
        border: `1px solid ${color}`,
        borderRadius: "8px",
        color,
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "0.85rem",
      }}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
}

function StatusBadge({ icon, label, color }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "6px 12px",
        background: `${color}22`,
        border: `1px solid ${color}`,
        borderRadius: "8px",
        color,
        fontSize: "0.8rem",
        fontWeight: "600",
      }}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}

function EmptyState({ icon, title, message, action }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "60px 20px",
        color: "#888",
      }}
    >
      <div style={{ marginBottom: "16px", opacity: 0.5 }}>{icon}</div>
      <h3
        style={{
          color: "#D4AF37",
          fontSize: "1.2rem",
          fontWeight: "600",
          marginBottom: "8px",
        }}
      >
        {title}
      </h3>
      <p style={{ marginBottom: "20px" }}>{message}</p>
      {action && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          style={{
            padding: "12px 24px",
            background: "#D4AF37",
            color: "#0A1A2F",
            border: "none",
            borderRadius: "12px",
            fontWeight: "600",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          {action.label}
        </motion.button>
      )}
    </div>
  );
}
