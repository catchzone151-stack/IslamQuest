import React from 'react';
import { mascotQuizStates } from '../../data/mascotQuizStates';

const QuizHeader = ({ currentQ, totalQ, mascotMood }) => {
  const mascotImg = mascotQuizStates[mascotMood] || mascotQuizStates.start;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
      <div>
        <h2 className="text-lg font-semibold text-gold-400">Quiz</h2>
        <p className="text-sm text-gray-300">
          Question {currentQ + 1} of {totalQ}
        </p>
      </div>
      <img
        src={mascotImg}
        alt="Zayd Mascot"
        className="w-14 h-14 object-contain drop-shadow-md"
      />
    </div>
  );
};

export default QuizHeader;
