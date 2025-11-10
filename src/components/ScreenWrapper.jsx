import React from "react";

export default function ScreenWrapper({ children }) {
  return (
    <div
      className="screen"
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "var(--navy)",
        padding: "clamp(12px, 3vw, 24px)",
        paddingBottom: "110px", // ✅ ensures space above BottomNav
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      {children}
    </div>
  );
}
