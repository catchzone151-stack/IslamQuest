import React, { useState } from "react";
import { useNavigate } from "../hooks/useNavigate";
import { useUserStore } from "../store/useUserStore";

export default function NameScreen() {
  const navigate = useNavigate();
  const { setName } = useUserStore();
  const [value, setValue] = useState("");

  const handleContinue = () => {
    if (value.trim().length > 0) {
      setName(value.trim());
      navigate("/onboarding/avatar");
    }
  };

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
      <h2 style={{ color: "#0a2a43", fontSize: "1.4rem" }}>
        What should we call you?
      </h2>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter your name"
        style={{
          marginTop: "24px",
          padding: "12px 16px",
          borderRadius: "10px",
          border: "1px solid #0a2a43",
          background: "#f8fafc",
          color: "#0a2a43",
          width: "80%",
          maxWidth: "300px",
          textAlign: "center",
          fontSize: "1rem",
        }}
      />
      <button
        onClick={handleContinue}
        style={{
          marginTop: "28px",
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
        Continue
      </button>
    </div>
  );
}
