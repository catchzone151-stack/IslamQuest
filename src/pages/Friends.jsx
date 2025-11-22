import { useState, useEffect } from "react";
import { useNavigate } from "../hooks/useNavigate";
import { useFriendsStore } from "../store/friendsStore";
import { useUserStore } from "../store/useUserStore";
import { useProgressStore } from "../store/progressStore";
import { useModalStore, MODAL_TYPES } from "../store/modalStore";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus, Users, Send, X, Check, Clock, Trophy, Flame } from "lucide-react";
import { LevelBadgeCompact } from "../components/LevelBadge";
import { getAvatarImage } from "../utils/avatarUtils";
import { getCurrentLevel } from "../utils/diamondLevels";

export default function Friends() {
  const navigate = useNavigate();
  const { id: currentUserId, name, avatar, username } = useUserStore();
  const { xp: currentUserXP, streak: currentUserStreak } = useProgressStore();
  const { showModal } = useModalStore();
  
  const {
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
    updateCurrentUserData,
    initializeUser
  } = useFriendsStore();

  const [activeTab, setActiveTab] = useState("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize current user in friends store on mount
  useEffect(() => {
    if (currentUserId && username) {
      initializeUser({
        id: currentUserId,
        username,
        nickname: name,
        avatar,
        xp: currentUserXP,
        streak: currentUserStreak
      });
    }
  }, [currentUserId, username]); // Only run on mount or when user changes

  // Update current user data when XP/streak changes
  useEffect(() => {
    updateCurrentUserData({ xp: currentUserXP, streak: currentUserStreak });
  }, [currentUserXP, currentUserStreak, updateCurrentUserData]);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim().length >= 3) {
      setIsSearching(true);
      const results = searchUsers(searchQuery.trim());
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchUsers]);

  const friends = getAllFriends();
  const sentRequests = getSentRequests();
  const receivedRequests = getReceivedRequests();

  const handleSendRequest = (userId) => {
    const result = sendFriendRequest(userId);
    if (result.success) {
      showModal(MODAL_TYPES.SUCCESS, {
        message: result.message
      });
    } else {
      showModal(MODAL_TYPES.ERROR, {
        message: result.error
      });
    }
  };

  const handleAcceptRequest = (requestId) => {
    const result = acceptFriendRequest(requestId);
    if (result.success) {
      showModal(MODAL_TYPES.SUCCESS, {
        message: result.message
      });
    } else {
      showModal(MODAL_TYPES.ERROR, {
        message: result.error
      });
    }
  };

  const handleDeclineRequest = (requestId) => {
    const result = declineFriendRequest(requestId);
    if (result.success) {
      // Silent success for decline
    } else {
      showModal(MODAL_TYPES.ERROR, {
        message: result.error
      });
    }
  };

  const handleCancelRequest = (requestId) => {
    const result = cancelSentRequest(requestId);
    if (result.success) {
      showModal(MODAL_TYPES.SUCCESS, {
        message: result.message
      });
    } else {
      showModal(MODAL_TYPES.ERROR, {
        message: result.error
      });
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
    if (friendship?.status === "pending") {
      return friendship.userId === currentUserId ? "sent" : "received";
    }
    return "add";
  };

  const totalRequests = sentRequests.length + receivedRequests.length;

  return (
    <div className="screen no-extra-space" style={{
      background: "#0B1E2D",
      minHeight: "100vh",
      paddingBottom: "80px"
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0B1E2D 0%, #1a3a52 100%)",
        padding: "20px 20px 0",
        borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
      }}>
        <h1 style={{
          color: "#D4AF37",
          fontSize: "1.8rem",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "20px"
        }}>
          Friends
        </h1>

        {/* Tabs */}
        <div style={{
          display: "flex",
          gap: "8px",
          justifyContent: "center"
        }}>
          <TabButton
            active={activeTab === "friends"}
            onClick={() => setActiveTab("friends")}
            icon={<Users size={18} />}
            label="Friends"
            count={friends.length}
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

      {/* Content */}
      <div style={{ padding: "16px" }}>
        <AnimatePresence mode="wait">
          {/* Friends Tab */}
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
                    onClick: () => setActiveTab("search")
                  }}
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {friends.map(friend => (
                    <UserCard
                      key={friend.id}
                      user={friend}
                      onClick={() => handleUserClick(friend.id)}
                      badge="Friends"
                      badgeColor="#10b981"
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Requests Tab */}
          {activeTab === "requests" && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Received Requests */}
              {receivedRequests.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <h3 style={{
                    color: "#D4AF37",
                    fontSize: "1rem",
                    fontWeight: "600",
                    marginBottom: "12px"
                  }}>
                    Received ({receivedRequests.length})
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {receivedRequests.map(request => (
                      <RequestCard
                        key={request.id}
                        user={request}
                        type="received"
                        onAccept={() => handleAcceptRequest(request.requestId)}
                        onDecline={() => handleDeclineRequest(request.requestId)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sent Requests */}
              {sentRequests.length > 0 && (
                <div>
                  <h3 style={{
                    color: "#D4AF37",
                    fontSize: "1rem",
                    fontWeight: "600",
                    marginBottom: "12px"
                  }}>
                    Sent ({sentRequests.length})
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {sentRequests.map(request => (
                      <RequestCard
                        key={request.id}
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

          {/* Search Tab */}
          {activeTab === "search" && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Search Input */}
              <div style={{
                position: "relative",
                marginBottom: "20px"
              }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by username..."
                  style={{
                    width: "100%",
                    padding: "14px 44px 14px 16px",
                    borderRadius: "12px",
                    border: "2px solid rgba(212, 175, 55, 0.3)",
                    background: "rgba(14, 22, 37, 0.6)",
                    color: "white",
                    fontSize: "1rem",
                    outline: "none"
                  }}
                />
                <Search
                  size={20}
                  color="#888"
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)"
                  }}
                />
              </div>

              {/* Search Results */}
              {searchQuery.trim().length < 3 ? (
                <div style={{
                  textAlign: "center",
                  color: "#888",
                  padding: "40px 20px"
                }}>
                  <Search size={48} color="#555" style={{ marginBottom: "16px" }} />
                  <p>Enter at least 3 characters to search</p>
                </div>
              ) : searchResults.length === 0 ? (
                <EmptyState
                  icon={<Search size={48} />}
                  title="No users found"
                  message={`No results for "${searchQuery}"`}
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {searchResults.map(user => {
                    const buttonState = getButtonState(user.id);
                    return (
                      <UserCard
                        key={user.id}
                        user={user}
                        onClick={buttonState === "friends" ? () => handleUserClick(user.id) : undefined}
                        action={
                          buttonState === "add" ? (
                            <ActionButton
                              onClick={() => handleSendRequest(user.id)}
                              icon={<UserPlus size={16} />}
                              label="Add"
                              color="#10b981"
                            />
                          ) : buttonState === "sent" ? (
                            <StatusBadge icon={<Clock size={14} />} label="Pending" color="#f59e0b" />
                          ) : buttonState === "friends" ? (
                            <StatusBadge icon={<Check size={14} />} label="Friends" color="#10b981" />
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
    </div>
  );
}

// Helper Components
function TabButton({ active, onClick, icon, label, count, badge }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "12px 16px",
        background: active ? "rgba(212, 175, 55, 0.2)" : "transparent",
        border: "none",
        borderBottom: active ? "2px solid #D4AF37" : "2px solid transparent",
        color: active ? "#D4AF37" : "#888",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        cursor: "pointer",
        position: "relative",
        fontSize: "0.85rem",
        fontWeight: active ? "600" : "500",
        transition: "all 0.2s ease"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        {icon}
        {count !== undefined && (
          <span style={{
            fontSize: "0.75rem",
            background: active ? "#D4AF37" : "#555",
            color: active ? "#0A1A2F" : "#ccc",
            padding: "2px 6px",
            borderRadius: "10px",
            fontWeight: "600"
          }}>
            {count}
          </span>
        )}
      </div>
      <span>{label}</span>
      {badge && (
        <div style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          width: "8px",
          height: "8px",
          background: "#ef4444",
          borderRadius: "50%"
        }} />
      )}
    </button>
  );
}

function UserCard({ user, onClick, action, badge, badgeColor }) {
  const avatarSrc = getAvatarImage(user.avatar);
  const userLevel = getCurrentLevel(user.xp);

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
        cursor: onClick ? "pointer" : "default"
      }}
    >
      {/* Avatar */}
      <div style={{
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        border: "2px solid #D4AF37",
        overflow: "hidden",
        flexShrink: 0,
        background: "#0E1625"
      }}>
        <img
          src={avatarSrc}
          alt={user.nickname}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
        />
      </div>

      {/* User Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <p style={{
            color: "white",
            fontWeight: "600",
            fontSize: "1rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}>
            {user.nickname}
          </p>
          <LevelBadgeCompact level={userLevel} size="small" />
        </div>
        <p style={{
          color: "#aaa",
          fontSize: "0.85rem",
          marginBottom: "6px"
        }}>
          @{user.username}
        </p>
        <div style={{
          display: "flex",
          gap: "12px",
          fontSize: "0.8rem",
          color: "#888"
        }}>
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

      {/* Action or Badge */}
      {badge ? (
        <div style={{
          padding: "6px 12px",
          background: `${badgeColor}22`,
          border: `1px solid ${badgeColor}`,
          borderRadius: "8px",
          color: badgeColor,
          fontSize: "0.8rem",
          fontWeight: "600"
        }}>
          {badge}
        </div>
      ) : action}
    </motion.div>
  );
}

function RequestCard({ user, type, onAccept, onDecline, onCancel }) {
  const avatarSrc = getAvatarImage(user.avatar);
  const userLevel = getCurrentLevel(user.xp);

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
        gap: "12px"
      }}
    >
      {/* Avatar */}
      <div style={{
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        border: "2px solid #D4AF37",
        overflow: "hidden",
        flexShrink: 0,
        background: "#0E1625"
      }}>
        <img
          src={avatarSrc}
          alt={user.nickname}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
        />
      </div>

      {/* User Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <p style={{
            color: "white",
            fontWeight: "600",
            fontSize: "1rem"
          }}>
            {user.nickname}
          </p>
          <LevelBadgeCompact level={userLevel} size="small" />
        </div>
        <p style={{
          color: "#aaa",
          fontSize: "0.85rem"
        }}>
          @{user.username}
        </p>
      </div>

      {/* Actions */}
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
              fontSize: "0.85rem"
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
              fontSize: "0.85rem"
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
            fontSize: "0.85rem"
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
        fontSize: "0.85rem"
      }}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
}

function StatusBadge({ icon, label, color }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "4px",
      padding: "6px 12px",
      background: `${color}22`,
      border: `1px solid ${color}`,
      borderRadius: "8px",
      color,
      fontSize: "0.8rem",
      fontWeight: "600"
    }}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

function EmptyState({ icon, title, message, action }) {
  return (
    <div style={{
      textAlign: "center",
      padding: "60px 20px",
      color: "#888"
    }}>
      <div style={{ marginBottom: "16px", opacity: 0.5 }}>
        {icon}
      </div>
      <h3 style={{
        color: "#D4AF37",
        fontSize: "1.2rem",
        fontWeight: "600",
        marginBottom: "8px"
      }}>
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
            cursor: "pointer"
          }}
        >
          {action.label}
        </motion.button>
      )}
    </div>
  );
}
