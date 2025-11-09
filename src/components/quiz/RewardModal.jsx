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

  const confettiColors = ["#D4AF37", "#F4C542", "#10B981", "#3B82F6", "#EC4899"];
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4"
    >
      {passed && [...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 0,
            scale: 0,
            x: "50vw",
            y: "50vh"
          }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0.5],
            x: `${Math.random() * 100}vw`,
            y: `${Math.random() * 100}vh`,
            rotate: Math.random() * 360
          }}
          transition={{
            duration: 2,
            delay: i * 0.1,
            ease: "easeOut"
          }}
          className="absolute w-3 h-3 rounded-full"
          style={{ backgroundColor: confettiColors[i % confettiColors.length] }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotateY: 90 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{ 
          type: "spring", 
          damping: 15, 
          stiffness: 100,
          delay: 0.2 
        }}
        className="w-full max-w-md relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] via-[#F4C542] to-[#D4AF37] rounded-3xl blur-2xl opacity-50 animate-pulse" />
        
        <div className="relative bg-gradient-to-br from-[#0B1E2D] via-[#1a2332] to-[#0B1E2D] rounded-3xl shadow-[0_0_100px_rgba(212,175,55,0.6)] border-2 sm:border-4 border-[#D4AF37] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent animate-pulse" />
          
          <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-[#D4AF37]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-32 sm:h-32 bg-[#10B981]/20 rounded-full blur-3xl" />
          
          <div className="relative px-4 sm:px-8 py-6 sm:py-10 text-center">
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="relative inline-block mb-4 sm:mb-6"
            >
              <div className="absolute inset-0 bg-[#D4AF37] rounded-full blur-xl opacity-60" />
              <img
                src={mascotImg}
                alt="Mascot"
                className="w-24 h-24 sm:w-32 sm:h-32 object-contain relative z-10 drop-shadow-[0_0_40px_rgba(212,175,55,0.8)]"
              />
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                delay: 0.4,
                damping: 10
              }}
            >
              <h2 
                className="font-black mb-2 bg-gradient-to-r from-[#FFD700] via-[#F4C542] to-[#FFD700] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(244,197,66,1)]"
                style={{
                  fontSize: "clamp(1.5rem, 6vw, 2.5rem)",
                  textShadow: "0 0 30px rgba(212, 175, 55, 0.8), 0 0 60px rgba(244, 197, 66, 0.6)"
                }}
              >
                {passed ? (isPerfect ? "🌟 PERFECT! 🌟" : "✨ MASHAA ALLAH! ✨") : "💪 KEEP GOING! 💪"}
              </h2>
            </motion.div>

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring",
                delay: 0.5,
                damping: 12
              }}
              className="relative my-4 sm:my-6"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/30 via-[#F4C542]/40 to-[#D4AF37]/30 rounded-3xl blur-xl" />
              
              <div className="relative bg-gradient-to-br from-[#1a2332] to-[#0B1E2D] border-2 sm:border-4 border-[#D4AF37] rounded-3xl p-4 sm:p-6 shadow-[inset_0_0_30px_rgba(212,175,55,0.3)]">
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <motion.span 
                    className="font-black bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent"
                    style={{ fontSize: "clamp(2.5rem, 10vw, 4rem)" }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {score}
                  </motion.span>
                  <span className="font-bold text-[#D4AF37]" style={{ fontSize: "clamp(1.5rem, 6vw, 2.25rem)" }}>/</span>
                  <span className="font-bold text-gray-400" style={{ fontSize: "clamp(1.75rem, 7vw, 3rem)" }}>{totalQ}</span>
                </div>

                <p className="text-white font-semibold mb-2 sm:mb-3" style={{ fontSize: "clamp(0.9rem, 3vw, 1.125rem)" }}>
                  {passed
                    ? isPerfect 
                      ? "🎯 Absolutely CRUSHING it! 🎯"
                      : "🎉 You unlocked the next lesson! 🎉"
                    : "🔥 Try again - you got this! 🔥"}
                </p>

                {passed && isPerfect && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="text-[#10B981] font-bold"
                    style={{ fontSize: "clamp(0.85rem, 2.5vw, 1rem)" }}
                  >
                    May Allah increase your knowledge 🌙
                  </motion.p>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center gap-2 sm:gap-4 mb-4 sm:mb-8"
            >
              <motion.div
                whileHover={{ scale: 1.15, rotate: 5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-[#D4AF37] rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-2 sm:gap-3 bg-gradient-to-br from-[#1a2332] to-[#0B1E2D] border-2 sm:border-3 border-[#D4AF37] rounded-xl sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-4 shadow-[0_0_20px_rgba(212,175,55,0.5)]">
                  <img src={xpIcon} alt="XP" className="w-7 h-7 sm:w-10 sm:h-10" />
                  <div className="text-left">
                    <div className="font-black text-[#FFD700]" style={{ fontSize: "clamp(1.25rem, 4vw, 1.875rem)" }}>+{xp}</div>
                    <div className="text-xs text-gray-400 font-semibold">XP</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.15, rotate: -5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-[#F4C542] rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-2 sm:gap-3 bg-gradient-to-br from-[#1a2332] to-[#0B1E2D] border-2 sm:border-3 border-[#F4C542] rounded-xl sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-4 shadow-[0_0_20px_rgba(244,197,66,0.5)]">
                  <img src={coinIcon} alt="Coins" className="w-7 h-7 sm:w-10 sm:h-10" />
                  <div className="text-left">
                    <div className="font-black text-[#FFD700]" style={{ fontSize: "clamp(1.25rem, 4vw, 1.875rem)" }}>+{coins}</div>
                    <div className="text-xs text-gray-400 font-semibold">COINS</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {passed ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onContinue}
                  className="relative w-full py-3 sm:py-5 overflow-hidden rounded-xl sm:rounded-2xl group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer" />
                  <span className="relative font-black text-[#0B1E2D] tracking-wide drop-shadow-lg" style={{ fontSize: "clamp(1rem, 3.5vw, 1.5rem)" }}>
                    CONTINUE LEARNING →
                  </span>
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onRetry}
                  className="relative w-full py-3 sm:py-5 overflow-hidden rounded-xl sm:rounded-2xl group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#10B981] animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative font-black text-white tracking-wide drop-shadow-lg" style={{ fontSize: "clamp(1rem, 3.5vw, 1.5rem)" }}>
                    TRY AGAIN 🔄
                  </span>
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RewardModal;
