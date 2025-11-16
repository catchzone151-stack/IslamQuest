import { useState, useEffect } from "react";
import ScreenContainer from "../components/ScreenContainer";
import { useReviseStore } from "../store/reviseStore";
import { useProgressStore } from "../store/progressStore";
import QuestionCard from "../components/quiz/QuestionCard";

export default function Revise() {
  const [mode, setMode] = useState(null); // null | "mistakes" | "smart"
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const {
    loadReviseData,
    getWeakPool,
    getRevisionSession,
    getSmartRevisionPack,
    removeIfMastered,
    updateLastSeen,
  } = useReviseStore();

  const { addXPAndCoins } = useProgressStore();

  // Load revise data on mount
  useEffect(() => {
    loadReviseData();
  }, [loadReviseData]);

  const weakPool = getWeakPool();
  const hasWeakQuestions = weakPool.length > 0;

  // Start Review Mistakes session
  const startMistakesReview = () => {
    const session = getRevisionSession(10);
    if (session.length === 0) return;

    setQuestions(session);
    setMode("mistakes");
    setCurrentQ(0);
    setSelected(null);
    setAnswers([]);
    setShowResults(false);
  };

  // Start Smart Revision session
  const startSmartRevision = () => {
    const pack = getSmartRevisionPack();
    if (pack.length === 0) return;

    setQuestions(pack);
    setMode("smart");
    setCurrentQ(0);
    setSelected(null);
    setAnswers([]);
    setShowResults(false);
  };

  // Handle answer selection
  const handleSelect = (index) => {
    if (selected !== null) return;

    const question = questions[currentQ];
    const isCorrect = index === question.answer;

    setSelected(index);
    const newAnswers = [...answers, { questionId: question.id, correct: isCorrect }];
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setSelected(null);
      } else {
        finishSession(newAnswers);
      }
    }, 1200);
  };

  // Finish revision session
  const finishSession = (finalAnswers) => {
    const correctCount = finalAnswers.filter((a) => a.correct).length;
    const totalQuestions = questions.length;

    // Process mistakes mode: remove mastered, update wrong again
    if (mode === "mistakes") {
      finalAnswers.forEach((ans) => {
        if (ans.correct) {
          // User got it right - remove from weak pool
          removeIfMastered(ans.questionId);
        } else {
          // User got it wrong again - update timestamp
          updateLastSeen(ans.questionId);
        }
      });

      // Rewards for mistakes mode
      const xpPerCorrect = 4;
      const xpEarned = correctCount * xpPerCorrect;
      const bonusXP = correctCount === totalQuestions ? 10 : 0;
      const totalXP = xpEarned + bonusXP;

      if (totalXP > 0) {
        addXPAndCoins(totalXP, 0);
      }
    } else if (mode === "smart") {
      // Rewards for smart mode
      const xp = 25;
      const coins = 10;
      addXPAndCoins(xp, coins);
    }

    setShowResults(true);
  };

  // Go back to main menu
  const goBack = () => {
    setMode(null);
    setQuestions([]);
    setCurrentQ(0);
    setSelected(null);
    setAnswers([]);
    setShowResults(false);
  };

  // ============================================
  // RESULTS SCREEN
  // ============================================
  if (showResults) {
    const correctCount = answers.filter((a) => a.correct).length;
    const totalQuestions = questions.length;
    const passed = correctCount >= totalQuestions * 0.5;

    let rewardXP = 0;
    let rewardCoins = 0;

    if (mode === "mistakes") {
      rewardXP = correctCount * 4;
      if (correctCount === totalQuestions) {
        rewardXP += 10; // Perfect score bonus
      }
    } else if (mode === "smart") {
      rewardXP = 25;
      rewardCoins = 10;
    }

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0B1E2D 0%, #1a3a52 100%)",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
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
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: passed ? "#10B981" : "#D4AF37",
              marginBottom: "20px",
            }}
          >
            {passed ? "Great Work! 🎉" : "Keep Learning! 💪"}
          </h1>

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

          {rewardXP > 0 && (
            <div
              style={{
                background: "rgba(212, 175, 55, 0.1)",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <p
                style={{
                  fontSize: "1.1rem",
                  color: "#10B981",
                  fontWeight: 600,
                  margin: "0 0 10px",
                }}
              >
                Rewards Earned!
              </p>
              <div style={{ fontSize: "1.5rem", color: "#D4AF37" }}>
                +{rewardXP} XP
                {rewardCoins > 0 && ` • +${rewardCoins} Coins`}
              </div>
            </div>
          )}

          {mode === "mistakes" && correctCount === totalQuestions && (
            <p
              style={{
                color: "#10B981",
                fontWeight: 600,
                marginBottom: "20px",
              }}
            >
              🎯 Perfect Score Bonus: +10 XP
            </p>
          )}

          {mode === "mistakes" && (
            <p
              style={{
                opacity: 0.8,
                marginBottom: "20px",
                fontSize: "0.95rem",
              }}
            >
              {correctCount > 0 && `${correctCount} question${correctCount > 1 ? 's' : ''} removed from weak pool!`}
            </p>
          )}

          <button
            onClick={goBack}
            style={{
              marginTop: "10px",
              background: "#D4AF37",
              border: "none",
              padding: "14px 28px",
              borderRadius: "12px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
              color: "#0B1E2D",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FFD700";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#D4AF37";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Back to Revise
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // QUIZ SCREEN
  // ============================================
  if (mode && questions.length > 0) {
    const currentQuestion = {
      text: questions[currentQ].question,
      options: questions[currentQ].options,
      correctIndex: questions[currentQ].answer,
    };

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0B1E2D 0%, #1a3a52 100%)",
          color: "#ffffff",
          padding: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "100%", maxWidth: "600px" }}>
          <div
            style={{
              textAlign: "center",
              marginBottom: "30px",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                color: "#D4AF37",
                marginBottom: "10px",
              }}
            >
              {mode === "mistakes" ? "Review Mistakes" : "Smart Revision"}
            </h2>
            <p style={{ opacity: 0.8, fontSize: "0.9rem" }}>
              {mode === "mistakes"
                ? "Master your weak areas"
                : "Strengthen your weakest path"}
            </p>
          </div>

          <QuestionCard
            question={currentQuestion}
            selected={selected}
            onSelect={handleSelect}
            currentQ={currentQ}
            totalQ={questions.length}
          />
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN MENU
  // ============================================
  return (
    <ScreenContainer>
      <div style={{ position: "relative", padding: "20px 20px 40px" }}>
        {/* Title */}
        <div style={{ textAlign: "center", marginTop: "20px", marginBottom: "30px" }}>
          <h1
            style={{
              fontSize: "clamp(1.5rem, 5vw, 2rem)",
              fontWeight: 800,
              margin: 0,
              background: "linear-gradient(90deg, #FFD700, #FFA500, #FFD700)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundSize: "200%",
              animation: "shimmer 8s linear infinite",
            }}
          >
            Revise & Master
          </h1>
          <p style={{ opacity: 0.9, marginTop: 8, fontSize: "0.95rem" }}>
            Turn your mistakes into mastery 📘
          </p>
        </div>

        {/* Review Mistakes Card */}
        <div
          onClick={hasWeakQuestions ? startMistakesReview : null}
          style={{
            background: hasWeakQuestions
              ? "linear-gradient(145deg, rgba(212,175,55,0.2), rgba(16,185,129,0.1))"
              : "linear-gradient(145deg, rgba(107,114,128,0.2), rgba(75,85,99,0.1))",
            border: `2px solid ${hasWeakQuestions ? "rgba(212,175,55,0.5)" : "rgba(107,114,128,0.3)"}`,
            borderRadius: 20,
            padding: 24,
            marginBottom: 20,
            cursor: hasWeakQuestions ? "pointer" : "not-allowed",
            transition: "all 0.3s ease",
            boxShadow: hasWeakQuestions
              ? "0 8px 20px rgba(212,175,55,0.2)"
              : "0 4px 10px rgba(0,0,0,0.1)",
            opacity: hasWeakQuestions ? 1 : 0.6,
          }}
          onMouseEnter={(e) => {
            if (hasWeakQuestions) {
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.boxShadow = "0 12px 30px rgba(212,175,55,0.3)";
            }
          }}
          onMouseLeave={(e) => {
            if (hasWeakQuestions) {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(212,175,55,0.2)";
            }
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  color: "#D4AF37",
                  margin: "0 0 8px",
                }}
              >
                Review Mistakes 🎯
              </h3>
              <p
                style={{
                  opacity: 0.85,
                  margin: "0 0 12px",
                  fontSize: "0.9rem",
                  lineHeight: 1.5,
                }}
              >
                Fix mistakes from past lessons, quizzes, and challenges.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  fontSize: "0.85rem",
                  opacity: 0.7,
                }}
              >
                <span>📝 10 questions</span>
                <span>•</span>
                <span>⏱️ No timer</span>
                <span>•</span>
                <span>✨ +4 XP per correct</span>
              </div>
            </div>
            <div
              style={{
                background: hasWeakQuestions
                  ? "rgba(212,175,55,0.2)"
                  : "rgba(107,114,128,0.2)",
                borderRadius: "50%",
                width: 60,
                height: 60,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.8rem",
                flexShrink: 0,
              }}
            >
              {hasWeakQuestions ? weakPool.length : "🔒"}
            </div>
          </div>

          {!hasWeakQuestions && (
            <div
              style={{
                marginTop: 15,
                padding: 12,
                background: "rgba(255,255,255,0.05)",
                borderRadius: 10,
                fontSize: "0.85rem",
                opacity: 0.8,
              }}
            >
              💡 Complete some lessons and get questions wrong to build your revision pool!
            </div>
          )}
        </div>

        {/* Smart Revision Card */}
        <SmartRevisionCard onStart={startSmartRevision} />
      </div>

      <style>
        {`
          @keyframes shimmer {
            0% { background-position: 0% 50%; }
            100% { background-position: 200% 50%; }
          }
        `}
      </style>
    </ScreenContainer>
  );
}

// ============================================
// SMART REVISION CARD COMPONENT
// ============================================
function SmartRevisionCard({ onStart }) {
  const { getWeakestPath } = useReviseStore();
  const weakestPath = getWeakestPath();

  const hasWeakestPath = weakestPath !== null && weakestPath.totalQuestions > 0;

  return (
    <div
      onClick={hasWeakestPath ? onStart : null}
      style={{
        background: hasWeakestPath
          ? "linear-gradient(145deg, rgba(59,130,246,0.2), rgba(147,51,234,0.1))"
          : "linear-gradient(145deg, rgba(107,114,128,0.2), rgba(75,85,99,0.1))",
        border: `2px solid ${hasWeakestPath ? "rgba(59,130,246,0.5)" : "rgba(107,114,128,0.3)"}`,
        borderRadius: 20,
        padding: 24,
        cursor: hasWeakestPath ? "pointer" : "not-allowed",
        transition: "all 0.3s ease",
        boxShadow: hasWeakestPath
          ? "0 8px 20px rgba(59,130,246,0.2)"
          : "0 4px 10px rgba(0,0,0,0.1)",
        opacity: hasWeakestPath ? 1 : 0.6,
      }}
      onMouseEnter={(e) => {
        if (hasWeakestPath) {
          e.currentTarget.style.transform = "scale(1.02)";
          e.currentTarget.style.boxShadow = "0 12px 30px rgba(59,130,246,0.3)";
        }
      }}
      onMouseLeave={(e) => {
        if (hasWeakestPath) {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 8px 20px rgba(59,130,246,0.2)";
        }
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3
            style={{
              fontSize: "1.3rem",
              fontWeight: 700,
              color: hasWeakestPath ? "#3B82F6" : "#9CA3AF",
              margin: "0 0 8px",
            }}
          >
            Smart Revision 🧠
          </h3>
          <p
            style={{
              opacity: 0.85,
              margin: "0 0 12px",
              fontSize: "0.9rem",
              lineHeight: 1.5,
            }}
          >
            {hasWeakestPath
              ? `Revise your weakest topic: ${weakestPath.title}`
              : "Revise your weakest topics intelligently."}
          </p>
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              fontSize: "0.85rem",
              opacity: 0.7,
            }}
          >
            <span>📝 8 questions</span>
            <span>•</span>
            <span>⏱️ No timer</span>
            <span>•</span>
            <span>✨ +25 XP +10 Coins</span>
          </div>
        </div>
        <div
          style={{
            background: hasWeakestPath
              ? "rgba(59,130,246,0.2)"
              : "rgba(107,114,128,0.2)",
            borderRadius: "50%",
            width: 60,
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.8rem",
            flexShrink: 0,
          }}
        >
          {hasWeakestPath ? "🎓" : "🔒"}
        </div>
      </div>

      {hasWeakestPath && weakestPath.wrongQuestions > 0 && (
        <div
          style={{
            marginTop: 15,
            padding: 12,
            background: "rgba(59,130,246,0.1)",
            borderRadius: 10,
            fontSize: "0.85rem",
            opacity: 0.9,
          }}
        >
          📊 {weakestPath.wrongQuestions} mistakes found • {weakestPath.completedLessons} lessons completed
        </div>
      )}

      {!hasWeakestPath && (
        <div
          style={{
            marginTop: 15,
            padding: 12,
            background: "rgba(255,255,255,0.05)",
            borderRadius: 10,
            fontSize: "0.85rem",
            opacity: 0.8,
          }}
        >
          💡 Complete some learning paths to unlock smart revision!
        </div>
      )}
    </div>
  );
}
