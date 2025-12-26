// src/pages/Profile.jsx
import React from "react";
import ScreenContainer from "../components/ScreenContainer";
import { useNavigate } from "../hooks/useNavigate";
import { useUserStore } from "../store/useUserStore";
import { useProgressStore } from "../store/progressStore";
import { useModalStore, MODAL_TYPES } from "../store/modalStore";
import ProfileCard from "../components/ProfileCard";
import { getCurrentLevel, getXPProgress } from "../utils/diamondLevels";
import { LOCAL_VERSION, shouldShowUpdateBanner } from "../config/versionConfig";
import { getAvatarImage } from "../utils/avatarUtils";
import ui_xp from "../assets/ui/ui_xp.webp";
import ui_coin from "../assets/ui/ui_coin.webp";
import ui_streak from "../assets/ui/ui_streak.webp";
import ui_shield from "../assets/ui/ui_shield.webp";

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
  } = useProgressStore();
  
  const { showModal } = useModalStore();

  const currentLevel = getCurrentLevel(xp);
  const xpProgress = getXPProgress(xp);
  const progress = xpProgress.percentage;
  
  const avatarImage = avatar ? getAvatarImage(avatar, { userId }) : "/default-avatar.png";

  return (
    <ScreenContainer>
      <div
        style={{
          textAlign: "center",
          padding: "16px 16px 90px",
          color: "white",
        }}
      >
        {/* === Header === */}
        <h1
          style={{
            fontSize: "1.4rem",
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

        {/* === Avatar + Name + Level Header === */}
        <div style={{ 
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          maxWidth: 380,
          margin: "16px auto 0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
                flexShrink: 0,
              }}
            >
              <img
                src={avatarImage}
                alt="Avatar"
                loading="eager"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  border: "2px solid #FFD700",
                  objectFit: "contain",
                }}
              />
            </button>

            <div style={{ textAlign: "left" }}>
              <h2
                onClick={() => showModal(MODAL_TYPES.EDIT_NAME, {
                  initialName: name,
                  onSave: setName
                })}
                style={{
                  cursor: "pointer",
                  fontSize: "1.1rem",
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
                  margin: 0,
                }}>
                  @{handle}
                </p>
              )}
            </div>
          </div>

          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: currentLevel.color || "#FFD700",
            }}>
              Level {currentLevel.level}
            </div>
            <div style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.7)" }}>
              {xp.toLocaleString()} XP
            </div>
          </div>
        </div>

        {/* === XP Progress Bar === */}
        <div
          style={{
            width: "85%",
            maxWidth: 380,
            margin: "12px auto 0",
            background: "rgba(255,255,255,0.1)",
            borderRadius: 8,
            overflow: "hidden",
            height: 10,
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
        {xpProgress.nextLevel && (
          <p style={{
            margin: "4px 0 0",
            fontSize: "0.75rem",
            color: "rgba(212, 175, 55, 0.6)",
          }}>
            {xpProgress.currentLevelXP.toLocaleString()}/{xpProgress.requiredDelta.toLocaleString()} to Level {xpProgress.nextLevel.level}
          </p>
        )}

        {/* === Stats cards === */}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 16,
          }}
        >
          <ProfileCard icon={ui_xp} label="XP" value={xp} />
          <ProfileCard icon={ui_coin} label="Coins" value={coins} color="#FFA500" />
          <ProfileCard icon={ui_streak} label="Streak" value={`${streak} 🔥`} color="#FF6347" />
          <ProfileCard icon={ui_shield} label="Shields" value={`${shieldCount}/3 🛡️`} color="#4fd5ff" />
        </div>

        {/* === Action Buttons Row === */}
        <div style={{
          display: "flex",
          gap: 8,
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: 14,
          maxWidth: 400,
          margin: "14px auto 0",
        }}>
          <button
            onClick={() => showModal(MODAL_TYPES.VIEW_ALL_LEVELS, { currentXP: xp })}
            style={{
              background: "linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(244, 208, 63, 0.1) 100%)",
              border: "1px solid rgba(212, 175, 55, 0.4)",
              borderRadius: 10,
              padding: "8px 14px",
              color: "#D4AF37",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            View Levels
          </button>
          <button
            onClick={() => showModal(MODAL_TYPES.PURCHASE_STREAK_FREEZE)}
            style={{
              background: "linear-gradient(135deg, rgba(79, 213, 255, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)",
              border: "1px solid rgba(79, 213, 255, 0.4)",
              borderRadius: 10,
              padding: "8px 14px",
              color: "#4fd5ff",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>🛡️</span>
            <span>Add Freeze</span>
          </button>
        </div>

        {/* === Update Banner === */}
        {shouldShowUpdateBanner() && (
          <div
            style={{
              maxWidth: 380,
              margin: "14px auto 0",
              padding: "12px",
              background: "linear-gradient(135deg, rgba(79, 213, 255, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)",
              border: "1px solid rgba(79, 213, 255, 0.4)",
              borderRadius: 10,
              color: "#4fd5ff",
              fontSize: "0.9rem",
              fontWeight: "600",
            }}
          >
            ✨ New update available!
          </div>
        )}

        {/* === Premium Section === */}
        <div
          style={{
            maxWidth: 380,
            margin: "16px auto 0",
            padding: 14,
            background: "rgba(255, 215, 0, 0.05)",
            border: "1px solid rgba(255, 215, 0, 0.2)",
            borderRadius: 12,
          }}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: premiumStatus === "free" ? 12 : 0,
          }}>
            <span style={{ color: "#FFD700", fontSize: "1rem", fontWeight: 700 }}>
              Premium Status
            </span>
            <span style={{
              color: "#FFD700",
              fontSize: "0.95rem",
              fontWeight: 600,
            }}>
              {premiumStatus === "free" ? "Free 🆓" : "Premium ⭐"}
            </span>
          </div>

          {premiumStatus === "free" && (
            <button
              onClick={() => showModal(MODAL_TYPES.PURCHASE)}
              style={{
                background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                color: "#111827",
                border: "none",
                borderRadius: 10,
                padding: "10px 20px",
                fontSize: "0.9rem",
                fontWeight: 700,
                width: "100%",
                cursor: "pointer",
                boxShadow: "0 3px 10px rgba(255, 215, 0, 0.3)",
              }}
            >
              ⭐ Upgrade to Premium
            </button>
          )}
        </div>

        {/* === Settings Button === */}
        <button
          onClick={() => navigate("/settings")}
          style={{
            background: "linear-gradient(135deg, rgba(79, 213, 255, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%)",
            border: "1px solid rgba(79, 213, 255, 0.3)",
            borderRadius: 10,
            padding: "10px 20px",
            color: "#4fd5ff",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "0.9rem",
            margin: "14px auto 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            maxWidth: 380,
            width: "100%",
          }}
        >
          <span>⚙️</span>
          <span>Settings</span>
        </button>

        {/* === Version === */}
        <div
          style={{
            marginTop: 12,
            fontSize: "0.7rem",
            color: "rgba(255,255,255,0.35)",
          }}
        >
          Version {LOCAL_VERSION}
        </div>

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
