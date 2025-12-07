import { useState, useEffect } from "react";
import { useNavigate } from "../hooks/useNavigate";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, X, Send, ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useUserStore } from "../store/useUserStore";
import { preloadUserData } from "../hooks/useDataPreloader";
import { avatarIndexToKey } from "../utils/avatarUtils";
import SittingMascot from "../assets/mascots/mascot_sitting.webp";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setOnboarded, setDisplayName, setHandle, setAvatar } = useUserStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [shake, setShake] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSending, setForgotSending] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  useEffect(() => {
    localStorage.setItem("iq_onboarding_step", "login");
  }, []);

  const isValidEmail = email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isValidPassword = password.length >= 6;
  const isFormValid = isValidEmail && isValidPassword;

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLogin = async () => {
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
      // Sign out any existing anonymous session before logging in
      // This prevents session conflicts with old hidden.local accounts
      await supabase.auth.signOut();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          localStorage.setItem("iq_email", email.trim().toLowerCase());
          setLoading(false);
          navigate("/check-email");
          return;
        }
        setErrorMsg("Invalid email or password");
        triggerShake();
        setLoading(false);
        return;
      }

      if (!data.user.email_confirmed_at) {
        localStorage.setItem("iq_email", email.trim().toLowerCase());
        setLoading(false);
        navigate("/check-email");
        return;
      }

      console.log("[LoginPage] Login successful, preloading data...");

      const preloadResult = await preloadUserData(data.user.id);

      if (!preloadResult.success) {
        console.log("[LoginPage] No profile found - redirecting to signup");
        await supabase.auth.signOut();
        setErrorMsg("No account found. Please sign up first.");
        setLoading(false);
        return;
      }

      const profile = preloadResult.profile;
      const displayName = profile.username || "Student";
      const handle = profile.handle || null;
      const avatarKey = typeof profile.avatar === "number"
        ? avatarIndexToKey(profile.avatar)
        : profile.avatar || "avatar_man_lantern";

      if (!handle) {
        console.log("[LoginPage] Profile missing handle");
        setErrorMsg("Your profile is incomplete. Please contact support.");
        setLoading(false);
        return;
      }

      setDisplayName(displayName);
      setHandle(handle);
      setAvatar(avatarKey);
      setOnboarded(true);

      localStorage.removeItem("iq_onboarding_step");
      localStorage.setItem("iq_profile_complete", "true");
      localStorage.setItem("iq_name", displayName);
      localStorage.setItem("iq_handle", handle);
      localStorage.setItem("iq_avatar", avatarKey);

      useUserStore.setState({
        user: data.user,
        userId: data.user.id,
        username: displayName,
        handle: handle,
        avatar: avatarKey,
        name: displayName,
        profile: profile,
        profileReady: true,
        hasOnboarded: true,
        loading: false,
        isHydrated: true,
      });

      console.log(`[LoginPage] Data preloaded in ${preloadResult.elapsed}ms`);
      setLoading(false);
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg("Something went wrong. Please try again.");
      triggerShake();
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) return;

    setForgotSending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        forgotEmail.trim().toLowerCase(),
        { redirectTo: `${window.location.origin}/reset-password` }
      );

      if (error) {
        console.error("Reset password error:", error);
      }

      setForgotSuccess(true);
    } catch (err) {
      console.error("Forgot password error:", err);
    }
    setForgotSending(false);
  };

  const shakeAnimation = {
    shake: {
      x: [0, -10, 10, -10, 10, -5, 5, 0],
      transition: { duration: 0.5 },
    },
  };

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #0a0f1e 0%, #030614 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <motion.button
        onClick={() => navigate("/onboarding/auth-choice")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          background: "rgba(255,255,255,0.1)",
          border: "none",
          borderRadius: "50%",
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <ArrowLeft size={20} color="#fff" />
      </motion.button>

      <motion.img
        src={SittingMascot}
        alt="Zayd"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        style={{
          width: "100px",
          height: "100px",
          objectFit: "contain",
          marginBottom: "-16px",
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
        <div style={{ textAlign: "center", marginBottom: 24 }}>
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
                background: "rgba(11, 30, 54, 0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "14px 16px 14px 44px",
                color: "#fff",
                fontSize: "0.95rem",
                outline: "none",
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
                background: "rgba(11, 30, 54, 0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "14px 44px 14px 44px",
                color: "#fff",
                fontSize: "0.95rem",
                outline: "none",
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

        <button
          onClick={() => {
            setForgotEmail(email);
            setShowForgotModal(true);
          }}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(212, 175, 55, 0.8)",
            fontSize: "0.85rem",
            cursor: "pointer",
            marginBottom: "16px",
            padding: 0,
          }}
        >
          Forgot password?
        </button>

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
          disabled={loading || !isFormValid}
          style={{
            width: "100%",
            height: "50px",
            background:
              loading || !isFormValid
                ? "rgba(139, 92, 246, 0.3)"
                : "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)",
            border: "none",
            borderRadius: "12px",
            color: loading || !isFormValid ? "rgba(255,255,255,0.5)" : "#fff",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: loading || !isFormValid ? "not-allowed" : "pointer",
            boxShadow:
              loading || !isFormValid
                ? "none"
                : "0 4px 20px rgba(139, 92, 246, 0.3)",
          }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                style={{ display: "inline-block", width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%" }}
              />
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </motion.button>

        <p
          onClick={() => navigate("/signup")}
          style={{
            textAlign: "center",
            marginTop: "20px",
            color: "#888",
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
        >
          Don't have an account?{" "}
          <span style={{ color: "#D4AF37", textDecoration: "underline" }}>Sign up</span>
        </p>
      </motion.div>

      <AnimatePresence>
        {showForgotModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForgotModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              padding: 20,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "linear-gradient(180deg, #111a2e 0%, #0a1220 100%)",
                borderRadius: "20px",
                padding: "28px 24px",
                maxWidth: "340px",
                width: "100%",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 600 }}>
                  Reset Password
                </h3>
                <button
                  onClick={() => setShowForgotModal(false)}
                  style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4 }}
                >
                  <X size={20} color="rgba(255,255,255,0.5)" />
                </button>
              </div>

              {!forgotSuccess ? (
                <>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", marginBottom: 16 }}>
                    Enter your email and we'll send you a reset link.
                  </p>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    style={{
                      width: "100%",
                      background: "rgba(11, 30, 54, 0.8)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      padding: "12px 14px",
                      color: "#fff",
                      fontSize: "0.9rem",
                      marginBottom: 16,
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={handleForgotPassword}
                    disabled={forgotSending || !forgotEmail.trim()}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: forgotSending || !forgotEmail.trim() ? "rgba(139, 92, 246, 0.3)" : "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)",
                      border: "none",
                      borderRadius: "10px",
                      color: "#fff",
                      fontWeight: 600,
                      cursor: forgotSending || !forgotEmail.trim() ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Send size={16} />
                    {forgotSending ? "Sending..." : "Send Reset Link"}
                  </button>
                </>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📧</div>
                  <p style={{ color: "#fff", fontWeight: 500, marginBottom: 8 }}>
                    Check your email!
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>
                    We've sent a password reset link to your email.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
