import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Check, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [hashError, setHashError] = useState("");

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("error=")) {
      const params = new URLSearchParams(hash.substring(1));
      const errorDesc = params.get("error_description");
      if (errorDesc) {
        setHashError(decodeURIComponent(errorDesc.replace(/\+/g, " ")));
      } else {
        setHashError("The reset link is invalid or has expired. Please request a new one.");
      }
    }
  }, []);

  const handleReset = async () => {
    if (!password.trim()) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message || "Failed to update password.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      setTimeout(() => {
        navigate("/auth");
      }, 2000);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (hashError) {
    return (
      <div
        className="screen no-extra-space flex items-center justify-center px-4"
        style={{
          background: "radial-gradient(circle at 20% 20%, rgba(10,15,30,1) 0%, rgba(3,6,20,1) 70%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: "linear-gradient(180deg, #0f1a2e 0%, #0a1220 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "20px",
            padding: "32px 24px",
            maxWidth: "380px",
            width: "100%",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <X size={28} color="#fff" />
          </div>

          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "#ef4444",
              marginBottom: "12px",
            }}
          >
            Link Expired
          </h2>

          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", marginBottom: "24px", lineHeight: 1.6 }}>
            {hashError}
          </p>

          <button
            onClick={() => navigate("/auth")}
            style={{
              background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)",
              border: "none",
              borderRadius: "12px",
              padding: "14px 24px",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              width: "100%",
            }}
          >
            Back to Login
          </button>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div
        className="screen no-extra-space flex items-center justify-center px-4"
        style={{
          background: "radial-gradient(circle at 20% 20%, rgba(10,15,30,1) 0%, rgba(3,6,20,1) 70%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: "linear-gradient(180deg, #0f1a2e 0%, #0a1220 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "20px",
            padding: "32px 24px",
            maxWidth: "380px",
            width: "100%",
            textAlign: "center",
          }}
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
              margin: "0 auto 20px",
            }}
          >
            <Check size={28} color="#fff" />
          </div>

          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "#10b981",
              marginBottom: "12px",
            }}
          >
            Password Updated!
          </h2>

          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", lineHeight: 1.6 }}>
            Your password has been successfully reset. Redirecting you to the app...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="screen no-extra-space flex items-center justify-center px-4"
      style={{
        background: "radial-gradient(circle at 20% 20%, rgba(10,15,30,1) 0%, rgba(3,6,20,1) 70%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: "linear-gradient(180deg, #0f1a2e 0%, #0a1220 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "20px",
          padding: "32px 24px",
          maxWidth: "380px",
          width: "100%",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            background: "linear-gradient(90deg, #fff 0%, #ffd88a 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "8px",
            textAlign: "center",
          }}
        >
          Set New Password
        </h2>

        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", marginBottom: "24px", textAlign: "center" }}>
          Enter your new password below
        </p>

        <div style={{ position: "relative", marginBottom: "16px" }}>
          <Lock
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
            type={showPassword ? "text" : "password"}
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              background: "#0b1e36",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              padding: "14px 44px 14px 42px",
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
              right: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {showPassword ? (
              <EyeOff size={18} color="rgba(255,255,255,0.4)" />
            ) : (
              <Eye size={18} color="rgba(255,255,255,0.4)" />
            )}
          </button>
        </div>

        <div style={{ position: "relative", marginBottom: "16px" }}>
          <Lock
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
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleReset()}
            style={{
              width: "100%",
              background: "#0b1e36",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              padding: "14px 44px 14px 42px",
              color: "#fff",
              fontSize: "0.95rem",
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{
              position: "absolute",
              right: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {showConfirmPassword ? (
              <EyeOff size={18} color="rgba(255,255,255,0.4)" />
            ) : (
              <Eye size={18} color="rgba(255,255,255,0.4)" />
            )}
          </button>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "16px", textAlign: "center" }}
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
              : "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)",
            border: "none",
            borderRadius: "12px",
            padding: "14px",
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.95rem",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

        <button
          onClick={() => navigate("/auth")}
          style={{
            width: "100%",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "12px",
            padding: "12px",
            color: "rgba(255,255,255,0.7)",
            fontWeight: 500,
            fontSize: "0.9rem",
            cursor: "pointer",
            marginTop: "12px",
          }}
        >
          Back to Login
        </button>
      </motion.div>
    </div>
  );
}
