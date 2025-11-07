import React from "react";
import { useTitleStore } from "../store/useTitleStore";
import { titles } from "../data/titles";
import "../styles/titles.css";

export default function TitleListModal({ onClose }) {
  const { currentTier } = useTitleStore();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.25)",
        backdropFilter: "blur(6px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "90%",
          maxWidth: 420,
          maxHeight: "80vh",
          overflowY: "auto",
          background: "linear-gradient(180deg, #004b80, #0078b5)",
          borderRadius: 18,
          padding: 20,
          boxShadow: "0 0 25px rgba(255,215,0,0.35)",
          color: "white",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            color: "gold",
            fontSize: "1.3rem",
            marginBottom: 16,
            textShadow: "0 0 8px rgba(255,215,0,0.5)",
          }}
        >
          Title Progression
        </h2>

        {/* Scrollable list */}
        <div style={{ maxHeight: "60vh", overflowY: "auto", paddingRight: 6 }}>
          {titles.map((t) => {
            const unlocked = t.id <= currentTier;
            return (
              <div
                key={t.id}
                style={{
                  background: unlocked
                    ? "linear-gradient(145deg, rgba(0,180,255,0.3), rgba(255,215,0,0.25))"
                    : "rgba(255,255,255,0.07)",
                  border: unlocked
                    ? "1px solid rgba(255,215,0,0.4)"
                    : "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 14,
                  padding: "12px 10px",
                  marginBottom: 10,
                  transition: "transform 0.2s ease",
                  boxShadow: unlocked
                    ? "0 0 12px rgba(255,215,0,0.2)"
                    : "none",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.02)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <div
                  className={t.cssClass}
                  style={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: unlocked ? t.color || "#fff" : "#999",
                    textShadow: unlocked
                      ? "0 0 6px rgba(255,215,0,0.35)"
                      : "none",
                  }}
                >
                  {t.name} {!unlocked && "🔒"}
                </div>

                <div
                  style={{
                    marginTop: 4,
                    fontSize: "0.85rem",
                    color: "#fff",
                    opacity: 0.95,
                  }}
                >
                  {t.requirement}
                </div>
              </div>
            );
          })}
        </div>

        {/* Fancy Close Button */}
        <button
          onClick={onClose}
          style={{
            marginTop: 16,
            background: "linear-gradient(135deg, #FFD700, #FFB400)",
            border: "none",
            color: "#0a0a0a",
            fontWeight: 700,
            borderRadius: 10,
            padding: "10px 22px",
            fontSize: "0.9rem",
            cursor: "pointer",
            boxShadow: "0 0 15px rgba(255,215,0,0.4)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(255,215,0,0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 0 15px rgba(255,215,0,0.4)";
          }}
        >
          ✨ Close
        </button>
      </div>
    </div>
  );
}
