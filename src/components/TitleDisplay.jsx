import React from "react";

export default function TitleDisplay({ title, subtitle }) {
  return (
    <div style={{ textAlign: "center", marginBottom: "20px" }}>
      <h2 style={{ color: "#FFD700" }}>{title}</h2>
      {subtitle && <p style={{ color: "#aaa" }}>{subtitle}</p>}
    </div>
  );
}
