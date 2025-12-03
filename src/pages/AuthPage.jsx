import { useState } from "react";
import { useNavigate } from "../hooks/useNavigate";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, X, Send } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useUserStore } from "../store/useUserStore";
import { useProgressStore } from "../store/progressStore";
import { avatarIndexToKey, avatarKeyToIndex } from "../utils/avatarUtils";
import SittingMascot from "../assets/mascots/mascot_sitting.webp";

export default function AuthPage() {
  const navigate = useNavigate();
  const { setOnboarded, setDisplayName, setHandle, setAvatar } = useUserStore();

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

  const sendWelcomeEmail = async (userEmail, username) => {
    try {
      const { data, error } = await supabase.functions.invoke("send-welcome-email", {
        body: { email: userEmail, username },
      });
      
      if (error) {
        console.warn("[WelcomeEmail] Failed to send:", error);
      } else {
        console.log("[WelcomeEmail] Sent successfully to:", userEmail);
      }
    } catch (err) {
      console.warn("[WelcomeEmail] Error:", err.message);
    }
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
          
          // Profile exists - mark as onboarded and go home
          setOnboarded(true);
          localStorage.removeItem("iq_onboarding_step");
          localStorage.setItem("iq_profile_complete", "true");
          
          // Set profile ready state directly (don't call init() as it re-runs profile checks)
          useUserStore.setState({ 
            user: data.user, 
            userId: data.user.id,
            profileReady: true,
            hasOnboarded: true,
            loading: false,
            isHydrated: true,
          });
          
          // Load progress from cloud after successful login
          setTimeout(() => {
            useProgressStore.getState().loadFromSupabase();
            console.log("Progress loaded from cloud after login");
          }, 100);
          
          setLoading(false);
          navigate("/");
        } else {
          // No profile found - check if user completed onboarding (data in localStorage)
          const storedName = localStorage.getItem("iq_name") || useUserStore.getState().username;
          const storedHandle = localStorage.getItem("iq_handle") || useUserStore.getState().handle;
          const storedAvatar = localStorage.getItem("iq_avatar") || useUserStore.getState().avatar || "avatar_man_lantern";
          
          if (storedName && storedHandle) {
            // User completed onboarding but profile was created with old anonymous ID
            // Create profile for the authenticated user
            console.log("Creating profile for existing user with stored data...");
            
            // Convert avatar key to index for database (expects integer)
            const avatarIndex = avatarKeyToIndex(storedAvatar);
            
            // Get existing progress from localStorage/progressStore to preserve it
            const progressState = useProgressStore.getState();
            const localXp = progressState.xp || 0;
            const localCoins = progressState.coins || 0;
            const localStreak = progressState.streak || 0;
            
            console.log("Preserving local progress:", { xp: localXp, coins: localCoins, streak: localStreak });
            
            const { error: profileError } = await supabase
              .from("profiles")
              .upsert({
                user_id: data.user.id,
                username: storedName,
                handle: storedHandle,
                avatar: avatarIndex,
                xp: localXp,
                coins: localCoins,
                streak: localStreak,
                created_at: new Date().toISOString(),
              }, { onConflict: 'user_id' });
            
            if (profileError) {
              console.error("Profile creation error:", profileError);
              setErrorMsg("Could not restore your profile. Please try again.");
              setLoading(false);
              return;
            }
            
            console.log("PROFILE CREATED for existing user:", data.user.id);
            
            setDisplayName(storedName);
            setHandle(storedHandle);
            setAvatar(storedAvatar);
            setOnboarded(true);
            localStorage.removeItem("iq_onboarding_step");
            localStorage.setItem("iq_profile_complete", "true");
            
            useUserStore.setState({ 
              user: data.user, 
              userId: data.user.id,
              username: storedName,
              handle: storedHandle,
              avatar: storedAvatar,
              profileReady: true,
              hasOnboarded: true,
              loading: false,
              isHydrated: true,
            });
            
            // Sync full progress to cloud (includes lessonStates, paths)
            setTimeout(() => {
              useProgressStore.getState().syncToSupabase();
              console.log("Progress synced to cloud after login");
            }, 500);
            
            setLoading(false);
            navigate("/");
          } else {
            // No stored data - user needs to complete onboarding
            setLoading(false);
            setErrorMsg("Please complete your profile setup.");
            setTimeout(() => {
              navigate("/onboarding/bismillah");
            }, 1500);
          }
        }
        return;
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
          // Get onboarding data from localStorage/store
          const storedName = localStorage.getItem("iq_name") || useUserStore.getState().username || "Student";
          const storedHandle = localStorage.getItem("iq_handle") || useUserStore.getState().handle;
          const storedAvatar = localStorage.getItem("iq_avatar") || useUserStore.getState().avatar || "avatar_man_lantern";
          
          // Convert avatar key to index for database (expects integer)
          const avatarIndex = avatarKeyToIndex(storedAvatar);
          
          // Get existing progress from localStorage/progressStore to preserve it
          const progressState = useProgressStore.getState();
          const localXp = progressState.xp || 0;
          const localCoins = progressState.coins || 0;
          const localStreak = progressState.streak || 0;
          
          console.log("Preserving local progress on signup:", { xp: localXp, coins: localCoins, streak: localStreak });
          
          // Create profile for the NEW authenticated user
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert({
              user_id: data.user.id,
              username: storedName,
              handle: storedHandle,
              avatar: avatarIndex,
              xp: localXp,
              coins: localCoins,
              streak: localStreak,
              created_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
          
          if (profileError) {
            console.error("Profile creation error:", profileError);
            setErrorMsg("Account created but profile setup failed. Please try logging in.");
            setLoading(false);
            return;
          }
          
          console.log("PROFILE CREATED for user:", data.user.id);
          
          // Send welcome email (non-blocking)
          sendWelcomeEmail(email.trim(), storedName);
          
          // Set local state
          setDisplayName(storedName);
          setHandle(storedHandle);
          setAvatar(storedAvatar);
          setOnboarded(true);
          
          // Clear onboarding step and mark complete
          localStorage.removeItem("iq_onboarding_step");
          localStorage.setItem("iq_profile_complete", "true");
          
          // Set store state
          useUserStore.setState({ 
            user: data.user, 
            userId: data.user.id,
            username: storedName,
            handle: storedHandle,
            avatar: storedAvatar,
            profileReady: true,
            hasOnboarded: true,
            loading: false,
            isHydrated: true,
          });
          
          // Sync full progress to cloud (includes lessonStates, paths)
          // This pushes local progress to the newly created profile
          setTimeout(() => {
            useProgressStore.getState().syncToSupabase();
            console.log("Progress synced to cloud after signup");
          }, 500);
          
          setLoading(false);
          navigate("/");
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

      <AnimatePresence>
        {showForgotModal && (
          <ForgotPasswordInlineModal
            onClose={() => setShowForgotModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ForgotPasswordInlineModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async () => {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: window.location.origin + "/reset-password",
        }
      );

      if (resetError) {
        setError(resetError.message || "Failed to send reset email.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setError("");
    setSuccess(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={handleClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(180deg, #0f1a2e 0%, #0a1220 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "20px",
          padding: "24px",
          maxWidth: "360px",
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex justify-between items-center mb-5">
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              background: "linear-gradient(90deg, #fff 0%, #ffd88a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Reset Password
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={18} color="#fff" />
          </button>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-4"
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Mail size={28} color="#fff" />
            </div>
            <p style={{ color: "#10b981", fontSize: "1rem", fontWeight: 600, marginBottom: "8px" }}>
              Reset Link Sent!
            </p>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", lineHeight: 1.5 }}>
              A reset link has been sent to your email. Please check your inbox.
            </p>
            <button
              onClick={handleClose}
              style={{
                marginTop: "20px",
                background: "linear-gradient(90deg, var(--accent) 0%, var(--accent-glow, #8b5cf6) 100%)",
                border: "none",
                borderRadius: "12px",
                padding: "12px 24px",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
                width: "100%",
              }}
            >
              Got it
            </button>
          </motion.div>
        ) : (
          <>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", marginBottom: "16px", lineHeight: 1.5 }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <div style={{ position: "relative", marginBottom: "12px" }}>
              <Mail
                size={18}
                color="rgba(255,255,255,0.4)"
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleReset()}
                style={{
                  width: "100%",
                  background: "var(--card-bg, #0b1e36)",
                  border: "1px solid var(--border, rgba(255,255,255,0.1))",
                  borderRadius: "12px",
                  padding: "14px 16px 14px 42px",
                  color: "var(--text, #fff)",
                  fontSize: "0.95rem",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ color: "#ef4444", fontSize: "0.8rem", marginBottom: "12px" }}
              >
                {error}
              </motion.p>
            )}

            <button
              onClick={handleReset}
              disabled={loading}
              style={{
                width: "100%",
                background: loading
                  ? "rgba(139, 92, 246, 0.5)"
                  : "linear-gradient(90deg, var(--accent, #6366f1) 0%, var(--accent-glow, #8b5cf6) 100%)",
                border: "none",
                borderRadius: "12px",
                padding: "14px",
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.95rem",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
            >
              {loading ? (
                "Sending..."
              ) : (
                <>
                  <Send size={18} />
                  Send Reset Link
                </>
              )}
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
