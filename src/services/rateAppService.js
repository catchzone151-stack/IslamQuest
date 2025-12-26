import { Capacitor } from "@capacitor/core";

// ================================================================
// RATE APP SERVICE
// Handles platform-specific store deep linking for app ratings.
// 
// Android: Uses Play Store deep link with market:// scheme
// iOS: Uses App Store deep link with itms-apps:// scheme
// Web: Falls back to store URL (for PWA or testing)
// ================================================================

// ================================================================
// APP IDENTIFIERS
// Update these values for your specific app:
// - ANDROID_PACKAGE: Your app's package name (from capacitor.config)
// - IOS_APP_STORE_ID: Your numeric App Store ID (find in App Store Connect)
// ================================================================
const ANDROID_PACKAGE = "com.islamquest.app";
const IOS_APP_STORE_ID = "6745142588"; // Replace with actual App Store ID when available

// ================================================================
// PLATFORM DETECTION
// Uses Capacitor to detect if running on native platform
// ================================================================
const getPlatform = () => {
  if (Capacitor.isNativePlatform()) {
    return Capacitor.getPlatform(); // "ios" or "android"
  }
  return "web";
};

// ================================================================
// ANDROID RATING
// 
// Primary: market:// deep link (opens Play Store app directly)
// Fallback: HTTPS Play Store URL (opens in browser if app not available)
// 
// The market:// scheme is preferred because:
// 1. Opens Play Store app directly (better UX)
// 2. Takes user straight to the app listing
// 3. Works offline if Play Store app is installed
// ================================================================
const openAndroidRating = async () => {
  const marketUrl = `market://details?id=${ANDROID_PACKAGE}`;
  const webUrl = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
  
  try {
    // Try the market:// deep link first (opens Play Store app)
    console.log("[RateApp] Attempting Android market:// deep link");
    window.location.href = marketUrl;
    
    // Set a fallback timeout - if deep link fails, try web URL
    // This handles cases where Play Store isn't installed
    setTimeout(() => {
      // Check if we're still on the same page (deep link failed)
      if (document.hasFocus()) {
        console.log("[RateApp] market:// may have failed, trying web URL");
        window.open(webUrl, "_blank");
      }
    }, 2500);
    
    return { success: true, method: "market" };
  } catch (error) {
    console.error("[RateApp] Android rating error:", error);
    
    // Fallback to web URL
    try {
      window.open(webUrl, "_blank");
      return { success: true, method: "web_fallback" };
    } catch (fallbackError) {
      console.error("[RateApp] Android fallback error:", fallbackError);
      return { success: false, error: fallbackError.message };
    }
  }
};

// ================================================================
// iOS RATING
// 
// Primary: itms-apps:// scheme with action=write-review
// This opens the App Store app directly to the review section.
// 
// The action=write-review parameter:
// 1. Skips the app listing and goes straight to review form
// 2. Provides better conversion for ratings
// 3. Is the Apple-recommended approach
// 
// Note: SKStoreReviewController is preferred for in-app review
// but requires native plugin. This URL scheme is the fallback
// that works from web views and Capacitor apps.
// ================================================================
const openIOSRating = async () => {
  // itms-apps:// opens App Store app directly
  // action=write-review takes user to review screen
  const appStoreUrl = `itms-apps://itunes.apple.com/app/id${IOS_APP_STORE_ID}?action=write-review`;
  const webUrl = `https://apps.apple.com/app/id${IOS_APP_STORE_ID}?action=write-review`;
  
  try {
    console.log("[RateApp] Attempting iOS itms-apps:// deep link");
    window.location.href = appStoreUrl;
    
    // Fallback for edge cases where deep link doesn't work
    setTimeout(() => {
      if (document.hasFocus()) {
        console.log("[RateApp] itms-apps:// may have failed, trying web URL");
        window.open(webUrl, "_blank");
      }
    }, 2500);
    
    return { success: true, method: "itms-apps" };
  } catch (error) {
    console.error("[RateApp] iOS rating error:", error);
    
    // Fallback to web URL
    try {
      window.open(webUrl, "_blank");
      return { success: true, method: "web_fallback" };
    } catch (fallbackError) {
      console.error("[RateApp] iOS fallback error:", fallbackError);
      return { success: false, error: fallbackError.message };
    }
  }
};

// ================================================================
// WEB FALLBACK
// 
// For web/PWA users, detect likely platform from user agent
// and open the appropriate store URL in a new tab.
// ================================================================
const openWebRating = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Detect platform from user agent
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  
  let url;
  
  if (isIOS) {
    url = `https://apps.apple.com/app/id${IOS_APP_STORE_ID}?action=write-review`;
  } else if (isAndroid) {
    url = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
  } else {
    // Desktop - default to Play Store (or could show both options)
    url = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
  }
  
  console.log("[RateApp] Opening web store URL:", url);
  
  try {
    window.open(url, "_blank");
    return { success: true, method: "web", platform: isIOS ? "ios" : "android" };
  } catch (error) {
    console.error("[RateApp] Web rating error:", error);
    return { success: false, error: error.message };
  }
};

// ================================================================
// MAIN EXPORT: openRateApp()
// 
// Call this when user taps "Rate this App" button.
// Automatically detects platform and uses appropriate method.
// 
// Returns: { success: boolean, method?: string, error?: string }
// 
// Fails silently - no crashes, just logs errors.
// ================================================================
export const openRateApp = async () => {
  const platform = getPlatform();
  
  console.log("[RateApp] Opening rating for platform:", platform);
  
  try {
    switch (platform) {
      case "android":
        return await openAndroidRating();
      
      case "ios":
        return await openIOSRating();
      
      case "web":
      default:
        return openWebRating();
    }
  } catch (error) {
    // Fail silently - log error but don't crash
    console.error("[RateApp] Unexpected error:", error);
    return { success: false, error: error.message };
  }
};

// ================================================================
// UTILITY: Check if rating is available
// 
// Always returns true since we have web fallbacks,
// but could be extended to check for specific conditions.
// ================================================================
export const isRatingAvailable = () => {
  return true;
};

// ================================================================
// STORE URLs (for reference/manual use)
// ================================================================
export const STORE_URLS = {
  android: {
    market: `market://details?id=${ANDROID_PACKAGE}`,
    web: `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`
  },
  ios: {
    appStore: `itms-apps://itunes.apple.com/app/id${IOS_APP_STORE_ID}?action=write-review`,
    web: `https://apps.apple.com/app/id${IOS_APP_STORE_ID}?action=write-review`
  }
};

export default {
  openRateApp,
  isRatingAvailable,
  STORE_URLS
};
