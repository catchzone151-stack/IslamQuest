import React from "react";

const QuestionCard = ({
  question,
  selected,
  onSelect,
  currentQ,
  totalQ,
}) => {
  if (!question) return null;

  const wrapper = {
    width: "100%",
    maxWidth: "600px",
    margin: "0 auto",
    textAlign: "center",
    color: "#ffffff",
  };

  const questionMeta = {
    fontSize: "16px",
    color: "#F4C542",
    marginBottom: "4px",
  };

  const questionStyle = {
    fontSize: "20px",
    fontWeight: 600,
    marginBottom: "24px",
    lineHeight: 1.5,
  };

  const optionList = {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  };

  const baseOption = {
    padding: "12px 14px",
    borderRadius: "10px",
    border: "2px solid #F4C542",
    background: "rgba(5,10,20,0.96)",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 500,
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.25s ease",
  };

  return (
    <div style={wrapper}>
      <h2 style={questionMeta}>
        Question {currentQ + 1} of {totalQ}
      </h2>

      <h3 style={questionStyle}>{question.text}</h3>

      <div style={optionList}>
        {question.options.map((option, index) => {
          const isSelected = selected === index;
          let style = { ...baseOption };

          if (selected !== null) {
            const isCorrectIndex = question.correctIndex;

            if (index === isCorrectIndex) {
              style.background = "#16a34a";
              style.borderColor = "#16a34a";
            } else if (isSelected && index !== isCorrectIndex) {
              style.background = "#dc2626";
              style.borderColor = "#dc2626";
            } else {
              style.opacity = 0.5;
              style.borderColor = "#4b5563";
              style.color = "#9ca3af";
            }
          }

          return (
            <button
              key={index}
              onClick={() => {
                if (selected === null) onSelect(index);
              }}
              disabled={selected !== null}
              style={style}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionCard;
