import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useModalStore } from "../store/modalStore";
import { useUserStore } from "../store/useUserStore";

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  padding: "20px",
};

const card = {
  background: "linear-gradient(135deg, #0a2a43 0%, #000814 100%)",
  border: "2px solid rgba(255,215,0,0.4)",
  borderRadius: "24px",
  padding: "32px 24px",
  maxWidth: "400px",
  width: "100%",
  boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 40px rgba(255,215,0,0.15)",
  textAlign: "center",
};

export default function VerifyEmailModal({ reason }) {
  const { hideModal } = useModalStore();
  const { user } = useUserStore();
  const [resendState, setResendState] = useState("idle");
  const [checkState, setCheckState] = useState("idle");

  const email = user?.email || localStorage.getItem("iq_email") || "";

  const handleResend = async () => {
    if (resendState === "loading") return;
    setResendState("loading");
    try {
      await supabase.auth.resend({ type: "signup", email });
      setResendState("sent");
    } catch {
      setResendState("error");
    }
  };

  const handleCheckVerified = async () => {
    if (checkState === "loading") return;
    setCheckState("loading");
    try {
      const { data } = await supabase.auth.getUser();
      const confirmed = !!data?.user?.email_confirmed_at;
      if (confirmed) {
        useUserStore.setState({ emailVerified: true });
        setCheckState("verified");
        setTimeout(hideModal, 800);
      } else {
        setCheckState("not_yet");
        setTimeout(() => setCheckState("idle"), 2500);
      }
    } catch {
      setCheckState("idle");
    }
  };

  const isXPCap = reason === "xp_cap";

  return (
    <div style={overlay} onClick={hideModal}>
      <div style={card} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: "2.4rem", marginBottom: "12px" }}>✉️</div>
        <h2
          style={{
            fontSize: "1.3rem",
            fontWeight: 700,
            color: "#FFD700",
            margin: "0 0 12px",
          }}
        >
          {isXPCap ? "XP Limit Reached" : "Verify Your Email"}
        </h2>
        <p
          style={{
            fontSize: "0.97rem",
            color: "#cbd5e1",
            lineHeight: 1.6,
            margin: "0 0 8px",
          }}
        >
          {isXPCap
            ? "You've reached the 1,000 XP limit for unverified accounts."
            : "Your email is not yet verified."}
        </p>
        <p
          style={{
            fontSize: "0.97rem",
            color: "#94a3b8",
            lineHeight: 1.6,
            margin: "0 0 24px",
          }}
        >
          Verify to unlock <strong style={{ color: "#FFD700" }}>leaderboards</strong>,{" "}
          <strong style={{ color: "#FFD700" }}>challenges</strong>,{" "}
          <strong style={{ color: "#FFD700" }}>friend requests</strong>, and{" "}
          <strong style={{ color: "#FFD700" }}>unlimited XP</strong>.
        </p>

        {email && (
          <p
            style={{
              fontSize: "0.82rem",
              color: "#64748b",
              marginBottom: "20px",
            }}
          >
            Sent to: <span style={{ color: "#94a3b8" }}>{email}</span>
          </p>
        )}

        <button
          onClick={handleCheckVerified}
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "10px",
            background:
              checkState === "verified"
                ? "linear-gradient(135deg, #10b981, #059669)"
                : "linear-gradient(135deg, #FFD700 0%, #b89600 100%)",
            border: "none",
            borderRadius: "12px",
            color: checkState === "verified" ? "#fff" : "#000814",
            fontSize: "1rem",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(255,215,0,0.3)",
            transition: "opacity 0.2s",
            opacity: checkState === "loading" ? 0.7 : 1,
          }}
        >
          {checkState === "loading"
            ? "Checking…"
            : checkState === "verified"
            ? "✓ Verified! Unlocking…"
            : checkState === "not_yet"
            ? "Not yet — check your inbox"
            : "I've Verified My Email ✓"}
        </button>

        <button
          onClick={handleResend}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
            background: "transparent",
            border: "2px solid rgba(255,215,0,0.35)",
            borderRadius: "12px",
            color:
              resendState === "sent"
                ? "#10b981"
                : resendState === "error"
                ? "#ef4444"
                : "#FFD700",
            fontSize: "0.95rem",
            fontWeight: 600,
            cursor: resendState === "loading" ? "not-allowed" : "pointer",
            opacity: resendState === "loading" ? 0.6 : 1,
          }}
        >
          {resendState === "loading"
            ? "Sending…"
            : resendState === "sent"
            ? "✓ Email resent!"
            : resendState === "error"
            ? "Failed — try again"
            : "Resend Verification Email"}
        </button>

        <button
          onClick={hideModal}
          style={{
            width: "100%",
            padding: "10px",
            background: "transparent",
            border: "none",
            color: "#475569",
            fontSize: "0.88rem",
            cursor: "pointer",
          }}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
