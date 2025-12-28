import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "../hooks/useNavigate";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, AtSign, ArrowLeft, Check, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useUserStore } from "../store/useUserStore";
import { useProgressStore } from "../store/progressStore";
import { avatarKeyToIndex } from "../utils/avatarUtils";
import { AVAILABLE_AVATARS } from "../utils/avatarUtils";
import { useOnboarding } from "../hooks/useOnboarding";
import { getAuthRedirectUrl } from "../utils/deepLinkHandler";
import assets from "../assets/assets";
import SittingMascot from "../assets/mascots/mascot_sitting.webp";

export default function SignUpPage() {
  const navigate = useNavigate();
  const { checkHandleAvailable } = useOnboarding();
  const { setDisplayName, setHandle: setStoreHandle, setAvatar: setStoreAvatar } = useUserStore();

  const [displayName, setDisplayNameLocal] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [shake, setShake] = useState(false);
  const [handleStatus, setHandleStatus] = useState({ checking: false, available: null, error: null });

  useEffect(() => {
    localStorage.setItem("iq_onboarding_step", "signup");
  }, []);

  const sortedAvatars = useMemo(
    () => AVAILABLE_AVATARS.map((key) => ({ key, src: assets.avatars[key] })).filter((a) => a.src),
    []
  );

  useEffect(() => {
    if (!handle.trim()) {
      setHandleStatus({ checking: false, available: null, error: null });
      return;
    }

    const timer = setTimeout(async () => {
      setHandleStatus({ checking: true, available: null, error: null });
      const result = await checkHandleAvailable(handle);
      setHandleStatus({
        checking: false,
        available: result.available,
        error: result.error,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [handle, checkHandleAvailable]);

  const isValidEmail = email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isValidPassword = password.length >= 6;
  const isValidName = displayName.trim().length >= 1;
  const isValidHandle = handle.trim().length >= 2 && handleStatus.available === true;
  const hasAvatar = selectedAvatar !== null;

  const isFormValid = isValidName && isValidHandle && isValidEmail && isValidPassword && hasAvatar;

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSignUp = async () => {
    setErrorMsg("");

    if (!isValidName) {
      setErrorMsg("Please enter your display name.");
      triggerShake();
      return;
    }

    if (!handle.trim()) {
      setErrorMsg("Please enter a username.");
      triggerShake();
      return;
    }

    if (handleStatus.available === false) {
      setErrorMsg(handleStatus.error || "Username is not available.");
      triggerShake();
      return;
    }

    if (!isValidEmail) {
      setErrorMsg("Please enter a valid email address.");
      triggerShake();
      return;
    }

    if (!isValidPassword) {
      setErrorMsg("Password must be at least 6 characters.");
      triggerShake();
      return;
    }

    if (!hasAvatar) {
      setErrorMsg("Please select an avatar.");
      triggerShake();
      return;
    }

    setLoading(true);

    try {
      const trimmedHandle = handle.trim().toLowerCase().replace(/^@/, "");
      const trimmedName = displayName.trim();
      const avatarKey = selectedAvatar;

      localStorage.setItem("iq_name", trimmedName);
      localStorage.setItem("iq_handle", trimmedHandle);
      localStorage.setItem("iq_avatar", avatarKey);
      localStorage.setItem("iq_email", email.trim().toLowerCase());

      // Sign out any existing anonymous session before creating new account
      // This prevents the confirmation email from going to the wrong address
      await supabase.auth.signOut();

      // Get the appropriate redirect URL (deep link for native, web URL for browser)
      const redirectUrl = getAuthRedirectUrl();
      console.log("[SignUp] Using redirect URL:", redirectUrl);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
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
        console.log("[SignUp] Auth user created:", data.user.id);
        
        // Create profile IMMEDIATELY after auth signup
        // This prevents "no account found" if email confirmation callback fails on mobile
        const avatarIndex = avatarKeyToIndex(avatarKey);
        const progressState = useProgressStore.getState();
        
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert(
            {
              user_id: data.user.id,
              username: trimmedName,
              handle: trimmedHandle,
              avatar: avatarIndex,
              xp: progressState.xp || 0,
              coins: progressState.coins || 0,
              streak: progressState.streak || 0,
              created_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );
        
        if (profileError) {
          console.error("[SignUp] Profile creation error:", profileError);
          setErrorMsg("Account created but profile setup failed. Please try logging in.");
          setLoading(false);
          return;
        }
        
        console.log("[SignUp] Profile created for user:", data.user.id);
        
        setDisplayName(trimmedName);
        setStoreHandle(trimmedHandle);
        setStoreAvatar(avatarKey);

        useUserStore.setState({
          user: data.user,
          userId: data.user.id,
          username: trimmedName,
          handle: trimmedHandle,
          avatar: avatarKey,
          loading: false,
          isHydrated: true,
        });

        setLoading(false);

        if (data.user.email_confirmed_at) {
          // Email already confirmed - go straight to home
          localStorage.removeItem("iq_onboarding_step");
          localStorage.setItem("iq_profile_complete", "true");
          useUserStore.setState({
            profileReady: true,
            hasOnboarded: true,
          });
          navigate("/");
        } else {
          // Normal flow: go to check-email to confirm email
          // Profile already exists, so login will work even if callback fails
          localStorage.setItem("iq_onboarding_step", "checkemail");
          navigate("/check-email");
        }
      }
    } catch (err) {
      console.error("Signup error:", err);
      setErrorMsg("Something went wrong. Please try again.");
      triggerShake();
      setLoading(false);
    }
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
        width: "100%",
        minHeight: "100vh",
        padding: "20px",
        paddingTop: "60px",
        paddingBottom: "40px",
        overflowY: "auto",
      }}
    >
      <motion.button
        onClick={() => navigate("/onboarding/auth-choice")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          position: "fixed",
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
          zIndex: 50,
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
          width: "80px",
          height: "80px",
          objectFit: "contain",
          marginBottom: "-12px",
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
          padding: "28px 20px",
          maxWidth: "400px",
          width: "100%",
          boxShadow: "0 25px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              background: "linear-gradient(90deg, #fff 0%, #ffd88a 50%, #ffb700 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "6px",
            }}
          >
            Create Account
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
            Start your Islamic learning journey
          </p>
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", marginBottom: 6, display: "block" }}>
            Display Name
          </label>
          <div style={{ position: "relative" }}>
            <User
              size={18}
              color="rgba(255,255,255,0.4)"
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayNameLocal(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(11, 30, 54, 0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "12px 14px 12px 42px",
                color: "#fff",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", marginBottom: 6, display: "block" }}>
            Username
          </label>
          <div style={{ position: "relative" }}>
            <AtSign
              size={18}
              color="rgba(255,255,255,0.4)"
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder="yourhandle"
              value={handle}
              onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              style={{
                width: "100%",
                background: "rgba(11, 30, 54, 0.8)",
                border: `1px solid ${handleStatus.available === false ? "#ef4444" : handleStatus.available === true ? "#22c55e" : "rgba(255,255,255,0.1)"}`,
                borderRadius: "12px",
                padding: "12px 42px 12px 42px",
                color: "#fff",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
            {handleStatus.checking && (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 18,
                  height: 18,
                  border: "2px solid rgba(255,255,255,0.2)",
                  borderTopColor: "#D4AF37",
                  borderRadius: "50%",
                  display: "inline-block",
                }}
              />
            )}
            {!handleStatus.checking && handleStatus.available === true && (
              <Check size={18} color="#22c55e" style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)" }} />
            )}
            {!handleStatus.checking && handleStatus.available === false && (
              <X size={18} color="#ef4444" style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)" }} />
            )}
          </div>
          {handleStatus.error && (
            <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: 4 }}>{handleStatus.error}</p>
          )}
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", marginTop: 4 }}>
            Friends can find you with @{handle || "yourhandle"}
          </p>
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", marginBottom: 6, display: "block" }}>
            Email
          </label>
          <div style={{ position: "relative" }}>
            <Mail
              size={18}
              color="rgba(255,255,255,0.4)"
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(11, 30, 54, 0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "12px 14px 12px 42px",
                color: "#fff",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "18px" }}>
          <label style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", marginBottom: 6, display: "block" }}>
            Password
          </label>
          <div style={{ position: "relative" }}>
            <Lock
              size={18}
              color="rgba(255,255,255,0.4)"
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="6+ characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(11, 30, 54, 0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "12px 42px 12px 42px",
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
              }}
            >
              {showPassword ? <EyeOff size={18} color="rgba(255,255,255,0.4)" /> : <Eye size={18} color="rgba(255,255,255,0.4)" />}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", marginBottom: 10, display: "block" }}>
            Choose Your Avatar
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: 8,
              maxHeight: "160px",
              overflowY: "auto",
              padding: "4px",
            }}
          >
            {sortedAvatars.map(({ key, src }) => (
              <motion.button
                key={key}
                onClick={() => setSelectedAvatar(key)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  borderRadius: "50%",
                  padding: 2,
                  border: selectedAvatar === key ? "2px solid #D4AF37" : "2px solid transparent",
                  background: "#0E1625",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
              >
                <img src={src} alt={key} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </motion.button>
            ))}
          </div>
        </div>

        {errorMsg && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ color: "#ef4444", fontSize: "0.8rem", marginBottom: "12px", textAlign: "center" }}
          >
            {errorMsg}
          </motion.p>
        )}

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSignUp}
          disabled={loading || !isFormValid}
          style={{
            width: "100%",
            height: "50px",
            background: loading || !isFormValid ? "rgba(212, 175, 55, 0.3)" : "linear-gradient(90deg, #D4AF37 0%, #c9a227 100%)",
            border: "none",
            borderRadius: "12px",
            color: loading || !isFormValid ? "rgba(255,255,255,0.5)" : "#0A1A2F",
            fontSize: "1rem",
            fontWeight: 700,
            cursor: loading || !isFormValid ? "not-allowed" : "pointer",
            boxShadow: loading || !isFormValid ? "none" : "0 4px 20px rgba(212, 175, 55, 0.3)",
          }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                style={{ display: "inline-block", width: 18, height: 18, border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#0A1A2F", borderRadius: "50%" }}
              />
              Creating account...
            </span>
          ) : (
            "Create Account"
          )}
        </motion.button>

        <p
          onClick={() => navigate("/login")}
          style={{ textAlign: "center", marginTop: "16px", color: "#888", fontSize: "0.85rem", cursor: "pointer" }}
        >
          Already have an account? <span style={{ color: "#D4AF37", textDecoration: "underline" }}>Log in</span>
        </p>
      </motion.div>
    </div>
  );
}
