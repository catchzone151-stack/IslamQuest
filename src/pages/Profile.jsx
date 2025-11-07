// src/pages/Profile.jsx
import React, { useState } from "react";
import ScreenContainer from "../components/ScreenContainer";
import { useUserStore } from "../store/useUserStore";
import { useProgressStore } from "../store/progressStore";
import ProfileCard from "../components/ProfileCard";
import EditNameInput from "../components/EditNameInput";
import EditAvatarModal from "../components/EditAvatarModal";
import LevelDetailModal from "../components/LevelDetailModal";
import TitleDisplay from "../components/TitleDisplay";
import TitleListModal from "../components/TitleListModal";

export default function Profile() {
  const { name, avatar, setName, setAvatar } = useUserStore();
  const { xp, coins, streak } = useProgressStore();

  const [showEditName, setShowEditName] = useState(false);
  const [showEditAvatar, setShowEditAvatar] = useState(false);
  const [showLevelDetail, setShowLevelDetail] = useState(false);
  const [showTitles, setShowTitles] = useState(false);

  const level = Math.floor(xp / 500) + 1;
  const nextLevelXP = level * 500;
  const progress = Math.min((xp / nextLevelXP) * 100, 100);

  return (
    <ScreenContainer>
      <div
        style={{
          textAlign: "center",
          padding: "40px 20px 100px",
          color: "white",
        }}
      >
        {/* === Header === */}
        <h1
          style={{
            fontSize: "1.8rem",
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
            <p
              onClick={() => setShowLevelDetail(true)}
              style={{
                marginTop: 4,
                opacity: 0.85,
                cursor: "pointer",
              }}
            >
              Level {level} • {xp} XP
            </p>

            {/* === Title Section === */}
            <TitleDisplay onViewAll={() => setShowTitles(true)} />
          </div>
        </div>

        {/* === XP Progress Bar === */}
        <div
          style={{
            width: "80%",
            maxWidth: 350,
            margin: "16px auto 26px",
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
              background: "linear-gradient(90deg,#FFD700,#FFA500)",
              transition: "width 0.6s ease",
            }}
          />
        </div>

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

      <LevelDetailModal
        isOpen={showLevelDetail}
        onClose={() => setShowLevelDetail(false)}
        currentXP={xp}
        level={level}
        nextLevelXP={nextLevelXP}
      />

      <TitleListModal
        isOpen={showTitles}
        onClose={() => setShowTitles(false)}
      />
    </ScreenContainer>
  );
}
