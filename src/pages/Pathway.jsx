import React from "react";
import { useParams, useNavigate } from "react-router-dom";

// MAP WHICH PATH USES WHICH DATA
const PATH_MAP = {};

export default function Pathway() {
  const { pathId } = useParams();
  const navigate = useNavigate();
  const pathData = PATH_MAP[pathId];

  if (!pathData) {
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
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 600,
            marginBottom: "8px",
            background:
              "linear-gradient(90deg,#fff 0%,#fff6d2 40%,#ffd88a 100%)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          Path not found
        </h2>
        <p style={{ color: "#cfcfcf", fontSize: "0.9rem", lineHeight: 1.4 }}>
          We couldn't load that learning path.
        </p>
        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: "16px",
            background:
              "linear-gradient(135deg,rgba(255,255,255,0.12) 0%,rgba(255,255,255,0) 60%)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "white",
            borderRadius: "12px",
            padding: "10px 14px",
            fontSize: "0.9rem",
          }}
        >
          Go Home
        </button>
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
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Inter", system-ui, Roboto, "Segoe UI", sans-serif',
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            appearance: "none",
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
            lineHeight: 1.3,
            background:
              "linear-gradient(90deg,#fff 0%,#fff6d2 40%,#ffd88a 100%)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            marginBottom: "4px",
          }}
        >
          {pathData.title || "Learning Path"}
        </div>

        <div
          style={{
            fontSize: "0.8rem",
            color: "#cfcfcf",
            lineHeight: 1.4,
            whiteSpace: "pre-line",
          }}
        >
          {pathData.description}
        </div>

        {/* META */}
        <div
          style={{
            marginTop: "12px",
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            fontSize: "0.7rem",
            lineHeight: 1.4,
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(135deg,rgba(255,255,255,0.08) 0%,rgba(255,255,255,0) 60%)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "10px",
              padding: "8px 10px",
              flexGrow: 1,
              minWidth: "120px",
            }}
          >
            <div style={{ color: "#fff", fontWeight: 500, fontSize: "0.7rem" }}>
              Lessons
            </div>
            <div style={{ color: "#ffd88a", fontSize: "0.8rem" }}>
              {pathData.lessons?.length || 0} total
            </div>
          </div>

          <div
            style={{
              background:
                "linear-gradient(135deg,rgba(255,255,255,0.08) 0%,rgba(255,255,255,0) 60%)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "10px",
              padding: "8px 10px",
              flexGrow: 1,
              minWidth: "120px",
            }}
          >
            <div style={{ color: "#fff", fontWeight: 500, fontSize: "0.7rem" }}>
              Certificate
            </div>
            <div style={{ color: "#ffd88a", fontSize: "0.8rem" }}>
              {pathData.certificate_title || "Certificate on completion"}
            </div>
          </div>
        </div>
      </div>

      {/* LESSONS LIST */}
      <div style={{ marginTop: "24px" }}>
        <div
          style={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "#fff",
            marginBottom: "12px",
          }}
        >
          Your Lessons
        </div>

        <div style={{ display: "grid", gap: "12px" }}>
          {pathData.lessons?.map((lesson, index) => (
            <button
              key={lesson.id || index}
              onClick={() => navigate(`/path/${pathId}/lesson/${index}`)}
              style={{
                width: "100%",
                textAlign: "left",
                background:
                  "linear-gradient(160deg, rgba(255,255,255,0.07) 0%, rgba(54,89,130,0.18) 60%)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: "16px",
                padding: "14px 16px",
                boxShadow:
                  "0 20px 40px rgba(0,0,0,0.8), 0 0 60px rgba(255,235,167,0.08) inset",
              }}
            >
              {/* LABELS */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 500,
                    lineHeight: 1.2,
                    color: "#ffd88a",
                    background:
                      "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.2) 0%, rgba(0,0,0,0) 70%)",
                    borderRadius: "8px",
                    padding: "4px 6px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    minWidth: "60px",
                    textAlign: "center",
                  }}
                >
                  Lesson {index + 1}
                </div>

                <div
                  style={{
                    fontSize: "0.6rem",
                    lineHeight: 1.2,
                    color: "#cfcfcf",
                    textAlign: "right",
                    maxWidth: "120px",
                  }}
                >
                  {lesson.sections?.length || 0} sections
                </div>
              </div>

              <div
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  lineHeight: 1.3,
                  background:
                    "linear-gradient(90deg,#fff 0%,#fff6d2 40%,#ffd88a 100%)",
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
                }}
              >
                {lesson.summary ||
                  "Learn Islamic knowledge every Muslim must know."}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
