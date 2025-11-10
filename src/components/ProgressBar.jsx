import React from "react";

export default function ProgressBar({ value, max = 1 }) {
  const width = Math.min(100, (value / max) * 100);
  return (
    <div
      style={{
        width: "100%",
        height: "8px",
        background: "rgba(255,255,255,0.1)",
        borderRadius: "10px",
        overflow: "hidden",
        marginTop: "8px",
      }}
    >
      <div
        style={{
          width: `${width}%`,
          height: "100%",
          background: "linear-gradient(90deg,#FFD700,#FFB100)",
          borderRadius: "10px",
          transition: "width 0.3s ease",
        }}
      ></div>
    </div>
  );
}
