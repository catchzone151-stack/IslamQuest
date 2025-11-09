import React from "react";
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
  return (
    <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50">
      <div
        className="
          w-full max-w-md
          bg-[#0E1325]
          text-center text-white
          rounded-t-3xl
          px-6 pt-7 pb-9
          border-t-4 border-[#F4C542]
          shadow-[0_-6px_24px_rgba(244,197,66,0.18)]
        "
      >
        {/* Mascot */}
        <img
          src={mascotImg}
          alt="Mascot"
          className="w-20 h-20 object-contain mx-auto mb-4 drop-shadow-[0_0_10px_rgba(244,197,66,0.15)]"
        />

        {/* Title */}
        <h2 className="text-2xl font-bold text-[#F4C542] mb-1">
          {passed ? "Mashaa Allah!" : "Almost there!"}
        </h2>

        {/* Description */}
        <p className="text-gray-200 mb-2 text-[15px] leading-snug">
          {passed
            ? `You got ${score} out of ${totalQ}! You’ve unlocked the next lesson 🎉`
            : `You got ${score} out of ${totalQ}. Try again and you’ll get it In shaa Allah 💪`}
        </p>

        {/* Du’aa line (only on full pass) */}
        {passed && score === totalQ && (
          <p className="text-sm text-gray-400 mb-2">
            May Allah increase your knowledge 🌙
          </p>
        )}

        {/* XP & Coins */}
        <div className="flex justify-center items-center gap-8 my-5">
          <div className="flex items-center gap-2">
            <img src={xpIcon} alt="XP" width="24" height="24" />
            <span className="text-yellow-400 text-lg font-semibold">
              +{xp}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <img src={coinIcon} alt="Coins" width="24" height="24" />
            <span className="text-yellow-400 text-lg font-semibold">
              +{coins}
            </span>
          </div>
        </div>

        {/* Button */}
        {passed ? (
          <button
            onClick={onContinue}
            className="
              w-full py-3 mt-1
              bg-gradient-to-r from-yellow-400 to-yellow-500
              text-black font-semibold rounded-xl
              shadow-md hover:scale-[1.02]
              transition-all
            "
          >
            Continue
          </button>
        ) : (
          <button
            onClick={onRetry}
            className="
              w-full py-3 mt-1
              bg-red-500 text-white font-semibold
              rounded-xl shadow-md hover:scale-[1.02]
              transition-all
            "
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default RewardModal;
