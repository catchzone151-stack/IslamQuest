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
          Continue Your Journey
        </h2>
        <p style={{ marginBottom: "18px" }}>
          Unlock all lessons forever for <strong>£2.99</strong> (one-time).
        </p>

        <button
          onClick={onPurchase}
          style={{
            backgroundColor: "#FFD700",
            color: "#111827",
            fontWeight: 700,
            border: "none",
            borderRadius: "12px",
            padding: "10px 24px",
            marginBottom: "10px",
            width: "100%",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Purchase Now
        </button>

        <button
          onClick={onClose}
          style={{
            backgroundColor: "transparent",
            color: "#9CA3AF",
            border: "none",
            cursor: "pointer",
            fontSize: "0.9rem",
            marginTop: "4px",
          }}
        >
          Not Now
        </button>
      </div>
    </div>
  );
}
