import React, { useState } from "react";

export default function InviteFamilyMemberModal({ isOpen, onClose, onInvite }) {
  const [memberName, setMemberName] = useState("");

  if (!isOpen) return null;

  const handleInvite = () => {
    if (memberName.trim()) {
      onInvite(memberName.trim());
      setMemberName("");
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
          width: "320px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ color: "#D4AF37", marginBottom: "8px", fontSize: "1.3rem" }}>
          👨‍👩‍👧‍👦 Invite Family Member
        </h3>
        <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "20px" }}>
          Enter their name or email to send an invite
        </p>
        
        <input
          value={memberName}
          onChange={(e) => setMemberName(e.target.value)}
          placeholder="Name or email"
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid rgba(255,215,0,0.4)",
            background: "rgba(255,255,255,0.05)",
            color: "white",
            textAlign: "center",
            fontSize: "1rem",
            marginBottom: "20px",
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleInvite();
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
            onClick={handleInvite}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
              color: "#0B1E2D",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Send Invite
          </button>
        </div>
      </div>
    </div>
  );
}
