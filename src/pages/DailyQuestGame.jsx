import { useState, useEffect } from "react";
import { useNavigate } from "../hooks/useNavigate";
import { useDailyQuestStore } from "../store/dailyQuestStore";
import { useAnalytics } from "../hooks/useAnalytics";
import QuestionCard from "../components/quiz/QuestionCard";
import assets from "../assets/assets";

export default function DailyQuestGame() {
  const navigate = useNavigate();
  const { questions, completeDailyQuest, getQuestStatus } = useDailyQuestStore();
  const analytics = useAnalytics();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Guard: Prevent entry if quest isn't ready or questions not loaded
  useEffect(() => {
    const status = getQuestStatus();
    if (status !== "ready" || questions.length === 0) {
      navigate("/");
    }
  }, [navigate, getQuestStatus, questions.length]);

  // Additional guard for direct navigation attempts
  if (questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  const handleSelect = (optionIndex) => {
    setSelected(optionIndex);
  };

  const handleNext = () => {
    const isCorrect = selected === currentQuestion.correctIndex;
    const newAnswers = [...answers, { questionIndex: currentIndex, correct: isCorrect }];
    setAnswers(newAnswers);

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelected(null);
    } else {
      const correctCount = newAnswers.filter(a => a.correct).length;
      completeDailyQuest(correctCount);
      
      // Track daily quest completion for analytics
      analytics('daily_quiz_completed', {
        score: correctCount,
        total: totalQuestions,
        xpEarned: 60,
        coinsEarned: 20
      });
      
      setShowResults(true);
    }
  };

  if (showResults) {
    const correctCount = answers.filter(a => a.correct).length;
    const passed = correctCount >= totalQuestions * 0.5;

    return (
      <div
        className="screen no-extra-space"
        style={{
          background: "linear-gradient(135deg, #0B1E2D 0%, #1a3a52 100%)",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: "20px",
          paddingRight: "20px",
          paddingTop: "20px",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "20px",
            padding: "40px",
            maxWidth: "500px",
            width: "100%",
            textAlign: "center",
            border: "2px solid #D4AF37",
            boxShadow: "0 10px 40px rgba(212, 175, 55, 0.3)",
          }}
        >
          {/* Title */}
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: passed ? "#10B981" : "#D4AF37",
              marginBottom: "20px",
            }}
          >
            {passed ? "Fantastic Work! 🎉" : "Good Effort! 💪"}
          </h1>

          {/* Score */}
          <div
            style={{
              fontSize: "3rem",
              fontWeight: 900,
              color: "#D4AF37",
              marginBottom: "30px",
            }}
          >
            {correctCount}/{totalQuestions}
          </div>

          {/* Rewards */}
          <div
            style={{
              background: "rgba(212, 175, 55, 0.1)",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "30px",
              border: "1px solid rgba(212, 175, 55, 0.3)",
            }}
          >
            <p
              style={{
                fontSize: "1.2rem",
                fontWeight: 600,
                color: "#D4AF37",
                marginBottom: "12px",
              }}
            >
              Daily Quest Rewards
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#10B981" }}>
                  +60 XP
                </div>
              </div>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#D4AF37" }}>
                  +20 Coins
                </div>
              </div>
            </div>
          </div>

          {/* Mascot */}
          <img 
            src={passed ? assets.mascots.mascot_congratulation : assets.mascots.mascot_defeated} 
            alt="Mascot"
            style={{
              width: "100px",
              height: "auto",
              margin: "0 auto 20px",
              animation: "bounce 1.5s infinite"
            }}
          />

          {/* Come back tomorrow message */}
          <p
            style={{
              fontSize: "1.1rem",
              color: "#f3f4f6",
              marginBottom: "30px",
            }}
          >
            Come back tomorrow for a new Daily Quest! 🌙
          </p>
          
          <style>{`
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
          `}</style>

          {/* Continue button */}
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "14px 40px",
              fontSize: "1.1rem",
              fontWeight: 600,
              borderRadius: "12px",
              border: "2px solid #D4AF37",
              background: "linear-gradient(145deg, #D4AF37, #b8941f)",
              color: "#0B1E2D",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 4px 12px rgba(212, 175, 55, 0.4)",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.05)";
              e.target.style.boxShadow = "0 6px 16px rgba(212, 175, 55, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "0 4px 12px rgba(212, 175, 55, 0.4)";
            }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="screen no-extra-space"
      style={{
        background: "linear-gradient(135deg, #0B1E2D 0%, #1a3a52 100%)",
        color: "#ffffff",
        paddingLeft: "20px",
        paddingRight: "20px",
        paddingTop: "20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto 30px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: 700,
            color: "#D4AF37",
            marginBottom: "8px",
          }}
        >
          Daily Quest 🌙
        </h1>
        <div
          style={{
            fontSize: "0.95rem",
            color: "#f3f4f6",
            marginBottom: "20px",
          }}
        >
          Question {currentIndex + 1} of {totalQuestions}
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: "100%",
            height: "8px",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
              height: "100%",
              background: "linear-gradient(90deg, #D4AF37, #10B981)",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      {/* Thinking Mascot */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <img 
          src={assets.mascots.mascot_dua} 
          alt="Mascot"
          style={{
            width: "80px",
            height: "auto"
          }}
        />
      </div>

      {/* Question Card */}
      <QuestionCard
        question={currentQuestion}
        currentQ={currentIndex}
        totalQ={totalQuestions}
        selected={selected}
        onSelect={handleSelect}
      />

      {/* Next Button */}
      {selected !== null && (
        <div
          style={{
            maxWidth: "600px",
            margin: "30px auto 0",
            textAlign: "center",
          }}
        >
          <button
            onClick={handleNext}
            style={{
              padding: "14px 40px",
              fontSize: "1.1rem",
              fontWeight: 600,
              borderRadius: "12px",
              border: "2px solid #D4AF37",
              background: "linear-gradient(145deg, #D4AF37, #b8941f)",
              color: "#0B1E2D",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 4px 12px rgba(212, 175, 55, 0.4)",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.05)";
              e.target.style.boxShadow = "0 6px 16px rgba(212, 175, 55, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "0 4px 12px rgba(212, 175, 55, 0.4)";
            }}
          >
            {currentIndex < totalQuestions - 1 ? "Next Question →" : "See Results 🎉"}
          </button>
        </div>
      )}
    </div>
  );
}
