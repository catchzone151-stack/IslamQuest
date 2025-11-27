import { useState } from "react";

export default function QuestionStep({ question, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);

  const handleSelect = (option) => {
    if (locked) return;

    setSelected(option);
    setLocked(true);

    setTimeout(() => {
      onAnswer(option);
      setSelected(null);
      setLocked(false);
    }, 800);
  };

  return (
    <div style={{ paddingBottom: 20 }}>
      <h2 className="quiz-question-title">{question.text}</h2>

      <div className="quiz-options">
        {question.options.map((opt, index) => (
          <button
            key={index}
            onClick={() => handleSelect(opt)}
            disabled={locked}
            className={`quiz-option ${selected === opt ? "selected" : ""}`}
            style={{
              padding: "14px 16px",
              marginBottom: 12,
              width: "100%",
              borderRadius: 12,
              background:
                selected === opt ? "var(--accent)" : "var(--card-bg)",
              color: selected === opt ? "#fff" : "var(--text)",
              transition: "all 0.25s ease",
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
