import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ to = null, label = "Back" }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => (to ? navigate(to) : navigate(-1))}
      aria-label={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.18)",
        background:
          "linear-gradient(180deg, rgba(255,215,0,0.15), rgba(255,215,0,0.05))",
        color: "#FFD700",
        boxShadow: "0 0 12px rgba(255,215,0,0.35)",
        cursor: "pointer",
      }}
    >
      <ArrowLeft size={18} />
      <span style={{ fontWeight: 700 }}>{label}</span>
    </button>
  );
}
