import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "../hooks/useNavigate";
import { useFriendsStore } from "../store/friendsStore";
import { useModalStore, MODAL_TYPES } from "../store/modalStore";
import { motion } from "framer-motion";
import { ArrowLeft, UserMinus, Trophy, Flame, Coins, Shield } from "lucide-react";
import { LevelBadgeCompact } from "../components/LevelBadge";
import { getAvatarImage } from "../utils/avatarUtils";
import { getCurrentLevel } from "../utils/diamondLevels";

export default function FriendProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { getProfileById, removeFriend, isFriend } = useFriendsStore();
  const { showModal } = useModalStore();

  const [user, setUser] = useState(null);
  const [isUserFriend, setIsUserFriend] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const profile = await getProfileById(userId);
        setUser(profile);
        setIsUserFriend(isFriend(userId));
      } catch (err) {
        console.warn("Failed to load profile:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId, getProfileById, isFriend]);

  const handleRemoveFriend = () => {
    showModal(MODAL_TYPES.CONFIRM, {
      title: "Remove Friend?",
      message: `Are you sure you want to remove ${user.username || user.handle || "this user"} from your friends?`,
      confirmText: "Remove",
      cancelText: "Cancel",
      onConfirm: async () => {
        const result = await removeFriend(userId);
        if (result.success) {
          showModal(MODAL_TYPES.SUCCESS, {
            message: result.message,
            onClose: () => navigate("/friends"),
          });
        } else {
          showModal(MODAL_TYPES.ERROR, {
            message: result.error,
          });
        }
      },
    });
  };

  if (loading) {
    return (
      <div
        className="screen no-extra-space"
        style={{
          background: "#0B1E2D",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          minHeight: "100vh",
        }}
      >
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="screen no-extra-space"
        style={{
          background: "#0B1E2D",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          minHeight: "100vh",
          gap: "16px",
        }}
      >
        <p>User not found</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/friends")}
          style={{
            padding: "12px 24px",
            background: "#D4AF37",
            color: "#0A1A2F",
            border: "none",
            borderRadius: "12px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Back to Friends
        </motion.button>
      </div>
    );
  }

  const userLevel = getCurrentLevel(user.xp || 0);
  const avatarSrc = getAvatarImage(user.avatar, {
    userId: user.user_id || user.id,
    nickname: user.nickname || user.username,
  });
  const displayName = user.username || user.handle || user.nickname || "User";

  return (
    <div
      className="screen no-extra-space"
      style={{
        background: "#0B1E2D",
        minHeight: "100vh",
        paddingBottom: "80px",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #0B1E2D 0%, #1a3a52 100%)",
          padding: "20px",
          borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
        }}
      >
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
            marginBottom: "16px",
          }}
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
        }}
      >
        <div
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            border: "3px solid #D4AF37",
            overflow: "hidden",
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

        <div
          style={{
            textAlign: "center",
            color: "white",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "4px",
              color: "#D4AF37",
            }}
          >
            {displayName}
          </h2>
          {user.handle && (
            <p
              style={{
                color: "#aaa",
                fontSize: "0.95rem",
                marginBottom: "12px",
              }}
            >
              @{user.handle}
            </p>
          )}

          <LevelBadgeCompact level={userLevel} size="large" />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <div
            style={{
              background: "rgba(14, 22, 37, 0.6)",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              borderRadius: "12px",
              padding: "16px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <Trophy size={20} color="#D4AF37" />
              <span
                style={{
                  color: "#D4AF37",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                }}
              >
                XP
              </span>
            </div>
            <p
              style={{
                color: "white",
                fontSize: "1.4rem",
                fontWeight: "bold",
              }}
            >
              {(user.xp || 0).toLocaleString()}
            </p>
          </div>

          <div
            style={{
              background: "rgba(14, 22, 37, 0.6)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "12px",
              padding: "16px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <Flame size={20} color="#ef4444" />
              <span
                style={{
                  color: "#ef4444",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                }}
              >
                Streak
              </span>
            </div>
            <p
              style={{
                color: "white",
                fontSize: "1.4rem",
                fontWeight: "bold",
              }}
            >
              {user.streak || 0}
            </p>
          </div>

          <div
            style={{
              background: "rgba(14, 22, 37, 0.6)",
              border: "1px solid rgba(234, 179, 8, 0.3)",
              borderRadius: "12px",
              padding: "16px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <Coins size={20} color="#eab308" />
              <span
                style={{
                  color: "#eab308",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                }}
              >
                Coins
              </span>
            </div>
            <p
              style={{
                color: "white",
                fontSize: "1.4rem",
                fontWeight: "bold",
              }}
            >
              {(user.coins || 0).toLocaleString()}
            </p>
          </div>

          <div
            style={{
              background: "rgba(14, 22, 37, 0.6)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              borderRadius: "12px",
              padding: "16px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <Shield size={20} color="#3b82f6" />
              <span
                style={{
                  color: "#3b82f6",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                }}
              >
                Shields
              </span>
            </div>
            <p
              style={{
                color: "white",
                fontSize: "1.4rem",
                fontWeight: "bold",
              }}
            >
              {user.shield_count || 0}
            </p>
          </div>
        </div>

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
              marginTop: "16px",
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
