import React from "react";

export default function EditAvatarModal({ avatars, onSelect, onClose }) {
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
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {avatars.map((a, i) => (
          <img
            key={i}
            src={a}
            alt="avatar"
            onClick={() => onSelect(a)}
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              cursor: "pointer",
              border: "2px solid transparent",
            }}
          />
        ))}
      </div>
    </div>
  );
}
