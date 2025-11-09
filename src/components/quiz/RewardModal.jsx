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
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-end justify-center z-50"
    >
      <motion.div
        initial={{ y: 500, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full max-w-md relative"
      >
        {isPerfect && (
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 flex gap-3">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: 0, opacity: 0 }}
                animate={{ y: [-20, -60, -100], opacity: [0, 1, 0] }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
                className="text-4xl"
              >
                ✨
              </motion.div>
            ))}
          </div>
        )}

        <div className="bg-gradient-to-b from-[#0B1E2D] via-[#0E1325] to-[#0A0F1E] text-center text-white rounded-t-3xl px-6 pt-8 pb-10 border-t-4 border-[#D4AF37] shadow-[0_-10px_40px_rgba(212,175,55,0.3)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#D4AF37]/10 to-transparent pointer-events-none" />
          
          <motion.img
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.2 }}
            src={mascotImg}
            alt="Mascot"
            className="w-28 h-28 object-contain mx-auto mb-5 drop-shadow-[0_0_20px_rgba(212,175,55,0.4)] relative z-10"
          />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#D4AF37] via-[#F4C542] to-[#D4AF37] bg-clip-text text-transparent mb-2 drop-shadow-lg">
              {passed ? (isPerfect ? "Perfect! Mashaa Allah!" : "Mashaa Allah!") : "Keep Going!"}
            </h2>

            <div className="inline-flex items-center justify-center gap-3 mb-3 bg-white/5 px-6 py-3 rounded-full border border-[#D4AF37]/20">
              <span className="text-5xl font-bold text-white">{score}</span>
              <span className="text-2xl text-gray-400">/</span>
              <span className="text-3xl font-semibold text-gray-300">{totalQ}</span>
            </div>

            <p className="text-gray-300 mb-3 text-base leading-relaxed px-2">
              {passed
                ? isPerfect 
                  ? "Outstanding! You've mastered this lesson completely! 🌟"
                  : `Great job! You've unlocked the next lesson! 🎉`
                : `You got ${score} out of ${totalQ}. You can do this In shaa Allah! 💪`}
            </p>

            {passed && isPerfect && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-[#10B981] mb-4 font-medium"
              >
                May Allah increase your knowledge 🌙
              </motion.p>
            )}
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center items-center gap-6 my-6 bg-gradient-to-r from-[#D4AF37]/10 via-[#D4AF37]/20 to-[#D4AF37]/10 py-4 rounded-2xl border border-[#D4AF37]/30"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="flex items-center gap-2 bg-[#0B1E2D] px-4 py-2 rounded-xl border border-[#D4AF37]/40">
                <img src={xpIcon} alt="XP" width="28" height="28" className="drop-shadow-lg" />
                <span className="text-[#F4C542] text-xl font-bold">
                  +{xp}
                </span>
              </div>
              <span className="text-xs text-gray-400 font-medium">Experience</span>
            </motion.div>

            <div className="w-px h-12 bg-gradient-to-b from-transparent via-[#D4AF37]/50 to-transparent" />

            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="flex items-center gap-2 bg-[#0B1E2D] px-4 py-2 rounded-xl border border-[#D4AF37]/40">
                <img src={coinIcon} alt="Coins" width="28" height="28" className="drop-shadow-lg" />
                <span className="text-[#F4C542] text-xl font-bold">
                  +{coins}
                </span>
              </div>
              <span className="text-xs text-gray-400 font-medium">Coins</span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {passed ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={onContinue}
                className="w-full py-4 mt-2 bg-gradient-to-r from-[#D4AF37] via-[#F4C542] to-[#D4AF37] text-[#0B1E2D] font-bold text-lg rounded-xl shadow-[0_4px_20px_rgba(212,175,55,0.5)] hover:shadow-[0_6px_30px_rgba(212,175,55,0.7)] transition-all relative overflow-hidden group"
              >
                <span className="relative z-10">Continue Learning</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={onRetry}
                className="w-full py-4 mt-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-lg rounded-xl shadow-[0_4px_20px_rgba(16,185,129,0.4)] hover:shadow-[0_6px_30px_rgba(16,185,129,0.6)] transition-all relative overflow-hidden group"
              >
                <span className="relative z-10">Try Again</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </motion.button>
            )}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RewardModal;
