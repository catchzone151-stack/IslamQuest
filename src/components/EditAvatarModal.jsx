import React from "react";
import assets from "../assets/assets";

export default function EditAvatarModal({ isOpen, onClose, currentAvatar, onSave }) {
  if (!isOpen) return null;

  const avatarList = Object.values(assets.avatars);

  const handleSelect = (avatar) => {
    onSave(avatar);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#0a0a1a",
          border: "1px solid rgba(255,215,0,0.2)",
          padding: "20px",
          borderRadius: "12px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, 80px)",
          gap: "10px",
          maxWidth: "90vw",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {avatarList.map((a, i) => (
          <img
            key={i}
            src={a}
            alt="avatar"
            onClick={() => handleSelect(a)}
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              cursor: "pointer",
              border: currentAvatar === a ? "3px solid #FFD700" : "2px solid transparent",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              if (currentAvatar !== a) {
                e.target.style.border = "2px solid #FFD700";
              }
            }}
            onMouseOut={(e) => {
              if (currentAvatar !== a) {
                e.target.style.border = "2px solid transparent";
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
