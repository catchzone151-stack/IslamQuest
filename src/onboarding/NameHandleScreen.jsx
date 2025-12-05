import React, { useState, useEffect } from "react";
import { useNavigate } from "../hooks/useNavigate";
import { motion } from "framer-motion";
import { useUserStore } from "../store/useUserStore";

export default function NameHandleScreen() {
  const navigate = useNavigate();
  const { setName, setUsername } = useUserStore();
  const [nameValue, setNameValue] = useState("");

  useEffect(() => {
    localStorage.setItem("iq_onboarding_step", "namehandle");
  }, []);

  const isValid = nameValue.trim().length > 0;

  const handleContinue = () => {
    if (!isValid) return;

    const trimmedName = nameValue.trim();
    
    setName(trimmedName);
    setUsername(trimmedName);
    localStorage.setItem("iq_name", trimmedName);

    navigate("/onboarding/avatar");
  };

  const goToLogin = () => {
    navigate("/auth");
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: "100%",
          maxWidth: "360px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2 style={{ color: "#D4AF37", fontSize: "1.4rem", marginBottom: "8px" }}>
          What should we call you?
        </h2>
        <p style={{ color: "#ccc", fontSize: "0.95rem", marginBottom: 24 }}>
          Enter your display name
        </p>

        <div style={{ width: "100%", marginBottom: "16px" }}>
          <input
            type="text"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            placeholder="Your name"
            style={{
              width: "100%",
              padding: "14px 18px",
              borderRadius: "12px",
              border: "2px solid rgba(212, 175, 55, 0.3)",
              background: "#0E1625",
              color: "white",
              fontSize: "1rem",
              textAlign: "center",
              outline: "none",
            }}
          />
        </div>

        <motion.button
          onClick={handleContinue}
          disabled={!isValid}
          whileHover={isValid ? { scale: 1.03, filter: "brightness(1.1)" } : {}}
          whileTap={isValid ? { scale: 0.97 } : {}}
          style={{
            marginTop: 20,
            background: isValid ? "#D4AF37" : "#7e6a2b",
            color: "#0A1A2F",
            border: "none",
            borderRadius: 10,
            padding: "12px 36px",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: isValid ? "pointer" : "not-allowed",
            width: "100%",
            maxWidth: "200px",
          }}
        >
          Continue
        </motion.button>

        <p
          onClick={goToLogin}
          style={{
            marginTop: "28px",
            color: "#888",
            fontSize: "0.85rem",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          Already have an account? Log in
        </p>
      </motion.div>
    </div>
  );
}
