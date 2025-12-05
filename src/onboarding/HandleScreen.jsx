import React, { useState, useEffect } from "react";
import { useNavigate } from "../hooks/useNavigate";
import { motion } from "framer-motion";
import { useUserStore } from "../store/useUserStore";
import { supabase } from "../lib/supabaseClient";
import { avatarIndexToKey } from "../utils/avatarUtils";

export default function HandleScreen() {
  const navigate = useNavigate();
  const { setHandle, userId, user } = useUserStore();
  const [handleValue, setHandleValue] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem("iq_onboarding_step", "handle");
  }, []);

  const isValid = handleValue.trim().length > 0;

  const handleContinue = async () => {
    if (!isValid) return;

    setChecking(true);
    setError("");

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

    setHandle(trimmedHandle);
    localStorage.setItem("iq_handle", trimmedHandle);

    if (uid) {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();
      
      if (existingProfile) {
        console.log("Updating existing profile with handle...");
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ handle: trimmedHandle })
          .eq("user_id", uid);
        
        if (updateError) {
          console.error("Failed to update profile with handle:", updateError);
          if (updateError.code === "23505") {
            setError("Handle already taken. Try another.");
          } else {
            setError("Failed to save handle. Please try again.");
          }
          setChecking(false);
          return;
        }
        
        console.log("Profile updated with handle, completing onboarding...");
        
        const storedName = localStorage.getItem("iq_name") || existingProfile.username || "Student";
        const rawAvatar = localStorage.getItem("iq_avatar") || existingProfile.avatar;
        const avatarKey = typeof rawAvatar === "number" 
          ? avatarIndexToKey(rawAvatar) 
          : (rawAvatar || "avatar_man_lantern");
        
        const updatedProfile = {
          ...existingProfile,
          handle: trimmedHandle,
          username: storedName,
          avatar: avatarKey,
        };
        
        localStorage.removeItem("iq_onboarding_step");
        localStorage.setItem("iq_profile_complete", "true");
        localStorage.setItem("iq_name", storedName);
        localStorage.setItem("iq_handle", trimmedHandle);
        localStorage.setItem("iq_avatar", avatarKey);
        
        useUserStore.setState({ 
          user: user,
          userId: uid,
          username: storedName,
          handle: trimmedHandle,
          avatar: avatarKey,
          name: storedName,
          profile: updatedProfile,
          profileReady: true,
          hasOnboarded: true,
          loading: false,
          isHydrated: true,
        });
        
        setChecking(false);
        navigate("/");
        return;
      }
    }

    localStorage.setItem("iq_onboarding_step", "auth");
    setChecking(false);
    navigate("/auth");
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
          Choose a username
        </h2>
        <p style={{ color: "#ccc", fontSize: "0.95rem", marginBottom: 24 }}>
          This is your unique @handle for friends & challenges
        </p>

        <div style={{ width: "100%", marginBottom: "8px" }}>
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
          <p style={{ color: "#888", fontSize: "0.8rem", marginTop: "6px" }}>
            Friends can find you with this handle
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
