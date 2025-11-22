import React from "react";
import { useModalStore, MODAL_TYPES } from "../store/modalStore";

export default function ExitConfirmationModal({ onConfirm, onCancel }) {
  const { showModal } = useModalStore();
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#0a2a43",
          border: "1px solid rgba(212, 175, 55, 0.3)",
          borderRadius: "16px",
          padding: "32px 24px",
          maxWidth: "320px",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        <h2
          style={{
            color: "#FFD700",
            fontSize: "1.2rem",
            fontWeight: 700,
            marginBottom: "12px",
          }}
        >
          Exit Islam Quest?
        </h2>

        <p
          style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: "0.95rem",
            marginBottom: "24px",
            lineHeight: "1.5",
          }}
        >
          Are you sure you want to exit Islam Quest?
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
          }}
        >
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              background: "transparent",
              border: "1px solid rgba(212, 175, 55, 0.4)",
              color: "#D4AF37",
              padding: "12px 16px",
              borderRadius: "8px",
              fontSize: "0.95rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(212, 175, 55, 0.1)";
              e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.4)";
            }}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              background: "linear-gradient(135deg, #D4AF37 0%, #FFA500 100%)",
              color: "#0a2a43",
              border: "none",
              padding: "12px 16px",
              borderRadius: "8px",
              fontSize: "0.95rem",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.3s",
              boxShadow: "0 4px 12px rgba(212, 175, 55, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(212, 175, 55, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(212, 175, 55, 0.3)";
            }}
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}
