import React from "react";
import assets from "../assets/assets";
import { AVAILABLE_AVATARS } from "../utils/avatarUtils";

export default function EditAvatarModal({ isOpen, onClose, currentAvatar, onSave }) {
  if (!isOpen) return null;

  // 3 sections without labels
  const section1 = AVAILABLE_AVATARS.slice(0, 12).map(key => assets.avatars[key]);
  const section2 = AVAILABLE_AVATARS.slice(12, 25).map(key => assets.avatars[key]);
  const section3 = AVAILABLE_AVATARS.slice(25).map(key => assets.avatars[key]);

  const handleSelect = (avatar) => {
    // Extract avatar key from full path (e.g., "/src/assets/avatars/avatar_robot.png.webp" -> "avatar_robot")
    const key = avatar.split("/").pop().split(".")[0];
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
          maxWidth: "90vw",
          maxHeight: "80vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 80px)",
            gap: "10px",
            justifyContent: "center",
          }}
        >
          {section1.map((a, i) => (
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 80px)",
            gap: "10px",
            justifyContent: "center",
          }}
        >
          {section2.map((a, i) => (
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 80px)",
            gap: "10px",
            justifyContent: "center",
          }}
        >
          {section3.map((a, i) => (
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
    </div>
  );
}
