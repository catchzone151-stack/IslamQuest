import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import lionMascot from "../assets/mascots/mascot_zayd_teaching.webp";

export default function Lesson() {
  const { pathId, lessonId } = useParams();
  const navigate = useNavigate();
  const index = parseInt(lessonId, 10);

  // Retrieve correct lesson from the correct path
  const lessons = [];
  const lesson = lessons[index];

  function handleBack() {
    if (pathId) {
      navigate(`/path/${pathId}`);
    } else {
      navigate(-1);
    }
  }

  if (!lesson) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at 20% 20%, #1a2337 0%, #000814 70%)",
          color: "white",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <button
          onClick={handleBack}
          style={{
            appearance: "none",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "white",
            fontSize: "0.8rem",
            borderRadius: "10px",
            padding: "8px 10px",
            marginBottom: "20px",
          }}
        >
          ← Back
        </button>
        <div
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            lineHeight: 1.3,
            background:
              "linear-gradient(90deg,#fff 0%,#fff6d2 40%,#ffd88a 100%)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          Lesson not found
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 20% 20%, #1a2337 0%, #000814 70%)",
        color: "white",
        padding: "16px",
        paddingBottom: "80px",
        maxWidth: "480px",
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* Top-right mascot */}
      <img
        src={lionMascot}
        alt="Zayd teaching"
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          width: "72px",
          height: "72px",
          objectFit: "contain",
          borderRadius: "50%",
          boxShadow: "0 0 20px rgba(255, 216, 138, 0.5)",
          background: "rgba(255,255,255,0.05)",
        }}
      />

      {/* Header */}
      <button
        onClick={handleBack}
        style={{
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.18)",
          color: "white",
          fontSize: "0.8rem",
          borderRadius: "10px",
          padding: "8px 10px",
          marginBottom: "12px",
          lineHeight: 1,
        }}
      >
        ← Back
      </button>

      <div
        style={{
          fontSize: "1rem",
          fontWeight: 600,
          background: "linear-gradient(90deg,#fff 0%,#fff6d2 40%,#ffd88a 100%)",
          WebkitBackgroundClip: "text",
          color: "transparent",
          marginBottom: "6px",
        }}
      >
        {lesson.title || "Untitled Lesson"}
      </div>

      <div
        style={{
          fontSize: "0.8rem",
          color: "#cfcfcf",
          lineHeight: 1.4,
          marginBottom: "12px",
        }}
      >
        {lesson.summary}
      </div>

      {/* Lesson content */}
      <div
        style={{
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.15)",
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(54,89,130,0.15) 60%)",
          padding: "16px",
          marginBottom: "16px",
        }}
      >
        {lesson.sections?.map((section, sIdx) => (
          <div
            key={sIdx}
            style={{
              marginBottom: "20px",
              borderBottom:
                sIdx === lesson.sections.length - 1
                  ? "none"
                  : "1px solid rgba(255,255,255,0.08)",
              paddingBottom: "12px",
            }}
          >
            <div
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                background:
                  "linear-gradient(90deg,#fff 0%,#fff6d2 40%,#ffd88a 100%)",
                WebkitBackgroundClip: "text",
                color: "transparent",
                marginBottom: "6px",
              }}
            >
              {section.heading}
            </div>

            <div
              style={{
                fontSize: "0.8rem",
                color: "#cfcfcf",
                lineHeight: 1.5,
                whiteSpace: "pre-line",
              }}
            >
              {section.text?.join("\n\n")}
            </div>
          </div>
        ))}
      </div>

      {/* Footer buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={handleBack}
          style={{
            flex: 1,
            background:
              "linear-gradient(135deg,rgba(255,255,255,0.12) 0%,rgba(255,255,255,0) 60%)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "white",
            borderRadius: "12px",
            padding: "12px",
            fontSize: "0.8rem",
            fontWeight: 500,
          }}
        >
          Back
        </button>

        <button
          onClick={() => navigate(`/path/${pathId}/quiz/${lessonId}`)}
          style={{
            flex: 1,
            backgroundColor: "#ffd88a",
            color: "#000814",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "12px",
            padding: "12px",
            fontSize: "0.8rem",
            fontWeight: 600,
            boxShadow:
              "0 20px 40px rgba(0,0,0,0.8), 0 0 60px rgba(255,235,167,0.4) inset",
          }}
        >
          Take Quiz 🎯
        </button>
      </div>
    </div>
  );
}
