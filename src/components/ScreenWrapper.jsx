import React from "react";

export default function ScreenWrapper({ children }) {
  return (
    <div
      className="screen no-extra-space"
      style={{
        width: "100%",
        background: "var(--navy)",
        paddingLeft: "clamp(12px, 3vw, 24px)",
        paddingRight: "clamp(12px, 3vw, 24px)",
        paddingTop: "clamp(12px, 3vw, 24px)",
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      {children}
    </div>
  );
}
