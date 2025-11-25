import React, { useState } from "react";
import ScreenContainer from "../components/ScreenContainer";
import { useNavigate } from "../hooks/useNavigate";
import { useProgressStore } from "../store/progressStore";
import { useUserStore } from "../store/useUserStore";
import { useModalStore, MODAL_TYPES } from "../store/modalStore";
import { supabase } from "../lib/supabaseClient";
import { ChevronLeft } from "lucide-react";
import { DEV_MODE, setDevMode } from "../config/dev";

export default function Settings() {
  const navigate = useNavigate();
  const { showModal } = useModalStore();
  const { vibrationEnabled, setVibrationEnabled, resetAllProgress } = useProgressStore();
  const { resetUserData, setOnboarded } = useUserStore();
  const [devModeEnabled, setDevModeEnabled] = useState(DEV_MODE);

  const handleVibrationToggle = () => {
    setVibrationEnabled(!vibrationEnabled);
    if (!vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleDevModeToggle = () => {
    const newValue = !devModeEnabled;
    setDevModeEnabled(newValue);
    setDevMode(newValue);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout failed:", err);
    }

    resetUserData();
    resetAllProgress();
    setOnboarded(false);

    navigate("/onboarding/bismillah", { replace: true });
  };

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
          {/* Vibration Toggle */}
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
              🔊 Vibration (Haptics)
            </span>
            <button
              onClick={handleVibrationToggle}
              style={{
                background: vibrationEnabled
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(79, 213, 255, 0.3)",
                borderRadius: 20,
                padding: "6px 14px",
                color: vibrationEnabled ? "white" : "#4fd5ff",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "0.85rem",
                transition: "all 0.3s",
              }}
            >
              {vibrationEnabled ? "ON" : "OFF"}
            </button>
          </div>

          {/* Dev Mode Toggle */}
          <div
            style={{
              background: devModeEnabled 
                ? "rgba(251, 191, 36, 0.15)" 
                : "rgba(255, 255, 255, 0.03)",
              padding: 14,
              borderRadius: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: devModeEnabled 
                ? "1px solid rgba(251, 191, 36, 0.4)" 
                : "none",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ color: devModeEnabled ? "#fbbf24" : "#cbd5e1", fontSize: "0.9rem" }}>
                🔧 Developer Mode
              </span>
              <span style={{ color: "#64748b", fontSize: "0.7rem" }}>
                Local testing (no cloud sync)
              </span>
            </div>
            <button
              onClick={handleDevModeToggle}
              style={{
                background: devModeEnabled
                  ? "linear-gradient(135deg, #f59e0b, #d97706)"
                  : "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(251, 191, 36, 0.3)",
                borderRadius: 20,
                padding: "6px 14px",
                color: devModeEnabled ? "white" : "#fbbf24",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "0.85rem",
                transition: "all 0.3s",
              }}
            >
              {devModeEnabled ? "ON" : "OFF"}
            </button>
          </div>

          {/* Dev Mode Active Banner */}
          {devModeEnabled && (
            <div
              style={{
                background: "linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(217, 119, 6, 0.15) 100%)",
                border: "1px solid rgba(251, 191, 36, 0.4)",
                borderRadius: 8,
                padding: "10px 14px",
                textAlign: "center",
              }}
            >
              <span style={{ color: "#fbbf24", fontSize: "0.8rem", fontWeight: 600 }}>
                ⚠️ DEV MODE ACTIVE - No data will sync to cloud
              </span>
            </div>
          )}

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

          {/* Log Out Button */}
          <button
            onClick={handleLogout}
            style={{
              background: "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(185, 28, 28, 0.1) 100%)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: 12,
              padding: "12px 16px",
              color: "#ef4444",
              fontWeight: "600",
              fontSize: "0.9rem",
              width: "100%",
              cursor: "pointer",
              marginTop: "8px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(185, 28, 28, 0.2) 100%)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(185, 28, 28, 0.1) 100%)";
            }}
          >
            Log Out
          </button>
        </div>
      </div>
    </ScreenContainer>
  );
}
