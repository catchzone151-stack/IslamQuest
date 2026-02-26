import React, { useEffect, useState } from "react";
import { useNavigate } from "../hooks/useNavigate";
import { motion } from "framer-motion";
import { Mail, RefreshCw, CheckCircle } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useUserStore } from "../store/useUserStore";
import { useModalStore, MODAL_TYPES } from "../store/modalStore";
import { preloadUserData } from "../hooks/useDataPreloader";
import { avatarIndexToKey } from "../utils/avatarUtils";

// Module-level flag to prevent concurrent login processing
let isProcessingLogin = false;

export default function CheckEmailScreen() {
  const navigate = useNavigate();
  const { setOnboarded, setDisplayName, setHandle, setAvatar } = useUserStore();
  const { showModal } = useModalStore();
  const [checking, setChecking] = useState(false);
  const [email, setEmail] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");
  const [urlError, setUrlError] = useState("");

  useEffect(() => {
    const getEmail = async () => {
      const storedEmail = localStorage.getItem("iq_email");
      if (storedEmail) {
        setEmail(storedEmail);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setEmail(user.email);
      }
    };
    getEmail();
  }, []);

  // Handle auth callback when user returns from confirmation link
  useEffect(() => {
    const handleAuthCallback = async () => {
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);
      
      // Check for errors in URL (from failed confirmation link)
      if (hash.includes('error=') || searchParams.has('error')) {
        const hashParams = new URLSearchParams(hash.substring(1));
        const errorCode = hashParams.get('error_code') || searchParams.get('error_code') || '';
        const errorDesc = hashParams.get('error_description') || searchParams.get('error_description') || '';
        
        console.log("[CheckEmail] Auth error in URL:", errorCode, errorDesc);
        
        if (errorCode === 'otp_expired') {
          setUrlError("Your confirmation link has expired. Please click 'Resend confirmation email' to get a new link.");
        } else if (errorCode === 'access_denied') {
          setUrlError("There was a problem with your confirmation link. Please request a new one.");
        } else {
          setUrlError("Something went wrong. Please try requesting a new confirmation email.");
        }
        
        // Clear the URL
        window.history.replaceState(null, '', window.location.pathname);
        return;
      }
      
      // PKCE flow: exchange the code for a session
      if (searchParams.has('code')) {
        console.log("[CheckEmail] PKCE code detected, exchanging for session...");
        setLoadingMessage("Confirming your email...");
        window.history.replaceState(null, '', window.location.pathname);

        const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(searchParams.get('code'));
        if (exchangeError) {
          console.error("[CheckEmail] Code exchange failed:", exchangeError);
          setUrlError("Failed to confirm your email. Please request a new link.");
          setLoadingMessage("");
          return;
        }
        if (sessionData?.user?.email_confirmed_at) {
          console.log("[CheckEmail] PKCE confirmation success, proceeding...");
          await completeLoginAndPreload(sessionData.user);
        } else {
          setUrlError("Could not confirm your email. Please request a new link.");
          setLoadingMessage("");
        }
        return;
      }

      // Implicit flow: Supabase client auto-hydrates session from hash via detectSessionInUrl
      if (hash.includes('access_token')) {
        console.log("[CheckEmail] Implicit token detected, reading session...");
        setLoadingMessage("Confirming your email...");
        window.history.replaceState(null, '', window.location.pathname);

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email_confirmed_at) {
          console.log("[CheckEmail] Implicit confirmation success, proceeding...");
          await completeLoginAndPreload(session.user);
        } else {
          setUrlError("Could not confirm your email. Please try the link again or request a new one.");
          setLoadingMessage("");
        }
        return;
      }
    };
    
    handleAuthCallback();
  }, []);

  const completeLoginAndPreload = async (user) => {
    // Prevent duplicate processing from concurrent calls
    if (isProcessingLogin) {
      console.log("[CheckEmail] Already processing login, skipping duplicate call");
      return false;
    }
    isProcessingLogin = true;
    
    setLoadingMessage("Loading your data...");
    
    let profile = null;
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingProfile) {
      console.log("[CheckEmail] Using existing profile for user:", user.id);
      profile = existingProfile;
    } else {
      console.log("[CheckEmail] Profile missing — calling create_profile_if_missing RPC...");
      const meta = user.user_metadata || {};
      await supabase.rpc("create_profile_if_missing", {
        p_username: meta.desired_username || "User",
        p_handle: meta.desired_handle || null,
        p_avatar_index: typeof meta.desired_avatar_index === "number" ? meta.desired_avatar_index : 0,
      });

      const { data: createdProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (createdProfile) {
        console.log("[CheckEmail] Profile created via RPC for user:", user.id);
        profile = createdProfile;
      } else {
        console.error("[CheckEmail] Profile creation failed — redirecting to signup");
        localStorage.setItem("iq_onboarding_step", "signup");
        isProcessingLogin = false;
        navigate("/signup");
        return false;
      }
    }

    const displayName = profile.username || "Student";
    const handle = profile.handle || null;
    const avatarKey = typeof profile.avatar === "number"
      ? avatarIndexToKey(profile.avatar)
      : profile.avatar || "avatar_man_lantern";

    if (!handle) {
      console.log("[CheckEmail] Profile missing handle — sending to handle screen");
      localStorage.setItem("iq_onboarding_step", "handle");
      isProcessingLogin = false;
      navigate("/onboarding/handle");
      return false;
    }
    
    setDisplayName(displayName);
    setHandle(handle);
    setAvatar(avatarKey);
    
    localStorage.removeItem("iq_onboarding_step");
    localStorage.removeItem("iq_email");
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
      loading: false,
      isHydrated: true,
    });

    setLoadingMessage("Loading your progress, friends, and quests...");
    
    console.log("[CheckEmail] Starting parallel data preload...");
    const preloadResult = await preloadUserData(user.id);
    console.log(`[CheckEmail] Data preload complete in ${preloadResult.elapsed}ms`);
    
    setOnboarded(true);
    useUserStore.setState({ 
      profileReady: true,
      hasOnboarded: true,
    });
    
    // Reset flag before navigation
    isProcessingLogin = false;
    navigate("/");
    return true;
  };

  useEffect(() => {
    const checkEmailConfirmation = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.email_confirmed_at) {
        console.log("[CheckEmail] Email confirmed! Proceeding to preload...");
        await completeLoginAndPreload(user);
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
    setUrlError(""); // Clear any previous error
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email || email;
      if (userEmail) {
        const appUrl = window.location.origin;
        console.log("[CheckEmail] Resending confirmation to:", userEmail);
        await supabase.auth.resend({
          type: 'signup',
          email: userEmail,
          options: {
            emailRedirectTo: `${appUrl}/check-email`,
          },
        });
        showModal(MODAL_TYPES.SUCCESS, { message: "New confirmation email sent! Please check your inbox and click the link." });
      } else {
        showModal(MODAL_TYPES.ERROR, { message: "Could not find your email. Please try signing up again." });
      }
    } catch (err) {
      console.error("Resend error:", err);
      showModal(MODAL_TYPES.ERROR, { message: "Failed to resend email. Please try again." });
    }
    setChecking(false);
  };

  const handleCheckNow = async () => {
    setChecking(true);
    
    // First check if we have a current session
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user?.email_confirmed_at) {
      console.log("[CheckEmail] User confirmed, proceeding...");
      const success = await completeLoginAndPreload(user);
      if (!success) {
        setChecking(false);
      }
      return;
    }
    
    // If no session or not confirmed, the confirmation link may have opened in another tab
    // Redirect to login page where they can sign in with their confirmed account
    if (!user) {
      console.log("[CheckEmail] No session found - redirecting to login");
      showModal(MODAL_TYPES.SUCCESS, { message: "Great! Now please sign in with your email and password to continue." });
      localStorage.setItem("iq_onboarding_step", "login");
      navigate("/login");
      setChecking(false);
      return;
    }
    
    // User exists but not confirmed yet
    showModal(MODAL_TYPES.ERROR, { message: "Email not confirmed yet. Please check your inbox and click the confirmation link." });
    setChecking(false);
  };

  if (loadingMessage) {
    return (
      <div
        className="onboarding-screen"
        style={{
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100%",
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            style={{
              width: "50px",
              height: "50px",
              border: "3px solid rgba(212, 175, 55, 0.3)",
              borderTopColor: "#D4AF37",
              borderRadius: "50%",
            }}
          />
          <p style={{ color: "#D4AF37", fontSize: "1rem", fontWeight: 500 }}>
            {loadingMessage}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="onboarding-screen"
      style={{
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        paddingLeft: "24px",
        paddingRight: "24px",
        paddingTop: "24px",
        justifyContent: "center",
        minHeight: "100%",
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
          marginBottom: urlError ? "16px" : "32px",
          lineHeight: 1.5
        }}>
          Click the link in your email to confirm your account and start your learning journey.
        </p>

        {urlError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "10px",
              padding: "12px 16px",
              marginBottom: "24px",
              width: "100%",
            }}
          >
            <p style={{ color: "#ef4444", fontSize: "0.9rem", lineHeight: 1.5 }}>
              {urlError}
            </p>
          </motion.div>
        )}

        {!urlError && (
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
            <RefreshCw size={16} style={{ animation: "spin 2s linear infinite" }} />
            <span style={{ fontSize: "0.85rem" }}>Waiting for confirmation...</span>
          </motion.div>
        )}

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
