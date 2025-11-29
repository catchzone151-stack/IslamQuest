import React, { useState, useMemo } from "react";
import { useNavigate } from "../hooks/useNavigate";
import { useUserStore } from "../store/useUserStore";
import { motion } from "framer-motion";
import assets from "../assets/assets";
import { AVAILABLE_AVATARS } from "../utils/avatarUtils";

export default function AvatarScreen() {
  const navigate = useNavigate();
  const { setAvatar } = useUserStore();
  const [selected, setSelected] = useState(null);

  // Only show AVAILABLE_AVATARS (excludes hidden ninja avatars)
  const sortedAvatars = useMemo(() => 
    AVAILABLE_AVATARS.map(key => assets.avatars[key]).filter(Boolean), 
  []);

  const handleContinue = () => {
    if (!selected) return;
    // Extract avatar key from full path (e.g., "/src/assets/avatars/avatar_robot.png.webp" -> "avatar_robot")
    const avatarKey = selected.split("/").pop().split(".")[0];
    setAvatar(avatarKey);
    navigate("/onboarding/username");
  };

  return (
    <div
      className="onboarding-screen"
      style={{
        background: "#ffffff",
        color: "#0a2a43",
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
      <h2 style={{ color: "#0a2a43", fontSize: "1.4rem", marginBottom: "8px" }}>
        Choose your avatar
      </h2>
      <p style={{ color: "#4a5568", fontSize: "0.95rem", marginBottom: 20 }}>
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
                  ? "3px solid #0a2a43"
                  : "2px solid #e5e7eb",
              background: "#f8fafc",
              overflow: "hidden",
              cursor: "pointer",
            }}
          >
            <motion.img
              src={src}
              alt="Avatar"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
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
          background: selected ? "#0a2a43" : "#94a3b8",
          color: "#ffffff",
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
