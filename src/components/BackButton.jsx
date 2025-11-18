import React from "react";
import { useNavigate } from "../hooks/useNavigate";

export default function BackButton({ label = "Back" }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      style={{
        background: "rgba(255,255,255,0.08)",
        color: "#FFD700",
        border: "1px solid rgba(255,215,0,0.4)",
        borderRadius: "12px",
        padding: "8px 16px",
        margin: "10px",
        cursor: "pointer",
        fontWeight: 600,
      }}
    >
      ← {label}
    </button>
  );
}
