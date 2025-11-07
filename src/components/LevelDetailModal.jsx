import React from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * LevelDetailModal
 * Displays when user taps on their Level badge in Profile.
 * Shows XP progress and XP needed to reach next level.
 */

export default function LevelDetailModal({ isOpen, onClose, currentXP, level, nextLevelXP }) {
  if (!isOpen) return null;

  const remainingXP = Math.max(nextLevelXP - currentXP, 0);
  const progress = Math.min((currentXP / nextLevelXP) * 100, 100);

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
          background: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          style={{
            background: "linear-gradient(145deg, #0A1A2F, #071220)",
            borderRadius: 20,
            padding: "28px 22px",
            textAlign: "center",
            color: "white",
            width: "85%",
            maxWidth: 400,
            boxShadow: "0 0 25px rgba(212,175,55,0.3)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h2
            style={{
              color: "#FFD700",
              fontSize: "1.4rem",
              marginBottom: 12,
            }}
          >
            Level {level}
          </h2>
          <p style={{ opacity: 0.85, marginBottom: 20 }}>
            You have <strong>{currentXP}</strong> XP.  
            Only <strong>{remainingXP}</strong> XP to reach Level {level + 1}!
          </p>

          <div
            style={{
              background: "rgba(255,255,255,0.1)",
              borderRadius: 10,
              overflow: "hidden",
              height: 14,
              marginBottom: 20,
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6 }}
              style={{
                background: "linear-gradient(90deg, #FFD700, #FFA500)",
                height: "100%",
              }}
            />
          </div>

          <button
            onClick={onClose}
            style={{
              background: "#D4AF37",
              border: "none",
              borderRadius: 10,
              color: "#0A1A2F",
              fontWeight: 600,
              padding: "10px 28px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
