import ScreenContainer from "../components/ScreenContainer";

export default function Revise() {
  return (
    <ScreenContainer>
      <div style={{ textAlign: "center", marginTop: "clamp(20px, 6vw, 40px)" }}>
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
          Revise & Learn
        </h1>
        <p style={{ opacity: 0.9, marginTop: 8 }}>
          Review your unlocked learning paths 📘
        </p>

        <div
          style={{
            marginTop: 20,
            background:
              "linear-gradient(145deg, rgba(0,255,209,0.15), rgba(255,215,0,0.1))",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            padding: 20,
            boxShadow: "0 0 15px rgba(0,255,209,0.25)",
          }}
        >
          <p style={{ opacity: 0.8 }}>
            Revision area coming soon, in shā’ Allāh 🌙
          </p>
        </div>
      </div>

      <style>
        {`
          @keyframes shimmer {
            0% { background-position: 0% 50%; }
            100% { background-position: 200% 50%; }
          }
        `}
      </style>
    </ScreenContainer>
  );
}
