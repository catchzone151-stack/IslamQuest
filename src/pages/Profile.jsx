// src/pages/Profile.jsx
import React from "react";
import ScreenContainer from "../components/ScreenContainer";
import { useNavigate } from "../hooks/useNavigate";
import { useUserStore } from "../store/useUserStore";
import { useProgressStore } from "../store/progressStore";
import { useModalStore, MODAL_TYPES } from "../store/modalStore";
import ProfileCard from "../components/ProfileCard";
import { getCurrentLevel, getXPProgress } from "../utils/diamondLevels";
import { shouldShowUpdateBanner } from "../config/versionConfig";
import { getAvatarImage } from "../utils/avatarUtils";
import ui_xp from "../assets/ui/ui_xp.webp";
import ui_coin from "../assets/ui/ui_coin.webp";
import ui_streak from "../assets/ui/ui_streak.webp";
import ui_shield from "../assets/ui/ui_shield.webp";
import mascotSitting from "../assets/mascots/mascot_sitting.webp";

// Extract avatar key from full path (e.g., "/src/assets/avatars/avatar_robot.png.webp" -> "avatar_robot")
const extractAvatarKey = (path) => {
  if (!path) return null;
  const file = path.split("/").pop();
  return file.split(".")[0];
};

export default function Profile() {
  const navigate = useNavigate();
  const { id: userId, name, avatar, handle, setName, setAvatar } = useUserStore();
  const { 
    xp, 
    coins, 
    streak, 
    shieldCount,
    premiumStatus,
    vibrationEnabled,
    setVibrationEnabled,
    purchaseIndividual,
  } = useProgressStore();
  
  const { showModal } = useModalStore();

  const currentLevel = getCurrentLevel(xp);
  const xpProgress = getXPProgress(xp);
  const progress = xpProgress.percentage;
  
  // Get the avatar image path from the stored key
  const avatarImage = avatar ? getAvatarImage(avatar, { userId }) : "/default-avatar.png";

  return (
    <ScreenContainer>
      <div
        style={{
          textAlign: "center",
          padding: "clamp(20px, 6vw, 40px) 20px 20px",
          color: "white",
        }}
      >
        {/* === Header === */}
        <h1
          style={{
            fontSize: "clamp(1.3rem, 5vw, 1.8rem)",
            fontWeight: 800,
            margin: 0,
            background: "linear-gradient(90deg, #FFD700, #FFA500, #FFD700)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundSize: "200%",
            animation: "shimmer 8s linear infinite",
          }}
        >
          My Profile
        </h1>
        <p style={{ opacity: 0.9, marginTop: 8 }}>
          Review your XP, coins, and progress
        </p>

        {/* === Avatar (centered, larger) === */}
        <div style={{ marginTop: 24 }}>
          <button
            onClick={() => showModal(MODAL_TYPES.EDIT_AVATAR, {
              currentAvatar: avatar,
              onSave: (selectedAvatar) => setAvatar(extractAvatarKey(selectedAvatar))
            })}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <img
              src={avatarImage}
              alt="Avatar"
              loading="eager"
              style={{
                width: 110,
                height: 110,
                borderRadius: "50%",
                border: "3px solid #FFD700",
                objectFit: "contain",
              }}
            />
          </button>
        </div>

        {/* === Name/Handle (left) + Level/Progress (right) === */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginTop: 24,
          maxWidth: 340,
          margin: "24px auto 0",
          padding: "0 8px",
        }}>
          {/* Left: Name + Handle */}
          <div style={{ textAlign: "left" }}>
            <h2
              onClick={() => showModal(MODAL_TYPES.EDIT_NAME, {
                initialName: name,
                onSave: setName
              })}
              style={{
                cursor: "pointer",
                fontSize: "1.2rem",
                fontWeight: 600,
                color: "#FFD700",
                margin: 0,
              }}
            >
              {name || "Explorer"}
            </h2>
            {handle && (
              <p style={{
                color: "rgba(255, 255, 255, 0.5)",
                fontSize: "0.8rem",
                margin: "2px 0 0",
              }}>
                @{handle}
              </p>
            )}
          </div>

          {/* Right: Level + Progress Bar */}
          <div style={{ textAlign: "right" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 6,
              marginBottom: 6,
            }}>
              <span style={{
                fontSize: "1.2rem",
                fontWeight: 600,
                color: currentLevel.color || "#FFD700",
              }}>
                Level {currentLevel.level}
              </span>
              <button
                onClick={() => showModal(MODAL_TYPES.VIEW_ALL_LEVELS, { currentXP: xp })}
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "none",
                  borderRadius: "50%",
                  width: 18,
                  height: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <span style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "rgba(255, 255, 255, 0.6)",
                }}>?</span>
              </button>
            </div>
            <div
              style={{
                width: 100,
                background: "rgba(255,255,255,0.1)",
                borderRadius: 6,
                overflow: "hidden",
                height: 6,
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: currentLevel.gradient,
                  boxShadow: currentLevel.glow,
                  transition: "width 0.6s ease",
                }}
              />
            </div>
            <div style={{
              fontSize: "0.65rem",
              color: "rgba(212, 175, 55, 0.6)",
              marginTop: 3,
            }}>
              {xpProgress.currentLevelXP.toLocaleString()} / {xpProgress.requiredDelta.toLocaleString()} XP
            </div>
          </div>
        </div>

        {/* === Stats cards (2x2 grid) === */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, auto)",
            gap: 8,
            justifyContent: "center",
            margin: "20px auto 0",
          }}
        >
          <ProfileCard icon={ui_xp} label="XP" value={xp} />
          <ProfileCard
            icon={ui_coin}
            label="Coins"
            value={coins}
            color="#FFA500"
          />
          <ProfileCard
            icon={ui_streak}
            label="Streak"
            value={`${streak} 🔥`}
            color="#FF6347"
          />
          <ProfileCard
            icon={ui_shield}
            label="Shields"
            value={`${shieldCount}/3 🛡️`}
            color="#4fd5ff"
          />
        </div>

        {/* === Add Freeze Button === */}
        <button
          onClick={() => showModal(MODAL_TYPES.PURCHASE_STREAK_FREEZE)}
          style={{
            background: "linear-gradient(135deg, rgba(79, 213, 255, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)",
            border: "1px solid rgba(79, 213, 255, 0.4)",
            borderRadius: 12,
            padding: "12px 24px",
            color: "#4fd5ff",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "0.95rem",
            marginTop: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            margin: "20px auto 0",
          }}
        >
          <span>🛡️</span>
          <span>Add Streak Freeze</span>
        </button>

        {/* === Update Banner === */}
        {shouldShowUpdateBanner() && (
          <div
            style={{
              maxWidth: 400,
              margin: "20px auto 0",
              padding: "16px",
              background: "linear-gradient(135deg, rgba(79, 213, 255, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)",
              border: "1px solid rgba(79, 213, 255, 0.4)",
              borderRadius: 12,
              color: "#4fd5ff",
              fontSize: "0.95rem",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            ✨ New update available!
          </div>
        )}

        {/* === Premium Section === */}
        <div
          style={{
            maxWidth: 340,
            margin: "24px auto 0",
            padding: 16,
            background: "rgba(255, 215, 0, 0.05)",
            border: "1px solid rgba(255, 215, 0, 0.2)",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <img
            src={mascotSitting}
            alt="Zayd"
            style={{
              width: 56,
              height: 56,
              objectFit: "contain",
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ color: "#FFD700", fontSize: "1rem", fontWeight: 600, marginBottom: 2 }}>
              {premiumStatus === "free" ? "Free Plan" : "Premium Plan"}
            </div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", lineHeight: 1.4 }}>
              {premiumStatus === "free" 
                ? "Unlock all lessons and features" 
                : "You have full access to everything"}
            </div>
          </div>
          {premiumStatus === "free" && (
            <button
              onClick={() => showModal(MODAL_TYPES.PURCHASE)}
              style={{
                background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                color: "#111827",
                border: "none",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              Upgrade
            </button>
          )}
        </div>

        {/* === Settings Button === */}
        <button
          onClick={() => navigate("/settings")}
          style={{
            background: "linear-gradient(135deg, rgba(79, 213, 255, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%)",
            border: "1px solid rgba(79, 213, 255, 0.3)",
            borderRadius: 12,
            padding: "14px 24px",
            color: "#4fd5ff",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "0.95rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            margin: "16px auto 0",
            maxWidth: 340,
            width: "100%",
          }}
        >
          <span>⚙️</span>
          <span>Settings</span>
        </button>

        {/* === Rate App Button === */}
        <button
          onClick={() => {
            import("../services/rateAppService").then(({ openRateApp }) => openRateApp());
          }}
          style={{
            background: "linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(244, 208, 63, 0.1) 100%)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            borderRadius: 12,
            padding: "14px 24px",
            color: "#d4af37",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "0.95rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            margin: "12px auto 0",
            maxWidth: 340,
            width: "100%",
          }}
        >
          <span>⭐</span>
          <span>Rate this App</span>
        </button>

        <style>
          {`
            @keyframes shimmer {
              0% { background-position: 0% 50%; }
              100% { background-position: 200% 50%; }
            }
          `}
        </style>
      </div>
    </ScreenContainer>
  );
}
