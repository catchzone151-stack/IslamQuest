import React from "react";
import { X, Crown, ExternalLink } from "lucide-react";
import ZaydReading from "../assets/mascots/mascot_sitting.webp";
import { openAppStore } from "../utils/appStoreUtils";

export default function PurchaseModal({ onClose }) {
  const handleUnlockPremium = () => {
    onClose();
    openAppStore();
  };

  return (
    <div
      onClick={onClose}
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
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0b132b",
          border: "2px solid #FFD700",
          borderRadius: "18px",
          padding: "28px 24px",
          width: "90%",
          maxWidth: "380px",
          color: "white",
          textAlign: "center",
          boxShadow: "0 0 25px rgba(255,215,0,0.3)",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "transparent",
            border: "none",
            color: "#9CA3AF",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={24} />
        </button>
        <img
          src={ZaydReading}
          alt="Zayd"
          style={{
            width: 80,
            height: 80,
            marginBottom: 12,
          }}
        />

        <h2
          style={{
            color: "#FFD700",
            fontSize: "1.5rem",
            marginBottom: "8px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <Crown size={28} />
          Upgrade to Premium
        </h2>
        <p style={{ marginBottom: "20px", color: "#cbd5e1", fontSize: "0.9rem" }}>
          Unlock your full Islamic learning potential
        </p>

        <div style={{ 
          textAlign: "left", 
          marginBottom: "20px",
          background: "rgba(255, 215, 0, 0.05)",
          padding: "16px",
          borderRadius: "12px",
        }}>
          <div style={{ color: "#cbd5e1", fontSize: "0.85rem", lineHeight: 1.8 }}>
            <div style={{ marginBottom: 8 }}>✓ Access to all topics</div>
            <div style={{ marginBottom: 8 }}>✓ All lessons unlocked</div>
            <div style={{ marginBottom: 8 }}>✓ Global Events</div>
            <div>✓ Premium badge</div>
          </div>
        </div>

        <button
          onClick={handleUnlockPremium}
          style={{
            backgroundColor: "#FFD700",
            color: "#111827",
            fontWeight: 700,
            border: "none",
            borderRadius: "12px",
            padding: "14px 24px",
            width: "100%",
            cursor: "pointer",
            fontSize: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <Crown size={20} />
          Unlock Premium
          <ExternalLink size={16} style={{ marginLeft: 4 }} />
        </button>

      </div>
    </div>
  );
}
