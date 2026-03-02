import React, { useState, useEffect } from "react";
import { useNavigate } from "../hooks/useNavigate";
import { motion } from "framer-motion";
import { Mail, RefreshCw, CheckCircle, ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useUserStore } from "../store/useUserStore";

export default function ConfirmEmailPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const storedEmail =
      localStorage.getItem("iq_pending_confirm_email") ||
      localStorage.getItem("iq_email") ||
      "";
    setEmail(storedEmail);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (
          (event === "SIGNED_IN" || event === "USER_UPDATED") &&
          session?.user?.email_confirmed_at
        ) {
          console.log("[ConfirmEmail] Email confirmed — re-initialising store");
          localStorage.removeItem("iq_pending_confirm_email");

          // Reset store so init() re-runs from scratch with the new confirmed session
          useUserStore.setState({ isHydrated: false, emailVerified: false });
          window.__iq_auth_init_complete = false;
          window.__iq_auth_init_running = false;

          await useUserStore.getState().init();
          navigate("/", { replace: true });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email || resending || cooldown > 0) return;
    setResending(true);
    setError("");

    const appUrl = window.location.origin;
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${appUrl}/check-email`,
      },
    });

    setResending(false);
    if (resendError) {
      setError(resendError.message);
    } else {
      setResent(true);
      setCooldown(60);
      setTimeout(() => setResent(false), 5000);
    }
  };

  const handleBackToLogin = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("iq_pending_confirm_email");
    localStorage.removeItem("iq_email");
    localStorage.removeItem("iq_onboarding_step");
    navigate("/login", { replace: true });
  };

  return (
    <div
      style={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        textAlign: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: "100%", maxWidth: "380px" }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", damping: 20 }}
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.08) 100%)",
            border: "2px solid rgba(212, 175, 55, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 28px",
          }}
        >
          <Mail size={36} color="#d4af37" />
        </motion.div>

        <h1
          style={{
            color: "#d4af37",
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "12px",
            letterSpacing: "-0.02em",
          }}
        >
          Confirm your email
        </h1>

        <p
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: "0.95rem",
            lineHeight: 1.6,
            marginBottom: "8px",
          }}
        >
          We sent a confirmation link to:
        </p>

        {email && (
          <p
            style={{
              color: "white",
              fontWeight: 600,
              fontSize: "1rem",
              marginBottom: "24px",
              background: "rgba(212,175,55,0.1)",
              border: "1px solid rgba(212,175,55,0.25)",
              borderRadius: "10px",
              padding: "10px 16px",
              wordBreak: "break-all",
            }}
          >
            {email}
          </p>
        )}

        <p
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "0.875rem",
            lineHeight: 1.6,
            marginBottom: "32px",
          }}
        >
          Click the link in the email to activate your account. This page will
          update automatically once confirmed.
        </p>

        {resent && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background: "rgba(34, 197, 94, 0.12)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              borderRadius: "10px",
              padding: "10px 16px",
              marginBottom: "16px",
            }}
          >
            <CheckCircle size={16} color="#22c55e" />
            <span style={{ color: "#22c55e", fontSize: "0.875rem", fontWeight: 600 }}>
              Confirmation email resent!
            </span>
          </motion.div>
        )}

        {error && (
          <p
            style={{
              color: "#ef4444",
              fontSize: "0.85rem",
              marginBottom: "16px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "8px",
              padding: "8px 12px",
            }}
          >
            {error}
          </p>
        )}

        <button
          onClick={handleResend}
          disabled={resending || cooldown > 0}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            background:
              resending || cooldown > 0
                ? "rgba(212,175,55,0.2)"
                : "linear-gradient(135deg, #d4af37 0%, #b8962e 100%)",
            color: resending || cooldown > 0 ? "rgba(255,255,255,0.5)" : "#0e2340",
            fontWeight: 700,
            fontSize: "0.95rem",
            border: "none",
            cursor: resending || cooldown > 0 ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "16px",
            transition: "all 0.2s",
          }}
        >
          {resending ? (
            <>
              <span
                style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "white",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  display: "inline-block",
                }}
              />
              Sending...
            </>
          ) : cooldown > 0 ? (
            `Resend in ${cooldown}s`
          ) : (
            <>
              <RefreshCw size={16} />
              Resend confirmation email
            </>
          )}
        </button>

        <button
          onClick={handleBackToLogin}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "12px",
            background: "transparent",
            color: "rgba(255,255,255,0.5)",
            fontWeight: 500,
            fontSize: "0.875rem",
            border: "1px solid rgba(255,255,255,0.12)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.8)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.5)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
          }}
        >
          <ArrowLeft size={14} />
          Use a different email
        </button>
      </motion.div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
