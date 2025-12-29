import React, { useState, useEffect } from "react";
import { X, RefreshCw } from "lucide-react";
import ZaydReading from "../assets/mascots/mascot_sitting.webp";
import { openAppStore, forceOpenStore } from "../utils/appStoreUtils";
import { loadProducts, restorePurchases, buyProduct } from "../services/iapService";
import { Capacitor } from "@capacitor/core";

export default function PurchaseModal({ onClose }) {
  console.log("🔥 COMPONENT RENDERED ON ANDROID 🔥");
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      try {
        console.log("[PurchaseModal] Loading products...");
        console.log("[PurchaseModal] Platform:", Capacitor.isNativePlatform() ? Capacitor.getPlatform() : "web");
        
        const products = await loadProducts();
        console.log("[PurchaseModal] Products loaded:", JSON.stringify(products));
        
        if (isMounted) {
          const premiumProduct = products.find(p => p.id === "premium_lifetime");
          console.log("[PurchaseModal] Premium product:", JSON.stringify(premiumProduct));
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
    console.log("=".repeat(60));
    console.log("[PurchaseModal] === UNLOCK PREMIUM CLICKED ===");
    console.log("[PurchaseModal] Timestamp:", new Date().toISOString());
    console.log("[PurchaseModal] Platform:", Capacitor.isNativePlatform() ? Capacitor.getPlatform() : "web");
    console.log("[PurchaseModal] Product state:", JSON.stringify(product));
    console.log("[PurchaseModal] Purchasing state:", purchasing);
    
    setErrorMsg(null);
    
    if (purchasing) {
      console.log("[PurchaseModal] Already purchasing - ignoring click");
      return;
    }
    
    if (!product) {
      console.log("[PurchaseModal] No product loaded - attempting store open");
      const storeResult = await forceOpenStore();
      if (storeResult.success) {
        console.log("[PurchaseModal] Store opened successfully, closing modal");
        onClose();
      } else {
        console.log("[PurchaseModal] Store failed to open:", storeResult.error);
        setErrorMsg("Could not open store. Please try again.");
      }
      return;
    }
    
    if (product.requiresNativeApp) {
      console.log("[PurchaseModal] Product requires native app - attempting store open");
      const storeResult = await forceOpenStore();
      if (storeResult.success) {
        console.log("[PurchaseModal] Store opened successfully, closing modal");
        onClose();
      } else {
        console.log("[PurchaseModal] Store failed to open:", storeResult.error);
        setErrorMsg("Could not open store. Please try again.");
      }
      return;
    }
    
    setPurchasing(true);
    console.log("[PurchaseModal] Set purchasing=true, calling buyProduct...");
    
    try {
      console.log("[PurchaseModal] >>> Calling buyProduct with:", product.id);
      const result = await buyProduct(product.id);
      console.log("[PurchaseModal] <<< buyProduct returned:", JSON.stringify(result));
      
      if (result.success) {
        console.log("[PurchaseModal] SUCCESS! Purchase completed, closing modal");
        onClose();
        return;
      }
      
      if (result.requiresNativeApp) {
        console.log("[PurchaseModal] Result says requiresNativeApp - attempting store open");
        const storeResult = await forceOpenStore();
        if (storeResult.success) {
          console.log("[PurchaseModal] Store opened successfully, closing modal");
          onClose();
        } else {
          console.log("[PurchaseModal] Store failed to open:", storeResult.error);
          setPurchasing(false);
          setErrorMsg("Could not open store. Please try again.");
        }
        return;
      }
      
      if (result.cancelled) {
        console.log("[PurchaseModal] User cancelled purchase - resetting state");
        setPurchasing(false);
        return;
      }
      
      console.log("[PurchaseModal] Purchase failed with error:", result.error);
      setPurchasing(false);
      setErrorMsg(result.error || "Purchase failed. Please try again.");
      
    } catch (err) {
      console.error("[PurchaseModal] EXCEPTION during purchase:", err);
      console.error("[PurchaseModal] Exception stack:", err.stack);
      setPurchasing(false);
      setErrorMsg("Something went wrong. Please try again.");
    }
    
    console.log("[PurchaseModal] === UNLOCK PREMIUM HANDLER END ===");
    console.log("=".repeat(60));
  };

  const handleRestore = async () => {
    console.log("🔥🔥🔥 RESTORE BUTTON PRESSED 🔥🔥🔥");
    if (restoring) return;
    setRestoring(true);
    setErrorMsg(null);
    
    try {
      console.log("[PurchaseModal] Restoring purchases...");
      const result = await restorePurchases();
      console.log("[PurchaseModal] Restore result:", JSON.stringify(result));
      
      if (result?.success) {
        onClose();
      } else if (result?.error) {
        setErrorMsg(result.error);
      }
    } catch (err) {
      console.error("[PurchaseModal] Restore failed:", err);
      setErrorMsg("Failed to restore purchases.");
    } finally {
      setRestoring(false);
    }
  };

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
            if (window.location.pathname.includes('/onboarding') || window.location.pathname === '/') {
              if (window.App && window.App.exitApp) {
                window.App.exitApp();
              } else if (window.navigator && window.navigator.app && window.navigator.app.exitApp) {
                window.navigator.app.exitApp();
              } else {
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
          
          {errorMsg && (
            <p style={{
              color: "#EF4444",
              fontSize: "0.85rem",
              marginTop: "12px",
              padding: "8px",
              background: "rgba(239, 68, 68, 0.1)",
              borderRadius: "8px",
            }}>
              {errorMsg}
            </p>
          )}
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
