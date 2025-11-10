import React from "react";

export default function TitleListModal({ titles = [], onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#0a0a1a",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid rgba(255,215,0,0.3)",
          color: "white",
          width: "300px",
          textAlign: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ color: "#FFD700", marginBottom: "12px" }}>Your Titles</h3>
        {titles.length === 0 ? (
          <p>No titles unlocked yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {titles.map((t, i) => (
              <li
                key={i}
                style={{
                  padding: "6px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {t}
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={onClose}
          style={{
            marginTop: "20px",
            background: "#FFD700",
            border: "none",
            borderRadius: "8px",
            padding: "10px 20px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
