import React from "react";
import { useNavigate } from "../hooks/useNavigate";
import { motion } from "framer-motion";

export default function BismillahScreen() {
  const navigate = useNavigate();

  return (
    <div
      className="onboarding-screen"
      style={{
        background: "#ffffff",
        color: "#0a2a43",
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
        <h2 style={{ fontFamily: "Amiri, serif", color: "#0a2a43", fontSize: "1.6rem" }}>
          بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ
        </h2>
        <p style={{ marginTop: "8px", color: "#0a2a43" }}>
          In the name of Allah, the Most Merciful, the Most Compassionate
        </p>
        <p style={{ marginTop: "20px", color: "#4a5568", fontSize: "0.95rem" }}>
          Begin with a pure intention. <br />
          Seek knowledge to get closer to Allah.
        </p>
        <p style={{ marginTop: "8px", fontSize: "0.9rem", color: "#718096" }}>
          May Allah bless your learning and efforts.
        </p>

        <button
          onClick={() => navigate("/onboarding/salaam")}
          style={{
            marginTop: "32px",
            background: "#0a2a43",
            color: "#ffffff",
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
