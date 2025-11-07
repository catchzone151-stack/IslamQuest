import React from "react";
import { motion } from "framer-motion";

/**
 * ProfileCard
 * Reusable glowing info card for profile stats like XP, Coins, or Streak.
 * Props:
 *  - icon: image src (icon path)
 *  - label: string (e.g. "XP")
 *  - value: number or string
 *  - color: glow color (#hex or rgba)
 */

export default function ProfileCard({ icon, label, value, color = "#FFD700" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        borderRadius: 16,
        padding: "16px 14px",
        textAlign: "center",
        flex: 1,
        boxShadow: `0 0 12px ${color}40`,
        border: `1px solid ${color}30`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon && (
        <img
          src={icon}
          alt={label}
          style={{ width: 40, height: 40, marginBottom: 6 }}
        />
      )}
      <p
        style={{
          fontSize: "1.2rem",
          fontWeight: 700,
          margin: 0,
          color,
          textShadow: `0 0 6px ${color}80`,
        }}
      >
        {value}
      </p>
      <p style={{ margin: 0, opacity: 0.85, fontSize: "0.9rem" }}>{label}</p>
    </motion.div>
  );
}
