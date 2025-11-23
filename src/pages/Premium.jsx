import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Check } from "lucide-react";
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
          className="w-full max-w-[480px] rounded-3xl p-6 text-center"
          style={{
            background: "rgba(15, 25, 45, 0.95)",
            border: "2px solid rgba(212, 175, 55, 0.3)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            backdropFilter: "blur(10px)",
          }}
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
          
          <div className="space-y-2 mb-6">
            {[
              "All 14 learning paths unlocked",
              "Unlimited lessons",
              "Global Events access",
              "No ads ever"
            ].map((text, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-2 text-left bg-white/5 rounded-xl p-3"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--gold)]/20 flex items-center justify-center flex-shrink-0">
                  <Check size={16} className="text-[var(--gold)]" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">{text}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("/")}
            className="w-full py-3 rounded-xl font-semibold transition-all"
            style={{
              background: "linear-gradient(135deg, #D4AF37, #FFD700)",
              color: "#0a0f1e",
              boxShadow: "0 4px 12px rgba(212, 175, 55, 0.3)",
            }}
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
        className="w-full max-w-[520px] rounded-3xl p-6 text-white"
        style={{
          background: "rgba(15, 25, 45, 0.95)",
          border: "2px solid rgba(212, 175, 55, 0.3)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Hero Section */}
        <img
          src={MainMascot}
          alt="Mascot"
          className="w-24 h-24 mx-auto mb-5"
        />
        
        <h1 className="text-2xl font-bold mb-2 text-center text-[var(--gold)]">
          Unlock Your Full Potential
        </h1>
        
        <p className="text-center text-sm text-gray-300 mb-6">
          Lifetime access. No ads. All learning paths.
        </p>

        {/* Main Premium Card */}
        <div
          className="rounded-3xl p-5 mb-5"
          style={{
            background: "rgba(10, 15, 30, 0.8)",
            border: "2px solid rgba(212, 175, 55, 0.4)",
            boxShadow: "0 0 18px rgba(255, 215, 0, 0.2)",
          }}
        >
          <h2 className="text-xl font-bold text-[var(--gold)] mb-1 text-center">
            Lifetime Access
          </h2>
          
          <p className="text-center text-gray-300 text-sm mb-4">
            £4.99 — One-time
          </p>

          <div className="space-y-2 mb-4">
            {[
              "All 14 learning paths unlocked",
              "Unlimited lessons",
              "Global Events access",
              "No ads ever",
              "Works across devices"
            ].map((text, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <Check size={16} className="text-[var(--gold)] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-200">{text}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-center text-gray-400 italic mt-4">
            Knowledge is light. May Allah make it easy for you.
          </p>
        </div>

        {/* Main Button */}
        <button
          onClick={handlePurchase}
          disabled={loading}
          className="w-full py-3.5 rounded-2xl font-bold text-base transition-all mb-3"
          style={{
            background: "#FFD700",
            color: "#0a0f1e",
            boxShadow: "0 0 12px rgba(255, 215, 0, 0.4)",
          }}
        >
          {loading ? "Processing..." : "Unlock Forever — £4.99"}
        </button>

        {/* Secondary Link */}
        <p className="text-center text-gray-400 text-xs mb-4">
          Family plan coming soon
        </p>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          Secure purchase • Instant access • Lifetime unlock
        </p>
      </motion.div>
    </div>
  );
};

export default Premium;
