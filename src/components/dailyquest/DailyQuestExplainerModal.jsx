import avatarManLantern from "../../assets/avatars/avatar_man_lantern.webp";

export default function DailyQuestExplainerModal({ onStart, onCancel }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.85)",
        zIndex: 9998,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onCancel}
    >
      <style>
        {`
          @keyframes gentleFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
        `}
      </style>
      <div
        className="quest-modal"
        style={{
          zIndex: 9999,
          background: "linear-gradient(145deg, #0B1E2D 0%, #1a3a52 100%)",
          borderRadius: "16px",
          padding: "24px 20px",
          maxWidth: "340px",
          width: "calc(100% - 40px)",
          boxShadow: "0 10px 40px rgba(212, 175, 55, 0.3)",
          border: "2px solid #D4AF37",
          textAlign: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={avatarManLantern}
          alt="Daily Quest"
          style={{
            width: "80px",
            height: "auto",
            margin: "0 auto 12px",
            display: "block",
            animation: "gentleFloat 2.5s ease-in-out infinite",
          }}
        />

        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#D4AF37",
            marginBottom: "8px",
          }}
        >
          Daily Quest 🌙
        </h2>

        <p
          style={{
            fontSize: "0.9rem",
            lineHeight: 1.5,
            color: "#cbd5e1",
            marginBottom: "16px",
          }}
        >
          Test your knowledge with 8 questions from all the lessons you've completed!
        </p>

        <div
          style={{
            background: "rgba(212, 175, 55, 0.08)",
            borderRadius: "10px",
            padding: "12px",
            marginBottom: "16px",
            border: "1px solid rgba(212, 175, 55, 0.2)",
            textAlign: "left",
          }}
        >
          <p style={{ fontSize: "0.85rem", color: "#D4AF37", marginBottom: "6px" }}>
            ⭐ No timer - take your time
          </p>
          <p style={{ fontSize: "0.85rem", color: "#10B981", marginBottom: "6px" }}>
            🪙 Rewards: <strong>+60 XP</strong> and <strong>+20 coins</strong>
          </p>
          <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>
            📅 One quest per day
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "10px 16px",
              fontSize: "0.9rem",
              fontWeight: 600,
              borderRadius: "10px",
              border: "1px solid #4b5563",
              background: "rgba(75, 85, 99, 0.2)",
              color: "#9ca3af",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onStart}
            style={{
              flex: 1,
              padding: "10px 16px",
              fontSize: "0.9rem",
              fontWeight: 600,
              borderRadius: "10px",
              border: "none",
              background: "linear-gradient(135deg, #D4AF37, #b8941f)",
              color: "#0B1E2D",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 3px 10px rgba(212, 175, 55, 0.3)",
            }}
          >
            Let's Go! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
