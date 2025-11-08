import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProgressStore } from "../store/progressStore.js";

// Certificate images
import certSixPillars from "../assets/certificates/certificate_six_pillars.webp";

export default function CertificateScreen() {
  const navigate = useNavigate();
  const { pathId } = useParams();
  const { displayName = "Student of Knowledge" } = useProgressStore.getState();

  const date = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Map pathId → certificate image (more added later)
  const certImages = {};

  const certificateImage = certImages[pathId] || certSixPillars;

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "20px 12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background:
          "radial-gradient(circle at 20% 20%, rgba(10,15,30,1) 0%, rgba(3,6,20,1) 70%)",
        color: "white",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
        }}
      >
        {/* Certificate Image */}
        <img
          src={certificateImage}
          alt="Certificate"
          style={{
            width: "100%",
            borderRadius: 12,
            boxShadow: "0 10px 40px rgba(251,191,36,0.25)",
          }}
        />

        {/* Name over certificate */}
        <div
          style={{
            position: "absolute",
            top: "34.5%", // ⬆️ moved slightly up
            width: "100%",
            textAlign: "center",
            fontWeight: "700",
            fontSize: "1.15rem",
            color: "#fbbf24",
            textShadow: "0 2px 6px rgba(0,0,0,0.65)",
            letterSpacing: "0.5px",
          }}
        >
          {displayName}
        </div>
      </div>

      {/* Date under cert */}
      <div
        style={{
          marginTop: 12,
          fontSize: "0.95rem",
        }}
      >
        Completed on:{" "}
        <span style={{ fontWeight: "bold", color: "#fbbf24" }}>{date}</span>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: 18,
          padding: "12px 18px",
          background: "linear-gradient(90deg, #fbbf24, #b45309)",
          border: "none",
          borderRadius: 10,
          color: "black",
          fontWeight: 700,
          fontSize: "1rem",
          cursor: "pointer",
          width: "200px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        }}
      >
        Back to Home
      </button>
    </div>
  );
}
