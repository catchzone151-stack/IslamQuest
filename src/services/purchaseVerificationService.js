import { supabase } from "../lib/supabaseClient";

const SUPABASE_FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL?.replace(".supabase.co", ".supabase.co/functions/v1") || "";

export const verifyReceipt = async ({ platform, productId, receipt, userId, deviceId, nonce, isRestore = false }) => {
  try {
    const endpoint = platform === "ios" ? "verify-apple-receipt" : "verify-google-receipt";
    
    const { data: session } = await supabase.auth.getSession();
    const accessToken = session?.session?.access_token;
    
    if (!accessToken) {
      console.error("[VerificationService] No auth session");
      return { success: false, error: "Not authenticated" };
    }
    
    const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        receipt,
        productId,
        userId,
        deviceId,
        nonce,
        isRestore
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[VerificationService] Backend error:", errorData);
      return { 
        success: false, 
        error: errorData.error || `Verification failed (${response.status})` 
      };
    }
    
    const result = await response.json();
    
    if (result.verified) {
      console.log("[VerificationService] Purchase verified successfully");
      return { 
        success: true, 
        premium: true,
        planType: result.planType,
        purchaseId: result.purchaseId
      };
    } else {
      console.error("[VerificationService] Verification rejected:", result.reason);
      return { 
        success: false, 
        error: result.reason || "Purchase verification failed" 
      };
    }
  } catch (error) {
    console.error("[VerificationService] Network error:", error);
    return { success: false, error: "Network error during verification" };
  }
};

export const validatePremiumStatus = async (userId, deviceId) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const accessToken = session?.session?.access_token;
    
    if (!accessToken) {
      return { premium: false, error: "Not authenticated" };
    }
    
    const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/validate-premium-status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify({ userId, deviceId })
    });
    
    if (!response.ok) {
      console.error("[VerificationService] Status check failed");
      return { premium: false, error: "Status check failed" };
    }
    
    const result = await response.json();
    return {
      premium: result.premium,
      planType: result.planType,
      deviceMatch: result.deviceMatch,
      familyGroupId: result.familyGroupId
    };
  } catch (error) {
    console.error("[VerificationService] Status check error:", error);
    return { premium: false, error: error.message };
  }
};

export const registerDevice = async (userId, deviceId) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const accessToken = session?.session?.access_token;
    
    if (!accessToken) {
      return { success: false, error: "Not authenticated" };
    }
    
    const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/register-device`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify({ userId, deviceId })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.error || "Device registration failed" };
    }
    
    const result = await response.json();
    return {
      success: true,
      isNewDevice: result.isNewDevice,
      previousDeviceLoggedOut: result.previousDeviceLoggedOut
    };
  } catch (error) {
    console.error("[VerificationService] Device registration error:", error);
    return { success: false, error: error.message };
  }
};

export default {
  verifyReceipt,
  validatePremiumStatus,
  registerDevice
};
