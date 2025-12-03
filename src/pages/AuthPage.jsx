import { useState } from "react";
import { useNavigate } from "../hooks/useNavigate";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useUserStore } from "../store/useUserStore";
import { useProgressStore } from "../store/progressStore";
import { avatarIndexToKey } from "../utils/avatarUtils";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import SittingMascot from "../assets/mascots/mascot_sitting.webp";

export default function AuthPage() {
  const navigate = useNavigate();
  const { setOnboarded, setDisplayName, setHandle, setAvatar } = useUserStore();
  const loadFromSupabase = useProgressStore((s) => s.loadFromSupabase);

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [shake, setShake] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const isLogin = mode === "login";
  const isValidEmail = email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isValidPassword = password.length >= 6;
  const isFormValid = isValidEmail && isValidPassword;

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async () => {
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      triggerShake();
      return;
    }

    if (!isValidEmail) {
      setErrorMsg("Please enter a valid email address.");
      triggerShake();
      return;
    }

    if (!password) {
      setErrorMsg("Please enter a password.");
      triggerShake();
      return;
    }

    if (!isValidPassword) {
      setErrorMsg("Password must be at least 6 characters.");
      triggerShake();
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
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
        localStorage.removeItem("iq_onboarding_step");
        await useUserStore.getState().init();
        setLoading(false);
        navigate("/");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) {
          if (error.message.includes("already registered")) {
            setErrorMsg("This email is already registered. Try logging in.");
          } else {
            setErrorMsg(error.message || "Could not create account.");
          }
          triggerShake();
          setLoading(false);
          return;
        }

        if (data?.user) {
          await loadFromSupabase();

          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", data.user.id)
            .maybeSingle();

          if (profile && profile.username && profile.handle) {
            setDisplayName(profile.username || "Student");
            setHandle(profile.handle || null);
            const avatarKey = typeof profile.avatar === "number"
              ? avatarIndexToKey(profile.avatar)
              : profile.avatar;
            setAvatar(avatarKey || "avatar_man_lantern");
            setOnboarded(true);
            localStorage.removeItem("iq_onboarding_step");
            await useUserStore.getState().init();
            setLoading(false);
            navigate("/");
          } else {
            setLoading(false);
            setErrorMsg("Account created! Complete your profile to continue.");
            setTimeout(() => {
              navigate("/onboarding/bismillah");
            }, 1500);
          }
        } else {
          setLoading(false);
          setErrorMsg("Account created! Check your email to verify.");
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        minHeight: "100vh",
      }}
    >
      <motion.img
        src={SittingMascot}
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
          <AnimatePresence mode="wait">
            <motion.h1
              key={mode}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                background: "linear-gradient(90deg, #fff 0%, #ffd88a 50%, #ffb700 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "8px",
              }}
            >
              {isLogin ? "Welcome Back" : "Create Account"}
            </motion.h1>
          </AnimatePresence>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>
            {isLogin ? "Sign in to continue your journey" : "Start your Islamic learning journey"}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            background: "rgba(0,0,0,0.3)",
            borderRadius: "12px",
            padding: "4px",
            marginBottom: "20px",
          }}
        >
          <button
            onClick={() => { setMode("login"); setErrorMsg(""); }}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "10px",
              border: "none",
              background: isLogin ? "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)" : "transparent",
              color: isLogin ? "#fff" : "rgba(255,255,255,0.5)",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Log In
          </button>
          <button
            onClick={() => { setMode("signup"); setErrorMsg(""); }}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "10px",
              border: "none",
              background: !isLogin ? "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)" : "transparent",
              color: !isLogin ? "#fff" : "rgba(255,255,255,0.5)",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Sign Up
          </button>
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
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
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
              placeholder={isLogin ? "Password" : "Create password (6+ characters)"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
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
          onClick={handleSubmit}
          disabled={loading || !isFormValid}
          style={{
            width: "100%",
            height: "50px",
            background: loading || !isFormValid
              ? "rgba(139, 92, 246, 0.3)"
              : "linear-gradient(90deg, var(--accent, #6366f1) 0%, var(--accent-glow, #8b5cf6) 100%)",
            border: "none",
            borderRadius: "12px",
            color: loading || !isFormValid ? "rgba(255,255,255,0.5)" : "#fff",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: loading || !isFormValid ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            boxShadow: loading || !isFormValid ? "none" : "0 4px 20px rgba(139, 92, 246, 0.3)",
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
              {isLogin ? "Signing in..." : "Creating account..."}
            </span>
          ) : (
            "Continue"
          )}
        </motion.button>

        {isLogin && (
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
        )}

        <p
          style={{
            marginTop: "24px",
            paddingTop: "16px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.35)",
            fontSize: "0.75rem",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          By continuing you agree to our Terms of Service & Privacy Policy.
        </p>
      </motion.div>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </div>
  );
}
