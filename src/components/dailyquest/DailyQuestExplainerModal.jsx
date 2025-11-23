import ZaydChallenge from "../../assets/mascots/mascot_waving.webp";

export default function DailyQuestExplainerModal({ onStart, onCancel }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
        paddingTop: "15vh",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "linear-gradient(145deg, #0B1E2D 0%, #1a3a52 100%)",
          borderRadius: "20px",
          padding: "30px",
          maxWidth: "450px",
          width: "100%",
          boxShadow: "0 10px 40px rgba(212, 175, 55, 0.3)",
          border: "2px solid #D4AF37",
          position: "relative",
          textAlign: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Zayd Mascot */}
        <img
          src={ZaydChallenge}
          alt="Zayd"
          style={{
            width: "100px",
            height: "auto",
            margin: "0 auto 20px",
            display: "block",
            animation: "bounce 1s ease-in-out infinite",
          }}
        />

        {/* Title */}
        <h2
          style={{
            fontSize: "1.8rem",
            fontWeight: 700,
            color: "#D4AF37",
            marginBottom: "16px",
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
          }}
        >
          Daily Quest 🌙
        </h2>

        {/* Description */}
        <p
          style={{
            fontSize: "1rem",
            lineHeight: 1.6,
            color: "#f3f4f6",
            marginBottom: "20px",
          }}
        >
          Test your knowledge with 8 questions from all the lessons you've completed!
        </p>

        <div
          style={{
            background: "rgba(212, 175, 55, 0.1)",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "24px",
            border: "1px solid rgba(212, 175, 55, 0.3)",
          }}
        >
          <p style={{ fontSize: "0.95rem", color: "#D4AF37", marginBottom: "8px" }}>
            ⭐ No timer - take your time
          </p>
          <p style={{ fontSize: "0.95rem", color: "#10B981", marginBottom: "8px" }}>
            🪙 Rewards: <strong>+60 XP</strong> and <strong>+20 coins</strong>
          </p>
          <p style={{ fontSize: "0.95rem", color: "#f3f4f6" }}>
            📅 One quest per day - come back tomorrow!
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "12px 24px",
              fontSize: "1rem",
              fontWeight: 600,
              borderRadius: "12px",
              border: "2px solid #6b7280",
              background: "rgba(107, 114, 128, 0.2)",
              color: "#d1d5db",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(107, 114, 128, 0.3)";
              e.target.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(107, 114, 128, 0.2)";
              e.target.style.transform = "scale(1)";
            }}
          >
            Cancel
          </button>
          <button
            onClick={onStart}
            style={{
              flex: 1,
              padding: "12px 24px",
              fontSize: "1rem",
              fontWeight: 600,
              borderRadius: "12px",
              border: "2px solid #D4AF37",
              background: "linear-gradient(145deg, #D4AF37, #b8941f)",
              color: "#0B1E2D",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 4px 12px rgba(212, 175, 55, 0.4)",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.05)";
              e.target.style.boxShadow = "0 6px 16px rgba(212, 175, 55, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "0 4px 12px rgba(212, 175, 55, 0.4)";
            }}
          >
            Let's Go! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
