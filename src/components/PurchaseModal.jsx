import React from "react";

export default function PurchaseModal({ onClose, onPurchase }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          background: "#0b132b",
          border: "2px solid #FFD700",
          borderRadius: "18px",
          padding: "28px 24px",
          width: "90%",
          maxWidth: "360px",
          color: "white",
          textAlign: "center",
          boxShadow: "0 0 25px rgba(255,215,0,0.3)",
        }}
      >
        <h2
          style={{
            color: "#FFD700",
            fontSize: "1.4rem",
            marginBottom: "10px",
          }}
        >
          Unlock All Lessons
        </h2>
        <p style={{ marginBottom: "24px", color: "#cbd5e1", fontSize: "0.95rem" }}>
          Get lifetime access to all 14 learning paths.
        </p>

        <button
          onClick={() => onPurchase("individual")}
          style={{
            backgroundColor: "#FFD700",
            color: "#111827",
            fontWeight: 700,
            border: "none",
            borderRadius: "12px",
            padding: "12px 24px",
            marginBottom: "10px",
            width: "100%",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Individual Plan (placeholder)
        </button>

        <button
          onClick={() => onPurchase("family")}
          style={{
            backgroundColor: "#4B5563",
            color: "#fff",
            fontWeight: 700,
            border: "none",
            borderRadius: "12px",
            padding: "12px 24px",
            marginBottom: "16px",
            width: "100%",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Family Plan (placeholder)
        </button>

        <button
          onClick={onClose}
          style={{
            backgroundColor: "transparent",
            color: "#6B7280",
            border: "none",
            cursor: "pointer",
            fontSize: "0.85rem",
            marginBottom: "10px",
            textDecoration: "underline",
          }}
        >
          Restore Purchase
        </button>

        <button
          onClick={onClose}
          style={{
            backgroundColor: "transparent",
            color: "#9CA3AF",
            border: "none",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          Not Now
        </button>
      </div>
    </div>
  );
}
