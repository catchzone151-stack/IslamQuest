import React, { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { NativeSettings, AndroidSettings, IOSSettings } from "capacitor-native-settings";

const STORAGE_KEY = "iq_notification_cta_dismissed";

export default function NotificationCTA() {
  const [visible, setVisible] = useState(false);
  const platform = Capacitor.getPlatform();
  const isNative = platform === "android" || platform === "ios";

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const handleEnable = async () => {
    try {
      if (platform === "android") {
        await NativeSettings.openAndroid({ option: AndroidSettings.AppNotification });
      } else if (platform === "ios") {
        await NativeSettings.openIOS({ option: IOSSettings.App });
      }
      localStorage.setItem(STORAGE_KEY, "enabled");
      setVisible(false);
    } catch (err) {
      console.warn("Could not open notification settings:", err.message);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "dismissed");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(255, 215, 0, 0.04))",
        border: "1px solid rgba(212, 175, 55, 0.2)",
        borderRadius: 14,
        padding: "14px 16px",
        marginTop: 16,
        position: "relative",
      }}
    >
      <button
        onClick={handleDismiss}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "transparent",
          border: "none",
          color: "rgba(203, 213, 225, 0.5)",
          cursor: "pointer",
          padding: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            background: "rgba(212, 175, 55, 0.15)",
            borderRadius: 10,
            padding: 8,
            flexShrink: 0,
          }}
        >
          <Bell size={20} style={{ color: "#d4af37" }} />
        </div>

        <div style={{ flex: 1, paddingRight: 16 }}>
          <p
            style={{
              color: "#e2e8f0",
              fontSize: "0.85rem",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {isNative
              ? "Stay consistent with gentle reminders for your streak and daily quests."
              : "Download the app to receive gentle reminders for your learning journey."}
          </p>

          {isNative && (
            <button
              onClick={handleEnable}
              style={{
                marginTop: 10,
                background: "linear-gradient(135deg, #d4af37, #b8962e)",
                border: "none",
                borderRadius: 8,
                padding: "8px 16px",
                color: "#1a1a2e",
                fontWeight: 600,
                fontSize: "0.8rem",
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
            >
              Enable Notifications
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
