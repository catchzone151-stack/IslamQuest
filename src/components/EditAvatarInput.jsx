import React from "react";

export default function EditAvatarInput({ avatar, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        textAlign: "center",
        cursor: "pointer",
        margin: "10px auto",
      }}
    >
      <img
        src={avatar}
        alt="avatar"
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          border: "2px solid #FFD700",
        }}
      />
      <p style={{ color: "#FFD700", marginTop: "6px" }}>Change Avatar</p>
    </div>
  );
}
