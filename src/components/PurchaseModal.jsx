import React from "react";
import { useProgressStore } from "../store/progressStore";
import ZaydDefault from "../assets/mascots/mascot_waving.webp";

export default function PurchaseModal({ onClose, onPurchase }) {
  const restorePurchases = useProgressStore((s) => s.restorePurchases);

  const handleRestore = () => {
    const result = restorePurchases();
    if (result.success) {
      alert(result.message);
      onClose();
    } else {
      alert(result.message);
    }
  };
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
          maxWidth: "380px",
          color: "white",
          textAlign: "center",
          boxShadow: "0 0 25px rgba(255,215,0,0.3)",
        }}
      >
        {/* Zayd Mascot */}
        <img
          src={ZaydDefault}
          alt="Zayd"
          style={{
            width: 80,
            height: 80,
            animation: "bounce 2s infinite",
            marginBottom: 12,
          }}
        />

        <h2
          style={{
            color: "#FFD700",
            fontSize: "1.5rem",
            marginBottom: "8px",
            fontWeight: 700,
          }}
        >
          Unlock All Lessons
        </h2>
        <p style={{ marginBottom: "20px", color: "#cbd5e1", fontSize: "0.9rem" }}>
          Get lifetime access to all 14 learning paths
        </p>

        {/* Benefits */}
        <div style={{ 
          textAlign: "left", 
          marginBottom: "20px",
          background: "rgba(255, 215, 0, 0.05)",
          padding: "16px",
          borderRadius: "12px",
        }}>
          <div style={{ color: "#cbd5e1", fontSize: "0.85rem", lineHeight: 1.8 }}>
            <div style={{ marginBottom: 8 }}>✓ Unlock all lessons</div>
            <div style={{ marginBottom: 8 }}>✓ Lifetime access</div>
            <div style={{ marginBottom: 8 }}>✓ No ads</div>
            <div>✓ Works across devices</div>
          </div>
        </div>

        {/* Individual Plan Button */}
        <button
          onClick={() => onPurchase("individual")}
          style={{
            backgroundColor: "#FFD700",
            color: "#111827",
            fontWeight: 700,
            border: "none",
            borderRadius: "12px",
            padding: "14px 24px",
            marginBottom: "10px",
            width: "100%",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Unlock All – £4.99
        </button>

        {/* Family Plan Button */}
        <button
          onClick={() => onPurchase("family")}
          style={{
            backgroundColor: "#4B5563",
            color: "#fff",
            fontWeight: 700,
            border: "none",
            borderRadius: "12px",
            padding: "14px 24px",
            marginBottom: "16px",
            width: "100%",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Family Access – £18 (6 users)
        </button>

        {/* Restore Purchase */}
        <button
          onClick={handleRestore}
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

        {/* Not Now */}
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

        {/* Bounce Animation */}
        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
      </div>
    </div>
  );
}
