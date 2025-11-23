import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Check, Users, Sparkles, BookOpen, Trophy, Zap, X } from "lucide-react";
import { useProgressStore } from "../store/progressStore";
import MainMascot from "../assets/mascots/mascot_sitting.webp";

const Premium = () => {
  const navigate = useNavigate();
  const { premium, premiumType, purchaseIndividual, purchaseFamily } = useProgressStore();
  const [selectedPlan, setSelectedPlan] = useState("individual");
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      if (selectedPlan === "individual") {
        await purchaseIndividual();
      } else {
        await purchaseFamily();
      }
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error("Purchase failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: BookOpen,
      title: "All 14 Learning Paths",
      description: "Unlock exclusive paths: The Grave, Day of Judgement, Hellfire, and Paradise"
    },
    {
      icon: Trophy,
      title: "Unlimited Lessons",
      description: "Access every lesson in all paths without restrictions"
    },
    {
      icon: Zap,
      title: "Global Events Access",
      description: "Compete in weekly challenges and climb the leaderboards"
    },
    {
      icon: Sparkles,
      title: "Premium Badge",
      description: "Display your commitment with an exclusive Crown badge"
    }
  ];

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
          {/* Mascot */}
          <img
            src={MainMascot}
            alt="Mascot"
            className="w-24 h-24 mx-auto mb-4"
          />
          
          {/* Crown Icon */}
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[var(--gold)] to-yellow-600 rounded-full flex items-center justify-center">
            <Crown size={32} className="text-white" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2 text-[var(--gold)]">
            You Have Premium! 👑
          </h1>
          
          <p className="text-gray-300 mb-6 text-sm">
            Plan: {premiumType === "family" ? "Family Plan (6 users)" : "Individual Plan"}
          </p>
          
          {/* Benefits Grid */}
          <div className="space-y-2 mb-6">
            {benefits.map((benefit, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-2 text-left bg-white/5 rounded-xl p-3"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--emerald)]/20 flex items-center justify-center flex-shrink-0">
                  <benefit.icon size={16} className="text-[var(--emerald)]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-sm">{benefit.title}</h3>
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
        {/* Mascot */}
        <img
          src={MainMascot}
          alt="Mascot"
          className="w-20 h-20 mx-auto mb-4"
        />
        
        {/* Crown Icon */}
        <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-[var(--gold)] to-yellow-600 rounded-full flex items-center justify-center">
          <Crown size={28} className="text-white" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2 text-center text-[var(--gold)]">
          Unlock Your Full Potential
        </h1>
        
        <p className="text-center text-sm text-gray-300 mb-6">
          Get unlimited access to all 14 learning paths and compete in global events
        </p>

        {/* Pricing Cards - Stacked */}
        <div className="space-y-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setSelectedPlan("individual")}
            className="relative cursor-pointer rounded-2xl p-4 transition-all"
            style={{
              border: `3px solid ${selectedPlan === "individual" ? "#D4AF37" : "rgba(255,255,255,0.2)"}`,
              background: selectedPlan === "individual" ? "rgba(212,175,55,0.1)" : "rgba(255,255,255,0.05)",
            }}
          >
            {selectedPlan === "individual" && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--gold)] rounded-full flex items-center justify-center">
                <Check size={14} className="text-white" />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown size={20} className="text-[var(--gold)]" />
                <div>
                  <h3 className="text-lg font-bold">Individual</h3>
                  <p className="text-xs text-gray-400">Perfect for you</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[var(--gold)]">£4.99</div>
                <p className="text-xs text-gray-400">/month</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => setSelectedPlan("family")}
            className="relative cursor-pointer rounded-2xl p-4 transition-all"
            style={{
              border: `3px solid ${selectedPlan === "family" ? "#D4AF37" : "rgba(255,255,255,0.2)"}`,
              background: selectedPlan === "family" ? "rgba(212,175,55,0.1)" : "rgba(255,255,255,0.05)",
            }}
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[var(--emerald)] to-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              BEST VALUE
            </div>
            
            {selectedPlan === "family" && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--gold)] rounded-full flex items-center justify-center">
                <Check size={14} className="text-white" />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={20} className="text-[var(--emerald)]" />
                <div>
                  <h3 className="text-lg font-bold">Family</h3>
                  <p className="text-xs text-gray-400">Up to 6 users</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[var(--emerald)]">£18</div>
                <p className="text-xs text-gray-400">£3/person</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Benefits Section - Compact */}
        <div className="space-y-2 mb-6">
          {benefits.map((benefit, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-2 bg-white/5 rounded-xl p-2"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--gold)]/20 flex items-center justify-center flex-shrink-0">
                <benefit.icon size={16} className="text-[var(--gold)]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{benefit.title}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handlePurchase}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #D4AF37, #FFD700)",
              color: "#0a0f1e",
              boxShadow: "0 4px 12px rgba(212, 175, 55, 0.3)",
            }}
          >
            {loading ? (
              "Processing..."
            ) : (
              <>
                <Crown size={20} />
                Get {selectedPlan === "family" ? "Family" : "Individual"} Plan
              </>
            )}
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 rounded-xl font-semibold transition-all"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              color: "white",
            }}
          >
            Maybe Later
          </button>

          <p className="text-center text-xs text-gray-400 mt-2">
            Cancel anytime • Secure payment • Instant access
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Premium;
