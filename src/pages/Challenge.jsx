import ZaydChallenge from "../assets/mascots/mascot_zayd_challenge.webp";

export default function Challenge() {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 16,
        paddingBottom: 90, // space for fixed BottomNav
        background: "linear-gradient(to bottom, #081426, #0e2340)",
        color: "white",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginTop: 10, marginBottom: 6 }}>
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
          Daily Challenge
        </h1>
        <p style={{ opacity: 0.9, marginTop: 6 }}>
          A quick mission for bonus XP 🔥
        </p>
      </div>

      {/* Placeholder Card */}
      <div
        style={{
          maxWidth: 520,
          margin: "14px auto 0",
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
          <h3 style={{ color: "gold", margin: "0 0 6px" }}>
            Coming Soon (Blueprint Scope)
          </h3>
          <ul
            style={{
              margin: 0,
              paddingLeft: 16,
              lineHeight: 1.5,
              opacity: 0.95,
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
            width: "clamp(70px, 18vw, 85px)",
            height: "auto",
            animation: "bounceY 1.6s ease-in-out infinite",
            transformOrigin: "50% 90%",
            filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.35))",
          }}
        />
      </div>

      {/* Local keyframes (match Home’s vibe) */}
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
