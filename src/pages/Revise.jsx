import { useState, useEffect, useMemo } from "react";
import ScreenContainer from "../components/ScreenContainer";
import { useReviseStore } from "../store/reviseStore";
import { useProgressStore } from "../store/progressStore";
import { useAnalytics } from "../hooks/useAnalytics";
import { getQuizForLesson } from "../data/quizEngine";
import QuestionCard from "../components/quiz/QuestionCard";
import assets from "../assets/assets";
import { supabase } from "../lib/supabaseClient";
import { logXpEvent } from "../backend/xpLogs";

function parseCardId(cardId) {
  if (!cardId || typeof cardId !== "string") return null;
  const parts = cardId.split("_");
  if (parts.length < 3) return null;
  const pathId = parseInt(parts[0], 10);
  const lessonId = parseInt(parts[1], 10);
  const questionIndex = parseInt(parts[2], 10);
  if (isNaN(pathId) || isNaN(lessonId) || isNaN(questionIndex)) return null;
  return { pathId, lessonId, questionIndex };
}

function lookupQuestion(cardId, lessonId) {
  const parsed = parseCardId(cardId);
  if (!parsed) return null;
  
  const questions = getQuizForLesson(parsed.lessonId, parsed.pathId);
  if (!questions || !Array.isArray(questions)) return null;
  
  const q = questions[parsed.questionIndex];
  if (!q) return null;
  
  return {
    id: cardId,
    cardId,
    lessonId,
    question: q.text || q.question,
    options: q.options,
    answer: q.correctIndex !== undefined ? q.correctIndex : q.answer,
    pathId: parsed.pathId,
    questionIndex: parsed.questionIndex,
  };
}

function enrichWeakPool(weakPool) {
  return weakPool
    .map((item) => {
      const enriched = lookupQuestion(item.cardId, item.lessonId);
      if (!enriched) return null;
      return {
        ...enriched,
        timesWrong: item.timesWrong || 0,
        timesCorrect: item.timesCorrect || 0,
        reviewedOnce: item.reviewedOnce || false,
        lastReviewedAt: item.lastReviewedAt,
        firstWrongAt: item.firstWrongAt,
      };
    })
    .filter(Boolean);
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Revise() {
  const [mode, setMode] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const { loadReviseData, getWeakPool, clearCorrectQuestion, saveWrongQuestion, markQuestionReviewed } = useReviseStore();
  const { addXPAndCoins, reviewMistakesUnlocked, smartRevisionUnlocked, getTotalCompletedLessons, paths, unlockReviewMistakes } = useProgressStore();
  const analytics = useAnalytics();

  useEffect(() => {
    loadReviseData();
  }, [loadReviseData]);

  const weakPool = getWeakPool();
  const enrichedPool = useMemo(() => enrichWeakPool(weakPool), [weakPool]);
  const hasWeakQuestions = enrichedPool.length > 0;

  const getRevisionSession = (count = 10) => {
    if (enrichedPool.length === 0) return [];
    const sorted = [...enrichedPool].sort((a, b) => {
      const aReviewed = a.reviewedOnce ? 1 : 0;
      const bReviewed = b.reviewedOnce ? 1 : 0;
      if (aReviewed !== bReviewed) return aReviewed - bReviewed;
      return (b.timesWrong || 0) - (a.timesWrong || 0);
    });
    return shuffle(sorted.slice(0, count));
  };

  const getWeakestPath = () => {
    if (enrichedPool.length === 0) return null;
    
    const pathStats = {};
    enrichedPool.forEach((q) => {
      if (!pathStats[q.pathId]) {
        pathStats[q.pathId] = { pathId: q.pathId, wrongCount: 0, questions: [] };
      }
      pathStats[q.pathId].wrongCount += q.timesWrong || 0;
      pathStats[q.pathId].questions.push(q);
    });

    let weakest = null;
    Object.values(pathStats).forEach((stat) => {
      if (!weakest || stat.wrongCount > weakest.wrongCount) {
        weakest = stat;
      }
    });

    if (!weakest) return null;

    const pathInfo = paths?.find((p) => p.id === weakest.pathId);
    return {
      pathId: weakest.pathId,
      title: pathInfo?.title || `Path ${weakest.pathId}`,
      totalQuestions: weakest.questions.length,
      wrongQuestions: weakest.wrongCount,
      completedLessons: pathInfo?.completedLessons || 0,
      questions: weakest.questions,
    };
  };

  const getSmartRevisionPack = () => {
    const weakestPath = getWeakestPath();
    if (!weakestPath || weakestPath.questions.length === 0) return [];
    return shuffle(weakestPath.questions).slice(0, 8);
  };

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

  const handleSelect = (index) => {
    if (selected !== null) return;

    const question = questions[currentQ];
    const isCorrect = index === question.answer;

    setSelected(index);
    const newAnswers = [...answers, { cardId: question.cardId, lessonId: question.lessonId, correct: isCorrect }];
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

  const finishSession = (finalAnswers) => {
    const correctCount = finalAnswers.filter((a) => a.correct).length;
    const totalQuestions = questions.length;

    if (mode === "mistakes") {
      finalAnswers.forEach((ans) => {
        markQuestionReviewed(ans.cardId, ans.lessonId, ans.correct);
      });

      const xpPerCorrect = 4;
      const xpEarned = correctCount * xpPerCorrect;
      const bonusXP = correctCount === totalQuestions ? 10 : 0;
      const totalXP = xpEarned + bonusXP;

      if (totalXP > 0) {
        addXPAndCoins(totalXP, 0);
        analytics("revision_completed", {
          mode: "mistakes",
          score: correctCount,
          total: totalQuestions,
          xpEarned: totalXP,
        });
        
        // Log XP event for revision mistakes mode
        (async () => {
          const { data } = await supabase.auth.getUser();
          const userId = data?.user?.id;
          if (userId) {
            logXpEvent(userId, totalXP, "revision");
          }
        })();
      }
    } else if (mode === "smart") {
      const xp = 25;
      const coins = 10;
      addXPAndCoins(xp, coins);
      analytics("revision_completed", {
        mode: "smart",
        score: correctCount,
        total: totalQuestions,
        xpEarned: xp,
        coinsEarned: coins,
      });
      
      // Log XP event for smart revision mode
      (async () => {
        const { data } = await supabase.auth.getUser();
        const userId = data?.user?.id;
        if (userId) {
          logXpEvent(userId, xp, "revision");
        }
      })();
    }

    setShowResults(true);
  };

  const goBack = () => {
    setMode(null);
    setQuestions([]);
    setCurrentQ(0);
    setSelected(null);
    setAnswers([]);
    setShowResults(false);
  };

  if (showResults) {
    const correctCount = answers.filter((a) => a.correct).length;
    const totalQuestions = questions.length;
    const passed = correctCount >= totalQuestions * 0.5;

    let rewardXP = 0;
    let rewardCoins = 0;

    if (mode === "mistakes") {
      rewardXP = correctCount * 4;
      if (correctCount === totalQuestions) rewardXP += 10;
    } else if (mode === "smart") {
      rewardXP = 25;
      rewardCoins = 10;
    }

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
          <img
            src={passed ? assets.mascots.mascot_congratulation : assets.mascots.mascot_sitting_v2}
            alt="Mascot"
            style={{
              width: "100px",
              height: "auto",
              margin: "0 auto 20px",
              animation: "bounce 1.5s infinite",
            }}
          />

          <style>{`
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
          `}</style>

          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: passed ? "#10B981" : "#D4AF37",
              marginBottom: "20px",
            }}
          >
            {passed ? "Great Work!" : "Keep Learning!"}
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
              <p style={{ fontSize: "1.1rem", color: "#10B981", fontWeight: 600, margin: "0 0 10px" }}>
                Rewards Earned!
              </p>
              <div style={{ fontSize: "1.5rem", color: "#D4AF37" }}>
                +{rewardXP} XP
                {rewardCoins > 0 && ` +${rewardCoins} Coins`}
              </div>
            </div>
          )}

          {mode === "mistakes" && correctCount === totalQuestions && (
            <p style={{ color: "#10B981", fontWeight: 600, marginBottom: "20px" }}>
              Perfect Score Bonus: +10 XP
            </p>
          )}

          {mode === "mistakes" && correctCount > 0 && (
            <p style={{ opacity: 0.8, marginBottom: "20px", fontSize: "0.95rem" }}>
              {correctCount} question{correctCount > 1 ? "s" : ""} improved!
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
          >
            Back to Revise
          </button>
        </div>
      </div>
    );
  }

  if (mode && questions.length > 0) {
    const currentQuestion = {
      text: questions[currentQ].question,
      options: questions[currentQ].options,
      correctIndex: questions[currentQ].answer,
    };

    return (
      <div
        className="screen no-extra-space"
        style={{
          background: "linear-gradient(135deg, #0B1E2D 0%, #1a3a52 100%)",
          color: "#ffffff",
          padding: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "100%", maxWidth: "600px" }}>
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <h2 style={{ fontSize: "1.5rem", color: "#D4AF37", marginBottom: "10px" }}>
              {mode === "mistakes" ? "Review Mistakes" : "Smart Revision"}
            </h2>
            <p style={{ opacity: 0.8, fontSize: "0.9rem" }}>
              {mode === "mistakes" ? "Master your weak areas" : "Strengthen your weakest path"}
            </p>
            <img
              src={assets.mascots.mascot_pointing_v2}
              alt="Mascot"
              style={{ width: "80px", height: "auto", margin: "20px auto 0" }}
            />
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

  const weakestPath = getWeakestPath();
  const hasWeakestPath = weakestPath !== null && weakestPath.totalQuestions > 0;
  const totalCompleted = getTotalCompletedLessons();
  const isSmartActive = smartRevisionUnlocked && hasWeakestPath;

  return (
    <ScreenContainer>
      <div style={{ position: "relative", padding: "20px 20px 40px" }}>
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
            Turn your mistakes into mastery
          </p>
        </div>

        <div
          onClick={reviewMistakesUnlocked && hasWeakQuestions ? startMistakesReview : null}
          style={{
            background: reviewMistakesUnlocked
              ? (hasWeakQuestions 
                  ? "linear-gradient(145deg, rgba(212,175,55,0.2), rgba(16,185,129,0.1))"
                  : "linear-gradient(145deg, rgba(16,185,129,0.1), rgba(107,114,128,0.1))")
              : "linear-gradient(145deg, rgba(107,114,128,0.2), rgba(75,85,99,0.1))",
            border: `2px solid ${reviewMistakesUnlocked ? (hasWeakQuestions ? "rgba(212,175,55,0.5)" : "rgba(16,185,129,0.3)") : "rgba(107,114,128,0.3)"}`,
            borderRadius: 20,
            padding: 24,
            marginBottom: 20,
            cursor: reviewMistakesUnlocked && hasWeakQuestions ? "pointer" : "default",
            transition: "all 0.3s ease",
            boxShadow: reviewMistakesUnlocked
              ? (hasWeakQuestions 
                  ? "0 8px 20px rgba(212,175,55,0.2)"
                  : "0 4px 15px rgba(16,185,129,0.1)")
              : "0 4px 10px rgba(0,0,0,0.1)",
            opacity: reviewMistakesUnlocked ? 1 : 0.6,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: reviewMistakesUnlocked ? "#D4AF37" : "#9CA3AF", margin: "0 0 8px" }}>
                Review Mistakes
              </h3>
              <p style={{ opacity: 0.85, margin: "0 0 12px", fontSize: "0.9rem", lineHeight: 1.5 }}>
                {reviewMistakesUnlocked && !hasWeakQuestions 
                  ? "No mistakes to review - keep up the great work!"
                  : "Fix mistakes from past lessons, quizzes, and challenges."}
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: "0.85rem", opacity: 0.7 }}>
                <span>Max 10 questions</span>
                <span>|</span>
                <span>No timer</span>
                <span>|</span>
                <span>+4 XP per correct</span>
              </div>
            </div>
            <div
              style={{
                background: reviewMistakesUnlocked
                  ? (hasWeakQuestions ? "rgba(212,175,55,0.2)" : "rgba(16,185,129,0.2)")
                  : "rgba(107,114,128,0.2)",
                borderRadius: "50%",
                width: 60,
                height: 60,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.8rem",
                flexShrink: 0,
                color: reviewMistakesUnlocked 
                  ? (hasWeakQuestions ? "#D4AF37" : "#10B981")
                  : "#9CA3AF",
              }}
            >
              {reviewMistakesUnlocked ? (hasWeakQuestions ? enrichedPool.length : "✓") : "?"}
            </div>
          </div>

          {!reviewMistakesUnlocked && (
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
              Get your first question wrong in any quiz to unlock this feature!
            </div>
          )}

          {reviewMistakesUnlocked && !hasWeakQuestions && (
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
              No mistakes to review! You've mastered all your weak areas!
            </div>
          )}
        </div>

        <div
          onClick={isSmartActive ? startSmartRevision : null}
          style={{
            background: isSmartActive
              ? "linear-gradient(145deg, rgba(59,130,246,0.2), rgba(147,51,234,0.1))"
              : "linear-gradient(145deg, rgba(107,114,128,0.2), rgba(75,85,99,0.1))",
            border: `2px solid ${isSmartActive ? "rgba(59,130,246,0.5)" : "rgba(107,114,128,0.3)"}`,
            borderRadius: 20,
            padding: 24,
            cursor: isSmartActive ? "pointer" : "not-allowed",
            transition: "all 0.3s ease",
            boxShadow: isSmartActive ? "0 8px 20px rgba(59,130,246,0.2)" : "0 4px 10px rgba(0,0,0,0.1)",
            opacity: isSmartActive ? 1 : 0.6,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: isSmartActive ? "#3B82F6" : "#9CA3AF", margin: "0 0 8px" }}>
                Smart Revision
              </h3>
              <p style={{ opacity: 0.85, margin: "0 0 12px", fontSize: "0.9rem", lineHeight: 1.5 }}>
                {isSmartActive ? `Revise your weakest topic: ${weakestPath.title}` : "Revise your weakest topics intelligently."}
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: "0.85rem", opacity: 0.7 }}>
                <span>Max 8 questions</span>
                <span>|</span>
                <span>No timer</span>
                <span>|</span>
                <span>+25 XP +10 Coins</span>
              </div>
            </div>
            <div
              style={{
                background: isSmartActive ? "rgba(59,130,246,0.2)" : "rgba(107,114,128,0.2)",
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
              {isSmartActive ? "+" : "?"}
            </div>
          </div>

          {isSmartActive && weakestPath.wrongQuestions > 0 && (
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
              {weakestPath.wrongQuestions} mistakes found | {weakestPath.completedLessons} lessons completed
            </div>
          )}

          {!smartRevisionUnlocked && (
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
              Complete 25 lessons to unlock Smart Revision! ({totalCompleted}/25)
            </div>
          )}

          {smartRevisionUnlocked && !hasWeakestPath && (
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
              Keep learning! Complete more lessons to build your revision pack.
            </div>
          )}
        </div>
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
