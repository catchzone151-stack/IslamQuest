import React from "react";
import ScreenContainer from "../components/ScreenContainer";
import { useNavigate } from "../hooks/useNavigate";
import { useModalStore, MODAL_TYPES } from "../store/modalStore";
import { ChevronLeft } from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  const { showModal } = useModalStore();

  return (
    <ScreenContainer>
      <div
        style={{
          padding: "20px 20px 90px",
          color: "white",
        }}
      >
        {/* Header with Back Button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 32,
          }}
        >
          <button
            onClick={() => navigate("/profile")}
            style={{
              background: "transparent",
              border: "none",
              color: "#4fd5ff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: 0,
            }}
          >
            <ChevronLeft size={24} />
          </button>
          <h1
            style={{
              fontSize: "1.6rem",
              fontWeight: 800,
              margin: 0,
              background: "linear-gradient(90deg, #FFD700, #FFA500)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Settings
          </h1>
        </div>

        {/* Settings Panel */}
        <div
          style={{
            maxWidth: 400,
            margin: "0 auto",
            padding: 20,
            background: "rgba(79, 213, 255, 0.05)",
            border: "1px solid rgba(79, 213, 255, 0.2)",
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {/* App Version */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              padding: 14,
              borderRadius: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>
              App Version
            </span>
            <span style={{ color: "#d4af37", fontSize: "0.9rem", fontWeight: 600 }}>
              Islam Quest v1.0.0
            </span>
          </div>

          {/* Clear Cache Button */}
          <button
            onClick={() => showModal(MODAL_TYPES.CLEAR_CACHE_CONFIRMATION)}
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: 12,
              padding: "12px 16px",
              color: "#ef4444",
              fontWeight: "600",
              fontSize: "0.9rem",
              width: "100%",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
            }}
          >
            🗑️ Clear Cache
          </button>

          {/* Rate App Button */}
          <a
            href="https://play.google.com/store"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", display: "block" }}
          >
            <button
              style={{
                background: "linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(244, 208, 63, 0.1) 100%)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                borderRadius: 12,
                padding: "12px 16px",
                color: "#d4af37",
                fontWeight: "600",
                fontSize: "0.9rem",
                width: "100%",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(212, 175, 55, 0.3) 0%, rgba(244, 208, 63, 0.2) 100%)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(244, 208, 63, 0.1) 100%)";
              }}
            >
              ⭐ Rate this App
            </button>
          </a>
        </div>
      </div>
    </ScreenContainer>
  );
}
