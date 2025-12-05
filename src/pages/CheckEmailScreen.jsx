import React, { useEffect, useState } from "react";
import { useNavigate } from "../hooks/useNavigate";
import { motion } from "framer-motion";
import { Mail, RefreshCw, CheckCircle } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useUserStore } from "../store/useUserStore";
import { useProgressStore } from "../store/progressStore";
import { avatarIndexToKey } from "../utils/avatarUtils";

export default function CheckEmailScreen() {
  const navigate = useNavigate();
  const { setOnboarded, setDisplayName, setHandle, setAvatar } = useUserStore();
  const [checking, setChecking] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const getEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setEmail(user.email);
      }
    };
    getEmail();
  }, []);

  useEffect(() => {
    const checkEmailConfirmation = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.email_confirmed_at) {
        console.log("Email confirmed! Proceeding to home...");
        
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile) {
          const displayName = profile.username || "Student";
          const handle = profile.handle || null;
          const avatarKey = typeof profile.avatar === "number"
            ? avatarIndexToKey(profile.avatar)
            : profile.avatar || "avatar_man_lantern";
          
          if (!handle) {
            console.error("Profile missing handle during auto-check - redirecting");
            localStorage.setItem("iq_onboarding_step", "handle");
            navigate("/onboarding/handle");
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
            user: user, 
            userId: user.id,
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
          
          setTimeout(() => {
            useProgressStore.getState().loadFromSupabase();
          }, 100);
          
          navigate("/");
        }
      }
    };

    const interval = setInterval(checkEmailConfirmation, 3000);
    checkEmailConfirmation();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'USER_UPDATED' && session?.user?.email_confirmed_at) {
        checkEmailConfirmation();
      }
    });

    return () => {
      clearInterval(interval);
      subscription?.unsubscribe();
    };
  }, [navigate, setOnboarded, setDisplayName, setHandle, setAvatar]);

  const handleResendEmail = async () => {
    setChecking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        await supabase.auth.resend({
          type: 'signup',
          email: user.email,
        });
        alert("Confirmation email sent! Check your inbox.");
      }
    } catch (err) {
      console.error("Resend error:", err);
    }
    setChecking(false);
  };

  const handleCheckNow = async () => {
    setChecking(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user?.email_confirmed_at) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile) {
        const displayName = profile.username || "Student";
        const handle = profile.handle || null;
        const avatarKey = typeof profile.avatar === "number"
          ? avatarIndexToKey(profile.avatar)
          : profile.avatar || "avatar_man_lantern";
        
        if (!handle) {
          console.error("Profile missing handle - redirecting to handle screen");
          setChecking(false);
          localStorage.setItem("iq_onboarding_step", "handle");
          navigate("/onboarding/handle");
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
          user: user, 
          userId: user.id,
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
        
        setTimeout(() => {
          useProgressStore.getState().loadFromSupabase();
        }, 100);
        
        navigate("/");
        return;
      }
    }
    
    alert("Email not confirmed yet. Please check your inbox and click the confirmation link.");
    setChecking(false);
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
        minHeight: "100vh",
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
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(212, 175, 55, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
          }}
        >
          <Mail size={40} color="#D4AF37" />
        </motion.div>

        <h2 style={{ 
          color: "#D4AF37", 
          fontSize: "1.5rem", 
          marginBottom: "12px",
          fontWeight: "600"
        }}>
          Check your email
        </h2>
        
        <p style={{ 
          color: "#e5e5e5", 
          fontSize: "1rem", 
          marginBottom: "8px",
          lineHeight: 1.5
        }}>
          We've sent a confirmation link to
        </p>
        
        {email && (
          <p style={{ 
            color: "#D4AF37", 
            fontSize: "1rem", 
            fontWeight: "600",
            marginBottom: "24px"
          }}>
            {email}
          </p>
        )}

        <p style={{ 
          color: "#999", 
          fontSize: "0.9rem", 
          marginBottom: "32px",
          lineHeight: 1.5
        }}>
          Click the link in your email to confirm your account and start your learning journey.
        </p>

        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#888",
            marginBottom: "32px",
          }}
        >
          <RefreshCw size={16} className="animate-spin" style={{ animation: "spin 2s linear infinite" }} />
          <span style={{ fontSize: "0.85rem" }}>Waiting for confirmation...</span>
        </motion.div>

        <motion.button
          onClick={handleCheckNow}
          disabled={checking}
          whileHover={{ scale: 1.03, filter: "brightness(1.1)" }}
          whileTap={{ scale: 0.97 }}
          style={{
            background: "#D4AF37",
            color: "#0A1A2F",
            border: "none",
            borderRadius: 10,
            padding: "14px 32px",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: checking ? "not-allowed" : "pointer",
            width: "100%",
            maxWidth: "280px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <CheckCircle size={18} />
          {checking ? "Checking..." : "I've confirmed my email"}
        </motion.button>

        <motion.button
          onClick={handleResendEmail}
          disabled={checking}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            marginTop: "16px",
            background: "transparent",
            color: "#888",
            border: "1px solid rgba(136, 136, 136, 0.3)",
            borderRadius: 10,
            padding: "12px 24px",
            fontWeight: 500,
            fontSize: "0.9rem",
            cursor: checking ? "not-allowed" : "pointer",
          }}
        >
          Resend confirmation email
        </motion.button>

        <p style={{ 
          marginTop: "32px",
          color: "#666", 
          fontSize: "0.8rem",
          lineHeight: 1.5
        }}>
          Didn't receive the email? Check your spam folder or try resending.
        </p>
      </motion.div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
