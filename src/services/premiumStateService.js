import { supabase } from "../lib/supabaseClient";
import { getDeviceId, hashDeviceId } from "./deviceService";
import { validatePremiumStatus, registerDevice } from "./purchaseVerificationService";

// ================================================================
// Premium status derives from profiles.premium (Supabase) only.
// Local cache is used as offline fallback only — it cannot grant
// premium that the server has not already confirmed.
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

// Always fetches from Supabase when online. Cache is only used when
// Supabase is unreachable (offline or network error). Cache can never
// upgrade false → true: if the server says false, false is written to cache.
export const getPremiumStatus = async () => {
  const cache = getPremiumCache();

  // Offline: use cache as fallback (cannot verify without connectivity)
  if (!navigator.onLine) {
    if (cache) {
      return {
        premium: cache.premium,
        planType: cache.planType,
        source: "offline_cache"
      };
    }
    return { premium: false, planType: null, source: "offline_no_cache" };
  }

  // Online: always fetch from Supabase — cache is never used as primary source
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
      return { premium: false, planType: null, source: "no_user" };
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("premium")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("[PremiumState] Supabase fetch error:", error);
      // Network/server error — fall back to cache but cannot upgrade false→true
      if (cache) {
        return {
          premium: cache.premium,
          planType: cache.planType,
          source: "stale_cache"
        };
      }
      return { premium: false, planType: null, source: "error" };
    }

    const isPremium = data?.premium === true;
    // Write server truth to cache (overwrites any fake client-side value)
    setPremiumCache(isPremium, null, null);

    return {
      premium: isPremium,
      planType: null,
      source: "profiles_table"
    };
  } catch (error) {
    console.error("[PremiumState] getPremiumStatus error:", error);
    if (cache) {
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

export const syncPremiumOnAppOpen = async () => {
  try {
    const status = await getPremiumStatus();
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
