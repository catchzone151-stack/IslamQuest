// src/pages/Profile.jsx
import React from "react";
import ScreenContainer from "../components/ScreenContainer";
import { useNavigate } from "../hooks/useNavigate";
import { useUserStore } from "../store/useUserStore";
import { useProgressStore } from "../store/progressStore";
import { useModalStore, MODAL_TYPES } from "../store/modalStore";
import ProfileCard from "../components/ProfileCard";
import { LevelBadge } from "../components/LevelBadge";
import { getCurrentLevel, getXPProgress } from "../utils/diamondLevels";
import { LOCAL_VERSION, shouldShowUpdateBanner } from "../config/versionConfig";
import { getAvatarImage } from "../utils/avatarUtils";
import ui_xp from "../assets/ui/ui_xp.webp";
import ui_coin from "../assets/ui/ui_coin.webp";
import ui_streak from "../assets/ui/ui_streak.webp";
import ui_shield from "../assets/ui/ui_shield.webp";

// Extract avatar key from full path (e.g., "/src/assets/avatars/avatar_robot.png.webp" -> "avatar_robot")
const extractAvatarKey = (path) => {
  if (!path) return null;
  const file = path.split("/").pop();
  return file.split(".")[0];
};

export default function Profile() {
  const navigate = useNavigate();
  const { id: userId, name, avatar, setName, setAvatar } = useUserStore();
  const { 
    xp, 
    coins, 
    streak, 
    shieldCount,
    premiumStatus,
    familyMembers,
    vibrationEnabled,
    setVibrationEnabled,
    purchaseIndividual,
    purchaseFamily,
    addFamilyMember,
    removeFamilyMember,
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
          padding: "clamp(20px, 6vw, 40px) 20px 90px",
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
          Review your XP, coins, and progress 🌙
        </p>

        {/* === Avatar + Nickname === */}
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
            }}
          >
            <img
              src={avatarImage}
              alt="Avatar"
              loading="eager"
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                border: "3px solid #FFD700",
                objectFit: "cover",
              }}
            />
          </button>

          <div style={{ marginTop: 12 }}>
            <h2
              onClick={() => showModal(MODAL_TYPES.EDIT_NAME, {
                initialName: name,
                onSave: setName
              })}
              style={{
                cursor: "pointer",
                fontSize: "1.3rem",
                fontWeight: 600,
                color: "#FFD700",
              }}
            >
              {name || "Explorer"}
            </h2>
            
            {/* 💎 Diamond Level Badge */}
            <div 
              style={{ 
                marginTop: 16,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <LevelBadge
                xp={xp}
                size="large"
                showXP={true}
                animated={false}
              />
            </div>

            {/* XP Progress Info */}
            {xpProgress.nextLevel && (
              <p style={{
                marginTop: 8,
                color: "rgba(212, 175, 55, 0.7)",
                fontSize: "0.85rem",
              }}>
                {xpProgress.currentLevelXP.toLocaleString()} / {xpProgress.requiredDelta.toLocaleString()} XP to Level {xpProgress.nextLevel.level}
              </p>
            )}
          </div>
        </div>

        {/* === XP Progress Bar === */}
        <div
          style={{
            width: "80%",
            maxWidth: 350,
            margin: "16px auto 8px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: 12,
            overflow: "hidden",
            height: 14,
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

        {/* View All Levels Button */}
        <button
          onClick={() => showModal(MODAL_TYPES.VIEW_ALL_LEVELS, { currentXP: xp })}
          style={{
            background: "linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(244, 208, 63, 0.1) 100%)",
            border: "1px solid rgba(212, 175, 55, 0.4)",
            borderRadius: 12,
            padding: "10px 20px",
            color: "#D4AF37",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "0.9rem",
            marginTop: 12,
          }}
        >
          💎 View All Levels
        </button>

        {/* === Stats cards === */}
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 20,
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
            marginTop: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            margin: "20px auto 0",
            maxWidth: 400,
            width: "100%",
          }}
        >
          <span>⚙️</span>
          <span>Settings</span>
        </button>

        {/* === Version Display (kept for logging) === */}
        <div
          style={{
            marginTop: 20,
            fontSize: "0.75rem",
            color: "rgba(255,255,255,0.4)",
            textAlign: "center",
          }}
        >
          Version {LOCAL_VERSION}
        </div>

        {/* === Premium Section === */}
        <div
          style={{
            maxWidth: 400,
            margin: "32px auto 0",
            padding: 20,
            background: "rgba(255, 215, 0, 0.05)",
            border: "1px solid rgba(255, 215, 0, 0.2)",
            borderRadius: 16,
          }}
        >
          <h3
            style={{
              color: "#FFD700",
              fontSize: "1.2rem",
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            💳 Premium Status
          </h3>

          {/* Current Plan */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              padding: 16,
              borderRadius: 12,
              marginBottom: 16,
            }}
          >
            <div style={{ color: "#cbd5e1", fontSize: "0.9rem", marginBottom: 8 }}>
              Current Plan:
            </div>
            <div
              style={{
                color: "#FFD700",
                fontSize: "1.1rem",
                fontWeight: 700,
                textTransform: "capitalize",
              }}
            >
              {premiumStatus === "free" ? "Free 🆓" : premiumStatus === "individual" ? "Individual ⭐" : "Family 👨‍👩‍👧‍👦"}
            </div>
          </div>

          {/* Upgrade Button - Only show for free users */}
          {premiumStatus === "free" && (
            <button
              onClick={() => showModal(MODAL_TYPES.PURCHASE)}
              style={{
                background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                color: "#111827",
                border: "none",
                borderRadius: 12,
                padding: "14px 24px",
                fontSize: "1rem",
                fontWeight: 700,
                width: "100%",
                cursor: "pointer",
                marginBottom: 16,
                boxShadow: "0 4px 12px rgba(255, 215, 0, 0.3)",
              }}
            >
              ⭐ Upgrade to Premium
            </button>
          )}

          {/* Family Members (only show if family plan) */}
          {premiumStatus === "family" && (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                padding: 16,
                borderRadius: 12,
              }}
            >
              <h4
                style={{
                  color: "#cbd5e1",
                  fontSize: "1rem",
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                Family Members ({familyMembers.length}/5)
              </h4>

              {familyMembers.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: 12 }}>
                  No family members yet. Invite up to 5 members!
                </p>
              ) : (
                <div style={{ marginBottom: 12 }}>
                  {familyMembers.map((member) => (
                    <div
                      key={member.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: 10,
                        background: "rgba(255, 255, 255, 0.05)",
                        borderRadius: 8,
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "#4B5563",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1rem",
                          }}
                        >
                          👤
                        </div>
                        <span style={{ color: "#fff", fontSize: "0.9rem" }}>
                          {member.name}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm(`Remove ${member.name} from your family plan?`)) {
                            removeFamilyMember(member.id);
                          }
                        }}
                        style={{
                          background: "transparent",
                          border: "1px solid rgba(239, 68, 68, 0.5)",
                          color: "#ef4444",
                          padding: "4px 12px",
                          borderRadius: 6,
                          fontSize: "0.75rem",
                          cursor: "pointer",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Invite Button */}
              {familyMembers.length < 5 && (
                <button
                  onClick={() => showModal(MODAL_TYPES.INVITE_FAMILY)}
                  style={{
                    background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                    color: "#111827",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 16px",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    width: "100%",
                    cursor: "pointer",
                  }}
                >
                  + Invite Member
                </button>
              )}
            </div>
          )}
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
