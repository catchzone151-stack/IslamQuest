import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, RefreshCw, Smartphone } from "lucide-react";
import { useProgressStore } from "../store/progressStore";
import { 
  purchase, 
  restorePurchases, 
  isNativeAppRequired, 
  loadProducts,
  checkEntitlementOnMount,
  isLocalPremium
} from "../services/iapService";
import { markPremiumActivated } from "../services/premiumStateService";
import NotificationModal from "../components/NotificationModal";
import MainMascot from "../assets/mascots/mascot_sitting.webp";

const Premium = () => {
  const navigate = useNavigate();
  const { premium, purchaseIndividual } = useProgressStore();
  
  // UI states with deterministic clearing
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [checkingEntitlement, setCheckingEntitlement] = useState(true);
  const [requiresNativeApp, setRequiresNativeApp] = useState(false);
  const [products, setProducts] = useState({});
  
  // Track if component is mounted for safe state updates
  const isMounted = useRef(true);
  
  const [notification, setNotification] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const showNotification = (title, message, type = "info") => {
    if (isMounted.current) {
      setNotification({ isOpen: true, title, message, type });
    }
  };

  const closeNotification = () => {
    setNotification({ ...notification, isOpen: false });
  };

  // ================================================================
  // AUTO-RESTORE ON MOUNT
  // Silently checks store ownership and unlocks premium if owned.
  // This prevents "already owned" from being shown as an error.
  // ================================================================
  useEffect(() => {
    isMounted.current = true;
    
    const initAndCheckEntitlement = async () => {
      try {
        // Check if already premium locally (instant)
        if (isLocalPremium()) {
          console.log("[Premium] Local premium detected on mount");
          purchaseIndividual();
          if (isMounted.current) setCheckingEntitlement(false);
          return;
        }
        
        // Check platform requirements
        const needsNative = isNativeAppRequired();
        if (isMounted.current) setRequiresNativeApp(needsNative);
        
        // Silently check store entitlement (handles auto-restore)
        const entitlement = await checkEntitlementOnMount();
        
        if (entitlement.isPremium) {
          console.log("[Premium] Entitlement confirmed on mount - unlocking");
          purchaseIndividual();
          markPremiumActivated("single");
        }
        
        // Load products for display
        if (!needsNative) {
          try {
            const loadedProducts = await loadProducts();
            if (isMounted.current) setProducts(loadedProducts);
            
            // If any product is marked as owned, unlock premium
            const ownedProduct = loadedProducts.find(p => p.owned);
            if (ownedProduct) {
              console.log("[Premium] Found owned product in loaded products");
              purchaseIndividual();
              markPremiumActivated("single");
            }
          } catch (error) {
            console.error("[Premium] Failed to load products:", error);
          }
        }
      } catch (error) {
        console.error("[Premium] Init error:", error);
      } finally {
        if (isMounted.current) setCheckingEntitlement(false);
      }
    };
    
    initAndCheckEntitlement();
    
    return () => {
      isMounted.current = false;
    };
  }, [purchaseIndividual]);

  // ================================================================
  // RESTORE PURCHASES HANDLER
  // Manual restore with clear success/failure states.
  // ================================================================
  const handleRestorePurchases = async () => {
    setRestoring(true);
    
    try {
      const result = await restorePurchases();
      
      if (result.success) {
        purchaseIndividual();
        showNotification("Restored!", result.message || "Your purchases have been restored successfully.", "success");
        setTimeout(() => {
          if (isMounted.current) navigate("/");
        }, 1500);
      } else if (result.requiresDeviceTransfer) {
        showNotification(
          "Device Limit Reached",
          "Your premium is active on another device. You can only use premium on one device at a time.",
          "device"
        );
      } else {
        showNotification(
          "No Purchases Found",
          result.message || result.error || "We couldn't find any purchases to restore.",
          "info"
        );
      }
    } catch (error) {
      console.error("[Premium] Restore failed:", error);
      showNotification(
        "Restore Failed",
        "Failed to restore purchases. Please check your connection and try again.",
        "error"
      );
    } finally {
      // Deterministic state clearing - always runs
      if (isMounted.current) setRestoring(false);
    }
  };

  // ================================================================
  // PURCHASE HANDLER
  // KEY FIXES:
  // 1. Treats "already owned" as success (handled in iapService)
  // 2. Shows "cancelled" message for user cancellation (not "failed")
  // 3. Deterministic loading state - never stays on "Processing..."
  // ================================================================
  const handlePurchase = async () => {
    if (requiresNativeApp) return;
    
    setLoading(true);
    
    try {
      const result = await purchase("premium_lifetime");
      
      if (result.success) {
        // Purchase successful (includes "already owned" case)
        purchaseIndividual();
        markPremiumActivated(result.planType || "single");
        
        if (result.alreadyOwned) {
          showNotification("Already Owned!", result.message || "You already have lifetime premium access!", "success");
        } else {
          showNotification("Success!", "Welcome to Premium! Enjoy your lifetime access.", "success");
        }
        
        setTimeout(() => {
          if (isMounted.current) navigate("/");
        }, 1500);
      } else if (result.cancelled) {
        // User cancelled - no error notification, just reset UI
        console.log("[Premium] Purchase cancelled by user");
        // Optionally show a subtle message:
        // showNotification("Cancelled", "Purchase was cancelled.", "info");
      } else if (result.requiresNativeApp) {
        // Shouldn't happen since we check this beforehand, but handle gracefully
        if (isMounted.current) setRequiresNativeApp(true);
      } else {
        // Actual failure - show error
        console.error("[Premium] Purchase failed:", result.error);
        showNotification(
          "Purchase Issue",
          result.error || "There was an issue with your purchase. Please try again.",
          "error"
        );
      }
    } catch (error) {
      console.error("[Premium] Purchase exception:", error);
      showNotification(
        "Purchase Issue",
        "Something went wrong. Please try again.",
        "error"
      );
    } finally {
      // ================================================================
      // FIX: DETERMINISTIC STATE CLEARING
      // Always clears loading state - never stays on "Processing..."
      // ================================================================
      if (isMounted.current) setLoading(false);
    }
  };

  // Show loading state while checking entitlement on mount
  if (checkingEntitlement) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center pb-24 px-4"
        style={{
          background: "radial-gradient(circle at 20% 20%, rgba(10,15,30,1) 0%, rgba(3,6,20,1) 70%)",
        }}
      >
        <div className="text-center">
          <RefreshCw size={32} className="text-[var(--gold)] mx-auto mb-4 animate-spin" />
          <p className="text-gray-300">Checking your status...</p>
        </div>
      </div>
    );
  }

  // User already has premium
  if (premium) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center pb-24 px-4"
        style={{
          background: "radial-gradient(circle at 20% 20%, rgba(10,15,30,1) 0%, rgba(3,6,20,1) 70%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[480px] text-center"
        >
          <img
            src={MainMascot}
            alt="Mascot"
            className="w-24 h-24 mx-auto mb-4"
          />
          
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[var(--gold)] to-yellow-600 rounded-full flex items-center justify-center">
            <Crown size={32} className="text-white" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2 text-[var(--gold)]">
            You Have Premium!
          </h1>
          
          <p className="text-gray-300 mb-6 text-sm">
            Lifetime Premium Access
          </p>

          <button
            onClick={() => navigate("/")}
            className="premium-btn"
          >
            Back to Home
          </button>
        </motion.div>
        
        <style>{buttonStyles}</style>
      </div>
    );
  }

  // Paywall UI
  return (
    <div 
      className="min-h-screen flex items-center justify-center pb-24 px-4"
      style={{
        background: "radial-gradient(circle at 20% 20%, rgba(10,15,30,1) 0%, rgba(3,6,20,1) 70%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="premium-container">
          <img src={MainMascot} className="premium-mascot" alt="Mascot" />

          <h1 className="premium-title">Unlock Your Full Potential</h1>

          <p className="premium-subtitle">
            Lifetime access - No ads - All learning paths - Works across devices
          </p>

          {requiresNativeApp ? (
            <div className="native-app-required">
              <div className="native-app-icon">
                <Smartphone size={48} className="text-[var(--gold)]" />
              </div>
              <h2 className="native-app-title">Download the App to Purchase</h2>
              <p className="native-app-text">
                To complete your purchase, please download Islam Quest from the App Store or Google Play Store.
              </p>
              <p className="native-app-text" style={{ marginTop: '8px', fontSize: '0.8rem', opacity: 0.8 }}>
                Already purchased? Tap "Restore Purchases" below.
              </p>
            </div>
          ) : (
            <div className="premium-card">
              <h2 className="premium-plan-title">Lifetime Premium</h2>
              <div className="premium-price">One-time payment</div>

              <ul className="premium-list">
                <li>All 14 Learning Paths</li>
                <li>Unlimited Lessons</li>
                <li>Global Events Access</li>
                <li>No Ads Ever</li>
                <li>Works Across Devices</li>
              </ul>

              <button 
                className="premium-btn"
                onClick={handlePurchase}
                disabled={loading}
              >
                {loading ? "Processing..." : "Unlock Premium"}
              </button>
            </div>
          )}

          <p className="premium-footer">
            Secure payment - Instant access - Lifetime unlock
          </p>

          <button 
            className="restore-btn"
            onClick={handleRestorePurchases}
            disabled={restoring || loading}
          >
            <RefreshCw size={16} className={restoring ? "spin" : ""} />
            {restoring ? "Restoring..." : "Restore Purchases"}
          </button>
        </div>
      </motion.div>

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      <style>{buttonStyles}</style>
      <style>{pageStyles}</style>
    </div>
  );
};

const buttonStyles = `
  .premium-btn {
    width: 100%;
    padding: 14px;
    background: linear-gradient(90deg, #FFD700, #FFB700);
    border: none;
    border-radius: 14px;
    color: #0a1a2f;
    font-weight: 700;
    font-size: 1rem;
    box-shadow: 0 0 12px rgba(255,215,0,0.4);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .premium-btn:hover {
    transform: scale(1.02);
    box-shadow: 0 0 16px rgba(255,215,0,0.5);
  }

  .premium-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const pageStyles = `
  .premium-container {
    text-align: center;
    padding: 20px;
    max-width: 480px;
    margin: 0 auto;
  }

  .premium-mascot {
    width: 120px;
    margin: 0 auto 10px;
    display: block;
  }

  .premium-title {
    color: #FFD700;
    font-size: 1.9rem;
    margin-bottom: 6px;
  }

  .premium-subtitle {
    color: #cfd6e1;
    font-size: 0.9rem;
    margin-bottom: 20px;
    line-height: 1.4rem;
  }

  .premium-card {
    background: #0b1e36;
    border: 3px solid #FFD700;
    border-radius: 24px;
    padding: 20px;
    margin: 14px auto;
    box-shadow: 0 0 18px rgba(255,215,0,0.28);
    width: 100%;
    max-width: 360px;
  }

  .premium-plan-title {
    color: #FFD700;
    font-size: 1.3rem;
    margin-bottom: 4px;
  }

  .premium-price {
    color: #FFD700;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .premium-list {
    list-style: none;
    padding: 0;
    margin-bottom: 16px;
    font-size: 0.9rem;
    line-height: 1.8rem;
    color: #fff;
    text-align: left;
  }

  .premium-list li {
    padding-left: 4px;
  }

  .premium-list li::before {
    content: "✓ ";
    color: #FFD700;
    font-weight: bold;
  }

  .premium-footer {
    margin-top: 24px;
    font-size: 0.75rem;
    color: #9ea5b0;
  }

  .restore-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 16px;
    padding: 10px 20px;
    background: transparent;
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 10px;
    color: #9ea5b0;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .restore-btn:hover {
    border-color: rgba(255, 215, 0, 0.6);
    color: #FFD700;
  }

  .restore-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .native-app-required {
    background: #0b1e36;
    border: 2px solid rgba(255, 215, 0, 0.3);
    border-radius: 24px;
    padding: 32px 20px;
    margin: 20px auto;
    max-width: 360px;
    text-align: center;
  }

  .native-app-icon {
    margin-bottom: 16px;
  }

  .native-app-title {
    color: #FFD700;
    font-size: 1.2rem;
    margin-bottom: 12px;
  }

  .native-app-text {
    color: #cfd6e1;
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

export default Premium;
