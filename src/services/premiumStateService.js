import { supabase } from "../lib/supabaseClient";
import { getDeviceId, hashDeviceId } from "./deviceService";
import { validatePremiumStatus, registerDevice } from "./purchaseVerificationService";

// ================================================================
// TESTING MODE: Premium status is determined ONLY by profiles.premium
// This bypasses all IAP verification, device binding, and Edge Functions
// When real Play Store / App Store verification is ready, restore the
// original getPremiumStatus and syncPremiumOnAppOpen functions below
// ================================================================

const PREMIUM_CACHE_KEY = "iq_premium_cache";
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000;

const getPremiumCache = () => {
  try {
    const cached = localStorage.getItem(PREMIUM_CACHE_KEY);
    if (!cached) return null;
    
    const data = JSON.parse(cached);
    const age = Date.now() - data.timestamp;
    
    if (age > CACHE_MAX_AGE) {
      console.log("[PremiumState] Cache expired, will refresh");
      return { ...data, expired: true };
    }
    
    return data;
  } catch (error) {
    console.error("[PremiumState] Cache read error:", error);
    return null;
  }
};

const setPremiumCache = (premium, planType, deviceId) => {
  try {
    localStorage.setItem(PREMIUM_CACHE_KEY, JSON.stringify({
      premium,
      planType,
      deviceId,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error("[PremiumState] Cache write error:", error);
  }
};

export const clearPremiumCache = () => {
  localStorage.removeItem(PREMIUM_CACHE_KEY);
};

// TESTING MODE: Simplified premium check using only profiles.premium boolean
export const getPremiumStatus = async (forceRefresh = false) => {
  const cache = getPremiumCache();
  
  // Offline fallback - use cache if available
  if (!navigator.onLine) {
    console.log("[PremiumState] Offline - using cached status");
    if (cache) {
      return {
        premium: cache.premium,
        planType: cache.planType,
        source: "offline_cache"
      };
    }
    return { premium: false, planType: null, source: "offline_no_cache" };
  }
  
  // Use cache if valid and not forcing refresh
  if (!forceRefresh && cache && !cache.expired) {
    console.log("[PremiumState] Using valid cache");
    return {
      premium: cache.premium,
      planType: cache.planType,
      source: "cache"
    };
  }
  
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    if (!userId) {
      console.log("[PremiumState] No user logged in");
      return { premium: false, planType: null, source: "no_user" };
    }
    
    // TESTING MODE: Simply fetch profiles.premium boolean
    console.log("[PremiumState] TESTING MODE - fetching profiles.premium for user:", userId);
    const { data, error } = await supabase
      .from("profiles")
      .select("premium")
      .eq("user_id", userId)
      .single();
    
    if (error) {
      console.error("[PremiumState] Error fetching premium status:", error);
      if (cache) {
        return {
          premium: cache.premium,
          planType: cache.planType,
          source: "stale_cache"
        };
      }
      return { premium: false, planType: null, source: "error" };
    }
    
    const isPremium = data?.premium || false;
    console.log("[PremiumState] TESTING MODE - profiles.premium =", isPremium);
    
    // Cache the result
    setPremiumCache(isPremium, null, null);
    
    return {
      premium: isPremium,
      planType: null,
      source: "profiles_table"
    };
  } catch (error) {
    console.error("[PremiumState] Error in getPremiumStatus:", error);
    
    if (cache) {
      console.log("[PremiumState] Using stale cache as fallback");
      return {
        premium: cache.premium,
        planType: cache.planType,
        source: "stale_cache"
      };
    }
    
    return { premium: false, planType: null, source: "error" };
  }
};

export const initializeDeviceBinding = async () => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    if (!userId) {
      console.log("[PremiumState] No user for device binding");
      return { success: false, error: "Not authenticated" };
    }
    
    const deviceId = await getDeviceId();
    const hashedDeviceId = await hashDeviceId(deviceId);
    
    const result = await registerDevice(userId, hashedDeviceId);
    
    if (result.success) {
      console.log("[PremiumState] Device registered successfully");
      if (result.previousDeviceLoggedOut) {
        console.log("[PremiumState] Previous device was logged out");
      }
    }
    
    return result;
  } catch (error) {
    console.error("[PremiumState] Device binding error:", error);
    return { success: false, error: error.message };
  }
};

// TESTING MODE: Simplified sync - just fetch profiles.premium, skip device binding
export const syncPremiumOnAppOpen = async () => {
  try {
    // TESTING MODE: Skip device binding, just get premium status from profiles table
    const status = await getPremiumStatus(true);
    
    console.log("[PremiumState] TESTING MODE - App open sync complete:", {
      premium: status.premium,
      source: status.source
    });
    
    return status;
  } catch (error) {
    console.error("[PremiumState] App open sync error:", error);
    const cache = getPremiumCache();
    return {
      premium: cache?.premium || false,
      planType: cache?.planType || null,
      source: "error_fallback"
    };
  }
};

export const markPremiumActivated = (planType) => {
  const deviceId = localStorage.getItem("iq_device_hash") 
    ? JSON.parse(localStorage.getItem("iq_device_hash")).hash 
    : null;
  
  setPremiumCache(true, planType, deviceId);
};

export const markPremiumRevoked = () => {
  clearPremiumCache();
};

export default {
  getPremiumStatus,
  initializeDeviceBinding,
  syncPremiumOnAppOpen,
  clearPremiumCache,
  markPremiumActivated,
  markPremiumRevoked
};
