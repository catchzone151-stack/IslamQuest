import React from "react";
import ModalBase from "./ModalBase";

export default function MilestoneModal({ days, reward, onClose }) {
  return (
    <ModalBase onClose={onClose}>
      <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
        <div style={{ fontSize: "3rem", marginBottom: "8px" }}>🔥</div>

        <h2 style={{
          margin: "0 0 6px",
          fontSize: "1.4rem",
          fontWeight: "800",
          background: "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Streak Milestone!
        </h2>

        <div style={{
          fontSize: "1.1rem",
          fontWeight: "700",
          color: "#e2e8f0",
          marginBottom: "16px",
        }}>
          {days} Days Strong!
        </div>

        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 24px",
          background: "rgba(245, 158, 11, 0.15)",
          border: "2px solid rgba(245, 158, 11, 0.4)",
          borderRadius: "12px",
          fontSize: "1.1rem",
          fontWeight: "700",
          color: "#f59e0b",
          marginBottom: "24px",
        }}>
          <span>💰</span>
          <span>+{reward} Coins</span>
        </div>

        <button
          onClick={onClose}
          style={{
            display: "block",
            width: "100%",
            padding: "14px",
            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            border: "none",
            borderRadius: "12px",
            color: "#fff",
            fontSize: "1rem",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Continue
        </button>
      </div>
    </ModalBase>
  );
}
