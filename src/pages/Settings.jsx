import React, { useState } from "react";
import ScreenContainer from "../components/ScreenContainer";
import { useNavigate } from "../hooks/useNavigate";
import { useProgressStore } from "../store/progressStore";
import { useUserStore } from "../store/useUserStore";
import { supabase } from "../lib/supabaseClient";
import { ChevronLeft, Trash2, Bell } from "lucide-react";
import DeleteAccountModal from "../components/DeleteAccountModal";
import { logEvent, ANALYTICS_EVENTS } from "../services/analyticsService";
import { Capacitor } from "@capacitor/core";
import { NativeSettings, AndroidSettings, IOSSettings } from "capacitor-native-settings";

export default function Settings() {
  const navigate = useNavigate();
  const { resetAllProgress } = useProgressStore();
  const { resetUserData, setOnboarded } = useUserStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenNotificationSettings = async () => {
    const platform = Capacitor.getPlatform();
    console.log("🔔 Opening notification settings, platform:", platform);
    try {
      if (platform === "android") {
        console.log("🔔 Calling NativeSettings.openAndroid...");
        await NativeSettings.openAndroid({ option: AndroidSettings.AppNotification });
        console.log("🔔 NativeSettings.openAndroid completed");
      } else if (platform === "ios") {
        console.log("🔔 Calling NativeSettings.openIOS...");
        await NativeSettings.openIOS({ option: IOSSettings.App });
        console.log("🔔 NativeSettings.openIOS completed");
      } else {
        console.log("🔔 Web platform - notification settings not available");
      }
    } catch (err) {
      console.warn("Could not open notification settings:", err.message);
    }
  };

  const isNative = Capacitor.getPlatform() !== "web";

  const handleLogout = async () => {
    logEvent(ANALYTICS_EVENTS.LOGOUT, {});
    
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout failed:", err);
    }

    resetUserData();
    resetAllProgress();
    setOnboarded(false);
    
    localStorage.setItem("iq_onboarding_step", "auth");

    navigate("/auth", { replace: true });
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {
      console.log("🗑️ Deleting account via RPC...");

      const { data, error } = await supabase.rpc("delete_my_account");

      if (error) {
        console.error("[DeleteAccount] RPC error:", error);
        setIsDeleting(false);
        return;
      }

      if (!data?.success) {
        console.error("[DeleteAccount] Deletion failed:", data?.error);
        setIsDeleting(false);
        return;
      }

      console.log("✅ Account deleted");

      logEvent(ANALYTICS_EVENTS.ACCOUNT_DELETED, {});

      resetUserData();
      resetAllProgress();
      setOnboarded(false);

      localStorage.clear();

      await supabase.auth.signOut();

      setShowDeleteModal(false);
      navigate("/goodbye", { replace: true });

    } catch (err) {
      console.error("[DeleteAccount] Unexpected error:", err);
      setIsDeleting(false);
    }
  };

  return (
    <ScreenContainer>
      <div
        style={{
          padding: "20px",
          color: "white",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: 32,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "40px"
          }}
        >
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
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              padding: 14,
              borderRadius: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Bell size={16} style={{ color: "#d4af37" }} />
                <span style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>
                  Notifications
                </span>
              </div>
              <button
                onClick={handleOpenNotificationSettings}
                style={{
                  background: "linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(255, 215, 0, 0.08))",
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                  borderRadius: 20,
                  padding: "6px 14px",
                  color: "#d4af37",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  transition: "all 0.3s",
                }}
              >
                Manage
              </button>
            </div>
            <p
              style={{
                color: "rgba(203, 213, 225, 0.6)",
                fontSize: "0.75rem",
                marginTop: 8,
                marginBottom: 0,
                lineHeight: 1.4,
              }}
            >
              {isNative 
                ? "Get gentle reminders for streaks, daily quests, and friend challenges"
                : "Download the app to receive streak and quest reminders"
              }
            </p>
          </div>

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
        </div>

        <div
          style={{
            maxWidth: 400,
            margin: "20px auto 0",
            padding: 20,
            background: "rgba(79, 213, 255, 0.05)",
            border: "1px solid rgba(79, 213, 255, 0.2)",
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
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

        <div
          style={{
            maxWidth: 400,
            margin: "32px auto 0",
            padding: "0 20px",
            display: "flex",
            flexDirection: "column",
            gap: 12
          }}
        >
          <div
            style={{
              height: 1,
              background: "linear-gradient(90deg, transparent 0%, rgba(239, 68, 68, 0.3) 50%, transparent 100%)",
              marginBottom: 8,
            }}
          />
          
          <button
            onClick={() => setShowDeleteModal(true)}
            style={{
              background: "transparent",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: 12,
              padding: "14px 16px",
              color: "rgba(239, 68, 68, 0.7)",
              fontWeight: "500",
              fontSize: "0.9rem",
              width: "100%",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.05)";
              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)";
              e.currentTarget.style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.2)";
              e.currentTarget.style.color = "rgba(239, 68, 68, 0.7)";
            }}
          >
            <Trash2 size={16} />
            Delete My Account
          </button>

          <button
            onClick={() => navigate("/profile")}
            style={{
              background: "transparent",
              border: "none",
              color: "#cbd5e1",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              width: "100%",
              marginTop: 16,
              opacity: 0.7,
              fontSize: "0.95rem",
              fontWeight: "600",
              transition: "opacity 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "0.7"}
          >
            <ChevronLeft size={20} />
            Back to Profile
          </button>
        </div>
      </div>

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        isDeleting={isDeleting}
      />
    </ScreenContainer>
  );
}
