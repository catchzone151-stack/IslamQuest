import { supabase } from "../lib/supabaseClient";
import { getDeviceId, hashDeviceId } from "./deviceService";
import { verifyReceipt, validatePremiumStatus } from "./purchaseVerificationService";
import { logEvent, ANALYTICS_EVENTS } from "./analyticsService";

const PRODUCTS = {
  premium_lifetime: {
    id: "premium_lifetime",
    googleId: "premium_lifetime",
    appleId: "premium_lifetime",
    type: "non-consumable",
    planType: "single"
  }
};

let storeKit = null;
let googleBilling = null;
let platformType = null;

const detectPlatform = () => {
  if (typeof window === "undefined") return null;
  
  if (window.Capacitor?.isNativePlatform()) {
    return window.Capacitor.getPlatform();
  }
  
  const userAgent = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return "ios";
  }
  if (/android/i.test(userAgent)) {
    return "android";
  }
  
  return null;
};

export const initializeIAP = async () => {
  platformType = detectPlatform();
  
  if (!platformType) {
    console.log("[IAP] Web environment - IAP not available");
    return { success: false, platform: "web" };
  }
  
  try {
    if (platformType === "ios") {
      if (window.webkit?.messageHandlers?.storeKit) {
        storeKit = window.webkit.messageHandlers.storeKit;
        console.log("[IAP] StoreKit initialized");
        return { success: true, platform: "ios" };
      }
      
      if (window.CdvPurchase?.store) {
        storeKit = window.CdvPurchase.store;
        await registerProducts(storeKit, "ios");
        console.log("[IAP] CdvPurchase StoreKit initialized");
        return { success: true, platform: "ios" };
      }
    }
    
    if (platformType === "android") {
      if (window.CdvPurchase?.store) {
        googleBilling = window.CdvPurchase.store;
        await registerProducts(googleBilling, "android");
        console.log("[IAP] Google Play Billing initialized");
        return { success: true, platform: "android" };
      }
      
      if (window.PlayBilling) {
        googleBilling = window.PlayBilling;
        console.log("[IAP] PlayBilling initialized");
        return { success: true, platform: "android" };
      }
    }
    
    console.log("[IAP] No native billing plugin found");
    return { success: false, platform: platformType, error: "No billing plugin available" };
  } catch (error) {
    console.error("[IAP] Initialization error:", error);
    return { success: false, platform: platformType, error: error.message };
  }
};

const registerProducts = async (store, platform) => {
  const productType = store.NON_CONSUMABLE || "non consumable";
  
  Object.values(PRODUCTS).forEach(product => {
    const storeId = platform === "ios" ? product.appleId : product.googleId;
    store.register({
      id: storeId,
      type: productType
    });
  });
  
  await store.refresh();
};

export const loadProducts = async () => {
  const initResult = await initializeIAP();
  
  if (!initResult.success) {
    return Object.values(PRODUCTS).map(p => ({
      id: p.id,
      title: "Lifetime Premium",
      description: "Unlock all features forever",
      available: false,
      requiresNativeApp: true
    }));
  }
  
  const store = platformType === "ios" ? storeKit : googleBilling;
  
  try {
    const products = Object.values(PRODUCTS).map(product => {
      const storeId = platformType === "ios" ? product.appleId : product.googleId;
      const storeProduct = store.get?.(storeId) || store.products?.find(p => p.id === storeId);
      
      return {
        id: product.id,
        storeId: storeId,
        title: storeProduct?.title || "Lifetime Premium",
        description: storeProduct?.description || "Unlock all features forever",
        price: storeProduct?.price || "Loading...",
        priceAmount: storeProduct?.priceMicros ? storeProduct.priceMicros / 1000000 : null,
        currency: storeProduct?.currency || "GBP",
        available: !!storeProduct
      };
    });
    
    return products;
  } catch (error) {
    console.error("[IAP] Error loading products:", error);
    return [];
  }
};

const generateNonce = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const purchase = async (productId) => {
  const product = PRODUCTS[productId];
  if (!product) {
    return { success: false, error: "Invalid product ID" };
  }
  
  const initResult = await initializeIAP();
  if (!initResult.success) {
    return { 
      success: false, 
      error: "Please download the app from App Store or Google Play to make purchases",
      requiresNativeApp: true
    };
  }
  
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user?.id) {
    return { success: false, error: "Please sign in to make a purchase" };
  }
  
  const userId = userData.user.id;
  const deviceId = await getDeviceId();
  const hashedDeviceId = await hashDeviceId(deviceId);
  const nonce = generateNonce();
  
  logEvent(ANALYTICS_EVENTS.PURCHASE_INITIATED, { productId, platform: platformType });
  
  const store = platformType === "ios" ? storeKit : googleBilling;
  const storeId = platformType === "ios" ? product.appleId : product.googleId;
  
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({ success: false, error: "Purchase timed out" });
    }, 120000);
    
    const handlePurchaseComplete = async (purchasedProduct) => {
      clearTimeout(timeout);
      
      try {
        const receipt = purchasedProduct.transaction?.receipt 
          || purchasedProduct.receipt 
          || purchasedProduct.purchaseToken;
        
        if (!receipt) {
          resolve({ success: false, error: "No receipt received" });
          return;
        }
        
        console.log("[IAP] Receipt received, sending to backend for verification...");
        logEvent(ANALYTICS_EVENTS.PURCHASE_TOKEN_RECEIVED, { productId: product.id, platform: platformType });
        
        const verificationResult = await verifyReceipt({
          platform: platformType,
          productId: product.id,
          receipt: receipt,
          userId: userId,
          deviceId: hashedDeviceId,
          nonce: nonce
        });
        
        if (!verificationResult.success) {
          console.error("[IAP] Backend verification failed:", verificationResult.error);
          logEvent(ANALYTICS_EVENTS.INVALID_RECEIPT, { productId: product.id, error: verificationResult.error });
          resolve({ success: false, error: verificationResult.error || "Purchase verification failed" });
          return;
        }
        
        logEvent(ANALYTICS_EVENTS.PURCHASE_VERIFIED_SERVER, { productId: product.id, platform: platformType });
        
        if (store.finish) {
          await store.finish(purchasedProduct);
        }
        
        console.log("[IAP] Purchase verified and completed successfully");
        resolve({ 
          success: true, 
          platform: platformType, 
          productId: product.id,
          planType: product.planType
        });
      } catch (error) {
        console.error("[IAP] Error processing purchase:", error);
        resolve({ success: false, error: error.message });
      }
    };
    
    const handlePurchaseError = (error) => {
      clearTimeout(timeout);
      console.error("[IAP] Purchase error:", error);
      
      if (error.code === "E_USER_CANCELLED" || error.message?.includes("cancel")) {
        resolve({ success: false, error: "Purchase cancelled", cancelled: true });
      } else {
        resolve({ success: false, error: error.message || "Purchase failed" });
      }
    };
    
    try {
      if (store.when) {
        store.when(storeId).approved(handlePurchaseComplete);
        store.when(storeId).error(handlePurchaseError);
        store.when(storeId).cancelled(() => {
          clearTimeout(timeout);
          resolve({ success: false, error: "Purchase cancelled", cancelled: true });
        });
      }
      
      if (store.order) {
        store.order(storeId);
      } else if (store.purchase) {
        store.purchase({ productId: storeId });
      } else {
        clearTimeout(timeout);
        resolve({ success: false, error: "Purchase method not available" });
      }
    } catch (error) {
      clearTimeout(timeout);
      handlePurchaseError(error);
    }
  });
};

export const restorePurchases = async () => {
  const initResult = await initializeIAP();
  
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user?.id) {
    return { success: false, error: "Please sign in to restore purchases" };
  }
  
  const userId = userData.user.id;
  const deviceId = await getDeviceId();
  const hashedDeviceId = await hashDeviceId(deviceId);
  
  logEvent(ANALYTICS_EVENTS.RESTORE_PURCHASES_ATTEMPTED, { platform: platformType });
  
  const backendResult = await validatePremiumStatus(userId, hashedDeviceId);
  
  if (backendResult.requiresDeviceTransfer) {
    console.log("[IAP] Premium exists but requires device transfer");
    logEvent(ANALYTICS_EVENTS.DEVICE_LIMIT_TRIGGERED, { planType: backendResult.planType });
    return {
      success: false,
      verified: false,
      requiresDeviceTransfer: true,
      planType: backendResult.planType,
      error: "Your premium is active on another device. You can only use premium on one device at a time."
    };
  }
  
  if (backendResult.premium) {
    const { markPremiumActivated } = await import("./premiumStateService");
    markPremiumActivated(backendResult.planType);
    
    console.log("[IAP] Restored from backend (verified):", backendResult.planType);
    logEvent(ANALYTICS_EVENTS.RESTORE_PURCHASES_SUCCESS, { source: "backend", planType: backendResult.planType });
    return {
      success: true,
      verified: true,
      source: "backend",
      planType: backendResult.planType,
      message: "Premium status restored!"
    };
  }
  
  if (!initResult.success) {
    return { 
      success: false, 
      error: "No purchases found. Please purchase premium to unlock features." 
    };
  }
  
  const store = platformType === "ios" ? storeKit : googleBilling;
  
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({ success: false, error: "Restore timed out" });
    }, 30000);
    
    let restored = false;
    let restoredPlanType = null;
    
    const handleRestored = async (product) => {
      const config = Object.values(PRODUCTS).find(p => 
        p.googleId === product.id || p.appleId === product.id
      );
      
      if (config && product.owned) {
        const receipt = product.transaction?.receipt || product.receipt || product.purchaseToken;
        
        if (receipt) {
          const verificationResult = await verifyReceipt({
            platform: platformType,
            productId: config.id,
            receipt: receipt,
            userId: userId,
            deviceId: hashedDeviceId,
            nonce: generateNonce(),
            isRestore: true
          });
          
          if (verificationResult.success) {
            console.log("[IAP] Restore verified by backend:", config.planType);
            restored = true;
            restoredPlanType = config.planType;
            
            if (store.finish) {
              await store.finish(product);
            }
          } else {
            console.log("[IAP] Restore verification failed:", verificationResult.error);
          }
        }
      }
    };
    
    try {
      Object.values(PRODUCTS).forEach(p => {
        const storeId = platformType === "ios" ? p.appleId : p.googleId;
        if (store.when) {
          store.when(storeId).owned(handleRestored);
        }
      });
      
      if (store.refresh) {
        store.refresh().then(() => {
          clearTimeout(timeout);
          setTimeout(() => {
            resolve({
              success: restored,
              verified: restored,
              source: "store",
              planType: restoredPlanType,
              message: restored ? "Purchases restored!" : "No purchases found"
            });
          }, 1000);
        });
      } else if (store.restorePurchases) {
        store.restorePurchases().then((purchases) => {
          clearTimeout(timeout);
          if (purchases && purchases.length > 0) {
            purchases.forEach(handleRestored);
          }
          resolve({
            success: restored,
            verified: restored,
            source: "store",
            planType: restoredPlanType,
            message: restored ? "Purchases restored!" : "No purchases found"
          });
        });
      } else {
        clearTimeout(timeout);
        resolve({ success: false, error: "Restore not available" });
      }
    } catch (error) {
      clearTimeout(timeout);
      console.error("[IAP] Restore error:", error);
      resolve({ success: false, error: error.message });
    }
  });
};

export const getPlatform = () => platformType;

export const isNativeAppRequired = () => {
  return !detectPlatform();
};

export default {
  initializeIAP,
  loadProducts,
  purchase,
  restorePurchases,
  getPlatform,
  isNativeAppRequired
};
