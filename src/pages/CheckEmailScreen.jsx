import React, { useEffect, useState } from "react";
import { useNavigate } from "../hooks/useNavigate";
import { motion } from "framer-motion";
import { Mail, RefreshCw, CheckCircle } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useUserStore } from "../store/useUserStore";
import { useProgressStore } from "../store/progressStore";
import { preloadUserData } from "../hooks/useDataPreloader";
import { avatarIndexToKey, avatarKeyToIndex } from "../utils/avatarUtils";

// Module-level flag to prevent duplicate profile creation
let isProcessingLogin = false;

export default function CheckEmailScreen() {
  const navigate = useNavigate();
  const { setOnboarded, setDisplayName, setHandle, setAvatar } = useUserStore();
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
      
      // Check if there are auth tokens in the URL (from successful email confirmation link)
      if (hash.includes('access_token') || searchParams.has('code')) {
        console.log("[CheckEmail] Auth callback detected in URL, processing immediately...");
        setLoadingMessage("Confirming your email...");
        
        // Clear the hash/params from URL immediately to prevent re-processing
        window.history.replaceState(null, '', window.location.pathname);
        
        // Give Supabase a moment to process the tokens
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Check if user is now confirmed
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email_confirmed_at) {
          console.log("[CheckEmail] User confirmed via callback, proceeding to home...");
          await completeLoginAndPreload(user);
        } else if (user) {
          console.log("[CheckEmail] User exists but not confirmed yet, checking again...");
          // Wait a bit more and try again
          await new Promise(resolve => setTimeout(resolve, 500));
          const { data: { user: refreshedUser } } = await supabase.auth.getUser();
          if (refreshedUser?.email_confirmed_at) {
            await completeLoginAndPreload(refreshedUser);
          } else {
            setLoadingMessage("");
          }
        } else {
          setLoadingMessage("");
        }
      }
    };
    
    handleAuthCallback();
  }, []);

  const createProfileIfMissing = async (user) => {
    const storedName = localStorage.getItem("iq_name") || "Student";
    const storedHandle = localStorage.getItem("iq_handle");
    const storedAvatar = localStorage.getItem("iq_avatar") || "avatar_man_lantern";
    
    if (!storedHandle) {
      console.log("No handle in localStorage - redirecting to signup");
      localStorage.setItem("iq_onboarding_step", "signup");
      navigate("/signup");
      return null;
    }
    
    const avatarIndex = avatarKeyToIndex(storedAvatar);
    const progressState = useProgressStore.getState();
    
    console.log("[CheckEmail] Creating profile for confirmed user:", user.id);
    
    const { data: newProfile, error } = await supabase
      .from("profiles")
      .upsert({
        user_id: user.id,
        username: storedName,
        handle: storedHandle.trim().toLowerCase(),
        avatar: avatarIndex,
        xp: progressState.xp || 0,
        coins: progressState.coins || 0,
        streak: progressState.streak || 0,
        created_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();
    
    if (error) {
      console.error("Failed to create profile:", error);
      return null;
    }
    
    console.log("[CheckEmail] Profile created successfully");
    return {
      ...newProfile,
      avatar: storedAvatar,
    };
  };

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
      console.log("[CheckEmail] No profile found - creating one now...");
      profile = await createProfileIfMissing(user);
      if (!profile) {
        isProcessingLogin = false;
        return false;
      }
    }

    const displayName = profile.username || "Student";
    const handle = profile.handle || null;
    const avatarKey = typeof profile.avatar === "number"
      ? avatarIndexToKey(profile.avatar)
      : profile.avatar || "avatar_man_lantern";
    
    if (!handle) {
      console.error("[CheckEmail] Profile missing handle - redirecting to signup");
      localStorage.setItem("iq_onboarding_step", "signup");
      isProcessingLogin = false;
      navigate("/signup");
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
        alert("New confirmation email sent! Please check your inbox and click the link.");
      } else {
        alert("Could not find your email. Please try signing up again.");
      }
    } catch (err) {
      console.error("Resend error:", err);
      alert("Failed to resend email. Please try again.");
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
      alert("Great! Now please sign in with your email and password to continue.");
      localStorage.setItem("iq_onboarding_step", "login");
      navigate("/login");
      setChecking(false);
      return;
    }
    
    // User exists but not confirmed yet
    alert("Email not confirmed yet. Please check your inbox and click the confirmation link.");
    setChecking(false);
  };

  if (loadingMessage) {
    return (
      <div
        className="onboarding-screen"
        style={{
          background: "linear-gradient(180deg, #0A1A2F 0%, #060D18 100%)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
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
