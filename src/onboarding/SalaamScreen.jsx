import React from "react";
import { useNavigate } from "../hooks/useNavigate";
import { motion } from "framer-motion";
import zayd from "../assets/mascots/mascot_onboarding.webp";

export default function SalaamScreen() {
  const navigate = useNavigate();

  return (
    <div
      className="screen no-extra-space"
      style={{
        background: "linear-gradient(180deg, #0A1A2F 0%, #060D18 100%)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 24,
      }}
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <h2 style={{ fontFamily: "Amiri, serif", color: "#D4AF37", fontSize: "1.5rem" }}>
          السلام عليكم ورحمة الله وبركاته
        </h2>
        <p style={{ marginTop: 10, color: "#e5e5e5" }}>
          Peace be upon you and the mercy of Allah and His blessings
        </p>
        <p style={{ marginTop: 6, color: "#cfcfcf" }}>Welcome to your journey of sacred knowledge.</p>

        <img
          src={zayd}
          alt="Zayd mascot"
          style={{ marginTop: 28, width: 160, height: "auto", objectFit: "contain" }}
        />

        <button
          onClick={() => navigate("/onboarding/name")}
          style={{
            marginTop: 28,
            background: "#D4AF37",
            color: "#0A1A2F",
            border: "none",
            borderRadius: 10,
            padding: "12px 36px",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Continue
        </button>
      </motion.div>
    </div>
  );
}
