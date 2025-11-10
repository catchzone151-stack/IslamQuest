import React from "react";

export default function ProfileCard({ name, level, avatar, xp }) {
  return (
    <div
      style={{
        textAlign: "center",
        background: "rgba(255,255,255,0.05)",
        borderRadius: "16px",
        padding: "20px",
        border: "1px solid rgba(255,215,0,0.2)",
        color: "white",
        width: "240px",
      }}
    >
      <img
        src={avatar}
        alt="avatar"
        style={{ width: "80px", height: "80px", borderRadius: "50%" }}
      />
      <h3 style={{ margin: "10px 0 4px" }}>{name}</h3>
      <p style={{ fontSize: "14px", opacity: 0.8 }}>Level {level}</p>
      <p style={{ color: "#FFD700", fontWeight: "bold" }}>{xp} XP</p>
    </div>
  );
}
