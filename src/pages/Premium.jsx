import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { useProgressStore } from "../store/progressStore";
import MainMascot from "../assets/mascots/mascot_sitting.webp";

const Premium = () => {
  const navigate = useNavigate();
  const { premium, premiumType, purchaseIndividual } = useProgressStore();
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
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
            Plan: {premiumType === "family" ? "Family Plan (6 users)" : "Lifetime Access"}
          </p>

          <button
            onClick={() => navigate("/")}
            className="iq-premium-btn"
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
        className="w-full max-w-[520px] text-white"
      >
        {/* Hero Section */}
        <img
          src={MainMascot}
          alt="Mascot"
          className="w-24 h-24 mx-auto mb-5"
          style={{
            filter: "drop-shadow(0 4px 8px rgba(255,215,0,0.2))"
          }}
        />
        
        <h1 
          className="text-3xl font-bold mb-3 text-center"
          style={{
            background: "linear-gradient(135deg, #FFD700, #FFA500)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Unlock IslamQuest
        </h1>
        
        <p className="text-center text-sm text-gray-300 mb-1">
          Lifetime access to all 14 learning paths.
        </p>
        <p className="text-center text-sm text-gray-300 mb-6">
          No ads — All updates — Works across devices.
        </p>

        {/* Main Premium Card */}
        <div className="iq-premium-card">
          <h2 
            className="text-2xl font-bold text-center mb-1"
            style={{ color: "#FFD700" }}
          >
            Lifetime Access
          </h2>
          
          <div className="iq-premium-price">
            £4.99 (one-time)
          </div>

          <ul className="iq-premium-list">
            <li>✔ All 14 Learning Paths</li>
            <li>✔ Unlimited Lessons</li>
            <li>✔ Global Events Access</li>
            <li>✔ No Ads Ever</li>
            <li>✔ Works Across Devices</li>
          </ul>

          <button 
            className="iq-premium-btn"
            onClick={handlePurchase}
            disabled={loading}
          >
            {loading ? "Processing..." : "Unlock Forever — £4.99"}
          </button>

          <div className="iq-premium-soon">
            Family plan coming soon
          </div>
        </div>

        {/* Footer */}
        <p className="iq-premium-footer">
          Secure purchase • Instant access • Lifetime unlock
        </p>
      </motion.div>

      <style>{`
        .iq-premium-card {
          background: #0b1e36;
          border: 3px solid #FFD700;
          border-radius: 24px;
          padding: 22px;
          box-shadow: 0 0 18px rgba(255,215,0,0.28);
          margin-top: 18px;
        }

        .iq-premium-price {
          margin-top: 6px;
          text-align: center;
          font-size: 1rem;
          color: #FFD700;
          font-weight: 600;
        }

        .iq-premium-list {
          list-style: none;
          padding: 0;
          margin: 14px 0;
          color: #fff;
          font-size: 0.9rem;
          line-height: 1.8rem;
        }

        .iq-premium-list li {
          padding-left: 4px;
        }

        .iq-premium-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(90deg, #FFD700, #FFB700);
          border: none;
          border-radius: 14px;
          color: #0a1a2f;
          font-weight: 700;
          font-size: 1rem;
          box-shadow: 0 0 12px rgba(255,215,0,0.4);
          margin-top: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .iq-premium-btn:hover {
          transform: scale(1.02);
          box-shadow: 0 0 16px rgba(255,215,0,0.5);
        }

        .iq-premium-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .iq-premium-soon {
          margin-top: 10px;
          text-align: center;
          font-size: 0.8rem;
          color: #d0d0d0;
        }

        .iq-premium-footer {
          margin-top: 30px;
          text-align: center;
          font-size: 0.75rem;
          color: #aeaeae;
        }
      `}</style>
    </div>
  );
};

export default Premium;
