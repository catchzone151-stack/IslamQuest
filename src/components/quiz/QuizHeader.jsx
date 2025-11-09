import React from "react";
import { mascotQuizStates } from "../../data/mascotQuizStates";

const QuizHeader = ({ currentQ, totalQ, mascotMood, isQuizDone = false }) => {
  const mascotImg = mascotQuizStates[mascotMood] || mascotQuizStates.start;

  return (
    <div className="flex items-center justify-between px-4 pt-4 pb-3">
      <div>
        <h2 className="text-xl font-semibold text-white">Quiz</h2>
        <p className="text-sm text-gray-300">
          Question {Math.min(currentQ + 1, totalQ)} of {totalQ}
        </p>
      </div>

      {!isQuizDone && (
        <img
          src={mascotImg}
          alt="Mascot"
          className="w-14 h-14 object-contain"
        />
      )}
    </div>
  );
};

export default QuizHeader;
