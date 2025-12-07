import React, { useEffect } from "react";
import { useNavigate } from "../hooks/useNavigate";
import { motion } from "framer-motion";
import zayd from "../assets/mascots/mascot_onboarding.webp";

export default function AuthChoiceScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("iq_onboarding_step", "authchoice");
  }, []);

  return (
    <div
      className="onboarding-screen"
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
        minHeight: "100vh",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: "360px",
        }}
      >
        <motion.img
          src={zayd}
          alt="Zayd mascot"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            width: 140,
            height: "auto",
            objectFit: "contain",
            marginBottom: 24,
            filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.4))",
          }}
        />

        <h2
          style={{
            fontFamily: "Amiri, serif",
            color: "#D4AF37",
            fontSize: "1.5rem",
            marginBottom: 8,
          }}
        >
          Ready to begin?
        </h2>
        <p style={{ color: "#e5e5e5", fontSize: "0.95rem", marginBottom: 32 }}>
          Create an account or sign in to continue your journey of sacred knowledge.
        </p>

        <motion.button
          onClick={() => navigate("/signup")}
          whileHover={{ scale: 1.03, filter: "brightness(1.1)" }}
          whileTap={{ scale: 0.97 }}
          style={{
            width: "100%",
            background: "linear-gradient(90deg, #D4AF37 0%, #c9a227 100%)",
            color: "#0A1A2F",
            border: "none",
            borderRadius: 12,
            padding: "16px 24px",
            fontWeight: 700,
            fontSize: "1.1rem",
            cursor: "pointer",
            marginBottom: 16,
            boxShadow: "0 4px 20px rgba(212, 175, 55, 0.3)",
          }}
        >
          Create Account
        </motion.button>

        <motion.button
          onClick={() => navigate("/login")}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{
            width: "100%",
            background: "transparent",
            color: "#D4AF37",
            border: "2px solid rgba(212, 175, 55, 0.5)",
            borderRadius: 12,
            padding: "14px 24px",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          I already have an account
        </motion.button>

        <p
          style={{
            marginTop: 32,
            color: "#666",
            fontSize: "0.75rem",
            lineHeight: 1.5,
          }}
        >
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
