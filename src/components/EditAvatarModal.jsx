import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * EditAvatarModal
 * Lets user choose a new avatar from /assets/avatars/*.png
 * Integrates with userStore to update avatar instantly.
 */

export default function EditAvatarModal({ isOpen, onClose, currentAvatar, onSave }) {
  const [selected, setSelected] = useState(currentAvatar || "");

  // ✅ Load all PNG avatars dynamically
  const avatarContext = import.meta.glob("/src/assets/avatars/*.png", { eager: true });
  const avatars = useMemo(
    () => Object.values(avatarContext).map((m) => m.default).filter(Boolean),
    []
  );

  const handleSave = () => {
    if (!selected) return;
    onSave(selected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.75)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          style={{
            background: "linear-gradient(145deg, #0A1A2F, #071220)",
            borderRadius: 20,
            padding: "26px 22px",
            textAlign: "center",
            color: "white",
            width: "90%",
            maxWidth: 420,
            boxShadow: "0 0 25px rgba(255,215,0,0.25)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h2
            style={{
              color: "#FFD700",
              fontSize: "1.3rem",
              marginBottom: 18,
            }}
          >
            Choose New Avatar
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
              justifyItems: "center",
              marginBottom: 20,
              maxHeight: "50vh",
              overflowY: "auto",
            }}
          >
            {avatars.map((src) => (
              <button
                key={src}
                onClick={() => setSelected(src)}
                style={{
                  width: "clamp(65px, 16vw, 75px)",
                  height: "clamp(65px, 16vw, 75px)",
                  borderRadius: "50%",
                  border: selected === src ? "3px solid #FFD700" : "2px solid transparent",
                  background: "#0E1625",
                  overflow: "hidden",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <img
                  src={src}
                  alt="Avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </button>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.1)",
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "10px 20px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              style={{
                background: "#D4AF37",
                color: "#0A1A2F",
                border: "none",
                borderRadius: 8,
                padding: "10px 22px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Save
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
