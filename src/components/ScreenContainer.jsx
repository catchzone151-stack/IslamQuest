import React from "react";

const NAV_HEIGHT = 76;

export default function ScreenContainer({ children }) {
  return (
    <div
      className="screen no-extra-space screen-container-root"
      style={{
        background: "var(--navy)",
        padding: "clamp(12px, 3vw, 24px)",
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
