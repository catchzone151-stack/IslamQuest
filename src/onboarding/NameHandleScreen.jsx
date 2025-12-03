import React, { useState, useEffect } from "react";
import { useNavigate } from "../hooks/useNavigate";
import { motion } from "framer-motion";
import { useUserStore } from "../store/useUserStore";
import { supabase } from "../lib/supabaseClient";

export default function NameHandleScreen() {
  const navigate = useNavigate();
  const { setName, setHandle, setUsername, userId, user } = useUserStore();
  const [nameValue, setNameValue] = useState("");
  const [handleValue, setHandleValue] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem("iq_onboarding_step", "namehandle");
  }, []);

  const isNameValid = nameValue.trim().length > 0;
  const isHandleValid = handleValue.trim().length > 0;
  const isValid = isNameValid && isHandleValid;

  const handleContinue = async () => {
    if (!isValid) return;

    setChecking(true);
    setError("");

    const trimmedName = nameValue.trim();
    const trimmedHandle = handleValue.trim().toLowerCase().replace(/^@/, "");
    const uid = user?.id || userId;

    try {
      const { data, error: err } = await supabase
        .from("profiles")
        .select("handle, user_id")
        .eq("handle", trimmedHandle);

      if (!err && data && data.length > 0) {
        const otherUser = data.find(d => d.user_id !== uid);
        if (otherUser) {
          setError("Handle already taken. Try another.");
          setChecking(false);
          return;
        }
      }
    } catch (e) {
      console.log("Handle check skipped (DB not ready)");
    }

    setName(trimmedName);
    setHandle(trimmedHandle);
    setUsername(trimmedName);

    setChecking(false);
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
          Set up your profile
        </h2>
        <p style={{ color: "#ccc", fontSize: "0.95rem", marginBottom: 24 }}>
          Tell us what to call you
        </p>

        <div style={{ width: "100%", marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              textAlign: "left",
              color: "#aaa",
              fontSize: "0.85rem",
              marginBottom: "6px",
            }}
          >
            Display Name
          </label>
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

        <div style={{ width: "100%", marginBottom: "8px" }}>
          <label
            style={{
              display: "block",
              textAlign: "left",
              color: "#aaa",
              fontSize: "0.85rem",
              marginBottom: "6px",
            }}
          >
            Unique Handle
          </label>
          <input
            type="text"
            value={handleValue}
            onChange={(e) => setHandleValue(e.target.value)}
            placeholder="@yourhandle"
            style={{
              width: "100%",
              padding: "14px 18px",
              borderRadius: "12px",
              border: error ? "2px solid #ef4444" : "2px solid rgba(212, 175, 55, 0.3)",
              background: "#0E1625",
              color: "white",
              fontSize: "1rem",
              textAlign: "center",
              outline: "none",
            }}
          />
          <p style={{ color: "#888", fontSize: "0.8rem", marginTop: "6px", textAlign: "left" }}>
            This is your unique @username for friends & challenges
          </p>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              color: "#ef4444",
              fontSize: "0.85rem",
              marginBottom: "8px",
            }}
          >
            {error}
          </motion.p>
        )}

        <motion.button
          onClick={handleContinue}
          disabled={!isValid || checking}
          whileHover={isValid && !checking ? { scale: 1.03, filter: "brightness(1.1)" } : {}}
          whileTap={isValid && !checking ? { scale: 0.97 } : {}}
          style={{
            marginTop: 20,
            background: isValid ? "#D4AF37" : "#7e6a2b",
            color: "#0A1A2F",
            border: "none",
            borderRadius: 10,
            padding: "12px 36px",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: isValid && !checking ? "pointer" : "not-allowed",
            width: "100%",
            maxWidth: "200px",
          }}
        >
          {checking ? "Checking..." : "Continue"}
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
