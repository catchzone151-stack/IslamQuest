import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "../hooks/useNavigate";
import { useFriendsStore } from "../store/friendsStore";
import { useModalStore, MODAL_TYPES } from "../store/modalStore";
import { motion } from "framer-motion";
import { ArrowLeft, UserMinus, Trophy, Flame } from "lucide-react";
import { LevelBadgeCompact } from "../components/LevelBadge";
import { getAvatarImage } from "../utils/avatarUtils";
import { getCurrentLevel } from "../utils/diamondLevels";

export default function FriendProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { getUserById, removeFriend, isFriend } = useFriendsStore();
  const { showModal } = useModalStore();
  
  const [user, setUser] = useState(null);
  const [isUserFriend, setIsUserFriend] = useState(false);

  useEffect(() => {
    if (userId) {
      const userData = getUserById(userId);
      setUser(userData);
      setIsUserFriend(isFriend(userId));
    }
  }, [userId, getUserById, isFriend]);

  const handleRemoveFriend = () => {
    showModal(MODAL_TYPES.CONFIRM, {
      title: "Remove Friend?",
      message: `Are you sure you want to remove @${user.username} from your friends?`,
      confirmText: "Remove",
      cancelText: "Cancel",
      onConfirm: () => {
        const result = removeFriend(userId);
        if (result.success) {
          showModal(MODAL_TYPES.SUCCESS, {
            message: result.message,
            onClose: () => navigate("/friends")
          });
        } else {
          showModal(MODAL_TYPES.ERROR, {
            message: result.error
          });
        }
      }
    });
  };

  if (!user) {
    return (
      <div className="screen no-extra-space" style={{
        background: "#0B1E2D",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white"
      }}>
        <p>User not found</p>
      </div>
    );
  }

  const userLevel = getCurrentLevel(user.xp);
  const avatarSrc = getAvatarImage(user.avatar, { userId: user.id, nickname: user.nickname });

  return (
    <div className="screen no-extra-space" style={{
      background: "#0B1E2D",
      minHeight: "100vh",
      paddingBottom: "80px"
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0B1E2D 0%, #1a3a52 100%)",
        padding: "20px",
        borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
      }}>
        <button
          onClick={() => navigate("/friends")}
          style={{
            background: "transparent",
            border: "none",
            color: "#D4AF37",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            fontSize: "1rem",
            padding: "8px",
            marginBottom: "16px"
          }}
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      {/* Profile Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px"
        }}
      >
        {/* Avatar */}
        <div style={{
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          border: "3px solid #D4AF37",
          overflow: "hidden",
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
        <div style={{
          textAlign: "center",
          color: "white"
        }}>
          <h2 style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "4px",
            color: "#D4AF37"
          }}>
            {user.nickname}
          </h2>
          <p style={{
            color: "#aaa",
            fontSize: "0.95rem",
            marginBottom: "12px"
          }}>
            @{user.username}
          </p>
          
          <LevelBadgeCompact level={userLevel} size="large" />
        </div>

        {/* Stats Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "16px",
          width: "100%",
          maxWidth: "400px"
        }}>
          {/* XP Card */}
          <div style={{
            background: "rgba(14, 22, 37, 0.6)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            borderRadius: "12px",
            padding: "16px",
            textAlign: "center"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginBottom: "8px"
            }}>
              <Trophy size={20} color="#D4AF37" />
              <span style={{ color: "#D4AF37", fontSize: "0.9rem", fontWeight: "600" }}>
                XP
              </span>
            </div>
            <p style={{
              color: "white",
              fontSize: "1.4rem",
              fontWeight: "bold"
            }}>
              {user.xp.toLocaleString()}
            </p>
          </div>

          {/* Streak Card */}
          <div style={{
            background: "rgba(14, 22, 37, 0.6)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "12px",
            padding: "16px",
            textAlign: "center"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginBottom: "8px"
            }}>
              <Flame size={20} color="#ef4444" />
              <span style={{ color: "#ef4444", fontSize: "0.9rem", fontWeight: "600" }}>
                Streak
              </span>
            </div>
            <p style={{
              color: "white",
              fontSize: "1.4rem",
              fontWeight: "bold"
            }}>
              {user.streak}
            </p>
          </div>
        </div>

        {/* Last Active */}
        <div style={{
          color: "#888",
          fontSize: "0.85rem",
          textAlign: "center"
        }}>
          Last active: {new Date(user.lastActive).toLocaleDateString()}
        </div>

        {/* Remove Friend Button */}
        {isUserFriend && (
          <motion.button
            onClick={handleRemoveFriend}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "12px",
              color: "#ef4444",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              marginTop: "16px"
            }}
          >
            <UserMinus size={18} />
            <span>Remove Friend</span>
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
