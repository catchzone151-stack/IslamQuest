import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Check, Users, Sparkles, BookOpen, Trophy, Zap, Lock } from "lucide-react";
import { useProgressStore } from "../store/progressStore";

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
      <div className="min-h-screen bg-gradient-to-br from-[var(--navy)] to-[var(--navy-dark)] text-white pb-24">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[var(--gold)] to-yellow-600 rounded-full flex items-center justify-center">
              <Crown size={48} className="text-white" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4">
              You Have Premium! 👑
            </h1>
            
            <p className="text-gray-300 mb-2">
              Plan: {premiumType === "family" ? "Family Plan (6 users)" : "Individual Plan"}
            </p>
            
            <div className="mt-8 bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-xl font-semibold mb-4">Your Premium Benefits</h2>
              <div className="space-y-3 text-left">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--emerald)]/20 flex items-center justify-center flex-shrink-0">
                      <benefit.icon size={20} className="text-[var(--emerald)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{benefit.title}</h3>
                      <p className="text-sm text-gray-300">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate("/")}
              className="mt-8 px-8 py-4 bg-white text-[var(--navy)] rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Back to Home
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--navy)] to-[var(--navy-dark)] text-white pb-24">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[var(--gold)] to-yellow-600 rounded-full flex items-center justify-center">
            <Crown size={40} className="text-white" />
          </div>
          
          <h1 className="text-4xl font-bold mb-3">
            Unlock Your Full Potential
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get unlimited access to all 14 learning paths and compete in global events
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setSelectedPlan("individual")}
            className={`
              relative cursor-pointer rounded-2xl p-6 border-4 transition-all
              ${selectedPlan === "individual" 
                ? "border-[var(--gold)] bg-white/10 backdrop-blur-sm" 
                : "border-white/20 bg-white/5 hover:bg-white/8"}
            `}
          >
            {selectedPlan === "individual" && (
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-[var(--gold)] rounded-full flex items-center justify-center">
                <Check size={20} className="text-white" />
              </div>
            )}
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--gold)] to-yellow-600 rounded-xl flex items-center justify-center">
                <Crown size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Individual</h3>
                <p className="text-sm text-gray-300">Perfect for you</p>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="text-4xl font-bold text-[var(--gold)]">
                £4.99
                <span className="text-lg text-gray-300 font-normal">/month</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Check size={16} className="text-[var(--emerald)] flex-shrink-0" />
                <span>All 14 learning paths</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check size={16} className="text-[var(--emerald)] flex-shrink-0" />
                <span>Unlimited lessons</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check size={16} className="text-[var(--emerald)] flex-shrink-0" />
                <span>Global events access</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check size={16} className="text-[var(--emerald)] flex-shrink-0" />
                <span>Premium badge</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => setSelectedPlan("family")}
            className={`
              relative cursor-pointer rounded-2xl p-6 border-4 transition-all
              ${selectedPlan === "family" 
                ? "border-[var(--gold)] bg-white/10 backdrop-blur-sm" 
                : "border-white/20 bg-white/5 hover:bg-white/8"}
            `}
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[var(--emerald)] to-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              BEST VALUE
            </div>
            
            {selectedPlan === "family" && (
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-[var(--gold)] rounded-full flex items-center justify-center">
                <Check size={20} className="text-white" />
              </div>
            )}
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--emerald)] to-green-600 rounded-xl flex items-center justify-center">
                <Users size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Family</h3>
                <p className="text-sm text-gray-300">Up to 6 users</p>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="text-4xl font-bold text-[var(--emerald)]">
                £18
                <span className="text-lg text-gray-300 font-normal">/month</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">£3 per person</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Check size={16} className="text-[var(--emerald)] flex-shrink-0" />
                <span>All Individual benefits</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check size={16} className="text-[var(--emerald)] flex-shrink-0" />
                <span>6 family members</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check size={16} className="text-[var(--emerald)] flex-shrink-0" />
                <span>Family leaderboard</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check size={16} className="text-[var(--emerald)] flex-shrink-0" />
                <span>Save 60% vs individual</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm mb-6"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">What You'll Get</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--gold)]/20 flex items-center justify-center flex-shrink-0">
                  <benefit.icon size={24} className="text-[var(--gold)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{benefit.title}</h3>
                  <p className="text-sm text-gray-300">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <button
            onClick={handlePurchase}
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-[var(--gold)] to-yellow-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              "Processing..."
            ) : (
              <>
                <Crown size={24} />
                Get {selectedPlan === "family" ? "Family" : "Individual"} Plan
              </>
            )}
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full py-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors"
          >
            Maybe Later
          </button>

          <p className="text-center text-sm text-gray-400 mt-4">
            Cancel anytime • Secure payment • Instant access
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Premium;
