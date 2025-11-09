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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 150 }}
        className="w-full max-w-md bg-gradient-to-b from-[#0B1E2D] via-[#0E1325] to-[#0A0F1E] rounded-3xl shadow-[0_0_60px_rgba(212,175,55,0.4)] border-2 border-[#D4AF37]/50 overflow-hidden"
      >
        <div className="relative px-6 py-8 text-center">
          <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#D4AF37]/20 to-transparent pointer-events-none" />

          <motion.img
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2, damping: 15 }}
            src={mascotImg}
            alt="Mascot"
            className="w-32 h-32 object-contain mx-auto mb-4 drop-shadow-[0_0_30px_rgba(212,175,55,0.6)] relative z-10"
          />

          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-[#D4AF37] mb-4"
          >
            {passed ? (isPerfect ? "Perfect!" : "Mashaa Allah!") : "Keep Trying!"}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-[#0B1E2D]/60 backdrop-blur-sm border-2 border-[#D4AF37]/30 rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-6xl font-bold text-white">{score}</span>
              <span className="text-3xl text-gray-400">/</span>
              <span className="text-4xl font-semibold text-gray-300">{totalQ}</span>
            </div>

            <p className="text-gray-300 text-base leading-relaxed mb-4">
              {passed
                ? isPerfect 
                  ? "Outstanding! You mastered this lesson! 🌟"
                  : "Great job! Next lesson unlocked! 🎉"
                : "You can do this In shaa Allah! 💪"}
            </p>

            {passed && isPerfect && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-sm text-[#10B981] font-medium"
              >
                May Allah increase your knowledge 🌙
              </motion.p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center items-center gap-4 mb-6"
          >
            <div className="flex items-center gap-2 bg-[#0B1E2D]/80 border-2 border-[#D4AF37]/40 rounded-xl px-5 py-3">
              <img src={xpIcon} alt="XP" width="32" height="32" />
              <span className="text-[#D4AF37] text-2xl font-bold">+{xp}</span>
            </div>

            <div className="flex items-center gap-2 bg-[#0B1E2D]/80 border-2 border-[#D4AF37]/40 rounded-xl px-5 py-3">
              <img src={coinIcon} alt="Coins" width="32" height="32" />
              <span className="text-[#D4AF37] text-2xl font-bold">+{coins}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {passed ? (
              <button
                onClick={onContinue}
                className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#F4C542] text-[#0B1E2D] font-bold text-lg rounded-xl shadow-[0_8px_30px_rgba(212,175,55,0.6)] hover:shadow-[0_12px_40px_rgba(212,175,55,0.8)] transform hover:scale-105 transition-all duration-300"
              >
                Continue Learning
              </button>
            ) : (
              <button
                onClick={onRetry}
                className="w-full py-4 bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-bold text-lg rounded-xl shadow-[0_8px_30px_rgba(16,185,129,0.5)] hover:shadow-[0_12px_40px_rgba(16,185,129,0.7)] transform hover:scale-105 transition-all duration-300"
              >
                Try Again
              </button>
            )}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RewardModal;
