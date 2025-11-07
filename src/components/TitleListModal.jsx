// src/components/TitleListModal.jsx
import React from "react";
import { titles } from "../data/titles";
import { useTitleStore } from "../store/useTitleStore";
import "../styles/titles.css";

export default function TitleListModal({ isOpen, onClose }) {
  const { currentTier } = useTitleStore();

  if (!isOpen) return null;

  return (
    <div className="title-modal-backdrop" onClick={onClose}>
      <div
        className="title-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ textAlign: "center", marginBottom: 16 }}>
          Title Progression
        </h2>
        <div className="title-list">
          {titles.map((t) => {
            const unlocked = t.id <= currentTier;
            return (
              <div
                key={t.id}
                className={`title-item ${t.cssClass} ${
                  unlocked ? "unlocked" : "locked"
                }`}
              >
                <div className="title-name">{t.name}</div>
                <div className="title-req">{t.requirement}</div>
              </div>
            );
          })}
        </div>
        <button className="title-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
