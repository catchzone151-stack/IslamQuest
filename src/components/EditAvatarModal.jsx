import React from "react";
import assets from "../assets/assets";
import { AVAILABLE_AVATARS } from "../utils/avatarUtils";

export default function EditAvatarModal({ isOpen, onClose, currentAvatar, onSave }) {
  if (!isOpen) return null;

  // Create array of {key, src} pairs for selection
  const avatarData = AVAILABLE_AVATARS.map(key => ({ key, src: assets.avatars[key] })).filter(item => item.src);

  const handleSelect = (key) => {
    onSave(key);
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
          gridTemplateColumns: "repeat(3, 80px)",
          gap: "10px",
          justifyContent: "center",
          maxWidth: "90vw",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {avatarData.map(({ key, src }) => (
          <img
            key={key}
            src={src}
            alt="avatar"
            onClick={() => handleSelect(key)}
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              cursor: "pointer",
              border: currentAvatar === key ? "3px solid #FFD700" : "2px solid transparent",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              if (currentAvatar !== key) {
                e.target.style.border = "2px solid #FFD700";
              }
            }}
            onMouseOut={(e) => {
              if (currentAvatar !== key) {
                e.target.style.border = "2px solid transparent";
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
