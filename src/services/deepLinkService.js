import { handleDeepLink as handleFamilyDeepLink } from "./familyService";

let pendingDeepLink = null;
let deepLinkHandler = null;

export const initializeDeepLinking = (onFamilyJoin) => {
  deepLinkHandler = onFamilyJoin;
  
  if (typeof window === "undefined") return;
  
  if (window.Capacitor?.Plugins?.App) {
    window.Capacitor.Plugins.App.addListener("appUrlOpen", async (event) => {
      console.log("[DeepLink] App URL opened:", event.url);
      await processDeepLink(event.url);
    });
    
    window.Capacitor.Plugins.App.getLaunchUrl().then((result) => {
      if (result?.url) {
        console.log("[DeepLink] App launched with URL:", result.url);
        processDeepLink(result.url);
      }
    });
  }
  
  window.addEventListener("hashchange", () => {
    const hash = window.location.hash;
    if (hash.includes("family-join")) {
      const url = window.location.href;
      processDeepLink(url);
    }
  });
  
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  if (token && window.location.pathname.includes("family-join")) {
    processDeepLink(window.location.href);
  }
};

export const processDeepLink = async (url) => {
  try {
    console.log("[DeepLink] Processing:", url);
    
    if (url.includes("family-join")) {
      const result = await handleFamilyDeepLink(url);
      
      if (result.requiresAuth) {
        pendingDeepLink = {
          type: "family_join",
          token: result.token,
          url: url
        };
        console.log("[DeepLink] Saved pending family invite, auth required");
        return { handled: true, requiresAuth: true };
      }
      
      if (result.success && deepLinkHandler) {
        deepLinkHandler(result);
      }
      
      return { handled: true, ...result };
    }
    
    console.log("[DeepLink] Unknown deep link type:", url);
    return { handled: false };
  } catch (error) {
    console.error("[DeepLink] Error processing:", error);
    return { handled: false, error: error.message };
  }
};

export const getPendingDeepLink = () => {
  return pendingDeepLink;
};

export const clearPendingDeepLink = () => {
  pendingDeepLink = null;
};

export const processPendingDeepLink = async () => {
  if (!pendingDeepLink) return null;
  
  const pending = pendingDeepLink;
  pendingDeepLink = null;
  
  console.log("[DeepLink] Processing pending:", pending);
  
  if (pending.type === "family_join") {
    const result = await handleFamilyDeepLink(pending.url);
    
    if (result.success && deepLinkHandler) {
      deepLinkHandler(result);
    }
    
    return result;
  }
  
  return null;
};

export const createFamilyInviteLink = (token) => {
  const webLink = `https://islamquest.app/family-join?token=${token}`;
  const appLink = `islamquest://family-join?token=${token}`;
  
  return {
    webLink,
    appLink,
    universalLink: webLink
  };
};

export default {
  initializeDeepLinking,
  processDeepLink,
  getPendingDeepLink,
  clearPendingDeepLink,
  processPendingDeepLink,
  createFamilyInviteLink
};
