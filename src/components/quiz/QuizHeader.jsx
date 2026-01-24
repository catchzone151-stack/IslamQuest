import React from "react";
import { mascotQuizStates } from "../../data/mascotQuizStates";

const QuizHeader = ({ currentQ, totalQ, mascotMood, isQuizDone = false, progressMascot = null }) => {
  const mascotImg = progressMascot || mascotQuizStates[mascotMood] || mascotQuizStates.start;

  return (
    <div className="flex items-center justify-end px-4 pt-4 pb-3">
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
