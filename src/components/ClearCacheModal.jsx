import React from "react";
import ModalBase from "./ModalBase";
import assets from "../assets/assets";

export default function ClearCacheModal({ onClose, onConfirm }) {
  const handleClear = () => {
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Show success and close
    alert("✅ Cache cleared! Your app has been reset.");
    onConfirm?.();
    onClose();
  };

  return (
    <ModalBase 
      title="Clear Cache?"
      onClose={onClose}
      showMascot={assets.mascots.mascot_sitting}
      mascotAnimation="float"
    >
      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <p style={{ marginBottom: "16px", fontSize: "0.95rem", color: "#e2e8f0" }}>
          This will reset:
        </p>
        <ul style={{
          textAlign: "left",
          maxWidth: "280px",
          margin: "0 auto 24px",
          fontSize: "0.9rem",
          color: "#cbd5e1",
          lineHeight: "1.8",
          listStyle: "none",
          padding: 0
        }}>
          <li>✓ All progress and lessons</li>
          <li>✓ XP, coins, and streaks</li>
          <li>✓ Friends and challenges</li>
          <li>✓ Settings and preferences</li>
        </ul>

        <p style={{
          fontSize: "0.85rem",
          opacity: 0.7,
          color: "#ef4444",
          marginBottom: "24px"
        }}>
          ⚠️ This action cannot be undone!
        </p>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px 20px",
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "12px",
              color: "white",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "0.95rem"
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleClear}
            style={{
              flex: 1,
              padding: "12px 20px",
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              border: "none",
              borderRadius: "12px",
              color: "white",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "0.95rem",
              boxShadow: "0 4px 15px rgba(239, 68, 68, 0.3)"
            }}
          >
            Clear Cache
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
