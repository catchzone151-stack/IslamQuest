import { useNavigate } from "react-router-dom";
import ZaydChallenge from "../assets/mascots/mascot_zayd_challenge.webp";

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
          padding: 20,
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
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: "2.5rem" }}>🌍</span>
          <div>
            <h2 style={{ color: "#d4af37", margin: "0 0 4px", fontSize: "1.4rem", fontWeight: 700 }}>
              Global Events
            </h2>
            <p style={{ color: "#10b981", margin: 0, fontSize: "0.9rem", fontWeight: 600 }}>
              🔴 LIVE NOW • Weekly Competition
            </p>
          </div>
        </div>
        
        <p style={{ opacity: 0.95, lineHeight: 1.6, marginBottom: 12 }}>
          Compete with Muslims worldwide in 4 themed events. Answer 10 hard questions, climb the leaderboard, and earn amazing rewards based on your rank!
        </p>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: 8, 
          marginBottom: 16,
          fontSize: "0.85rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>🕌</span>
            <span>Pillar Clash</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>✨</span>
            <span>Names Mastery</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>🌙</span>
            <span>Faith Test</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>📖</span>
            <span>Seerah Challenge</span>
          </div>
        </div>

        <button
          style={{
            width: "100%",
            background: "linear-gradient(135deg, #10b981, #059669)",
            border: "none",
            padding: "14px 20px",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: "1.05rem",
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

      {/* Daily Challenge Card - COMING SOON */}
      <div
        style={{
          maxWidth: 520,
          margin: "0 auto",
          background:
            "linear-gradient(135deg, rgba(0,255,209,0.18), rgba(255,215,0,0.16))",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 18,
          padding: 16,
          boxShadow: "0 0 18px rgba(0,255,209,0.25)",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div>
          <h3 style={{ color: "gold", margin: "0 0 6px", fontSize: "1.2rem" }}>
            Daily Challenge
          </h3>
          <p style={{ opacity: 0.8, fontSize: "0.85rem", marginBottom: 10 }}>
            Coming Soon
          </p>
          <ul
            style={{
              margin: 0,
              paddingLeft: 16,
              lineHeight: 1.5,
              opacity: 0.95,
              fontSize: "0.9rem",
            }}
          >
            <li>One-tap mini quiz from unlocked paths</li>
            <li>Streak-safe daily bonus + coins</li>
            <li>Zayd reactions & reward modal</li>
          </ul>
          <button
            onClick={() => alert("Daily Challenge system is being built next!")}
            style={{
              marginTop: 12,
              background: "gold",
              border: "none",
              padding: "10px 18px",
              borderRadius: 10,
              fontWeight: "bold",
              cursor: "pointer",
              color: "#0b2145",
            }}
          >
            Got it 👍
          </button>
        </div>

        <img
          src={ZaydChallenge}
          alt="Zayd Challenge"
          style={{
            width: 96,
            height: "auto",
            animation: "bounceY 1.6s ease-in-out infinite",
            transformOrigin: "50% 90%",
            filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.35))",
          }}
        />
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
