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
      {passed && [...Array(30)].map((_, i) => (
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
            scale: [0, 1.5, 1, 0.3],
            x: `${Math.random() * 100}vw`,
            y: `${Math.random() * 100}vh`,
            rotate: Math.random() * 720
          }}
          transition={{
            duration: 2.5,
            delay: i * 0.08,
            ease: "easeOut"
          }}
          className="absolute w-2 h-2 sm:w-3 sm:h-3 rounded-full"
          style={{ backgroundColor: confettiColors[i % confettiColors.length] }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.3, opacity: 0, y: 100 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ 
          type: "spring", 
          damping: 20, 
          stiffness: 120,
          delay: 0.1 
        }}
        className="w-full max-w-md relative"
      >
        {/* Glowing background effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] rounded-full blur-3xl opacity-40 animate-pulse" />
        
        <div className="relative bg-gradient-to-br from-[#0A1A2F]/95 via-[#081426]/95 to-[#0A1A2F]/95 rounded-3xl overflow-hidden backdrop-blur-sm">
          {/* Animated border glow */}
          <div className="absolute inset-0 rounded-3xl" style={{
            background: 'linear-gradient(45deg, #D4AF37, #FFD700, #F4C542, #D4AF37)',
            backgroundSize: '300% 300%',
            animation: 'gradient 3s ease infinite',
            padding: '2px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude'
          }} />
          
          <div className="relative px-5 py-8 text-center flex flex-col items-center">
            {/* Mascot drops in from top, then stays static */}
            <motion.div
              initial={{ y: -200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                type: "spring",
                damping: 15,
                stiffness: 100,
                delay: 0.2
              }}
              className="relative inline-block mb-4"
            >
              <div className="absolute inset-0 bg-[#FFD700] rounded-full blur-2xl opacity-60 scale-150" />
              <img
                src={mascotImg}
                alt="Mascot"
                style={{ width: "clamp(60px, 15vw, 80px)", height: "clamp(60px, 15vw, 80px)" }}
                className="object-contain relative z-10 drop-shadow-[0_0_25px_rgba(255,215,0,0.8)]"
              />
            </motion.div>

            {/* MaashaAllah heading - centered */}
            <motion.div
              initial={{ scale: 0, rotateZ: -180 }}
              animate={{ scale: 1, rotateZ: 0 }}
              transition={{ 
                type: "spring",
                delay: 0.3,
                damping: 15
              }}
              className="mb-3 w-full text-center"
            >
              <h2 
                className="font-black mb-1 bg-gradient-to-r from-[#FFD700] via-[#F4C542] to-[#FFD700] bg-clip-text text-transparent"
                style={{
                  fontSize: "clamp(1.5rem, 6vw, 2rem)",
                  textShadow: "0 0 40px rgba(255, 215, 0, 0.8)",
                  letterSpacing: "0.05em"
                }}
              >
                {passed ? (isPerfect ? "MASHA ALLAH! 🌟" : "MASHA ALLAH! ✨") : "KEEP GOING! 💪"}
              </h2>
            </motion.div>

            {/* Score badge - centered */}
            <motion.div
              initial={{ scale: 0, rotate: 360 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring",
                delay: 0.4,
                damping: 12
              }}
              className="inline-flex items-baseline gap-1 px-4 py-1.5 mb-3 rounded-full bg-gradient-to-r from-[#D4AF37]/20 to-[#FFD700]/20 border border-[#D4AF37]/50"
            >
              <motion.span 
                className="font-black text-white"
                style={{ fontSize: "clamp(1.5rem, 6vw, 2rem)" }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {score}
              </motion.span>
              <span className="font-bold text-[#D4AF37]" style={{ fontSize: "clamp(1rem, 4vw, 1.3rem)" }}>/{totalQ}</span>
            </motion.div>

            {/* Compliment text - centered */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-gray-300 font-medium mb-5 px-2 text-center w-full"
              style={{ fontSize: "clamp(0.9rem, 3vw, 1.1rem)" }}
            >
              {passed
                ? isPerfect 
                  ? "Perfect score! May Allah bless you! 🎯"
                  : "Amazing work! Next lesson unlocked! 🎉"
                : "Don't give up - you're learning! 🔥"}
            </motion.p>

            {/* XP and Coins together - centered showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring", damping: 15 }}
              className="relative mb-6 w-full flex justify-center"
            >
              {/* Glowing background for rewards */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/30 via-[#FFD700]/40 to-[#F4C542]/30 blur-2xl rounded-full" />
              
              <div className="relative flex items-center justify-center gap-3 sm:gap-4">
                {/* XP Box */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6, type: "spring", damping: 15 }}
                  whileHover={{ scale: 1.05, y: -3 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition-all" />
                  <div className="relative bg-gradient-to-br from-[#1a2332] to-[#0B1E2D] rounded-2xl p-3 sm:p-4 border-2 border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.6)]">
                    <img 
                      src={xpIcon} 
                      alt="XP" 
                      style={{ width: "clamp(24px, 6vw, 32px)", height: "clamp(24px, 6vw, 32px)" }}
                      className="mx-auto mb-1 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]"
                    />
                    <div className="font-black text-[#FFD700] text-center" style={{ fontSize: "clamp(0.9rem, 3.5vw, 1.1rem)" }}>
                      +{xp}
                    </div>
                    <div className="text-xs text-[#D4AF37] font-bold text-center tracking-wider">XP</div>
                  </div>
                </motion.div>

                {/* Coins Box */}
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6, type: "spring", damping: 15 }}
                  whileHover={{ scale: 1.05, y: -3 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#F4C542] to-[#FFD700] rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition-all" />
                  <div className="relative bg-gradient-to-br from-[#1a2332] to-[#0B1E2D] rounded-2xl p-3 sm:p-4 border-2 border-[#F4C542] shadow-[0_0_30px_rgba(244,197,66,0.6)]">
                    <img 
                      src={coinIcon} 
                      alt="Coins" 
                      style={{ width: "clamp(24px, 6vw, 32px)", height: "clamp(24px, 6vw, 32px)" }}
                      className="mx-auto mb-1 drop-shadow-[0_0_10px_rgba(244,197,66,0.8)]"
                    />
                    <div className="font-black text-[#FFD700] text-center" style={{ fontSize: "clamp(0.9rem, 3.5vw, 1.1rem)" }}>
                      +{coins}
                    </div>
                    <div className="text-xs text-[#F4C542] font-bold text-center tracking-wider">COINS</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Perfect score bonus message - centered */}
            {passed && isPerfect && (
              <motion.p
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
                className="text-[#10B981] font-bold mb-5 text-center w-full"
                style={{ fontSize: "clamp(0.85rem, 2.8vw, 1rem)" }}
              >
                ✨ May Allah increase your knowledge ✨
              </motion.p>
            )}

            {/* Action button - vibrant and dynamic - centered */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="w-full"
            >
              {passed ? (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onContinue}
                  className="relative w-full py-4 overflow-hidden rounded-2xl group shadow-[0_0_30px_rgba(212,175,55,0.5)]"
                  style={{
                    background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #F4C542 100%)',
                  }}
                >
                  {/* Shimmer effect */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  
                  {/* Glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700] to-[#F4C542] opacity-0 group-hover:opacity-50 transition-opacity blur-xl" />
                  
                  <span className="relative font-black text-[#0A1A2F] tracking-wider flex items-center justify-center gap-2" style={{ fontSize: "clamp(1.1rem, 4vw, 1.4rem)" }}>
                    CONTINUE JOURNEY
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </span>
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onRetry}
                  className="relative w-full py-4 overflow-hidden rounded-2xl group shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #34D399 50%, #6EE7B7 100%)',
                  }}
                >
                  {/* Shimmer effect */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  
                  {/* Glow on hover */}
                  <div className="absolute inset-0 bg-[#34D399] opacity-0 group-hover:opacity-50 transition-opacity blur-xl" />
                  
                  <span className="relative font-black text-white tracking-wider flex items-center justify-center gap-2" style={{ fontSize: "clamp(1.1rem, 4vw, 1.4rem)" }}>
                    TRY AGAIN
                    <motion.span
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      🔄
                    </motion.span>
                  </span>
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </motion.div>
  );
};

export default RewardModal;
