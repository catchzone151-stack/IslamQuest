import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * EditNameInput
 * Modal to change the user’s nickname.
 * Saves instantly when confirmed.
 */

export default function EditNameInput({ isOpen, onClose, currentName, onSave }) {
  const [name, setName] = useState(currentName || "");

  const handleSave = () => {
    if (name.trim().length < 2) return alert("Name too short!");
    onSave(name.trim());
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
            padding: "28px 22px",
            textAlign: "center",
            color: "white",
            width: "85%",
            maxWidth: 400,
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
            Change Nickname
          </h2>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter new nickname"
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: "white",
              fontSize: "1rem",
              outline: "none",
              marginBottom: 18,
              textAlign: "center",
            }}
          />

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
