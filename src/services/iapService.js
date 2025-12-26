import { supabase } from "../lib/supabaseClient";
import { getDeviceId, hashDeviceId } from "./deviceService";
import { verifyReceipt, validatePremiumStatus } from "./purchaseVerificationService";
import { logEvent, ANALYTICS_EVENTS } from "./analyticsService";
import { Capacitor } from "@capacitor/core";

const PRODUCTS = {
  premium_lifetime: {
    id: "premium_lifetime",
    googleId: "premium_lifetime",
    appleId: "premium_lifetime",
    type: "non-consumable",
    planType: "single"
  }
};

let store = null;
let platformType = null;
let initialized = false;
let initPromise = null;

const detectPlatform = () => {
  if (typeof window === "undefined") return null;
  
  if (Capacitor.isNativePlatform()) {
    return Capacitor.getPlatform();
  }
  
  return null;
};

const waitForDeviceReady = () => {
  return new Promise((resolve) => {
    if (document.readyState === "complete" && window.CdvPurchase) {
      resolve();
      return;
    }
    
    const checkCdvPurchase = () => {
      if (window.CdvPurchase) {
        resolve();
      } else {
        setTimeout(checkCdvPurchase, 100);
      }
    };
    
    if (document.readyState === "complete") {
      checkCdvPurchase();
    } else {
      document.addEventListener("deviceready", () => checkCdvPurchase(), false);
      window.addEventListener("load", () => checkCdvPurchase());
    }
    
    setTimeout(() => resolve(), 5000);
  });
};

export const initializeIAP = async () => {
  if (initialized && store) {
    return { success: true, platform: platformType };
  }
  
  if (initPromise) {
    return initPromise;
  }
  
  initPromise = (async () => {
    platformType = detectPlatform();
    
    if (!platformType) {
      console.log("[IAP] Web environment - IAP not available");
      return { success: false, platform: "web" };
    }
    
    console.log("[IAP] Detected platform:", platformType);
    
    try {
      await waitForDeviceReady();
      
      if (!window.CdvPurchase) {
        console.log("[IAP] CdvPurchase not available after wait");
        return { success: false, platform: platformType, error: "Billing plugin not loaded" };
      }
      
      store = window.CdvPurchase.store;
      
      if (!store) {
        console.log("[IAP] CdvPurchase.store not available");
        return { success: false, platform: platformType, error: "Store not available" };
      }
      
      console.log("[IAP] CdvPurchase.store found, initializing...");
      
      store.verbosity = window.CdvPurchase.LogLevel.DEBUG;
      
      await registerProducts();
      
      initialized = true;
      console.log("[IAP] Initialization complete for", platformType);
      return { success: true, platform: platformType };
    } catch (error) {
      console.error("[IAP] Initialization error:", error);
      return { success: false, platform: platformType, error: error.message };
    }
  })();
  
  return initPromise;
};

const registerProducts = async () => {
  const CdvPurchase = window.CdvPurchase;
  const platform = platformType === "ios" 
    ? CdvPurchase.Platform.APPLE_APPSTORE 
    : CdvPurchase.Platform.GOOGLE_PLAY;
  
  Object.values(PRODUCTS).forEach(product => {
    const storeId = platformType === "ios" ? product.appleId : product.googleId;
    console.log("[IAP] Registering product:", storeId, "on platform:", platform);
    
    store.register({
      id: storeId,
      platform: platform,
      type: CdvPurchase.ProductType.NON_CONSUMABLE
    });
  });
  
  store.error((error) => {
    console.error("[IAP] Store error:", error.code, error.message);
  });
  
  await store.initialize([platform]);
  console.log("[IAP] Store initialized, refreshing products...");
  
  await store.update();
  console.log("[IAP] Products updated");
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
  
  try {
    const products = Object.values(PRODUCTS).map(product => {
      const storeId = platformType === "ios" ? product.appleId : product.googleId;
      const storeProduct = store.get(storeId);
      
      return {
        id: product.id,
        storeId: storeId,
        title: storeProduct?.title || "Lifetime Premium",
        description: storeProduct?.description || "Unlock all features forever",
        price: storeProduct?.pricing?.price || "Loading...",
        priceAmount: storeProduct?.pricing?.priceMicros ? storeProduct.pricing.priceMicros / 1000000 : null,
        currency: storeProduct?.pricing?.currency || "GBP",
        available: !!storeProduct?.canPurchase
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
  
  const storeId = platformType === "ios" ? product.appleId : product.googleId;
  const storeProduct = store.get(storeId);
  
  if (!storeProduct) {
    console.error("[IAP] Product not found in store:", storeId);
    return { success: false, error: "Product not available" };
  }
  
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({ success: false, error: "Purchase timed out" });
    }, 120000);
    
    const verifyAndFinish = async (transaction) => {
      clearTimeout(timeout);
      
      try {
        const receipt = transaction.receipt 
          || transaction.purchaseToken 
          || transaction.transactionReceipt;
        
        if (!receipt) {
          console.error("[IAP] No receipt in transaction:", transaction);
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
        
        transaction.finish();
        
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
    
    store.when()
      .productUpdated((p) => {
        if (p.id === storeId) {
          console.log("[IAP] Product updated:", p.id, "owned:", p.owned);
        }
      })
      .approved((transaction) => {
        if (transaction.products.some(tp => tp.id === storeId)) {
          console.log("[IAP] Transaction approved for:", storeId);
          verifyAndFinish(transaction);
        }
      })
      .finished((transaction) => {
        console.log("[IAP] Transaction finished:", transaction.transactionId);
      });
    
    try {
      const offer = storeProduct.getOffer();
      if (offer) {
        console.log("[IAP] Ordering product:", storeId);
        offer.order()
          .then(() => console.log("[IAP] Order initiated"))
          .catch((error) => {
            clearTimeout(timeout);
            console.error("[IAP] Order error:", error);
            if (error.code === window.CdvPurchase.ErrorCode.PAYMENT_CANCELLED) {
              resolve({ success: false, error: "Purchase cancelled", cancelled: true });
            } else {
              resolve({ success: false, error: error.message || "Purchase failed" });
            }
          });
      } else {
        clearTimeout(timeout);
        console.error("[IAP] No offer available for product:", storeId);
        resolve({ success: false, error: "Product not available for purchase" });
      }
    } catch (error) {
      clearTimeout(timeout);
      console.error("[IAP] Purchase error:", error);
      resolve({ success: false, error: error.message || "Purchase failed" });
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
  
  return new Promise(async (resolve) => {
    const timeout = setTimeout(() => {
      resolve({ success: false, error: "Restore timed out" });
    }, 30000);
    
    try {
      console.log("[IAP] Checking owned products...");
      
      for (const productConfig of Object.values(PRODUCTS)) {
        const storeId = platformType === "ios" ? productConfig.appleId : productConfig.googleId;
        const storeProduct = store.get(storeId);
        
        if (storeProduct?.owned) {
          console.log("[IAP] Found owned product:", storeId);
          
          const lastTransaction = storeProduct.lastTransaction;
          if (lastTransaction) {
            const receipt = lastTransaction.receipt 
              || lastTransaction.purchaseToken 
              || lastTransaction.transactionReceipt;
            
            if (receipt) {
              const verificationResult = await verifyReceipt({
                platform: platformType,
                productId: productConfig.id,
                receipt: receipt,
                userId: userId,
                deviceId: hashedDeviceId,
                nonce: generateNonce(),
                isRestore: true
              });
              
              if (verificationResult.success) {
                clearTimeout(timeout);
                const { markPremiumActivated } = await import("./premiumStateService");
                markPremiumActivated(productConfig.planType);
                
                console.log("[IAP] Restore verified by backend:", productConfig.planType);
                logEvent(ANALYTICS_EVENTS.RESTORE_PURCHASES_SUCCESS, { source: "store", planType: productConfig.planType });
                
                resolve({
                  success: true,
                  verified: true,
                  source: "store",
                  planType: productConfig.planType,
                  message: "Purchases restored!"
                });
                return;
              }
            }
          }
        }
      }
      
      await store.restorePurchases();
      await store.update();
      
      for (const productConfig of Object.values(PRODUCTS)) {
        const storeId = platformType === "ios" ? productConfig.appleId : productConfig.googleId;
        const storeProduct = store.get(storeId);
        
        if (storeProduct?.owned) {
          clearTimeout(timeout);
          const { markPremiumActivated } = await import("./premiumStateService");
          markPremiumActivated(productConfig.planType);
          
          console.log("[IAP] Restore found owned product after refresh:", storeId);
          resolve({
            success: true,
            verified: true,
            source: "store",
            planType: productConfig.planType,
            message: "Purchases restored!"
          });
          return;
        }
      }
      
      clearTimeout(timeout);
      resolve({
        success: false,
        verified: false,
        source: "store",
        message: "No purchases found"
      });
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
