import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Send } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function ForgotPasswordModal({ isOpen, onClose }) {
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
    </AnimatePresence>
  );
}
