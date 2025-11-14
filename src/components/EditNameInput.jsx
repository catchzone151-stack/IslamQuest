import React, { useState } from "react";

export default function EditNameInput({ isOpen, onClose, currentName, onSave }) {
  const [name, setName] = useState(currentName || "");

  if (!isOpen) return null;

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#0B1E2D",
          padding: "24px",
          borderRadius: "16px",
          border: "2px solid rgba(212, 175, 55, 0.3)",
          textAlign: "center",
          maxWidth: "90%",
          width: "300px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ color: "#D4AF37", marginBottom: "16px" }}>Edit Name</h3>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid rgba(255,215,0,0.4)",
            background: "rgba(255,255,255,0.05)",
            color: "white",
            textAlign: "center",
            fontSize: "1rem",
            marginBottom: "16px",
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleSave();
          }}
        />
        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              background: "transparent",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              background: "#FFD700",
              color: "#0B1E2D",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
