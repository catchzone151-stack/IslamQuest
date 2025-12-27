import { useState, useEffect } from "react";
import { useNavigate } from "../hooks/useNavigate";
import { useDailyQuestStore } from "../store/dailyQuestStore";
import { useAnalytics } from "../hooks/useAnalytics";
import { useVibration } from "../hooks/useVibration";
import QuestionCard from "../components/quiz/QuestionCard";
import PointingMascot from "../assets/mascots/mascot_pointing_v2.webp";
import SittingMascot from "../assets/mascots/mascot_sitting_v2.webp";
import CongratsMascot from "../assets/mascots/mascot_congratulation.webp";

export default function DailyQuestGame() {
  const navigate = useNavigate();
  const { questions, completeDailyQuest, getQuestStatus } = useDailyQuestStore();
  const analytics = useAnalytics();
  const { vibrate } = useVibration();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Guard: Wait for questions to load, show loading state instead of redirecting immediately
  useEffect(() => {
    let isMounted = true;
    
    const checkQuest = async () => {
      const status = getQuestStatus();
      
      // Already completed today
      if (status === "completed") {
        navigate("/");
        return;
      }
      
      // If questions already loaded, we're good
      if (questions.length > 0) {
        if (isMounted) setIsLoading(false);
        return;
      }
      
      // Wait a moment for store to sync
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Check again after delay
      let currentQuestions = useDailyQuestStore.getState().questions;
      if (currentQuestions.length > 0) {
        if (isMounted) setIsLoading(false);
        return;
      }
      
      // Still no questions - try generating
      try {
        const { checkAndGenerateDailyQuest } = useDailyQuestStore.getState();
        await checkAndGenerateDailyQuest();
      } catch (error) {
        console.error("Failed to generate quest:", error);
        if (isMounted) {
          setLoadError(true);
          setIsLoading(false);
        }
        return;
      }
      
      // Final check
      const finalQuestions = useDailyQuestStore.getState().questions;
      if (isMounted) {
        if (finalQuestions.length > 0) {
          setIsLoading(false);
        } else {
          // No questions available - show error instead of redirecting
          setLoadError(true);
          setIsLoading(false);
        }
      }
    };
    
    checkQuest();
    
    return () => { isMounted = false; };
  }, [navigate, getQuestStatus, questions.length]);

  // Show error state if quest couldn't be loaded
  if (loadError) {
    return (
      <div
        className="screen no-extra-space"
        style={{
          background: "linear-gradient(135deg, #0B1E2D 0%, #1a3a52 100%)",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          <img 
            src={SittingMascot} 
            alt="Mascot"
            style={{ width: "100px", height: "auto", marginBottom: "20px" }}
          />
          <h2 style={{ color: "#D4AF37", marginBottom: "16px" }}>
            Complete a Lesson First!
          </h2>
          <p style={{ color: "#f3f4f6", marginBottom: "24px", lineHeight: 1.6 }}>
            Daily Quest questions are drawn from lessons you've completed. 
            Complete at least one lesson to unlock Daily Quests!
          </p>
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
            }}
          >
            Go to Learning Paths
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while waiting for questions
  if (isLoading || questions.length === 0) {
    return (
      <div
        className="screen no-extra-space"
        style={{
          background: "linear-gradient(135deg, #0B1E2D 0%, #1a3a52 100%)",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "4px solid rgba(212, 175, 55, 0.3)",
              borderTop: "4px solid #D4AF37",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          />
          <p style={{ color: "#D4AF37", fontSize: "1.1rem", fontWeight: 600 }}>
            Loading Daily Quest...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
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

    // Haptic feedback based on answer correctness
    if (isCorrect) {
      vibrate([100, 50, 100, 50, 100]); // Success pattern
    } else {
      vibrate([200, 100, 200]); // Failure pattern
    }

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
    // Use dynamic 60% threshold based on actual question count
    const passThreshold = Math.ceil(totalQuestions * 0.6);
    const passed = correctCount >= passThreshold;

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
            {passed ? "MASHAA ALLAH! 🎉" : "Try Again! 💪"}
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
            src={passed ? CongratsMascot : SittingMascot} 
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

      {/* Mascot - Always show pointing_v2 during quiz */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <img 
          src={PointingMascot} 
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
