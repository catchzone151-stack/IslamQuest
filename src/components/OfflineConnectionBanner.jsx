import React from "react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

export default function OfflineConnectionBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        background: "linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%)",
        color: "white",
        padding: "12px 16px",
        textAlign: "center",
        fontSize: "0.95rem",
        fontWeight: "600",
        zIndex: 9998,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
      }}
    >
      ⚠️ No connection — some features may not work offline
    </div>
  );
}
