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
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-[#0A1A2F] via-[#081426] to-[#0A1A2F] rounded-3xl p-6 border-2 border-[#D4AF37]">
          
          {/* MASCOT - CENTERED */}
          <div className="w-full flex justify-center mb-5">
            <img
              src={mascotImg}
              alt="Mascot"
              style={{ 
                width: "clamp(60px, 15vw, 80px)", 
                height: "clamp(60px, 15vw, 80px)",
                display: "block"
              }}
              className="object-contain"
            />
          </div>

          {/* HEADING - CENTERED - NO EMOJIS */}
          <div className="w-full text-center mb-4">
            <h2 
              className="font-black bg-gradient-to-r from-[#FFD700] via-[#F4C542] to-[#FFD700] bg-clip-text text-transparent"
              style={{
                fontSize: "clamp(1.5rem, 6vw, 2rem)",
                letterSpacing: "0.05em"
              }}
            >
              {passed ? "MASHA ALLAH!" : "KEEP GOING!"}
            </h2>
          </div>

          {/* SCORE - CENTERED */}
          <div className="w-full flex justify-center mb-3">
            <div className="flex items-baseline gap-1 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#D4AF37]/20 to-[#FFD700]/20 border border-[#D4AF37]/50">
              <span 
                className="font-black text-white"
                style={{ fontSize: "clamp(1.5rem, 6vw, 2rem)" }}
              >
                {score}
              </span>
              <span className="font-bold text-[#D4AF37]" style={{ fontSize: "clamp(1rem, 4vw, 1.3rem)" }}>/{totalQ}</span>
            </div>
          </div>

          {/* COMPLIMENT - CENTERED */}
          <div className="w-full text-center mb-6">
            <p
              className="text-gray-300 font-medium"
              style={{ fontSize: "clamp(0.9rem, 3vw, 1.1rem)" }}
            >
              {passed
                ? isPerfect 
                  ? "Perfect score! May Allah bless you!"
                  : "Amazing work! Next lesson unlocked!"
                : "Don't give up - you're learning!"}
            </p>
          </div>

          {/* XP AND COINS - SIDE BY SIDE - CENTERED */}
          <div className="w-full flex justify-center mb-6">
            <div className="flex flex-row gap-3">
              
              {/* XP BOX */}
              <div className="bg-gradient-to-br from-[#1a2332] to-[#0B1E2D] rounded-2xl p-3 border-2 border-[#D4AF37] min-w-[90px]">
                <div className="flex flex-col items-center">
                  <img 
                    src={xpIcon} 
                    alt="XP" 
                    style={{ 
                      width: "clamp(24px, 6vw, 32px)", 
                      height: "clamp(24px, 6vw, 32px)",
                      display: "block"
                    }}
                    className="mb-1"
                  />
                  <div className="font-black text-[#FFD700] text-center" style={{ fontSize: "clamp(0.9rem, 3.5vw, 1.1rem)" }}>
                    +{xp}
                  </div>
                  <div className="text-xs text-[#D4AF37] font-bold text-center">XP</div>
                </div>
              </div>

              {/* COINS BOX */}
              <div className="bg-gradient-to-br from-[#1a2332] to-[#0B1E2D] rounded-2xl p-3 border-2 border-[#F4C542] min-w-[90px]">
                <div className="flex flex-col items-center">
                  <img 
                    src={coinIcon} 
                    alt="Coins" 
                    style={{ 
                      width: "clamp(24px, 6vw, 32px)", 
                      height: "clamp(24px, 6vw, 32px)",
                      display: "block"
                    }}
                    className="mb-1"
                  />
                  <div className="font-black text-[#FFD700] text-center" style={{ fontSize: "clamp(0.9rem, 3.5vw, 1.1rem)" }}>
                    +{coins}
                  </div>
                  <div className="text-xs text-[#F4C542] font-bold text-center">COINS</div>
                </div>
              </div>

            </div>
          </div>

          {/* PERFECT SCORE MESSAGE - CENTERED */}
          {passed && isPerfect && (
            <div className="w-full text-center mb-5">
              <p
                className="text-[#10B981] font-bold"
                style={{ fontSize: "clamp(0.85rem, 2.8vw, 1rem)" }}
              >
                May Allah increase your knowledge
              </p>
            </div>
          )}

          {/* BUTTON - CENTERED */}
          <div className="w-full">
            {passed ? (
              <button
                onClick={onContinue}
                className="w-full py-4 rounded-2xl font-black tracking-wider text-center"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #F4C542 100%)',
                  color: '#0A1A2F',
                  fontSize: "clamp(1.1rem, 4vw, 1.4rem)"
                }}
              >
                CONTINUE JOURNEY →
              </button>
            ) : (
              <button
                onClick={onRetry}
                className="w-full py-4 rounded-2xl font-black tracking-wider text-center"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #34D399 50%, #6EE7B7 100%)',
                  color: 'white',
                  fontSize: "clamp(1.1rem, 4vw, 1.4rem)"
                }}
              >
                TRY AGAIN
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default RewardModal;
