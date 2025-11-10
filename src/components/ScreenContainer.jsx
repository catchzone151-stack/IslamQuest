import React from "react";

const NAV_HEIGHT = 76;

export default function ScreenContainer({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--navy)",
        padding: "clamp(12px, 3vw, 24px)",
        paddingBottom: `${NAV_HEIGHT + 34}px`, // 76 + 34 = 110px
        maxWidth: "100%",
        width: "100%",
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      {children}
    </div>
  );
}
