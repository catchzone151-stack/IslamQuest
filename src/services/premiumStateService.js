import { supabase } from "../lib/supabaseClient";
import { getDeviceId, hashDeviceId } from "./deviceService";
import { validatePremiumStatus, registerDevice } from "./purchaseVerificationService";

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

export const getPremiumStatus = async (forceRefresh = false) => {
  const cache = getPremiumCache();
  const deviceId = await getDeviceId();
  const hashedDeviceId = await hashDeviceId(deviceId);
  
  if (!navigator.onLine) {
    console.log("[PremiumState] Offline - using cached status");
    if (cache) {
      return {
        premium: cache.premium,
        planType: cache.planType,
        source: "offline_cache",
        deviceId: hashedDeviceId
      };
    }
    return { premium: false, planType: null, source: "offline_no_cache", deviceId: hashedDeviceId };
  }
  
  if (!forceRefresh && cache && !cache.expired) {
    console.log("[PremiumState] Using valid cache");
    return {
      premium: cache.premium,
      planType: cache.planType,
      source: "cache",
      deviceId: hashedDeviceId
    };
  }
  
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    if (!userId) {
      console.log("[PremiumState] No user logged in");
      return { premium: false, planType: null, source: "no_user", deviceId: hashedDeviceId };
    }
    
    const result = await validatePremiumStatus(userId, hashedDeviceId);
    
    if (!result.deviceMatch && result.premium) {
      console.log("[PremiumState] Device mismatch detected");
    }
    
    setPremiumCache(result.premium, result.planType, hashedDeviceId);
    
    return {
      premium: result.premium,
      planType: result.planType,
      familyGroupId: result.familyGroupId,
      deviceMatch: result.deviceMatch,
      source: "backend",
      deviceId: hashedDeviceId
    };
  } catch (error) {
    console.error("[PremiumState] Backend validation failed:", error);
    
    if (cache) {
      console.log("[PremiumState] Using stale cache as fallback");
      return {
        premium: cache.premium,
        planType: cache.planType,
        source: "stale_cache",
        deviceId: hashedDeviceId
      };
    }
    
    return { premium: false, planType: null, source: "error", deviceId: hashedDeviceId };
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
    await initializeDeviceBinding();
    
    const status = await getPremiumStatus(true);
    
    console.log("[PremiumState] App open sync complete:", {
      premium: status.premium,
      planType: status.planType,
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
