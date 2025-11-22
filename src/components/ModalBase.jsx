import React from "react";
import "./ModalBase.css";

export default function ModalBase({
  children,
  onClose,
  title,
  maxWidth = "500px",
  showMascot = null,
  mascotAnimation = "float",
}) {
  return (
    <div className="modal-base-overlay" onClick={onClose}>
      <div 
        className="modal-base-card" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth }}
      >
        {/* Mascot Header (optional) */}
        {showMascot && (
          <div className="modal-base-mascot-container">
            <img
              src={showMascot}
              alt="Mascot"
              className={`modal-base-mascot ${mascotAnimation}`}
            />
          </div>
        )}

        {/* Title (optional) */}
        {title && <h2 className="modal-base-title">{title}</h2>}

        {/* Content */}
        <div className="modal-base-content">
          {children}
        </div>
      </div>
    </div>
  );
}
