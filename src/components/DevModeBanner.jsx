import React, { useState, useEffect } from "react";
import { isDevMode as checkDevMode } from "../config/dev";

export default function DevModeBanner() {
  const [devModeActive, setDevModeActive] = useState(checkDevMode());

  useEffect(() => {
    const updateDevMode = () => {
      const stored = localStorage.getItem("iq_dev_mode");
      setDevModeActive(stored === "true");
    };
    
    updateDevMode();
    
    window.addEventListener("storage", updateDevMode);
    
    const interval = setInterval(updateDevMode, 1000);
    
    return () => {
      window.removeEventListener("storage", updateDevMode);
      clearInterval(interval);
    };
  }, []);

  if (!devModeActive) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        background: "linear-gradient(135deg, rgba(234, 179, 8, 0.95) 0%, rgba(202, 138, 4, 0.95) 100%)",
        color: "#1a1a1a",
        padding: "8px 16px",
        textAlign: "center",
        fontSize: "0.85rem",
        fontWeight: "700",
        zIndex: 9999,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        letterSpacing: "0.5px",
      }}
    >
      🔧 DEV MODE ACTIVE — Cloud sync disabled
    </div>
  );
}
