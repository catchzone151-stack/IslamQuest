// src/pages/Profile.jsx
import React, { useState } from "react";
import ScreenContainer from "../components/ScreenContainer";
import { useUserStore } from "../store/useUserStore";
import { useProgressStore } from "../store/progressStore";
import ProfileCard from "../components/ProfileCard";
import EditNameInput from "../components/EditNameInput";
import EditAvatarModal from "../components/EditAvatarModal";
import { LevelBadge } from "../components/LevelBadge";
import { ViewAllLevelsModal } from "../components/ViewAllLevelsModal";
import { getCurrentLevel, getXPProgress } from "../utils/diamondLevels";

export default function Profile() {
  const { name, avatar, setName, setAvatar } = useUserStore();
  const { xp, coins, streak } = useProgressStore();

  const [showEditName, setShowEditName] = useState(false);
  const [showEditAvatar, setShowEditAvatar] = useState(false);
  const [showAllLevels, setShowAllLevels] = useState(false);

  const currentLevel = getCurrentLevel(xp);
  const xpProgress = getXPProgress(xp);
  const progress = xpProgress.percentage;

  return (
    <ScreenContainer>
      <div
        style={{
          textAlign: "center",
          padding: "clamp(20px, 6vw, 40px) 20px 100px",
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
            onClick={() => setShowEditAvatar(true)}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            <img
              src={avatar || "/default-avatar.png"}
              alt="Avatar"
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
              onClick={() => setShowEditName(true)}
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
          onClick={() => setShowAllLevels(true)}
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
          }}
        >
          <ProfileCard icon="/src/assets/icons/xp.png" label="XP" value={xp} />
          <ProfileCard
            icon="/src/assets/icons/coin.png"
            label="Coins"
            value={coins}
            color="#FFA500"
          />
          <ProfileCard
            icon="/src/assets/icons/streak.png"
            label="Streak"
            value={`${streak} 🔥`}
            color="#FF6347"
          />
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

      {/* === Modals === */}
      <EditNameInput
        isOpen={showEditName}
        onClose={() => setShowEditName(false)}
        currentName={name}
        onSave={setName}
      />

      <EditAvatarModal
        isOpen={showEditAvatar}
        onClose={() => setShowEditAvatar(false)}
        currentAvatar={avatar}
        onSave={setAvatar}
      />

      {showAllLevels && (
        <ViewAllLevelsModal
          currentXP={xp}
          onClose={() => setShowAllLevels(false)}
        />
      )}
    </ScreenContainer>
  );
}
