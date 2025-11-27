import { supabase } from "../lib/supabaseClient";

const PRODUCTS = {
  individual_monthly: {
    id: "individual_monthly",
    googleId: "islamquest_individual_monthly",
    appleId: "islamquest.individual.monthly",
    price: 4.99,
    currency: "GBP",
    planType: "individual"
  },
  family_monthly: {
    id: "family_monthly",
    googleId: "islamquest_family_monthly", 
    appleId: "islamquest.family.monthly",
    price: 18.00,
    currency: "GBP",
    planType: "family"
  }
};

let iapPlugin = null;
let platformType = "web";

const initializeIAP = async () => {
  if (typeof window === "undefined") return false;
  
  try {
    if (window.Capacitor?.isNativePlatform()) {
      platformType = window.Capacitor.getPlatform();
      
      if (window.CdvPurchase?.store) {
        iapPlugin = window.CdvPurchase.store;
        console.log("[PaymentService] CdvPurchase initialized for:", platformType);
        return true;
      }
      
      if (window.store) {
        iapPlugin = window.store;
        console.log("[PaymentService] Cordova store initialized for:", platformType);
        return true;
      }
    }
  } catch (e) {
    console.log("[PaymentService] Running in web mode (no IAP available)");
  }
  
  console.log("[PaymentService] Running in web mode");
  return false;
};

export const loadProducts = async () => {
  await initializeIAP();
  
  if (!iapPlugin) {
    console.log("[PaymentService] No IAP plugin - returning product definitions");
    return Object.values(PRODUCTS).map(p => ({
      id: p.id,
      title: p.planType === "individual" ? "Individual Plan" : "Family Plan (6 users)",
      price: `£${p.price.toFixed(2)}/month`,
      priceAmount: p.price,
      currency: p.currency,
      available: true
    }));
  }
  
  try {
    const productIds = Object.values(PRODUCTS).map(p => 
      platformType === "ios" ? p.appleId : p.googleId
    );
    
    if (iapPlugin.register) {
      productIds.forEach(id => {
        iapPlugin.register({
          id,
          type: iapPlugin.PAID_SUBSCRIPTION || "paid subscription"
        });
      });
      await iapPlugin.refresh();
    }
    
    const products = productIds.map(id => {
      const product = iapPlugin.get?.(id) || iapPlugin.products?.find(p => p.id === id);
      const config = Object.values(PRODUCTS).find(p => 
        p.googleId === id || p.appleId === id
      );
      
      return {
        id: config?.id || id,
        storeId: id,
        title: product?.title || (config?.planType === "individual" ? "Individual Plan" : "Family Plan"),
        price: product?.price || `£${config?.price.toFixed(2)}/month`,
        priceAmount: product?.priceMicros ? product.priceMicros / 1000000 : config?.price,
        currency: product?.currency || config?.currency,
        available: !!product
      };
    });
    
    console.log("[PaymentService] Products loaded:", products);
    return products;
  } catch (e) {
    console.error("[PaymentService] Error loading products:", e);
    return [];
  }
};

const detectPaymentMethod = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  if (/android/i.test(userAgent)) {
    return "google_pay";
  }
  
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return "apple_pay";
  }
  
  return "google_pay";
};

const initiateWebPayment = async (productConfig, progressStore) => {
  const paymentMethod = detectPaymentMethod();
  
  console.log(`[PaymentService] Initiating ${paymentMethod} for ${productConfig.id}`);
  
  if (paymentMethod === "google_pay") {
    const result = await initiateGooglePay(productConfig, progressStore);
    
    if (!result.success && result.error?.includes("not available")) {
      return {
        success: false,
        error: "Google Pay is not available in this browser. Please download the IslamQuest app from Google Play Store to complete your purchase."
      };
    }
    return result;
  } else {
    const result = await initiateApplePay(productConfig, progressStore);
    
    if (!result.success && result.error?.includes("not available")) {
      return {
        success: false,
        error: "Apple Pay is not available in this browser. Please download the IslamQuest app from the App Store to complete your purchase."
      };
    }
    return result;
  }
};

const loadGooglePayScript = () => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.google?.payments?.api) {
      resolve(true);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://pay.google.com/gp/p/js/pay.js';
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load Google Pay SDK'));
    document.head.appendChild(script);
  });
};

const initiateGooglePay = async (productConfig, progressStore) => {
  if (typeof window === "undefined") {
    return { success: false, error: "Window not available" };
  }

  try {
    await loadGooglePayScript();
  } catch (error) {
    console.error("[PaymentService] Failed to load Google Pay SDK:", error);
    return { success: false, error: "Google Pay is not available. Please try again later." };
  }

  if (!window.google?.payments?.api?.PaymentsClient) {
    return { success: false, error: "Google Pay is not supported on this device" };
  }

  const paymentsClient = new window.google.payments.api.PaymentsClient({
    environment: 'PRODUCTION'
  });

  const baseRequest = {
    apiVersion: 2,
    apiVersionMinor: 0
  };

  const allowedPaymentMethods = [{
    type: 'CARD',
    parameters: {
      allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
      allowedCardNetworks: ['MASTERCARD', 'VISA', 'AMEX']
    },
    tokenizationSpecification: {
      type: 'PAYMENT_GATEWAY',
      parameters: {
        gateway: 'stripe',
        'stripe:version': '2020-08-27',
        'stripe:publishableKey': 'pk_live_islamquest'
      }
    }
  }];

  try {
    const isReadyToPayRequest = {
      ...baseRequest,
      allowedPaymentMethods
    };
    
    const response = await paymentsClient.isReadyToPay(isReadyToPayRequest);
    
    if (!response.result) {
      return { success: false, error: "Google Pay is not available on this device" };
    }

    const paymentDataRequest = {
      ...baseRequest,
      allowedPaymentMethods,
      merchantInfo: {
        merchantId: 'BCR2DN4T7ISLAMQUEST',
        merchantName: 'IslamQuest'
      },
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPrice: productConfig.price.toFixed(2),
        currencyCode: productConfig.currency,
        countryCode: 'GB'
      }
    };

    const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
    
    if (paymentData) {
      progressStore.getState().unlockPremium(productConfig.planType);
      
      await logPurchaseToSupabase(
        productConfig.id,
        productConfig.price,
        "google_pay",
        JSON.stringify(paymentData)
      );
      
      console.log("[PaymentService] Google Pay purchase successful");
      return { success: true, platform: "google_pay", productId: productConfig.id };
    }
    
    return { success: false, error: "Payment cancelled" };
  } catch (error) {
    console.error("[PaymentService] Google Pay error:", error);
    
    if (error.statusCode === 'CANCELED') {
      return { success: false, error: "Payment was cancelled" };
    }
    
    return { success: false, error: error.message || "Google Pay failed. Please try again." };
  }
};

const initiateApplePay = async (productConfig, progressStore) => {
  if (typeof window === "undefined") {
    return { success: false, error: "Window not available" };
  }

  if (!window.ApplePaySession) {
    console.log("[PaymentService] Apple Pay not available - ApplePaySession undefined");
    return { success: false, error: "Apple Pay is not available on this device. Please use an Apple device with Apple Pay enabled." };
  }

  try {
    if (!window.ApplePaySession.canMakePayments()) {
      return { success: false, error: "Apple Pay is not set up on this device. Please configure Apple Pay in your device settings." };
    }
  } catch (error) {
    console.error("[PaymentService] Error checking Apple Pay availability:", error);
    return { success: false, error: "Unable to verify Apple Pay availability" };
  }

  const paymentRequest = {
    countryCode: 'GB',
    currencyCode: productConfig.currency,
    supportedNetworks: ['visa', 'masterCard', 'amex'],
    merchantCapabilities: ['supports3DS'],
    total: {
      label: `IslamQuest ${productConfig.planType === 'individual' ? 'Individual' : 'Family'} Plan`,
      amount: productConfig.price.toFixed(2)
    }
  };

  return new Promise((resolve) => {
    try {
      const session = new window.ApplePaySession(3, paymentRequest);

      session.onvalidatemerchant = async (event) => {
        try {
          const merchantSession = { merchantSessionIdentifier: 'islamquest_merchant' };
          session.completeMerchantValidation(merchantSession);
        } catch (error) {
          console.error("[PaymentService] Apple Pay merchant validation failed:", error);
          session.abort();
          resolve({ success: false, error: "Merchant validation failed. Please try again." });
        }
      };

      session.onpaymentauthorized = async (event) => {
        try {
          progressStore.getState().unlockPremium(productConfig.planType);
          
          await logPurchaseToSupabase(
            productConfig.id,
            productConfig.price,
            "apple_pay",
            JSON.stringify(event.payment.token)
          );
          
          session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
          console.log("[PaymentService] Apple Pay purchase successful");
          resolve({ success: true, platform: "apple_pay", productId: productConfig.id });
        } catch (error) {
          session.completePayment(window.ApplePaySession.STATUS_FAILURE);
          resolve({ success: false, error: "Payment processing failed. Please try again." });
        }
      };

      session.oncancel = () => {
        console.log("[PaymentService] Apple Pay cancelled by user");
        resolve({ success: false, error: "Payment was cancelled" });
      };

      session.begin();
    } catch (error) {
      console.error("[PaymentService] Failed to create Apple Pay session:", error);
      resolve({ success: false, error: "Failed to start Apple Pay. Please try again." });
    }
  });
};

export const purchase = async (productId, progressStore) => {
  const productConfig = PRODUCTS[productId];
  if (!productConfig) {
    return { success: false, error: "Invalid product ID" };
  }
  
  await initializeIAP();
  
  if (!iapPlugin) {
    console.log("[PaymentService] Web mode - initiating native payment");
    return await initiateWebPayment(productConfig, progressStore);
  }
  
  try {
    const storeId = platformType === "ios" ? productConfig.appleId : productConfig.googleId;
    
    return new Promise((resolve) => {
      const purchaseHandler = async (product) => {
        if (product.id !== storeId) return;
        
        try {
          const receipt = product.transaction?.receipt || product.receipt || "native_purchase";
          
          await logPurchaseToSupabase(
            productConfig.id,
            productConfig.price,
            platformType,
            receipt
          );
          
          progressStore.getState().unlockPremium(productConfig.planType);
          
          if (iapPlugin.finish) {
            await iapPlugin.finish(product);
          }
          
          console.log("[PaymentService] Purchase successful:", productConfig.id);
          resolve({ success: true, platform: platformType, productId, receipt });
        } catch (e) {
          console.error("[PaymentService] Error processing purchase:", e);
          resolve({ success: false, error: e.message });
        }
      };
      
      if (iapPlugin.when) {
        iapPlugin.when(storeId).approved(purchaseHandler);
        iapPlugin.when(storeId).error((e) => {
          console.error("[PaymentService] Purchase error:", e);
          resolve({ success: false, error: e.message || "Purchase failed" });
        });
      }
      
      if (iapPlugin.order) {
        iapPlugin.order(storeId);
      } else if (iapPlugin.purchase) {
        iapPlugin.purchase({ productId: storeId });
      }
    });
  } catch (e) {
    console.error("[PaymentService] Purchase error:", e);
    return { success: false, error: e.message };
  }
};

export const confirmPurchase = async (transactionId) => {
  if (!iapPlugin) {
    console.log("[PaymentService] No IAP plugin - nothing to confirm");
    return { success: true };
  }
  
  try {
    if (iapPlugin.finish) {
      const product = iapPlugin.get?.(transactionId);
      if (product) {
        await iapPlugin.finish(product);
        console.log("[PaymentService] Purchase confirmed:", transactionId);
        return { success: true };
      }
    }
    return { success: true };
  } catch (e) {
    console.error("[PaymentService] Confirm error:", e);
    return { success: false, error: e.message };
  }
};

export const restorePurchases = async (progressStore) => {
  await initializeIAP();
  
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  
  if (userId) {
    try {
      const { data: purchases, error } = await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false })
        .limit(1);
      
      if (!error && purchases && purchases.length > 0) {
        const lastPurchase = purchases[0];
        const planType = lastPurchase.product_id.includes("family") ? "family" : "individual";
        
        progressStore.getState().unlockPremium(planType);
        
        console.log("[PaymentService] Restored from Supabase:", planType);
        return { 
          success: true, 
          source: "supabase",
          plan: planType,
          message: `${planType === "individual" ? "Individual" : "Family"} plan restored!`
        };
      }
    } catch (e) {
      console.error("[PaymentService] Supabase restore check failed:", e);
    }
  }
  
  if (!iapPlugin) {
    console.log("[PaymentService] No purchases found in Supabase and no native store available");
    return { 
      success: false, 
      message: "No previous purchases found. Please purchase a plan to unlock premium." 
    };
  }
  
  try {
    return new Promise((resolve) => {
      let restored = false;
      
      const restoreHandler = async (product) => {
        const config = Object.values(PRODUCTS).find(p => 
          p.googleId === product.id || p.appleId === product.id
        );
        
        if (config && product.owned) {
          restored = true;
          
          await logPurchaseToSupabase(
            config.id,
            config.price,
            platformType,
            product.transaction?.receipt || "restored"
          );
          
          progressStore.getState().unlockPremium(config.planType);
          
          if (iapPlugin.finish) {
            await iapPlugin.finish(product);
          }
        }
      };
      
      Object.values(PRODUCTS).forEach(p => {
        const storeId = platformType === "ios" ? p.appleId : p.googleId;
        if (iapPlugin.when) {
          iapPlugin.when(storeId).owned(restoreHandler);
        }
      });
      
      if (iapPlugin.refresh) {
        iapPlugin.refresh().then(() => {
          setTimeout(() => {
            resolve({
              success: restored,
              source: "store",
              message: restored ? "Purchases restored!" : "No purchases found"
            });
          }, 1000);
        });
      } else if (iapPlugin.restorePurchases) {
        iapPlugin.restorePurchases().then((purchases) => {
          if (purchases && purchases.length > 0) {
            purchases.forEach(restoreHandler);
          }
          resolve({
            success: restored,
            source: "store", 
            message: restored ? "Purchases restored!" : "No purchases found"
          });
        });
      } else {
        resolve({ success: false, message: "Restore not available" });
      }
    });
  } catch (e) {
    console.error("[PaymentService] Restore error:", e);
    return { success: false, error: e.message };
  }
};

const logPurchaseToSupabase = async (productId, amount, platform, receipt) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    if (!userId) {
      console.error("[PaymentService] No user ID for purchase log");
      return;
    }
    
    const { error } = await supabase.from("purchases").insert({
      user_id: userId,
      product_id: productId,
      amount: amount,
      currency: "GBP",
      platform: platform,
      receipt: receipt,
      timestamp: Date.now()
    });
    
    if (error) {
      console.error("[PaymentService] Supabase log error:", error);
    } else {
      console.log("[PaymentService] Purchase logged to Supabase:", productId);
    }
  } catch (e) {
    console.error("[PaymentService] Error logging purchase:", e);
  }
};

export const getPlatform = () => platformType;

export const isNativePlatform = () => {
  return typeof window !== "undefined" && window.Capacitor?.isNativePlatform();
};

export default {
  loadProducts,
  purchase,
  confirmPurchase,
  restorePurchases,
  getPlatform,
  isNativePlatform
};
