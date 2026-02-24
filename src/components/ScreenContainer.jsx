import React from "react";

export default function ScreenContainer({ children }) {
  return (
    <div
      className="screen no-extra-space"
      style={{
        paddingLeft: "clamp(12px, 3vw, 24px)",
        paddingRight: "clamp(12px, 3vw, 24px)",
        paddingTop: "clamp(12px, 3vw, 24px)",
        maxWidth: "100%",
        width: "100%",
        boxSizing: "border-box",
        overflowX: "clip",
      }}
    >
      {children}
    </div>
  );
}
