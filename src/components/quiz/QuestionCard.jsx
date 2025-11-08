import React from 'react';

const QuestionCard = ({
  question,
  selected,
  onSelect,
  onNext,
  currentQ,
  totalQ,
}) => {
  if (!question) return null;

  const handleSelect = (index) => {
    if (selected === null) onSelect(index);
  };

  return (
    <div className="flex flex-col flex-grow justify-center items-center text-center px-4 py-6">
      <h3 className="text-xl font-semibold mb-6">{question.text}</h3>

      <div className="w-full max-w-md space-y-3">
        {question.options.map((option, index) => {
          let bgColor = 'bg-[#101828] text-white';
          if (selected !== null) {
            if (index === question.correctIndex) bgColor = 'bg-green-600';
            else if (index === selected) bgColor = 'bg-red-600';
          }

          return (
            <button
              key={index}
              className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${bgColor}`}
              onClick={() => handleSelect(index)}
              disabled={selected !== null}
            >
              {option}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <button
          className="mt-6 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-xl font-semibold"
          onClick={onNext}
        >
          {currentQ + 1 === totalQ ? 'See Results' : 'Next Question'}
        </button>
      )}
    </div>
  );
};

export default QuestionCard;
