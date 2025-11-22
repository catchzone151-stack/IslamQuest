import React, { useState, useMemo } from "react";
import { useNavigate } from "../hooks/useNavigate";
import { useUserStore } from "../store/useUserStore";
import { motion } from "framer-motion";

// ✅ Load all .webp avatars (optimized and compressed)
const avatarContext = import.meta.glob("/src/assets/avatars/*.webp", {
  eager: true,
});

const avatars = Object.values(avatarContext)
  .map((m) => m.default)
  .filter((src) => typeof src === "string");

export default function AvatarScreen() {
  const navigate = useNavigate();
  const { setAvatar } = useUserStore();
  const [selected, setSelected] = useState(null);

  const sortedAvatars = useMemo(() => avatars.sort(), []);

  const handleContinue = () => {
    if (!selected) return;
    setAvatar(selected);
    navigate("/onboarding/username");
  };

  return (
    <div
      className="onboarding-screen"
      style={{
        background: "linear-gradient(180deg, #0A1A2F 0%, #060D18 100%)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        paddingLeft: "24px",
        paddingRight: "24px",
        paddingTop: "24px",
        justifyContent: "center",
      }}
    >
      <h2 style={{ color: "#D4AF37", fontSize: "1.4rem", marginBottom: "8px" }}>
        Choose your avatar
      </h2>
      <p style={{ color: "#ccc", fontSize: "0.95rem", marginBottom: 20 }}>
        Tap to choose your look 👇
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
          gap: 16,
          width: "90%",
          maxWidth: 360,
          justifyItems: "center",
        }}
      >
        {sortedAvatars.map((src, i) => (
          <motion.button
            key={src}
            onClick={() => setSelected(src)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.05, filter: "brightness(1.1)" }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              padding: 0,
              border:
                selected === src
                  ? "3px solid #D4AF37"
                  : "2px solid transparent",
              background: "#0E1625",
              overflow: "hidden",
              cursor: "pointer",
            }}
          >
            <motion.img
              src={src}
              alt="Avatar"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            />
          </motion.button>
        ))}
      </div>

      <motion.button
        onClick={handleContinue}
        disabled={!selected}
        whileHover={selected ? { scale: 1.03, filter: "brightness(1.1)" } : {}}
        whileTap={selected ? { scale: 0.97 } : {}}
        style={{
          marginTop: 28,
          background: selected ? "#D4AF37" : "#7e6a2b",
          color: "#0A1A2F",
          border: "none",
          borderRadius: 10,
          padding: "12px 36px",
          fontWeight: 600,
          fontSize: "1rem",
          cursor: selected ? "pointer" : "not-allowed",
        }}
      >
        Continue
      </motion.button>
    </div>
  );
}
