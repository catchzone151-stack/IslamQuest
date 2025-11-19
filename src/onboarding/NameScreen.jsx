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
      className="screen no-extra-space"
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
      <h2 style={{ color: "#D4AF37", fontSize: "1.4rem" }}>
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
          border: "1px solid #D4AF37",
          background: "transparent",
          color: "white",
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
        Continue
      </button>
    </div>
  );
}
