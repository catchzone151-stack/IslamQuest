import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ScreenContainer from "../components/ScreenContainer";

export default function Goodbye() {
  const navigate = useNavigate();

  const handleReturnToStart = () => {
    navigate("/onboarding/bismillah", { replace: true });
  };

  return (
    <ScreenContainer>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            maxWidth: "360px",
            width: "100%",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(79, 213, 255, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)",
              border: "2px solid rgba(79, 213, 255, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 32px",
              fontSize: "2rem",
            }}
          >
            <span role="img" aria-label="wave">
              🌙
            </span>
          </div>

          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#fff",
              marginBottom: "16px",
              lineHeight: 1.4,
            }}
          >
            Your account has been deleted.
          </h1>

          <p
            style={{
              fontSize: "1rem",
              color: "rgba(255, 255, 255, 0.7)",
              marginBottom: "40px",
              lineHeight: 1.6,
            }}
          >
            You're always welcome back anytime.
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReturnToStart}
            style={{
              background: "linear-gradient(135deg, #4fd5ff 0%, #38bdf8 100%)",
              color: "#0a1929",
              border: "none",
              padding: "16px 32px",
              borderRadius: "14px",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer",
              width: "100%",
              maxWidth: "280px",
              boxShadow: "0 4px 20px rgba(79, 213, 255, 0.3)",
              transition: "box-shadow 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 6px 30px rgba(79, 213, 255, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(79, 213, 255, 0.3)";
            }}
          >
            Return to Start
          </motion.button>
        </motion.div>
      </div>
    </ScreenContainer>
  );
}
