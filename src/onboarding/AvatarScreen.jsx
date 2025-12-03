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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem("iq_onboarding_step", "avatar");
  }, []);

  // Only show AVAILABLE_AVATARS (excludes hidden ninja avatars)
  const sortedAvatars = useMemo(() => 
    AVAILABLE_AVATARS.map(key => assets.avatars[key]).filter(Boolean), 
  []);

  const handleContinue = async () => {
    if (!selected || saving) return;
    
    setSaving(true);
    setError("");
    
    // Extract avatar key from full path (e.g., "/src/assets/avatars/avatar_robot.png.webp" -> "avatar_robot")
    const avatarKey = selected.split("/").pop().split(".")[0];
    setAvatar(avatarKey);
    
    try {
      // Complete onboarding - saves all identity fields to cloud
      const { completeOnboarding } = useUserStore.getState();
      const result = await completeOnboarding();
      
      if (!result?.success) {
        console.error("Failed to complete onboarding:", result?.error);
        if (result?.error === "handle_taken") {
          setError("Handle already taken. Please go back and choose another.");
        } else {
          setError("Could not save profile. Please try again.");
        }
        setSaving(false);
        return;
      }
      
      // Navigate to auth page for email/password setup
      navigate("/auth");
    } catch (err) {
      console.error("Onboarding error:", err);
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
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
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            />
          </motion.button>
        ))}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            color: "#ef4444",
            fontSize: "0.85rem",
            marginTop: "16px",
            marginBottom: "-12px",
          }}
        >
          {error}
        </motion.p>
      )}

      <motion.button
        onClick={handleContinue}
        disabled={!selected || saving}
        whileHover={selected && !saving ? { scale: 1.03, filter: "brightness(1.1)" } : {}}
        whileTap={selected && !saving ? { scale: 0.97 } : {}}
        style={{
          marginTop: 28,
          background: selected && !saving ? "#D4AF37" : "#7e6a2b",
          color: "#0A1A2F",
          border: "none",
          borderRadius: 10,
          padding: "12px 36px",
          fontWeight: 600,
          fontSize: "1rem",
          cursor: selected && !saving ? "pointer" : "not-allowed",
        }}
      >
        {saving ? "Saving..." : "Continue"}
      </motion.button>
    </div>
  );
}
