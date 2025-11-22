import { useState, useEffect } from "react";
import { useFriendsStore } from "../store/friendsStore";
import { useProgressStore } from "../store/progressStore";
import { useNavigate } from "../hooks/useNavigate";
import { Search, UserPlus, Users, Trophy, Activity, X, Send, Swords } from "lucide-react";
import { LevelBadgeCompact } from "../components/LevelBadge";
import { getAvatarImage } from "../utils/avatarUtils";

export default function Friends() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMiniProfile, setShowMiniProfile] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(null);
  const [leaderboardTab, setLeaderboardTab] = useState("friends");

  const {
    friends,
    incomingRequests,
    outgoingRequests,
    activityFeed,
    friendOfWeek,
    clearRequestsBadge,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    cancelOutgoingRequest,
    removeFriend,
    sendMessage,
    sendChallenge,
    getFriendsLeaderboard,
    getGlobalLeaderboard,
  } = useFriendsStore();

  const { xp: currentUserXP } = useProgressStore();

  useEffect(() => {
    clearRequestsBadge();
    // Simulate friends and leaderboard loading
    setIsLoadingFriends(true);
    setIsLoadingLeaderboard(true);
    const friendsTimer = setTimeout(() => setIsLoadingFriends(false), 500);
    const leaderboardTimer = setTimeout(() => setIsLoadingLeaderboard(false), 800);
    return () => {
      clearTimeout(friendsTimer);
      clearTimeout(leaderboardTimer);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      sendFriendRequest(searchQuery.trim());
      setSearchQuery("");
    }
  };

  const handleSendMessage = (friendId, message) => {
    sendMessage(friendId, message);
    setShowMessageModal(null);
  };

  const handleChallenge = (friendId) => {
    const friend = friends.find(f => f.id === friendId);
    if (friend) {
      // Navigate to Challenge page with friend pre-selected
      navigate("/challenge", { state: { preselectedFriend: friend } });
    }
    setShowMiniProfile(null);
  };

  const friendsLeaderboard = getFriendsLeaderboard();
  const globalLeaderboard = getGlobalLeaderboard();

  const totalRequests = incomingRequests.length + outgoingRequests.length;

  return (
    <div className="screen no-extra-space" style={{
      background: "#0B1E2D",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0B1E2D 0%, #1a3a52 100%)",
        padding: "20px 20px 16px",
        borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
      }}>
        <h1 style={{
          color: "#D4AF37",
          fontSize: "1.8rem",
          fontWeight: "bold",
          textAlign: "center",
          textShadow: "0 0 20px rgba(212, 175, 55, 0.5)",
          margin: 0,
        }}>
          Friends 🤝
        </h1>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        gap: 8,
        padding: "16px 16px 0",
        overflowX: "auto",
        borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
      }}>
        {[
          { id: "friends", label: "Friends", icon: Users },
          { id: "requests", label: "Requests", icon: UserPlus, badge: totalRequests },
          { id: "leaderboard", label: "Leaderboard", icon: Trophy },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                minWidth: 100,
                padding: "12px 16px",
                background: activeTab === tab.id
                  ? "linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)"
                  : "rgba(212, 175, 55, 0.1)",
                border: "none",
                borderRadius: "12px 12px 0 0",
                color: activeTab === tab.id ? "#0B1E2D" : "#D4AF37",
                fontWeight: "600",
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "all 0.3s",
                position: "relative",
                boxShadow: activeTab === tab.id
                  ? "0 0 20px rgba(212, 175, 55, 0.4)"
                  : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Icon size={16} />
                {tab.label}
                {tab.badge > 0 && (
                  <span style={{
                    background: "#ef4444",
                    color: "white",
                    borderRadius: "50%",
                    width: 20,
                    height: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: "bold",
                  }}>
                    {tab.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div style={{ padding: 16 }}>
        {activeTab === "friends" && isLoadingFriends && (
          <div style={{
            padding: "60px 20px",
            textAlign: "center",
            color: "#D4AF37"
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "12px" }}>⏳</div>
            <p style={{ fontSize: "1.1rem" }}>Loading friends...</p>
          </div>
        )}

        {activeTab === "friends" && !isLoadingFriends && (
          <FriendsTab
            friends={friends}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            setShowMiniProfile={setShowMiniProfile}
            setShowMessageModal={setShowMessageModal}
            onChallenge={handleChallenge}
          />
        )}

        {activeTab === "requests" && (
          <RequestsTab
            incomingRequests={incomingRequests}
            outgoingRequests={outgoingRequests}
            acceptFriendRequest={acceptFriendRequest}
            declineFriendRequest={declineFriendRequest}
            cancelOutgoingRequest={cancelOutgoingRequest}
          />
        )}

        {activeTab === "leaderboard" && isLoadingLeaderboard && (
          <div style={{
            padding: "60px 20px",
            textAlign: "center",
            color: "#D4AF37"
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "12px" }}>⏳</div>
            <p style={{ fontSize: "1.1rem" }}>Loading leaderboards...</p>
          </div>
        )}

        {activeTab === "leaderboard" && !isLoadingLeaderboard && (
          <LeaderboardTab
            leaderboardTab={leaderboardTab}
            setLeaderboardTab={setLeaderboardTab}
            friendsLeaderboard={friendsLeaderboard}
            globalLeaderboard={globalLeaderboard}
            currentUserXP={currentUserXP}
            friendOfWeek={friendOfWeek}
          />
        )}

      </div>

      {/* Mini Profile Modal */}
      {showMiniProfile && (
        <MiniProfileModal
          friend={showMiniProfile}
          onClose={() => setShowMiniProfile(null)}
          onMessage={() => {
            setShowMessageModal(showMiniProfile);
            setShowMiniProfile(null);
          }}
          onChallenge={() => handleChallenge(showMiniProfile.id)}
          onRemove={() => {
            if (window.confirm(`Remove ${showMiniProfile.name} from your friends?`)) {
              removeFriend(showMiniProfile.id);
              setShowMiniProfile(null);
            }
          }}
        />
      )}

      {/* Quick Messages Modal */}
      {showMessageModal && (
        <QuickMessagesModal
          friend={showMessageModal}
          onClose={() => setShowMessageModal(null)}
          onSend={(message) => handleSendMessage(showMessageModal.id, message)}
        />
      )}
    </div>
  );
}

function FriendsTab({ friends, searchQuery, setSearchQuery, handleSearch, setShowMiniProfile, setShowMessageModal, onChallenge }) {
  return (
    <>
      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ marginBottom: 12 }}>
        <div style={{
          display: "flex",
          gap: 8,
          background: "rgba(212, 175, 55, 0.1)",
          padding: 12,
          borderRadius: 16,
          border: "1px solid rgba(212, 175, 55, 0.3)",
        }}>
          <Search size={20} color="#D4AF37" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by nickname..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "#f3f4f6",
              outline: "none",
              fontSize: "1rem",
            }}
          />
          <button
            type="submit"
            style={{
              background: "linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)",
              border: "none",
              borderRadius: 12,
              padding: "8px 16px",
              color: "#0B1E2D",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 0 15px rgba(212, 175, 55, 0.3)",
            }}
          >
            Add
          </button>
        </div>
      </form>

      {/* Friends List */}
      {friends.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "#D4AF37",
        }}>
          <div style={{ fontSize: "4rem", marginBottom: 16 }}>👋</div>
          <p style={{ fontSize: "1.2rem", fontWeight: "600" }}>Add your first friend 🌙</p>
          <p style={{ color: "rgba(212, 175, 55, 0.7)", marginTop: 8 }}>
            Search for friends above to get started!
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {friends.map((friend) => (
            <FriendCard
              key={friend.id}
              friend={friend}
              onViewProfile={() => setShowMiniProfile(friend)}
              onMessage={() => setShowMessageModal(friend)}
              onChallenge={() => onChallenge(friend.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}

function FriendCard({ friend, onViewProfile, onMessage, onChallenge }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(26, 58, 82, 0.6) 0%, rgba(11, 30, 45, 0.8) 100%)",
      borderRadius: 16,
      padding: 16,
      border: "1px solid rgba(212, 175, 55, 0.2)",
      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
      overflow: "hidden",
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {/* Avatar */}
        <img
          src={getAvatarImage(friend.avatar, { userId: friend.id, nickname: friend.name })}
          alt={friend.name}
          onClick={onViewProfile}
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            objectFit: "cover",
            cursor: "pointer",
            border: "3px solid #D4AF37",
            boxShadow: "0 0 20px rgba(212, 175, 55, 0.4)",
            flexShrink: 0,
          }}
        />

        {/* Info */}
        <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
          <div style={{ 
            color: "#D4AF37", 
            fontWeight: "600", 
            fontSize: "1.1rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {friend.name}
          </div>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 8, 
            marginTop: 8,
            flexWrap: "wrap",
          }}>
            <LevelBadgeCompact xp={friend.xp} size={20} />
            <span style={{ color: "rgba(212, 175, 55, 0.7)", fontSize: "0.85rem" }}>
              • {friend.xp} XP • {friend.streak} day streak 🔥
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button
            onClick={onChallenge}
            style={{
              background: "rgba(239, 68, 68, 0.2)",
              border: "1px solid rgba(239, 68, 68, 0.5)",
              borderRadius: 12,
              padding: "8px 10px",
              color: "#ef4444",
              cursor: "pointer",
              fontSize: "1.2rem",
              flexShrink: 0,
            }}
            title="Challenge"
          >
            ⚔️
          </button>
          <button
            onClick={onMessage}
            style={{
              background: "rgba(212, 175, 55, 0.2)",
              border: "1px solid rgba(212, 175, 55, 0.5)",
              borderRadius: 12,
              padding: "8px 10px",
              color: "#D4AF37",
              cursor: "pointer",
              fontSize: "1.2rem",
              flexShrink: 0,
            }}
            title="Message"
          >
            💬
          </button>
        </div>
      </div>
    </div>
  );
}

function RequestsTab({ incomingRequests, outgoingRequests, acceptFriendRequest, declineFriendRequest, cancelOutgoingRequest }) {
  const hasRequests = incomingRequests.length > 0 || outgoingRequests.length > 0;

  if (!hasRequests) {
    return (
      <div style={{
        textAlign: "center",
        padding: "60px 20px",
        color: "#D4AF37",
      }}>
        <div style={{ fontSize: "4rem", marginBottom: 16 }}>🌙</div>
        <p style={{ fontSize: "1.2rem", fontWeight: "600" }}>No new friend requests</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Incoming Requests */}
      {incomingRequests.length > 0 && (
        <div>
          <h3 style={{ color: "#D4AF37", marginBottom: 12, fontSize: "1.1rem" }}>
            Incoming Requests ({incomingRequests.length})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {incomingRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                type="incoming"
                onAccept={() => acceptFriendRequest(request.id)}
                onDecline={() => declineFriendRequest(request.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Outgoing Requests */}
      {outgoingRequests.length > 0 && (
        <div>
          <h3 style={{ color: "#D4AF37", marginBottom: 12, fontSize: "1.1rem" }}>
            Outgoing Requests ({outgoingRequests.length})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {outgoingRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                type="outgoing"
                onCancel={() => cancelOutgoingRequest(request.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RequestCard({ request, type, onAccept, onDecline, onCancel }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(26, 58, 82, 0.6) 0%, rgba(11, 30, 45, 0.8) 100%)",
      borderRadius: 16,
      padding: 16,
      border: "1px solid rgba(212, 175, 55, 0.2)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <img
          src={getAvatarImage(request.avatar, { userId: request.id, nickname: request.name })}
          alt={request.name}
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid #D4AF37",
            flexShrink: 0,
          }}
        />
        <div>
          <div style={{ color: "#D4AF37", fontWeight: "600" }}>{request.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <LevelBadgeCompact xp={request.xp} size={18} />
            <span style={{ color: "rgba(212, 175, 55, 0.7)", fontSize: "0.85rem" }}>
              {request.xp} XP
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {type === "incoming" ? (
          <>
            <button
              onClick={onAccept}
              style={{
                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                border: "none",
                borderRadius: 12,
                padding: "8px 16px",
                color: "white",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ✅ Accept
            </button>
            <button
              onClick={onDecline}
              style={{
                background: "rgba(239, 68, 68, 0.2)",
                border: "1px solid rgba(239, 68, 68, 0.5)",
                borderRadius: 12,
                padding: "8px 16px",
                color: "#ef4444",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ❌
            </button>
          </>
        ) : (
          <button
            onClick={onCancel}
            style={{
              background: "rgba(239, 68, 68, 0.2)",
              border: "1px solid rgba(239, 68, 68, 0.5)",
              borderRadius: 12,
              padding: "8px 16px",
              color: "#ef4444",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function LeaderboardTab({ leaderboardTab, setLeaderboardTab, friendsLeaderboard, globalLeaderboard, currentUserXP, friendOfWeek }) {
  const activeLeaderboard = leaderboardTab === "friends" ? friendsLeaderboard : globalLeaderboard;

  return (
    <>
      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button
          onClick={() => setLeaderboardTab("friends")}
          style={{
            flex: 1,
            padding: "12px",
            background: leaderboardTab === "friends"
              ? "linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)"
              : "rgba(212, 175, 55, 0.1)",
            border: "none",
            borderRadius: 12,
            color: leaderboardTab === "friends" ? "#0B1E2D" : "#D4AF37",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          🏅 Friends
        </button>
        <button
          onClick={() => setLeaderboardTab("global")}
          style={{
            flex: 1,
            padding: "12px",
            background: leaderboardTab === "global"
              ? "linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)"
              : "rgba(212, 175, 55, 0.1)",
            border: "none",
            borderRadius: 12,
            color: leaderboardTab === "global" ? "#0B1E2D" : "#D4AF37",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          🌍 Global
        </button>
      </div>

      {/* Friend of the Week */}
      {leaderboardTab === "friends" && friendOfWeek && (
        <div style={{
          background: "linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(244, 208, 63, 0.1) 100%)",
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          border: "2px solid #D4AF37",
          boxShadow: "0 0 30px rgba(212, 175, 55, 0.4)",
        }}>
          <div style={{ textAlign: "center", color: "#D4AF37", fontWeight: "600", marginBottom: 12 }}>
            🏆 Friend of the Week
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center" }}>
            <img
              src={getAvatarImage(friendOfWeek.avatar, { userId: friendOfWeek.id, nickname: friendOfWeek.name })}
              alt={friendOfWeek.name}
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #D4AF37",
                boxShadow: "0 0 15px rgba(212, 175, 55, 0.5)",
              }}
            />
            <div>
              <div style={{ color: "#D4AF37", fontWeight: "600", fontSize: "1.2rem" }}>
                {friendOfWeek.name}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                <LevelBadgeCompact xp={friendOfWeek.xp} size={22} />
                <span style={{ color: "rgba(212, 175, 55, 0.7)" }}>
                  {friendOfWeek.xp} XP
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <h3 style={{ color: "#D4AF37", marginBottom: 16, fontSize: "1.1rem" }}>
        {leaderboardTab === "friends" 
          ? "🏅 Your friends ranked by XP this week"
          : "🌍 Global Leaderboard"}
      </h3>

      {/* Leaderboard */}
      {activeLeaderboard.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "#D4AF37",
        }}>
          <p style={{ fontSize: "1.2rem" }}>No friends yet! Add some to see the leaderboard.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {activeLeaderboard.slice(0, 12).map((user, index) => {
            const isTop3 = index < 3;
            const medals = ["🥇", "🥈", "🥉"];
            
            return (
              <div
                key={user.id}
                style={{
                  background: isTop3
                    ? "linear-gradient(135deg, rgba(212, 175, 55, 0.3) 0%, rgba(244, 208, 63, 0.2) 100%)"
                    : "linear-gradient(135deg, rgba(26, 58, 82, 0.6) 0%, rgba(11, 30, 45, 0.8) 100%)",
                  borderRadius: 16,
                  padding: 16,
                  border: isTop3 ? "2px solid #D4AF37" : "1px solid rgba(212, 175, 55, 0.2)",
                  boxShadow: isTop3 ? "0 0 25px rgba(212, 175, 55, 0.4)" : "0 4px 15px rgba(0, 0, 0, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: isTop3 ? "#D4AF37" : "rgba(212, 175, 55, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  color: isTop3 ? "#0B1E2D" : "#D4AF37",
                  fontSize: "1.2rem",
                  flexShrink: 0,
                }}>
                  {isTop3 ? medals[index] : index + 1}
                </div>
                <img
                  src={getAvatarImage(user.avatar, { userId: user.id, nickname: user.name })}
                  alt={user.name}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: isTop3 ? "3px solid #D4AF37" : "2px solid rgba(212, 175, 55, 0.4)",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#D4AF37", fontWeight: "600" }}>
                    {user.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <LevelBadgeCompact xp={user.xp} size={20} />
                    <span style={{ color: "rgba(212, 175, 55, 0.7)", fontSize: "0.9rem" }}>
                      {user.xp} XP
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Zayd Mascot */}
      <div style={{
        textAlign: "center",
        marginTop: 20,
        color: "rgba(212, 175, 55, 0.7)",
        fontSize: "0.9rem",
      }}>
        <span style={{ fontSize: "2rem" }}>👑</span>
        <div style={{ marginTop: 8 }}>Keep climbing the ranks!</div>
      </div>
    </>
  );
}

function ActivityTab({ activityFeed }) {
  const shouldShowZayd = (index) => (index + 1) % 5 === 0;

  if (activityFeed.length === 0) {
    return (
      <div style={{
        textAlign: "center",
        padding: "60px 20px",
        color: "#D4AF37",
      }}>
        <div style={{ fontSize: "4rem", marginBottom: 16 }}>📊</div>
        <p style={{ fontSize: "1.2rem", fontWeight: "600" }}>No activity yet</p>
        <p style={{ color: "rgba(212, 175, 55, 0.7)", marginTop: 8 }}>
          Friend activity will appear here!
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {activityFeed.map((activity, index) => (
        <div key={activity.id}>
          <div style={{
            background: "linear-gradient(135deg, rgba(26, 58, 82, 0.6) 0%, rgba(11, 30, 45, 0.8) 100%)",
            borderRadius: 16,
            padding: 16,
            border: "1px solid rgba(212, 175, 55, 0.2)",
          }}>
            <div style={{ color: "#D4AF37", fontSize: "0.95rem" }}>
              {activity.message}
            </div>
            <div style={{ color: "rgba(212, 175, 55, 0.5)", fontSize: "0.8rem", marginTop: 8 }}>
              {new Date(activity.timestamp).toLocaleTimeString()}
            </div>
          </div>

          {/* Zayd appears every 5 activities */}
          {shouldShowZayd(index) && (
            <div style={{
              background: "linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(244, 208, 63, 0.1) 100%)",
              borderRadius: 16,
              padding: 16,
              marginTop: 12,
              border: "1px solid rgba(212, 175, 55, 0.3)",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>🧑‍🏫</div>
              <div style={{ color: "#D4AF37", fontWeight: "600" }}>
                Keep going team!
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MiniProfileModal({ friend, onClose, onMessage, onChallenge, onRemove }) {
  const friendsSince = friend.addedAt ? new Date(friend.addedAt).toLocaleDateString() : "Recently";

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: 20,
    }}>
      <div style={{
        background: "linear-gradient(135deg, #1a3a52 0%, #0B1E2D 100%)",
        borderRadius: 24,
        padding: 32,
        maxWidth: 400,
        width: "100%",
        border: "2px solid rgba(212, 175, 55, 0.3)",
        boxShadow: "0 0 40px rgba(212, 175, 55, 0.3)",
        position: "relative",
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "rgba(239, 68, 68, 0.2)",
            border: "1px solid rgba(239, 68, 68, 0.5)",
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#ef4444",
          }}
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <img
            src={getAvatarImage(friend.avatar, { userId: friend.id, nickname: friend.name })}
            alt={friend.name}
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              objectFit: "cover",
              margin: "0 auto",
              border: "4px solid #D4AF37",
              boxShadow: "0 0 30px rgba(212, 175, 55, 0.5)",
              display: "block",
            }}
          />
          <h2 style={{ color: "#D4AF37", marginTop: 16, fontSize: "1.5rem" }}>
            {friend.name}
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 24,
        }}>
          <div style={{
            background: "rgba(212, 175, 55, 0.1)",
            padding: 16,
            borderRadius: 12,
            textAlign: "center",
            border: "1px solid rgba(212, 175, 55, 0.2)",
          }}>
            <div style={{ color: "#D4AF37", fontSize: "1.5rem", fontWeight: "bold" }}>
              {friend.xp}
            </div>
            <div style={{ color: "rgba(212, 175, 55, 0.7)", fontSize: "0.85rem", marginTop: 4 }}>
              Total XP
            </div>
          </div>
          <div style={{
            background: "rgba(212, 175, 55, 0.1)",
            padding: 16,
            borderRadius: 12,
            textAlign: "center",
            border: "1px solid rgba(212, 175, 55, 0.2)",
          }}>
            <div style={{ color: "#D4AF37", fontSize: "1.5rem", fontWeight: "bold" }}>
              {friend.streak} 🔥
            </div>
            <div style={{ color: "rgba(212, 175, 55, 0.7)", fontSize: "0.85rem", marginTop: 4 }}>
              Day Streak
            </div>
          </div>
        </div>

        <div style={{
          color: "rgba(212, 175, 55, 0.7)",
          fontSize: "0.9rem",
          textAlign: "center",
          marginBottom: 24,
        }}>
          Friends since: {friendsSince}
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <button
            onClick={onChallenge}
            style={{
              flex: 1,
              background: "linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.2) 100%)",
              border: "1px solid rgba(239, 68, 68, 0.5)",
              borderRadius: 12,
              padding: "12px",
              color: "#ef4444",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Swords size={18} />
            Challenge
          </button>
          <button
            onClick={onMessage}
            style={{
              flex: 1,
              background: "linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)",
              border: "none",
              borderRadius: 12,
              padding: "12px",
              color: "#0B1E2D",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 0 20px rgba(212, 175, 55, 0.3)",
            }}
          >
            <Send size={18} />
            Message
          </button>
        </div>

        {/* Remove Friend Button */}
        <button
          onClick={onRemove}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            color: "rgba(239, 68, 68, 0.7)",
            fontSize: "0.9rem",
            cursor: "pointer",
            padding: "8px",
            textDecoration: "underline",
          }}
        >
          Remove Friend
        </button>
      </div>
    </div>
  );
}

function QuickMessagesModal({ friend, onClose, onSend }) {
  const { quickMessages } = useFriendsStore();

  const handleSend = (message) => {
    onSend(message);
    window.alert(`Message sent to ${friend.name}: "${message}" ✅`);
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: 20,
    }}>
      <div style={{
        background: "linear-gradient(135deg, #1a3a52 0%, #0B1E2D 100%)",
        borderRadius: 24,
        padding: 24,
        maxWidth: 400,
        width: "100%",
        border: "2px solid rgba(212, 175, 55, 0.3)",
        boxShadow: "0 0 40px rgba(212, 175, 55, 0.3)",
        position: "relative",
        maxHeight: "80vh",
        overflowY: "auto",
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "rgba(239, 68, 68, 0.2)",
            border: "1px solid rgba(239, 68, 68, 0.5)",
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#ef4444",
          }}
        >
          <X size={18} />
        </button>

        <h3 style={{ color: "#D4AF37", marginBottom: 16, fontSize: "1.2rem" }}>
          Send a message to {friend.name}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {quickMessages.map((message, index) => (
            <button
              key={index}
              onClick={() => handleSend(message)}
              style={{
                background: "rgba(212, 175, 55, 0.1)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                borderRadius: 12,
                padding: "12px 16px",
                color: "#D4AF37",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(212, 175, 55, 0.2)";
                e.currentTarget.style.boxShadow = "0 0 15px rgba(212, 175, 55, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(212, 175, 55, 0.1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {message}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
