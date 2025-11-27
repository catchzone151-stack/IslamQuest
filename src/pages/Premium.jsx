import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, RefreshCw } from "lucide-react";
import { useProgressStore } from "../store/progressStore";
import { restorePurchases } from "../services/paymentService";
import MainMascot from "../assets/mascots/mascot_sitting.webp";

const Premium = () => {
  const navigate = useNavigate();
  const { premium, premiumType, purchaseIndividual, purchaseFamily } = useProgressStore();
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState("");

  const handleRestorePurchases = async () => {
    setRestoring(true);
    setRestoreMessage("");
    try {
      const result = await restorePurchases(useProgressStore);
      setRestoreMessage(result.message || (result.success ? "Purchases restored!" : "No purchases found"));
      if (result.success) {
        setTimeout(() => navigate("/"), 1500);
      }
    } catch (error) {
      console.error("Restore failed:", error);
      setRestoreMessage("Failed to restore purchases");
    } finally {
      setRestoring(false);
    }
  };

  const handleIndividualPurchase = async () => {
    setLoading(true);
    try {
      await purchaseIndividual();
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error("Purchase failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFamilyPurchase = async () => {
    setLoading(true);
    try {
      await purchaseFamily();
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error("Purchase failed:", error);
    } finally {
      setLoading(false);
    }
  };

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
            You Have Premium! 👑
          </h1>
          
          <p className="text-gray-300 mb-6 text-sm">
            Plan: {premiumType === "family" ? "Family Plan (6 users)" : "Individual Plan"}
          </p>

          <button
            onClick={() => navigate("/")}
            className="premium-btn"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

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
            Lifetime access • No ads • All learning paths • Works across devices
          </p>

          {/* INDIVIDUAL PLAN */}
          <div className="premium-card">
            <h2 className="premium-plan-title">Individual</h2>
            <div className="premium-price">£4.99 — One-time</div>

            <ul className="premium-list">
              <li>✔ All 14 Learning Paths</li>
              <li>✔ Unlimited Lessons</li>
              <li>✔ Global Events Access</li>
              <li>✔ No Ads Ever</li>
              <li>✔ Works Across Devices</li>
            </ul>

            <button 
              className="premium-btn"
              onClick={handleIndividualPurchase}
              disabled={loading}
            >
              {loading ? "Processing..." : "Unlock Individual — £4.99"}
            </button>
          </div>

          {/* FAMILY PLAN */}
          <div className="premium-card">
            <h2 className="premium-plan-title">Family (Up to 6 Users)</h2>
            <div className="premium-price">£18 — One-time</div>

            <ul className="premium-list">
              <li>✔ All Individual Benefits</li>
              <li>✔ 6 Linked Accounts</li>
              <li>✔ Perfect for parents & children</li>
            </ul>

            <button 
              className="premium-btn"
              onClick={handleFamilyPurchase}
              disabled={loading}
            >
              {loading ? "Processing..." : "Unlock Family — £18"}
            </button>

            <div className="premium-coming-soon">* More family features coming soon *</div>
          </div>

          <p className="premium-footer">
            Secure payment • Instant access • Lifetime unlock
          </p>

          <button 
            className="restore-btn"
            onClick={handleRestorePurchases}
            disabled={restoring}
          >
            <RefreshCw size={16} className={restoring ? "spin" : ""} />
            {restoring ? "Restoring..." : "Restore Purchases"}
          </button>

          {restoreMessage && (
            <p className="restore-message">{restoreMessage}</p>
          )}
        </div>
      </motion.div>

      <style>{`
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
          line-height: 1.6rem;
          color: #fff;
          text-align: left;
        }

        .premium-list li {
          padding-left: 4px;
        }

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
        }

        .premium-coming-soon {
          margin-top: 10px;
          font-size: 0.8rem;
          color: #d0d0d0;
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

        .restore-message {
          margin-top: 10px;
          font-size: 0.8rem;
          color: #10b981;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Premium;
