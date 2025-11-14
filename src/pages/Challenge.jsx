import { useNavigate } from "react-router-dom";

export default function Challenge() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 16,
        paddingBottom: 90,
        background: "linear-gradient(to bottom, #081426, #0e2340)",
        color: "white",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginTop: 10, marginBottom: 20 }}>
        <h1
          style={{
            fontSize: "clamp(1.3rem, 5vw, 1.8rem)",
            fontWeight: 800,
            margin: 0,
            background: "linear-gradient(90deg, #FFD700, #FFA500, #FFD700)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundSize: "200%",
            animation: "shimmer 8s linear infinite",
          }}
        >
          Challenges Hub
        </h1>
        <p style={{ opacity: 0.9, marginTop: 6 }}>
          Test your knowledge and compete 🏆
        </p>
      </div>

      {/* Global Events Card - ACTIVE */}
      <div
        onClick={() => navigate("/events")}
        style={{
          maxWidth: 520,
          margin: "0 auto 20px",
          background:
            "linear-gradient(135deg, rgba(212,175,55,0.25), rgba(16,185,129,0.2))",
          border: "2px solid rgba(212,175,55,0.5)",
          borderRadius: 18,
          padding: 16,
          boxShadow: "0 0 30px rgba(212,175,55,0.4)",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 6px 35px rgba(212,175,55,0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 0 30px rgba(212,175,55,0.4)";
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: "2rem" }}>🌍</span>
            <h2 style={{ color: "#d4af37", margin: 0, fontSize: "1.3rem", fontWeight: 700 }}>
              Global Events
            </h2>
          </div>
          <p style={{ color: "#10b981", margin: 0, fontSize: "0.85rem", fontWeight: 600 }}>
            🔴 LIVE NOW
          </p>
        </div>

        <button
          style={{
            width: "100%",
            background: "linear-gradient(135deg, #10b981, #059669)",
            border: "none",
            padding: "12px 18px",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: "1rem",
            cursor: "pointer",
            color: "white",
            boxShadow: "0 4px 15px rgba(16,185,129,0.3)",
            transition: "all 0.3s ease",
          }}
          onClick={(e) => {
            e.stopPropagation();
            navigate("/events");
          }}
        >
          Enter Global Events →
        </button>
      </div>

      {/* Local keyframes */}
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: 0% 50%; }
            100% { background-position: 200% 50%; }
          }
          @keyframes bounceY {
            0%, 100% { transform: translateY(0) scale(1); }
            30% { transform: translateY(-10px) scale(1.02); }
            60% { transform: translateY(-4px) scale(1.01); }
          }
        `}
      </style>
    </div>
  );
}
