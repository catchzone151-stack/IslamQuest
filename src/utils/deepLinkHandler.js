import { App as CapApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { supabase } from "../lib/supabaseClient";

const DEEP_LINK_SCHEME = "islamquest://";

export function extractAuthTokensFromUrl(url) {
  try {
    let hashString = "";
    
    if (url.includes("#")) {
      hashString = url.split("#")[1];
    } else if (url.includes("?")) {
      hashString = url.split("?")[1];
    }
    
    if (!hashString) return null;
    
    const params = new URLSearchParams(hashString);
    
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");
    const error = params.get("error");
    const errorDescription = params.get("error_description");
    
    if (error) {
      return { error, errorDescription };
    }
    
    if (accessToken) {
      return { accessToken, refreshToken, type };
    }
    
    return null;
  } catch (err) {
    console.error("[DeepLink] Failed to parse URL:", err);
    return null;
  }
}

export function determineAuthRoute(type) {
  switch (type) {
    case "recovery":
      return "/reset-password";
    case "signup":
    case "email_confirmation":
      return "/";
    case "magiclink":
      return "/";
    default:
      return "/";
  }
}

export async function handleDeepLinkAuth(url, navigate) {
  console.log("[DeepLink] Processing auth URL:", url);
  
  const tokens = extractAuthTokensFromUrl(url);
  
  if (!tokens) {
    console.log("[DeepLink] No auth tokens found in URL");
    return false;
  }
  
  if (tokens.error) {
    console.error("[DeepLink] Auth error:", tokens.error, tokens.errorDescription);
    const errorRoute = `/reset-password#error=${tokens.error}&error_description=${encodeURIComponent(tokens.errorDescription || "")}`;
    if (navigate) navigate(errorRoute);
    return true;
  }
  
  const { accessToken, refreshToken, type } = tokens;
  
  if (!accessToken) {
    console.log("[DeepLink] No access token in URL");
    return false;
  }
  
  try {
    console.log("[DeepLink] Setting Supabase session with tokens, type:", type);
    
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    
    if (error) {
      console.error("[DeepLink] Failed to set session:", error);
      return false;
    }
    
    console.log("[DeepLink] Session established for user:", data.user?.id);
    
    const targetRoute = determineAuthRoute(type);
    console.log("[DeepLink] Navigating to:", targetRoute);
    
    if (type === "recovery") {
      if (navigate) navigate("/reset-password");
    } else if (type === "signup" || type === "email_confirmation") {
      localStorage.removeItem("iq_onboarding_step");
      localStorage.setItem("iq_profile_complete", "true");
      if (navigate) navigate("/");
    } else {
      if (navigate) navigate(targetRoute);
    }
    
    return true;
  } catch (err) {
    console.error("[DeepLink] Error handling auth:", err);
    return false;
  }
}

export function initDeepLinkListener(navigate) {
  if (!Capacitor.isNativePlatform()) {
    console.log("[DeepLink] Not on native platform, skipping listener setup");
    return () => {};
  }
  
  console.log("[DeepLink] Setting up native deep link listener");
  
  CapApp.addListener("appUrlOpen", async ({ url }) => {
    console.log("[DeepLink] App opened with URL:", url);
    
    if (url.startsWith(DEEP_LINK_SCHEME)) {
      const handled = await handleDeepLinkAuth(url, navigate);
      if (!handled) {
        console.log("[DeepLink] URL not handled as auth, checking for other routes");
        const path = url.replace(DEEP_LINK_SCHEME, "").replace("auth/callback", "");
        if (path && navigate) {
          navigate("/" + path);
        }
      }
    }
  });
  
  CapApp.getLaunchUrl().then(async (result) => {
    if (result?.url) {
      console.log("[DeepLink] App launched with URL:", result.url);
      if (result.url.startsWith(DEEP_LINK_SCHEME)) {
        await handleDeepLinkAuth(result.url, navigate);
      }
    }
  });
  
  return () => {
    CapApp.removeAllListeners();
  };
}

export function getAuthRedirectUrl() {
  if (Capacitor.isNativePlatform()) {
    return "islamquest://auth/callback";
  }
  return `${window.location.origin}/check-email`;
}

export function getPasswordResetRedirectUrl() {
  if (Capacitor.isNativePlatform()) {
    return "islamquest://auth/callback";
  }
  return `${window.location.origin}/reset-password`;
}
