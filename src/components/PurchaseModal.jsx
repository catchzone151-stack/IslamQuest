import React, { useState, useEffect } from "react";
import { X, RefreshCw } from "lucide-react";
import ZaydReading from "../assets/mascots/mascot_sitting.webp";
import { openAppStore } from "../utils/appStoreUtils";
import { loadProducts, restorePurchases, buyProduct } from "../services/iapService";

export default function PurchaseModal({ onClose }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      try {
        console.log("[PurchaseModal] Loading products...");
        const products = await loadProducts();
        console.log("[PurchaseModal] Products loaded:", products);
        if (isMounted) {
          // Find the lifetime premium product
          const premiumProduct = products.find(p => p.id === "premium_lifetime");
          console.log("[PurchaseModal] Premium product:", premiumProduct);
          setProduct(premiumProduct);
        }
      } catch (err) {
        console.error("[PurchaseModal] Failed to load products:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProduct();
    return () => { isMounted = false; };
  }, []);

  const handleUnlockPremium = async () => {
    console.log("[PurchaseModal] Unlock Premium clicked, product:", product);
    
    // Prevent double-click
    if (purchasing) {
      console.log("[PurchaseModal] Already purchasing, ignoring click");
      return;
    }
    
    if (!product) {
      console.log("[PurchaseModal] No product - opening app store");
      openAppStore();
      onClose();
      return;
    }
    
    setPurchasing(true);
    
    try {
      console.log("[PurchaseModal] Calling buyProduct with:", product.id);
      const result = await buyProduct(product.id);
      console.log("[PurchaseModal] buyProduct result:", result);
      
      if (result.success) {
        console.log("[PurchaseModal] Purchase successful!");
        onClose();
        return;
      }
      
      if (result.requiresNativeApp) {
        console.log("[PurchaseModal] Requires native app - opening store");
        openAppStore();
        onClose();
        return;
      }
      
      // Purchase failed but doesn't require native app - IAP issue on device
      // Log error and reset state so user can retry
      console.error("[PurchaseModal] Purchase failed:", result.error);
      setPurchasing(false);
      
      // If cancelled by user, just reset state
      if (result.cancelled) {
        return;
      }
      
      // Show alert for actual errors
      if (result.error) {
        alert(result.error || "Purchase failed. Please try again.");
      }
    } catch (err) {
      console.error("[PurchaseModal] Purchase exception:", err);
      setPurchasing(false);
      alert("Something went wrong. Please try again.");
    }
  };

  const handleRestore = async () => {
    if (restoring) return;
    setRestoring(true);
    try {
      await restorePurchases();
      // Usually restorePurchases handles the logic, we just provide the trigger
    } catch (err) {
      console.error("[PurchaseModal] Restore failed:", err);
    } finally {
      setRestoring(false);
    }
  };

  // The store-provided localized price string (e.g., "£4.99", "$9.99", "€5.49")
  // comes directly from iapService.loadProducts() -> storeProduct.pricing.price
  const displayPrice = product?.price || "...";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#030614",
          borderRadius: "24px",
          padding: "24px 20px",
          width: "100%",
          maxWidth: "360px",
          color: "white",
          textAlign: "center",
          position: "relative",
        }}
      >
        <button
          onClick={() => {
            onClose();
            // If we are in the initial onboarding/startup phase and user cancels, exit the app
            if (window.location.pathname.includes('/onboarding') || window.location.pathname === '/') {
              if (window.App && window.App.exitApp) {
                window.App.exitApp();
              } else if (window.navigator && window.navigator.app && window.navigator.app.exitApp) {
                window.navigator.app.exitApp();
              } else {
                // Fallback for browser/web if exitApp isn't available
                window.close();
              }
            }
          }}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "transparent",
            border: "none",
            color: "#9CA3AF",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={24} />
        </button>

        <img
          src={ZaydReading}
          alt="Zayd"
          style={{
            width: 90,
            height: 90,
            marginBottom: 16,
          }}
        />

        <h1
          style={{
            color: "#FFD700",
            fontSize: "1.6rem",
            marginBottom: "8px",
            fontWeight: 700,
          }}
        >
          Unlock Your Full Potential
        </h1>

        <p style={{ 
          marginBottom: "20px", 
          color: "#9CA3AF", 
          fontSize: "0.85rem",
          lineHeight: 1.4,
        }}>
          Lifetime access • No ads • All learning paths
        </p>

        <div style={{ 
          background: "#0b1e36",
          border: "3px solid #FFD700",
          borderRadius: "20px",
          padding: "20px",
          marginBottom: "16px",
          boxShadow: "0 0 18px rgba(255,215,0,0.25)",
        }}>
          <h2 style={{ 
            color: "#FFD700", 
            fontSize: "1.3rem", 
            fontWeight: 700,
            marginBottom: "4px",
          }}>
            Lifetime Premium
          </h2>
          <p style={{ 
            color: "#FFD700", 
            fontSize: "1rem", 
            fontWeight: 600,
            marginBottom: "16px",
          }}>
            {loading ? "Loading..." : `${displayPrice} — One-time`}
          </p>

          <div style={{ 
            textAlign: "left", 
            color: "white", 
            fontSize: "0.9rem", 
            lineHeight: 2,
          }}>
            <div>✔️ All 14 Learning Paths</div>
            <div>✔️ Unlimited Lessons</div>
            <div>✔️ Global Events Access</div>
            <div>✔️ No Ads Ever</div>
          </div>

          <button
            onClick={handleUnlockPremium}
            disabled={loading || purchasing}
            style={{
              backgroundColor: (loading || purchasing) ? "#9CA3AF" : "#FFD700",
              color: "#111827",
              fontWeight: 700,
              border: "none",
              borderRadius: "12px",
              padding: "14px 24px",
              width: "100%",
              cursor: (loading || purchasing) ? "not-allowed" : "pointer",
              fontSize: "1rem",
              marginTop: "16px",
              opacity: (loading || purchasing) ? 0.7 : 1,
            }}
          >
            {loading ? "Loading..." : purchasing ? "Processing..." : `Unlock Premium — ${displayPrice}`}
          </button>
        </div>

        <p style={{ 
          color: "#6B7280", 
          fontSize: "0.75rem",
          marginBottom: "12px",
        }}>
          Secure payment • Instant access • Lifetime unlock
        </p>

        <button
          onClick={handleRestore}
          disabled={restoring}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            background: "transparent",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "10px",
            color: "#9CA3AF",
            fontSize: "0.85rem",
            cursor: "pointer",
            opacity: restoring ? 0.5 : 1,
          }}
        >
          <RefreshCw size={16} className={restoring ? "animate-spin" : ""} />
          {restoring ? "Restoring..." : "Restore Purchases"}
        </button>
      </div>
    </div>
  );
}
