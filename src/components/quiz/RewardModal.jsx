import React from 'react';
import { mascotQuizStates } from '../../data/mascotQuizStates';

const RewardModal = ({
  score,
  totalQ,
  xpEarned,
  coinsEarned,
  mascotMood,
  onRetry,
  onContinue,
}) => {
  const passed = score >= 3;
  const mascotImg = mascotQuizStates[mascotMood] || mascotQuizStates.pass;

  return (
    <div className="flex flex-col justify-center items-center text-center h-screen px-4">
      <img
        src={mascotImg}
        alt="Zayd Mascot"
        className="w-32 h-32 mb-6 object-contain drop-shadow-md"
      />
      <h2 className="text-2xl font-bold mb-2">
        {passed ? 'Mā shā’ Allāh!' : 'Almost there!'}
      </h2>
      <p className="text-gray-300 mb-4">
        {passed
          ? `You got ${score} out of ${totalQ}! You’ve unlocked the next lesson 🎉`
          : `You got ${score} out of ${totalQ}. Let’s learn a bit more then try again 💪`}
      </p>

      <div className="bg-[#101828] rounded-xl px-6 py-3 mb-5">
        <p className="text-lg text-gold-400 font-semibold">
          ⭐ +{xpEarned} XP · 💰 +{coinsEarned} Coins
        </p>
      </div>

      <div className="flex gap-3">
        {!passed && (
          <button
            className="px-5 py-3 bg-[#101828] text-white rounded-xl border border-gray-600"
            onClick={onRetry}
          >
            Retry Quiz
          </button>
        )}
        <button
          className="px-5 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold rounded-xl"
          onClick={onContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default RewardModal;
