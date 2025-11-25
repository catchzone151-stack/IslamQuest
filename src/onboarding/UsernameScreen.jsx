// src/onboarding/UsernameScreen.jsx
import { useState } from "react";
import { useNavigate } from "../hooks/useNavigate";
import { motion } from "framer-motion";
import { useUserStore } from "../store/useUserStore";
import { supabase } from "../lib/supabaseClient";

export default function UsernameScreen() {
  const navigate = useNavigate();
  const { setHandle, setOnboarded, saveProfile, name, avatar, userId } = useUserStore();
  const [input, setInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    if (!input.trim()) {
      setError("Please enter a handle.");
      return;
    }

    setChecking(true);
    setError("");

    const handleValue = input.trim().toLowerCase();

    // Check if handle already taken (skip if DB not ready)
    try {
      const { data, error: err } = await supabase
        .from("profiles")
        .select("handle")
        .eq("handle", handleValue);

      if (!err && data && data.length > 0) {
        setError("Handle already taken. Try another.");
        setChecking(false);
        return;
      }
    } catch (e) {
      // Database not ready, skip uniqueness check
      console.log("Handle check skipped (DB not ready)");
    }

    // Save locally
    setHandle(handleValue);
    
    // Mark onboarding as complete
    setOnboarded(true);

    // 🔹 SYNC PROFILE TO SUPABASE
    // Save username (display name), avatar, and handle to cloud
    try {
      console.log("📤 Syncing profile to Supabase...", { name, avatar, handle: handleValue });
      await saveProfile({
        username: name || null,
        avatar: avatar || null,
        handle: handleValue,
      });
      console.log("✅ Profile synced to Supabase");
    } catch (e) {
      console.error("Profile sync failed:", e);
      // Continue anyway - local storage has the data
    }
    
    // Navigate to homepage
    navigate("/");
  };

  const goToLogin = () => {
    navigate("/login");
  };

  const isValid = input.trim().length > 0;

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
          Choose your handle
        </h2>
        <p style={{ color: "#ccc", fontSize: "0.95rem", marginBottom: 24 }}>
          This is your unique @username for friends & challenges
        </p>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
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
            marginBottom: "8px",
          }}
        />

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
