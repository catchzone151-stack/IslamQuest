import { useState } from "react";
import { useNavigate } from "../hooks/useNavigate";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useUserStore } from "../store/useUserStore";
import { useProgressStore } from "../store/progressStore";
import { avatarIndexToKey } from "../utils/avatarUtils";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import WavingMascot from "../assets/mascots/mascot_waving.webp";

export default function Login() {
  const navigate = useNavigate();
  const { setOnboarded, setDisplayName, setHandle, setAvatar } = useUserStore();
  const loadFromSupabase = useProgressStore((s) => s.loadFromSupabase);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [shake, setShake] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLogin = async () => {
    setErrorMsg("");
    
    if (!email.trim() || !password) {
      setErrorMsg("Please enter email and password.");
      triggerShake();
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setErrorMsg("Invalid email or password");
        triggerShake();
        setLoading(false);
        return;
      }

      await loadFromSupabase();

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (profile) {
        setDisplayName(profile.username || "Student");
        setHandle(profile.handle || null);
        const avatarKey = typeof profile.avatar === "number" 
          ? avatarIndexToKey(profile.avatar) 
          : profile.avatar;
        setAvatar(avatarKey || "avatar_man_lantern");
      }

      setOnboarded(true);

      await useUserStore.getState().init();

      setLoading(false);
      navigate("/");
    } catch (err) {
      setErrorMsg("Something went wrong. Please try again.");
      triggerShake();
      setLoading(false);
    }
  };

  const shakeAnimation = {
    shake: {
      x: [0, -10, 10, -10, 10, -5, 5, 0],
      transition: { duration: 0.5 }
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{
        background: "linear-gradient(180deg, #0a0f1e 0%, #030614 100%)",
      }}
    >
      <motion.img
        src={WavingMascot}
        alt="Zayd"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        style={{
          width: "120px",
          height: "120px",
          objectFit: "contain",
          marginBottom: "-20px",
          zIndex: 10,
          filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.4))",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={shake ? "shake" : { opacity: 1, y: 0 }}
        variants={shakeAnimation}
        transition={{ duration: 0.5 }}
        style={{
          background: "linear-gradient(180deg, #111a2e 0%, #0a1220 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "24px",
          padding: "32px 24px",
          maxWidth: "380px",
          width: "100%",
          boxShadow: "0 25px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div className="text-center mb-6">
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              background: "linear-gradient(90deg, #fff 0%, #ffd88a 50%, #ffb700 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "8px",
            }}
          >
            Welcome Back
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>
            Sign in to continue your journey
          </p>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <div style={{ position: "relative" }}>
            <Mail
              size={18}
              color="rgba(255,255,255,0.4)"
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={{
                width: "100%",
                background: "var(--card-bg, rgba(11, 30, 54, 0.8))",
                border: "1px solid var(--border, rgba(255,255,255,0.1))",
                borderRadius: "12px",
                padding: "14px 16px 14px 44px",
                color: "var(--text, #fff)",
                fontSize: "0.95rem",
                outline: "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(139, 92, 246, 0.5)";
                e.target.style.boxShadow = "0 0 0 3px rgba(139, 92, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border, rgba(255,255,255,0.1))";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <div style={{ position: "relative" }}>
            <Lock
              size={18}
              color="rgba(255,255,255,0.4)"
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={{
                width: "100%",
                background: "var(--card-bg, rgba(11, 30, 54, 0.8))",
                border: "1px solid var(--border, rgba(255,255,255,0.1))",
                borderRadius: "12px",
                padding: "14px 44px 14px 44px",
                color: "var(--text, #fff)",
                fontSize: "0.95rem",
                outline: "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(139, 92, 246, 0.5)";
                e.target.style.boxShadow = "0 0 0 3px rgba(139, 92, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border, rgba(255,255,255,0.1))";
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {showPassword ? (
                <EyeOff size={18} color="rgba(255,255,255,0.4)" />
              ) : (
                <Eye size={18} color="rgba(255,255,255,0.4)" />
              )}
            </button>
          </div>
        </div>

        {errorMsg && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              color: "#ef4444",
              fontSize: "0.8rem",
              marginBottom: "12px",
              textAlign: "center",
            }}
          >
            {errorMsg}
          </motion.p>
        )}

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            height: "50px",
            background: loading
              ? "rgba(139, 92, 246, 0.5)"
              : "linear-gradient(90deg, var(--accent, #6366f1) 0%, var(--accent-glow, #8b5cf6) 100%)",
            border: "none",
            borderRadius: "12px",
            color: "#fff",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            boxShadow: loading ? "none" : "0 4px 20px rgba(139, 92, 246, 0.3)",
            marginTop: "8px",
          }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{
                  display: "inline-block",
                  width: "18px",
                  height: "18px",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                }}
              />
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </motion.button>

        <button
          onClick={() => setShowForgotModal(true)}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.5)",
            fontSize: "0.85rem",
            marginTop: "16px",
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
            width: "100%",
            textAlign: "center",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.color = "rgba(255,255,255,0.8)")}
          onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.5)")}
        >
          Forgot Password?
        </button>

        <div
          style={{
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            textAlign: "center",
          }}
        >
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/onboarding/bismillah")}
              style={{
                background: "transparent",
                border: "none",
                color: "#ffd88a",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              Create one
            </button>
          </p>
        </div>
      </motion.div>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </div>
  );
}
