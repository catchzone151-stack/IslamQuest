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

// ================================================================
// LOCAL PREMIUM STATE PERSISTENCE
// This ensures premium is available offline and survives app restarts.
// The local state is the source of truth for UI; backend sync validates.
// ================================================================
const LOCAL_PREMIUM_KEY = "iq_iap_premium_entitlement";

const getLocalPremiumState = () => {
  try {
    const stored = localStorage.getItem(LOCAL_PREMIUM_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

const setLocalPremiumState = (isPremium, planType = "single") => {
  try {
    localStorage.setItem(LOCAL_PREMIUM_KEY, JSON.stringify({
      isPremium,
      planType,
      activatedAt: Date.now()
    }));
    console.log("[IAP] Local premium state persisted:", isPremium);
  } catch (error) {
    console.error("[IAP] Failed to persist local premium state:", error);
  }
};

export const isLocalPremium = () => {
  const state = getLocalPremiumState();
  return state?.isPremium === true;
};

export const clearLocalPremium = () => {
  localStorage.removeItem(LOCAL_PREMIUM_KEY);
};

// ================================================================
// IAP STORE INITIALIZATION
// ================================================================
let store = null;
let platformType = null;
let initialized = false;
let initPromise = null;
let autoRestoreAttempted = false;

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

// ================================================================
// CORE INITIALIZATION
// On init, we also attempt auto-restore if user owns the product.
// ================================================================
export const initializeIAP = async () => {
  if (initialized && store) {
    return { success: true, platform: platformType };
  }
  
  if (initPromise) {
    return initPromise;
  }
  
  initPromise = (async () => {
    platformType = detectPlatform();
    
    // ONLY for web users: flag as requiresNativeApp
    // Native failures should NOT set this flag
    if (!platformType) {
      console.log("[IAP] Web environment - purchases require native app");
      return { success: false, platform: "web", requiresNativeApp: true };
    }
    
    console.log("[IAP] Detected platform:", platformType);
    
    try {
      await waitForDeviceReady();
      
      if (!window.CdvPurchase) {
        console.log("[IAP] CdvPurchase not available after wait");
        // CRITICAL FIX: Clear initPromise so we can retry when plugin becomes available
        initPromise = null;
        return { success: false, platform: platformType, error: "Billing plugin not loaded yet" };
      }
      
      store = window.CdvPurchase.store;
      
      if (!store) {
        console.log("[IAP] CdvPurchase.store not available");
        // CRITICAL FIX: Clear initPromise so we can retry
        initPromise = null;
        return { success: false, platform: platformType, error: "Store not available" };
      }
      
      console.log("[IAP] CdvPurchase.store found, initializing...");
      
      store.verbosity = window.CdvPurchase.LogLevel.DEBUG;
      
      // Register global handlers BEFORE product registration
      setupGlobalHandlers();
      
      await registerProducts();
      
      initialized = true;
      console.log("[IAP] Initialization complete for", platformType);
      
      // Auto-restore: Check if user already owns the product
      // This runs silently on every app launch / paywall mount
      if (!autoRestoreAttempted) {
        autoRestoreAttempted = true;
        silentAutoRestore();
      }
      
      return { success: true, platform: platformType };
    } catch (error) {
      console.error("[IAP] Initialization error:", error);
      // CRITICAL FIX: Clear initPromise so we can retry
      initPromise = null;
      return { success: false, platform: platformType, error: error.message };
    }
  })();
  
  return initPromise;
};

// ================================================================
// GLOBAL HANDLERS
// These handle ALL purchase events including "already owned" scenario.
// When the store detects an owned product, we treat it as success.
// ================================================================
const setupGlobalHandlers = () => {
  const CdvPurchase = window.CdvPurchase;
  
  // Handle when a product's ownership status changes
  store.when()
    .productUpdated((product) => {
      console.log("[IAP] Product updated:", product.id, "owned:", product.owned, "canPurchase:", product.canPurchase);
      
      // KEY FIX: If product is owned, immediately unlock premium locally
      // This handles the "already owned" case automatically
      if (product.owned) {
        const config = Object.values(PRODUCTS).find(p => 
          p.googleId === product.id || p.appleId === product.id
        );
        if (config) {
          console.log("[IAP] Product is OWNED - unlocking premium locally");
          setLocalPremiumState(true, config.planType);
          
          // Also update the premium state service cache
          import("./premiumStateService").then(({ markPremiumActivated }) => {
            markPremiumActivated(config.planType);
          });
        }
      }
    })
    .approved((transaction) => {
      console.log("[IAP] Transaction approved:", transaction.transactionId);
      // Approved transactions will be handled in the purchase flow
    })
    .finished((transaction) => {
      console.log("[IAP] Transaction finished:", transaction.transactionId);
    });
  
  // Global error handler
  store.error((error) => {
    console.error("[IAP] Store error:", error.code, error.message);
  });
};

// ================================================================
// RECONCILE PURCHASE WITH BACKEND (IDEMPOTENT)
// 
// This function ensures Supabase is synced when the store says
// the user owns premium. It's safe to call multiple times.
// 
// Logic:
// 1. Check if backend already knows about premium
// 2. If not, send receipt to backend to create verified_purchases record
// 3. Set local premium state
// 4. Return success/failure
// ================================================================
const reconcilePurchaseWithBackend = async (storeProduct, productConfig) => {
  console.log("[IAP] ===== RECONCILE PURCHASE WITH BACKEND =====");
  console.log("[IAP] Product:", productConfig.id, "Store owned:", storeProduct?.owned);
  
  if (!storeProduct?.owned) {
    console.log("[IAP] Product not owned, nothing to reconcile");
    return { success: false, reason: "not_owned" };
  }
  
  // Get user and device info
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user?.id) {
    console.log("[IAP] No authenticated user, cannot reconcile with backend");
    // Still unlock locally - user owns it
    setLocalPremiumState(true, productConfig.planType);
    const { markPremiumActivated } = await import("./premiumStateService");
    markPremiumActivated(productConfig.planType);
    return { success: true, source: "local_only", reason: "no_auth" };
  }
  
  const userId = userData.user.id;
  const deviceId = await getDeviceId();
  const hashedDeviceId = await hashDeviceId(deviceId);
  
  // Step 1: Check if backend already knows about premium
  console.log("[IAP] Checking backend premium status for user:", userId);
  const backendStatus = await validatePremiumStatus(userId, hashedDeviceId);
  console.log("[IAP] Backend status:", JSON.stringify(backendStatus));
  
  if (backendStatus.premium) {
    console.log("[IAP] Backend already shows premium - synced");
    setLocalPremiumState(true, backendStatus.planType || productConfig.planType);
    const { markPremiumActivated } = await import("./premiumStateService");
    markPremiumActivated(backendStatus.planType || productConfig.planType);
    return { success: true, source: "backend_confirmed", planType: backendStatus.planType };
  }
  
  // Step 2: Backend doesn't show premium, but store says owned
  // We need to send the receipt to sync Supabase
  console.log("[IAP] Backend NOT premium, but store owns product - syncing to Supabase...");
  
  const lastTransaction = storeProduct.lastTransaction;
  const receipt = lastTransaction?.receipt 
    || lastTransaction?.purchaseToken 
    || lastTransaction?.transactionReceipt
    || storeProduct.transactions?.[0]?.receipt
    || storeProduct.transactions?.[0]?.purchaseToken;
  
  if (receipt) {
    console.log("[IAP] Found receipt, calling verifyReceipt to sync Supabase");
    try {
      const verifyResult = await verifyReceipt({
        platform: platformType,
        productId: productConfig.id,
        receipt: receipt,
        userId: userId,
        deviceId: hashedDeviceId,
        nonce: generateNonce(),
        isRestore: true
      });
      console.log("[IAP] verifyReceipt result:", JSON.stringify(verifyResult));
      
      if (verifyResult.success) {
        console.log("[IAP] Supabase synced successfully via receipt verification");
        setLocalPremiumState(true, verifyResult.planType || productConfig.planType);
        const { markPremiumActivated } = await import("./premiumStateService");
        markPremiumActivated(verifyResult.planType || productConfig.planType);
        logEvent(ANALYTICS_EVENTS.RESTORE_PURCHASES_SUCCESS, { source: "reconcile_receipt", planType: productConfig.planType });
        return { success: true, source: "receipt_verified", planType: verifyResult.planType };
      } else {
        console.log("[IAP] Receipt verification failed, but user owns in store - unlocking locally");
      }
    } catch (verifyError) {
      console.error("[IAP] Receipt verification error:", verifyError);
    }
  } else {
    console.log("[IAP] No receipt available for verification");
  }
  
  // Step 3: Even if backend sync failed, unlock locally since store says owned
  console.log("[IAP] Unlocking premium locally (store is source of truth)");
  setLocalPremiumState(true, productConfig.planType);
  const { markPremiumActivated } = await import("./premiumStateService");
  markPremiumActivated(productConfig.planType);
  logEvent(ANALYTICS_EVENTS.RESTORE_PURCHASES_SUCCESS, { source: "store_owned_local", planType: productConfig.planType });
  
  return { success: true, source: "store_owned", planType: productConfig.planType };
};

// ================================================================
// SILENT AUTO-RESTORE (ENHANCED)
// Runs on app launch to detect owned products without user interaction.
// This ensures premium is unlocked even after:
// - App reinstall
// - App update
// - Purchase timeout/crash
// - Device switch
// 
// CRITICAL: This queries native billing, verifies, syncs Supabase
// ================================================================
const silentAutoRestore = async () => {
  console.log("🔥🔥🔥 [IAP] silentAutoRestore() CALLED - FIRST LINE 🔥🔥🔥");
  console.log("[IAP] ===== SILENT AUTO-RESTORE START =====");
  console.log("[IAP] Timestamp:", new Date().toISOString());
  
  try {
    // Step 1: Refresh store to get latest ownership from Google/Apple
    console.log("[IAP] Calling store.restorePurchases() to refresh ownership...");
    try {
      await store.restorePurchases();
      await store.update();
      console.log("[IAP] Store ownership refreshed");
    } catch (refreshError) {
      console.log("[IAP] Store refresh failed (non-fatal):", refreshError.message);
    }
    
    // Step 2: Check each product for ownership
    for (const productConfig of Object.values(PRODUCTS)) {
      const storeId = platformType === "ios" ? productConfig.appleId : productConfig.googleId;
      const storeProduct = store.get(storeId);
      
      console.log("[IAP] Checking product:", storeId, "owned:", storeProduct?.owned);
      
      if (storeProduct?.owned) {
        console.log("[IAP] OWNED PRODUCT DETECTED:", storeId);
        
        // Reconcile with backend (creates verified_purchases if needed)
        const reconcileResult = await reconcilePurchaseWithBackend(storeProduct, productConfig);
        console.log("[IAP] Reconcile result:", JSON.stringify(reconcileResult));
        
        if (reconcileResult.success) {
          console.log("[IAP] ===== PREMIUM UNLOCKED (auto-restore) =====");
          return;
        }
      }
    }
    
    // Step 3: No owned products found - check if local cache exists
    if (isLocalPremium()) {
      console.log("[IAP] No store ownership but local premium exists - validating...");
      
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.id) {
        const deviceId = await getDeviceId();
        const hashedDeviceId = await hashDeviceId(deviceId);
        const backendStatus = await validatePremiumStatus(userData.user.id, hashedDeviceId);
        
        if (!backendStatus.premium) {
          console.log("[IAP] Backend says not premium - clearing invalid local cache");
          clearLocalPremium();
        } else {
          console.log("[IAP] Backend confirms premium - keeping local state");
        }
      }
    }
    
    console.log("[IAP] ===== SILENT AUTO-RESTORE END (no premium found) =====");
  } catch (error) {
    console.error("[IAP] Auto-restore error:", error);
    console.error("[IAP] Error stack:", error.stack);
  }
};

// ================================================================
// PRODUCT REGISTRATION
// ================================================================
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
  
  await store.initialize([platform]);
  console.log("[IAP] Store initialized, refreshing products...");
  
  await store.update();
  console.log("[IAP] Products updated");
};

// ================================================================
// LOAD PRODUCTS FOR UI
// ================================================================
export const loadProducts = async () => {
  const initResult = await initializeIAP();
  
  if (!initResult.success) {
    // Only set requiresNativeApp for actual web users
    const isWeb = initResult.requiresNativeApp || initResult.platform === "web";
    return Object.values(PRODUCTS).map(p => ({
      id: p.id,
      title: "Lifetime Premium",
      description: "Unlock all features forever",
      available: false,
      requiresNativeApp: isWeb,
      initError: !isWeb ? initResult.error : null
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
        available: !!storeProduct?.canPurchase,
        owned: !!storeProduct?.owned
      };
    });
    
    return products;
  } catch (error) {
    console.error("[IAP] Error loading products:", error);
    return [];
  }
};

// ================================================================
// CHECK IF ALREADY OWNED
// Call this before initiating purchase to skip redundant flows.
// ================================================================
export const checkIfAlreadyOwned = async (productId) => {
  const product = PRODUCTS[productId];
  if (!product) return false;
  
  const initResult = await initializeIAP();
  if (!initResult.success) return isLocalPremium();
  
  const storeId = platformType === "ios" ? product.appleId : product.googleId;
  const storeProduct = store.get(storeId);
  
  if (storeProduct?.owned) {
    console.log("[IAP] Product already owned:", storeId);
    setLocalPremiumState(true, product.planType);
    return true;
  }
  
  return isLocalPremium();
};

const generateNonce = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// ================================================================
// PURCHASE FLOW
// KEY FIXES:
// 1. Check ownership first - if already owned, return success immediately
// 2. Handle "ALREADY_OWNED" error code as success
// 3. Persist local premium state on any successful ownership detection
// 4. Deterministic timeout handling - never stays stuck
// 5. Backend verification is optional for "already owned" (idempotent)
// ================================================================
export const buyProduct = async (productId) => {
  return await purchase(productId);
};

export const purchase = async (productId) => {
  console.log("=".repeat(60));
  console.log("[IAP] === PURCHASE FLOW STARTED ===");
  console.log("[IAP] ProductId:", productId);
  console.log("[IAP] Timestamp:", new Date().toISOString());
  
  const product = PRODUCTS[productId];
  if (!product) {
    console.log("[IAP] ERROR: Invalid product ID");
    return { success: false, error: "Invalid product ID" };
  }
  
  console.log("[IAP] Product config:", JSON.stringify(product));
  console.log("[IAP] Calling initializeIAP...");
  
  const initResult = await initializeIAP();
  console.log("[IAP] initializeIAP result:", JSON.stringify(initResult));
  
  if (!initResult.success) {
    console.log("[IAP] Initialization failed, checking reason...");
    console.log("[IAP] - requiresNativeApp:", initResult.requiresNativeApp);
    console.log("[IAP] - platform:", initResult.platform);
    console.log("[IAP] - error:", initResult.error);
    
    if (initResult.requiresNativeApp || initResult.platform === "web") {
      console.log("[IAP] >>> Returning requiresNativeApp=true (web user)");
      return { 
        success: false, 
        error: "Please download the app from App Store or Google Play to make purchases",
        requiresNativeApp: true
      };
    }
    
    console.log("[IAP] >>> Returning error for retry (native init failed)");
    return { 
      success: false, 
      error: initResult.error || "Billing service not ready. Please try again."
    };
  }
  
  console.log("[IAP] Initialization successful, platformType:", platformType);
  
  const storeId = platformType === "ios" ? product.appleId : product.googleId;
  const storeProduct = store.get(storeId);
  
  // ================================================================
  // FIX #1: Check if already owned BEFORE attempting purchase
  // This prevents the "already owned" error from being treated as failure
  // ================================================================
  if (storeProduct?.owned) {
    console.log("[IAP] Product already owned - returning success immediately");
    setLocalPremiumState(true, product.planType);
    
    const { markPremiumActivated } = await import("./premiumStateService");
    markPremiumActivated(product.planType);
    
    logEvent(ANALYTICS_EVENTS.PURCHASE_VERIFIED_SERVER, { productId: product.id, platform: platformType, alreadyOwned: true });
    
    return { 
      success: true, 
      platform: platformType, 
      productId: product.id,
      planType: product.planType,
      alreadyOwned: true,
      message: "You already own this product!"
    };
  }
  
  if (!storeProduct) {
    console.error("[IAP] Product not found in store:", storeId);
    return { success: false, error: "Product not available" };
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
  
  return new Promise((resolve) => {
    // ================================================================
    // FIX #4: Deterministic timeout - ALWAYS clears after 2 minutes
    // This prevents UI from being stuck on "Processing..." indefinitely
    // ================================================================
    let resolved = false;
    const safeResolve = (result) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve(result);
      }
    };
    
    const timeout = setTimeout(() => {
      console.log("[IAP] Purchase timeout - checking ownership one more time");
      
      // Before timing out, check if product became owned during the process
      const currentProduct = store.get(storeId);
      if (currentProduct?.owned) {
        console.log("[IAP] Timeout but product is owned - treating as success");
        setLocalPremiumState(true, product.planType);
        safeResolve({ 
          success: true, 
          platform: platformType, 
          productId: product.id,
          planType: product.planType,
          message: "Purchase successful!"
        });
      } else {
        safeResolve({ success: false, error: "Purchase timed out. Please try again." });
      }
    }, 120000);
    
    // ================================================================
    // TRANSACTION VERIFICATION HANDLER
    // Called when a transaction is approved (new purchase or pending)
    // ================================================================
    const verifyAndFinish = async (transaction) => {
      try {
        const receipt = transaction.receipt 
          || transaction.purchaseToken 
          || transaction.transactionReceipt
          || transaction.appStoreReceipt;
        
        if (!receipt) {
          // No receipt but check if product is now owned
          const currentProduct = store.get(storeId);
          if (currentProduct?.owned) {
            console.log("[IAP] No receipt but product is owned - success");
            setLocalPremiumState(true, product.planType);
            
            const { markPremiumActivated } = await import("./premiumStateService");
            markPremiumActivated(product.planType);
            
            transaction.finish();
            safeResolve({ 
              success: true, 
              platform: platformType, 
              productId: product.id,
              planType: product.planType
            });
            return;
          }
          
          console.error("[IAP] No receipt in transaction:", transaction);
          safeResolve({ success: false, error: "Purchase processing failed. Please contact support." });
          return;
        }
        
        console.log("[IAP] Receipt received, sending to backend for verification...");
        logEvent(ANALYTICS_EVENTS.PURCHASE_TOKEN_RECEIVED, { productId: product.id, platform: platformType });
        
        // ================================================================
        // FIX #2: Backend verification is idempotent
        // If already verified, backend returns success; we persist locally
        // ================================================================
        const verificationResult = await verifyReceipt({
          platform: platformType,
          productId: product.id,
          receipt: receipt,
          userId: userId,
          deviceId: hashedDeviceId,
          nonce: nonce
        });
        
        // Even if backend verification fails, check local ownership
        const currentProduct = store.get(storeId);
        
        if (verificationResult.success || currentProduct?.owned) {
          // ================================================================
          // FIX #3: Persist local premium state immediately on success
          // ================================================================
          setLocalPremiumState(true, product.planType);
          
          const { markPremiumActivated } = await import("./premiumStateService");
          markPremiumActivated(product.planType);
          
          logEvent(ANALYTICS_EVENTS.PURCHASE_VERIFIED_SERVER, { productId: product.id, platform: platformType });
          
          transaction.finish();
          
          console.log("[IAP] Purchase verified and completed successfully");
          safeResolve({ 
            success: true, 
            platform: platformType, 
            productId: product.id,
            planType: product.planType
          });
        } else {
          console.error("[IAP] Backend verification failed:", verificationResult.error);
          logEvent(ANALYTICS_EVENTS.INVALID_RECEIPT, { productId: product.id, error: verificationResult.error });
          safeResolve({ success: false, error: verificationResult.error || "Purchase verification failed" });
        }
      } catch (error) {
        console.error("[IAP] Error processing purchase:", error);
        
        // Last resort: check ownership
        const currentProduct = store.get(storeId);
        if (currentProduct?.owned) {
          setLocalPremiumState(true, product.planType);
          safeResolve({ success: true, platform: platformType, productId: product.id, planType: product.planType });
        } else {
          safeResolve({ success: false, error: error.message || "Purchase processing failed" });
        }
      }
    };
    
    // Set up transaction listener for this purchase
    const approvedHandler = store.when().approved((transaction) => {
      if (transaction.products.some(tp => tp.id === storeId)) {
        console.log("[IAP] Transaction approved for:", storeId);
        verifyAndFinish(transaction);
      }
    });
    
    // Initiate the purchase
    try {
      console.log("[IAP] Getting offer for product:", storeId);
      const offer = storeProduct.getOffer();
      console.log("[IAP] Offer:", offer ? "found" : "NOT FOUND");
      
      if (offer) {
        console.log("[IAP] >>> CALLING offer.order() - This should open billing UI <<<");
        console.log("[IAP] Timestamp before order:", new Date().toISOString());
        
        offer.order()
          .then(() => {
            console.log("[IAP] offer.order() promise resolved - billing UI should be open");
            console.log("[IAP] Timestamp after order:", new Date().toISOString());
          })
          .catch((error) => {
            console.error("[IAP] Order error:", error);
            const errorCode = error.code;
            const errorMessage = error.message?.toLowerCase() || "";
            
            // ================================================================
            // FIX #1 (continued): Handle "already owned" error as SUCCESS
            // Different stores return this differently:
            // - Google Play: ITEM_ALREADY_OWNED or "already own"
            // - iOS: "already purchased" or similar
            // ================================================================
            const isAlreadyOwned = 
              errorCode === window.CdvPurchase?.ErrorCode?.ITEM_ALREADY_OWNED ||
              errorCode === "6777010" || // Google Play already owned
              errorCode === "ALREADY_OWNED" ||
              errorMessage.includes("already own") ||
              errorMessage.includes("already purchased") ||
              errorMessage.includes("you already have");
            
            if (isAlreadyOwned) {
              console.log("[IAP] 'Already owned' error - treating as SUCCESS");
              setLocalPremiumState(true, product.planType);
              
              import("./premiumStateService").then(({ markPremiumActivated }) => {
                markPremiumActivated(product.planType);
              });
              
              logEvent(ANALYTICS_EVENTS.PURCHASE_VERIFIED_SERVER, { productId: product.id, platform: platformType, alreadyOwned: true });
              
              safeResolve({ 
                success: true, 
                platform: platformType, 
                productId: product.id,
                planType: product.planType,
                alreadyOwned: true,
                message: "You already own this product!"
              });
              return;
            }
            
            // Check for user cancellation
            const isCancelled = 
              errorCode === window.CdvPurchase?.ErrorCode?.PAYMENT_CANCELLED ||
              errorCode === "USER_CANCELLED" ||
              errorMessage.includes("cancel");
            
            if (isCancelled) {
              safeResolve({ success: false, error: "Purchase cancelled", cancelled: true });
            } else {
              safeResolve({ success: false, error: error.message || "Purchase failed" });
            }
          });
      } else {
        console.error("[IAP] No offer available for product:", storeId);
        safeResolve({ success: false, error: "Product not available for purchase" });
      }
    } catch (error) {
      console.error("[IAP] Purchase exception:", error);
      safeResolve({ success: false, error: error.message || "Purchase failed" });
    }
  });
};

// ================================================================
// RESTORE PURCHASES
// Called manually by user or automatically on paywall mount.
// First checks backend, then queries store for owned products.
// ================================================================
export const restorePurchases = async () => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user?.id) {
    return { success: false, error: "Please sign in to restore purchases" };
  }
  
  const userId = userData.user.id;
  const deviceId = await getDeviceId();
  const hashedDeviceId = await hashDeviceId(deviceId);
  
  logEvent(ANALYTICS_EVENTS.RESTORE_PURCHASES_ATTEMPTED, { platform: platformType });
  
  // Step 1: Check backend for verified premium status
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
    // Backend confirms premium - persist locally and return success
    setLocalPremiumState(true, backendResult.planType);
    
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
  
  // Step 2: Query the store for owned products
  const initResult = await initializeIAP();
  
  if (!initResult.success) {
    // Not on native platform - check local state as fallback
    if (isLocalPremium()) {
      return {
        success: true,
        verified: false,
        source: "local_cache",
        message: "Premium status confirmed from local cache"
      };
    }
    return { 
      success: false, 
      error: "No purchases found. Please purchase premium to unlock features." 
    };
  }
  
  try {
    console.log("[IAP] ===== RESTORE PURCHASES (user-triggered) =====");
    console.log("[IAP] Querying store for owned products...");
    
    // Refresh store to get latest ownership info from Google/Apple
    await store.restorePurchases();
    await store.update();
    console.log("[IAP] Store refreshed");
    
    // Check each product for ownership and reconcile with backend
    for (const productConfig of Object.values(PRODUCTS)) {
      const storeId = platformType === "ios" ? productConfig.appleId : productConfig.googleId;
      const storeProduct = store.get(storeId);
      
      console.log("[IAP] Checking product:", storeId, "owned:", storeProduct?.owned);
      
      if (storeProduct?.owned) {
        console.log("[IAP] OWNED PRODUCT DETECTED:", storeId);
        
        // Use reconcile function to sync with Supabase
        const reconcileResult = await reconcilePurchaseWithBackend(storeProduct, productConfig);
        console.log("[IAP] Reconcile result:", JSON.stringify(reconcileResult));
        
        if (reconcileResult.success) {
          console.log("[IAP] ===== PREMIUM RESTORED SUCCESSFULLY =====");
          return {
            success: true,
            verified: true,
            source: reconcileResult.source,
            planType: reconcileResult.planType || productConfig.planType,
            message: "Purchases restored successfully!"
          };
        }
      }
    }
    
    console.log("[IAP] No owned products found in store");
    return {
      success: false,
      verified: false,
      source: "store",
      error: "No purchases found"
    };
    
  } catch (error) {
    console.error("[IAP] Restore error:", error);
    console.error("[IAP] Error stack:", error.stack);
    
    // Fallback to local state
    if (isLocalPremium()) {
      return {
        success: true,
        verified: false,
        source: "local_cache",
        message: "Premium status confirmed from local cache"
      };
    }
    
    return { success: false, error: error.message || "Restore failed" };
  }
};

// ================================================================
// PAYWALL MOUNT HOOK (ENHANCED)
// Call this when the premium/paywall screen mounts.
// It silently checks ownership, reconciles with backend, and unlocks if owned.
// Returns: { isPremium: boolean, source: string }
// ================================================================
export const checkEntitlementOnMount = async () => {
  console.log("[IAP] checkEntitlementOnMount called");
  
  // First check local state (instant)
  if (isLocalPremium()) {
    console.log("[IAP] Local premium state found");
    return { isPremium: true, source: "local" };
  }
  
  // Then check store if on native platform
  const initResult = await initializeIAP();
  if (initResult.success) {
    console.log("[IAP] Checking store for owned products on paywall mount...");
    
    for (const productConfig of Object.values(PRODUCTS)) {
      const storeId = platformType === "ios" ? productConfig.appleId : productConfig.googleId;
      const storeProduct = store.get(storeId);
      
      if (storeProduct?.owned) {
        console.log("[IAP] Owned product found on paywall mount:", storeId);
        
        // Reconcile with backend to ensure Supabase is synced
        const reconcileResult = await reconcilePurchaseWithBackend(storeProduct, productConfig);
        console.log("[IAP] Paywall mount reconcile result:", JSON.stringify(reconcileResult));
        
        if (reconcileResult.success) {
          return { isPremium: true, source: reconcileResult.source };
        }
      }
    }
  }
  
  return { isPremium: false, source: "none" };
};

// ================================================================
// UTILITY EXPORTS
// ================================================================
export const getPlatform = () => platformType;

export const isNativeAppRequired = () => {
  return !detectPlatform();
};

export default {
  initializeIAP,
  loadProducts,
  purchase,
  restorePurchases,
  checkEntitlementOnMount,
  checkIfAlreadyOwned,
  isLocalPremium,
  clearLocalPremium,
  getPlatform,
  isNativeAppRequired
};
