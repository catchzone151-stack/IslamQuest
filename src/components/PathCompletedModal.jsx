import mascotWellDone from "../assets/mascots/mascot_welldone.webp";

export default function PathCompletedModal({ pathTitle, onClose }) {
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
      onClick={onClose}
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
          src={mascotWellDone}
          alt="Well Done"
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
          Path Completed! 🎉
        </h2>

        <p
          style={{
            fontSize: "0.9rem",
            lineHeight: 1.5,
            color: "#cbd5e1",
            marginBottom: "16px",
          }}
        >
          {pathTitle}
        </p>

        <button
          onClick={onClose}
          style={{
            width: "100%",
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
          Continue
        </button>
      </div>
    </div>
  );
}
