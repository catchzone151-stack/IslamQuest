// src/components/TitleListModal.jsx
import React from "react";
import { titles } from "../data/titles";
import { useTitleStore } from "../store/useTitleStore";
import "../styles/titles.css";

export default function TitleListModal({ isOpen, onClose }) {
  const { currentTier } = useTitleStore();

  if (!isOpen) return null;

  const tierColours = {
    1: "#f5e6c6",
    2: "#ffd700",
    3: "#00a86b",
    4: "#0066ff",
    5: "#b0c3ff",
    6: "#b22222",
    7: "#ffbf00",
    8: "#e0ffff",
    9: "#00b080",
    10: "#ffffff",
  };

  return (
    <div className="title-modal-backdrop" onClick={onClose}>
      <div
        className="title-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: "80vh",
          overflowY: "auto",
          background: "rgba(0, 15, 35, 0.95)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 16,
          padding: 20,
          color: "white",
          boxShadow: "0 0 20px rgba(0,0,0,0.5)",
          backdropFilter: "blur(8px)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: 16,
            color: "white",
          }}
        >
          Title Progression
        </h2>

        <div className="title-list">
          {titles.map((t) => {
            const unlocked = t.id <= currentTier;
            const textColour = tierColours[t.id] || "#ffffff";

            return (
              <div
                key={t.id}
                className={`title-item ${t.cssClass} ${
                  unlocked ? "unlocked" : "locked"
                }`}
                style={{
                  border: unlocked
                    ? "1px solid rgba(255, 215, 0, 0.4)"
                    : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  marginBottom: 10,
                  padding: "10px 14px",
                  background: unlocked
                    ? "rgba(0, 50, 90, 0.45)"
                    : "rgba(10, 10, 10, 0.3)",
                }}
              >
                <div
                  className="title-name"
                  style={{
                    fontWeight: 600,
                    color: textColour,
                    textShadow: unlocked
                      ? "0 0 6px rgba(255,255,255,0.4)"
                      : "none",
                  }}
                >
                  {t.name}
                  {!unlocked && (
                    <span style={{ marginLeft: 8, color: "#aaa" }}>🔒</span>
                  )}
                </div>
                <div
                  className="title-req"
                  style={{
                    fontSize: "0.85rem",
                    color: "#ffffff",
                    marginTop: 4,
                  }}
                >
                  {t.requirement}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: "center", marginTop: 18 }}>
          <button
            onClick={onClose}
            style={{
              background: "linear-gradient(90deg, #0074D9, #00BFFF)",
              border: "none",
              color: "white",
              fontWeight: 600,
              borderRadius: 10,
              padding: "10px 24px",
              cursor: "pointer",
              boxShadow: "0 0 10px rgba(0,191,255,0.6)",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 0 14px rgba(0,191,255,0.9)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 0 10px rgba(0,191,255,0.6)")
            }
          >
            ✨ Close
          </button>
        </div>
      </div>
    </div>
  );
}
