import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "../hooks/useNavigate";
import { useUserStore } from "../store/useUserStore";
import { motion } from "framer-motion";
import assets from "../assets/assets";
import { AVAILABLE_AVATARS } from "../utils/avatarUtils";

export default function AvatarScreen() {
  const navigate = useNavigate();
  const { setAvatar } = useUserStore();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    localStorage.setItem("iq_onboarding_step", "avatar");
  }, []);

  // Create array of {key, src} pairs for selection
  const avatarData = useMemo(() => 
    AVAILABLE_AVATARS.map(key => ({ key, src: assets.avatars[key] })).filter(item => item.src), 
  []);

  const handleContinue = () => {
    if (!selected) return;
    
    setAvatar(selected);
    localStorage.setItem("iq_avatar", selected);
    localStorage.setItem("iq_onboarding_step", "handle");
    
    navigate("/onboarding/handle");
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
          gridTemplateColumns: "repeat(3, 90px)",
          gap: 16,
          width: "90%",
          maxWidth: 360,
          justifyContent: "center",
          maxHeight: "60vh",
          overflowY: "auto",
          paddingBottom: 16,
        }}
      >
        {avatarData.map(({ key, src }, i) => (
          <motion.button
            key={key}
            onClick={() => setSelected(key)}
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
                selected === key
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
