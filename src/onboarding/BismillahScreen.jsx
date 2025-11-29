import React from "react";
import { useNavigate } from "../hooks/useNavigate";
import { motion } from "framer-motion";

export default function BismillahScreen() {
  const navigate = useNavigate();

  return (
    <div
      className="onboarding-screen"
      style={{
        background:
          "linear-gradient(180deg, #0A1A2F 0%, #060D18 100%)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        paddingLeft: "24px",
        paddingRight: "24px",
        paddingTop: "24px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h2 style={{ fontFamily: "Amiri, serif", color: "#D4AF37", fontSize: "1.6rem" }}>
          بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ
        </h2>
        <p style={{ marginTop: "8px", color: "#e5e5e5" }}>
          In the name of Allah, the Most Merciful, the Most Compassionate
        </p>
        <p style={{ marginTop: "20px", color: "#bbb", fontSize: "0.95rem" }}>
          Begin with a pure intention. <br />
          Seek knowledge to get closer to Allah.
        </p>
        <p style={{ marginTop: "8px", fontSize: "0.9rem", color: "#888" }}>
          May Allah bless your learning and efforts.
        </p>

        <button
          onClick={() => navigate("/onboarding/salaam")}
          style={{
            marginTop: "32px",
            background: "#D4AF37",
            color: "#0A1A2F",
            border: "none",
            borderRadius: "10px",
            padding: "12px 36px",
            fontWeight: "600",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Bismillah
        </button>
      </motion.div>
    </div>
  );
}
