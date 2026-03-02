import { useState, useEffect, useRef } from "react";
import { useNavigate } from "../hooks/useNavigate";
import { useDailyQuestStore } from "../store/dailyQuestStore";
import { useAnalytics } from "../hooks/useAnalytics";
import { useVibration } from "../hooks/useVibration";
import QuestionCard from "../components/quiz/QuestionCard";
import PointingMascot from "../assets/mascots/mascot_pointing_v2.webp";
import SittingMascot from "../assets/mascots/mascot_sitting_v2.webp";
import CongratsMascot from "../assets/mascots/mascot_congratulation.webp";

// Root overlay — covers full viewport, never scrolls, never bounces
const overlayBase = {
  position: "fixed",
  inset: 0,
  top: 0,
  paddingTop: "var(--sat, 0px)",
  height: "100dvh",
  zIndex: 999,
  background: "#0e2340",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  overscrollBehavior: "none",
  touchAction: "none",
};

export default function DailyQuestGame() {
  const navigate = useNavigate();
  const { questions, completeDailyQuest, getQuestStatus } = useDailyQuestStore();
  const analytics = useAnalytics();
  const { vibrate } = useVibration();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const autoAdvanceTimer = useRef(null);

  // Prevent underlying page from scrolling while active
  useEffect(() => {
    const el = document.querySelector(".app-root-container");
    if (el) el.style.overflowY = "hidden";
    return () => {
      if (el) el.style.overflowY = "";
    };
  }, []);

  // Guard: Wait for questions to load
  useEffect(() => {
    let isMounted = true;

    const checkQuest = async () => {
      const status = getQuestStatus();
      if (status === "completed") {
        navigate("/");
        return;
      }
      if (questions.length > 0) {
        if (isMounted) setIsLoading(false);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
      let q = useDailyQuestStore.getState().questions;
      if (q.length > 0) {
        if (isMounted) setIsLoading(false);
        return;
      }
      try {
        const { checkAndGenerateDailyQuest } = useDailyQuestStore.getState();
        await checkAndGenerateDailyQuest();
      } catch {
        if (isMounted) { setLoadError(true); setIsLoading(false); }
        return;
      }
      const final = useDailyQuestStore.getState().questions;
      if (isMounted) {
        if (final.length > 0) setIsLoading(false);
        else { setLoadError(true); setIsLoading(false); }
      }
    };

    checkQuest();
    return () => { isMounted = false; };
  }, [navigate, getQuestStatus, questions.length]);

  // Clear timer on unmount
  useEffect(() => () => clearTimeout(autoAdvanceTimer.current), []);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  const handleSelect = (i) => {
    if (isAnswered) return;

    setSelected(i);
    setIsAnswered(true);

    const isCorrect = i === currentQuestion.correctIndex;
    vibrate(isCorrect ? [100, 50, 100] : [200, 100, 200]);

    const newAnswers = [...answers, { questionIndex: currentIndex, correct: isCorrect }];
    setAnswers(newAnswers);

    // Auto-advance after 2 seconds
    autoAdvanceTimer.current = setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelected(null);
        setIsAnswered(false);
      } else {
        const correctCount = newAnswers.filter((a) => a.correct).length;
        completeDailyQuest(correctCount);
        analytics("daily_quiz_completed", { score: correctCount, total: totalQuestions, xpEarned: 60, coinsEarned: 20 });
        setShowResults(true);
      }
    }, 2000);
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading || (!loadError && questions.length === 0)) {
    return (
      <div style={{ ...overlayBase, alignItems: "center", justifyContent: "center", touchAction: "auto" }}>
        <div
          style={{
            width: 50,
            height: 50,
            border: "4px solid rgba(212,175,55,0.3)",
            borderTop: "4px solid #D4AF37",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: 20,
          }}
        />
        <p style={{ color: "#D4AF37", fontSize: "1.1rem", fontWeight: 600 }}>
          Loading Daily Quest...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div style={{ ...overlayBase, alignItems: "center", justifyContent: "center", padding: "20px", touchAction: "auto" }}>
        <img src={SittingMascot} alt="Mascot" style={{ width: 100, height: "auto", marginBottom: 20 }} />
        <h2 style={{ color: "#D4AF37", marginBottom: 16, textAlign: "center" }}>
          Complete a Lesson First!
        </h2>
        <p style={{ color: "#f3f4f6", marginBottom: 24, lineHeight: 1.6, textAlign: "center", maxWidth: 320 }}>
          Daily Quest questions are drawn from lessons you've completed. Complete at least one lesson to unlock!
        </p>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "14px 40px",
            fontSize: "1.1rem",
            fontWeight: 600,
            borderRadius: 12,
            border: "2px solid #D4AF37",
            background: "linear-gradient(145deg, #D4AF37, #b8941f)",
            color: "#0B1E2D",
            cursor: "pointer",
          }}
        >
          Go to Learning Paths
        </button>
      </div>
    );
  }

  // ── Results ──────────────────────────────────────────────────────────────────
  if (showResults) {
    const correctCount = answers.filter((a) => a.correct).length;
    const passed = correctCount >= Math.ceil(totalQuestions * 0.6);

    return (
      <div
        style={{
          ...overlayBase,
          overflowY: "auto",
          overscrollBehavior: "contain",
          touchAction: "auto",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: 20,
            padding: 40,
            maxWidth: 500,
            width: "100%",
            textAlign: "center",
            border: "2px solid #D4AF37",
            boxShadow: "0 10px 40px rgba(212,175,55,0.3)",
          }}
        >
          <h1 style={{ fontSize: "2rem", fontWeight: 700, color: passed ? "#10B981" : "#D4AF37", marginBottom: 20 }}>
            {passed ? "MASHAA ALLAH! 🎉" : "Try Again! 💪"}
          </h1>
          <div style={{ fontSize: "3rem", fontWeight: 900, color: "#D4AF37", marginBottom: 30 }}>
            {correctCount}/{totalQuestions}
          </div>
          <div
            style={{
              background: "rgba(212,175,55,0.1)",
              borderRadius: 16,
              padding: 20,
              marginBottom: 30,
              border: "1px solid rgba(212,175,55,0.3)",
            }}
          >
            <p style={{ fontSize: "1.2rem", fontWeight: 600, color: "#D4AF37", marginBottom: 12 }}>
              Daily Quest Rewards
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#10B981" }}>+60 XP</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#D4AF37" }}>+20 Coins</div>
            </div>
          </div>
          <img
            src={passed ? CongratsMascot : SittingMascot}
            alt="Mascot"
            style={{ width: 100, height: "auto", margin: "0 auto 20px" }}
          />
          <p style={{ fontSize: "1.1rem", color: "#f3f4f6", marginBottom: 30 }}>
            Come back tomorrow for a new Daily Quest! 🌙
          </p>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "14px 40px",
              fontSize: "1.1rem",
              fontWeight: 600,
              borderRadius: 12,
              border: "2px solid #D4AF37",
              background: "linear-gradient(145deg, #D4AF37, #b8941f)",
              color: "#0B1E2D",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(212,175,55,0.4)",
            }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // ── Question Screen ───────────────────────────────────────────────────────────
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div style={overlayBase}>
      {/* ── Header ── */}
      <div
        style={{
          flexShrink: 0,
          padding: "16px 20px 12px",
          background: "rgba(0,0,0,0.25)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#D4AF37" }}>Daily Quest 🌙</span>
            <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              {currentIndex + 1} / {totalQuestions}
            </span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "linear-gradient(90deg, #D4AF37, #10B981)",
                borderRadius: 3,
                transition: "width 0.35s ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Scrollable Content Area ── */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
          padding: "20px 20px 0",
          paddingBottom: "40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ maxWidth: 600, width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <img src={PointingMascot} alt="Mascot" style={{ width: 72, height: "auto" }} />
          </div>

          <QuestionCard
            question={currentQuestion}
            currentQ={currentIndex}
            totalQ={totalQuestions}
            selected={selected}
            onSelect={handleSelect}
          />
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
