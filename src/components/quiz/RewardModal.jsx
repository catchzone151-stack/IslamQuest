import React from "react";
import { motion } from "framer-motion";
import xpIcon from "../../assets/ui/ui_xp.webp";
import coinIcon from "../../assets/ui/ui_coin.webp";

const RewardModal = ({
  score,
  totalQ,
  xp,
  coins,
  passed,
  mascotImg,
  onRetry,
  onContinue,
}) => {
  const isPerfect = score === totalQ;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 200 }}
        className="w-full max-w-sm bg-[#0E1325] rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-b from-[#D4AF37]/20 to-transparent py-8 px-6 text-center border-b border-[#D4AF37]/30">
          <motion.img
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            src={mascotImg}
            alt="Mascot"
            className="w-24 h-24 object-contain mx-auto mb-4"
          />
          
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-[#D4AF37] mb-2"
          >
            {passed ? (isPerfect ? "Perfect Score!" : "Well Done!") : "Keep Trying!"}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-300 text-sm"
          >
            {passed
              ? isPerfect 
                ? "Mashaa Allah, you got everything right!"
                : "Great job! Keep up the good work!"
              : "You can do better In shaa Allah!"}
          </motion.p>
        </div>

        <div className="px-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#0B1E2D] rounded-2xl p-6 mb-6 border border-[#D4AF37]/20"
          >
            <div className="text-center mb-4">
              <div className="flex items-baseline justify-center gap-2 mb-1">
                <span className="text-5xl font-bold text-white">{score}</span>
                <span className="text-2xl text-gray-400">/</span>
                <span className="text-3xl font-semibold text-gray-400">{totalQ}</span>
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Questions Correct</p>
            </div>

            <div className="flex items-center justify-center gap-6 pt-4 border-t border-[#D4AF37]/10">
              <div className="flex items-center gap-2">
                <img src={xpIcon} alt="XP" className="w-8 h-8" />
                <div>
                  <div className="text-xl font-bold text-[#D4AF37]">+{xp}</div>
                  <div className="text-xs text-gray-500">XP</div>
                </div>
              </div>

              <div className="w-px h-10 bg-[#D4AF37]/20" />

              <div className="flex items-center gap-2">
                <img src={coinIcon} alt="Coins" className="w-8 h-8" />
                <div>
                  <div className="text-xl font-bold text-[#D4AF37]">+{coins}</div>
                  <div className="text-xs text-gray-500">Coins</div>
                </div>
              </div>
            </div>
          </motion.div>

          {passed && isPerfect && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-sm text-[#10B981] mb-4"
            >
              May Allah increase your knowledge 🌙
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {passed ? (
              <button
                onClick={onContinue}
                className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#F4C542] hover:from-[#F4C542] hover:to-[#D4AF37] text-[#0B1E2D] font-bold text-lg rounded-xl transition-all duration-300 shadow-lg"
              >
                Continue Learning
              </button>
            ) : (
              <button
                onClick={onRetry}
                className="w-full py-4 bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#10B981] text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-lg"
              >
                Try Again
              </button>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default RewardModal;
